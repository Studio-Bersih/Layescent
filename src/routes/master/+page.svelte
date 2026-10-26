<script lang="ts">
	import { onMount } from "svelte";
	import { toast } from "svelte-sonner";
	import { db } from "../../library/hooks/db";
	import { useNotice } from "../../library/validator/useNotice";
	import { useConfiguration } from "../../config/useConfiguration";
	import { currencySanitizer, rupiahFormatter } from "../../library/utils/useFormatter";

    import Modal from "../../components/shared/Modal.svelte";
	import Rupiah from "../../components/shared/Rupiah.svelte";
	import Navigation from "../../components/Navigation.svelte";
	import { loadToken } from "../../library/validator/useAuth";

    interface Master { 
        id: number;
        name: string; 
        jenis: string; 
        barcode: string; 
        hargaStok: number; 
        hargaJual: number; 
        keterangan: string; 
        stokItem: number;
        stokItemSecond: number;
        stokItemThird: number;
    }

    let newData: Master[] = $state([]);
    let newDataDefault: Master[] = $state([]);

    let name: string = $state('');
    let jenis: string = $state('');
    let barcode: string = $state('');
    let hargaStok: string = $state('');
    let hargaJual: string = $state('');
    let keterangan: string = $state('');
    let stokItem: number | null = $state(null);
    let stokItemSecond: number | null = $state(null);
    let stokItemThird: number | null = $state(null);

    let searchByNameController: HTMLElement;
    let searchBar: string = $state('');

    let isModal: boolean = $state(false);
    let isLoading: boolean = $state(false);

    let currentPage: string | "delete" | "update" = $state('');

    const jenisItem: string[] = ['Alat Listrik','Minuman','Aksesoris','Pulsa','Kuota','Voucher'];

    let setDelete: number | null = $state(null);
    let setUpdate: number | null = $state(null);

    /*
    | Display-only filters and pagination.
    |
    | Everything below narrows what is RENDERED from `newData` and nothing else.
    | `newData`, `newDataDefault`, the search (stringFilter), the API calls and the
    | CSV export all behave exactly as before — the CSV still exports `newData`.
    */
    let filterJenis: string = $state('');
    let filterHargaField: 'hargaJual' | 'hargaStok' = $state('hargaJual');
    let filterHargaMin: string = $state('');
    let filterHargaMax: string = $state('');
    let showFilter: boolean = $state(false);

    let page: number = $state(1);
    let perPage: number = $state(25);

    // The fixed list, plus any jenis already stored that is not in it.
    let jenisOptions: string[] = $derived([
        ...jenisItem,
        ...[...new Set(newDataDefault.map((item) => item.jenis))]
            .filter((value) => value && !jenisItem.includes(value))
            .sort()
    ]);

    // Rupiah inputs hold "Rp 10.000"; an input with no digits means "no bound".
    const hargaBound = (value: string): number | null => /\d/.test(value) ? currencySanitizer(value) : null;

    let hargaMin: number | null = $derived(hargaBound(filterHargaMin));
    let hargaMax: number | null = $derived(hargaBound(filterHargaMax));

    let activeFilters: number = $derived(
        (filterJenis !== '' ? 1 : 0) + (hargaMin !== null || hargaMax !== null ? 1 : 0)
    );

    let filteredData: Master[] = $derived.by(() => {
        // Tolerate the bounds typed the wrong way round.
        const low  = hargaMin !== null && hargaMax !== null ? Math.min(hargaMin, hargaMax) : hargaMin;
        const high = hargaMin !== null && hargaMax !== null ? Math.max(hargaMin, hargaMax) : hargaMax;

        return newData.filter((item) => {
            if (filterJenis !== '' && item.jenis !== filterJenis) return false;
            const harga = Number(item[filterHargaField] ?? 0);
            if (low !== null && harga < low) return false;
            if (high !== null && harga > high) return false;
            return true;
        });
    });

    let lastPage: number = $derived(Math.max(1, Math.ceil(filteredData.length / perPage)));
    let pageOffset: number = $derived((page - 1) * perPage);
    let pagedData: Master[] = $derived(filteredData.slice(pageOffset, pageOffset + perPage));

    // Back to page 1 whenever what is being looked at changes.
    $effect(() => {
        filterJenis; filterHargaField; hargaMin; hargaMax; searchBar; perPage;
        page = 1;
    });

    // Keep the page in range after a delete shrinks the list.
    $effect(() => {
        if (page > lastPage) page = lastPage;
    });

    function resetFilter(): void {
        filterJenis = '';
        filterHargaField = 'hargaJual';
        filterHargaMin = '';
        filterHargaMax = '';
        if (searchBar !== '') {
            searchBar = '';
            stringFilter(searchBar);
        }
    }

    function gotoPage(target: number): void {
        page = Math.min(Math.max(1, target), lastPage);
    }

    onMount(() => initializePage());

    async function initializePage(): Promise <void> {
        loadToken();
        const { status, message, data } = await db({
            TOKEN: $useConfiguration.token,
            USAHA: $useConfiguration.usaha,
        }, 'Master-Product');

        if (status === "error") {
            toast.error(message);
            return
        }

        newData = data.map((element: { 
            ID: number; NAMA: string; BARCODE: string; JENIS: string; 
            STOK_ITEM: number; STOK_ITEM_SECOND: number; STOK_ITEM_THIRD: number;
            HARGA_STOK: number; HARGA_JUAL: number; KETERANGAN: string }) => ({
                id: element.ID,
                name: element.NAMA,
                jenis: element.JENIS,
                barcode: element.BARCODE,
                hargaStok: element.HARGA_STOK,
                hargaJual: element.HARGA_JUAL,
                keterangan: element.KETERANGAN,
                stokItem: element.STOK_ITEM,
                stokItemSecond: element.STOK_ITEM_SECOND,
                stokItemThird: element.STOK_ITEM_THIRD
        }));
        newDataDefault = newData;
    }

    function stringFilter(ID: string): void {
        if (ID === '') {
            newData = newDataDefault;
        } else {
            const searchID = ID.toLowerCase();
            newData = newDataDefault.filter((item: { barcode: string; name: string | string[]; }) => {
                const nameMatches = typeof item.name === 'string'
                    ? item.name.toLowerCase().includes(searchID)
                    : Array.isArray(item.name) && item.name.some(name => name.toLowerCase().includes(searchID));

                const barcodeMatches = item.barcode?.toLowerCase().includes(searchID) ?? false;

                return nameMatches || barcodeMatches;
            });
        }
    }

    async function viewModal(id: number, type: "delete" | "update"): Promise <void> {
        if(type === "delete") {
            setDelete = id;
            currentPage = "delete";
        } else if (type === "update") {
            setUpdate = id;
            currentPage = "update";

            const { status, message, data } = await db({ id: id }, 'Detail-Item')
            
            if (status === 'success') {
                toast.success(message);
                name = data.NAMA;
                jenis = data.JENIS;
                barcode = data.BARCODE;
                hargaStok = rupiahFormatter.format(data.HARGA_STOK);
                hargaJual = rupiahFormatter.format(data.HARGA_JUAL);
                keterangan = data.KETERANGAN;
                stokItem = data.STOK_ITEM
            }
        }
        isModal = true;
    }

    function viewForm(): boolean {
        removeAll();
        currentPage = "create";
        isModal = !isModal;
        return isModal;
    }

    async function createItem(): Promise <void> {
        if (hargaStok == '' || hargaJual == '') {
            toast.error('Harap mengisi harga stok dan harga jual!');
            return;
        }

        isLoading = true;

        const { status, message } = await db({
            name: name,
            jenis : jenis,
            barcode: barcode,
            hargaStok: currencySanitizer(hargaStok),
            hargaJual: currencySanitizer(hargaJual),
            keterangan: keterangan,
            stok : stokItem ?? 0,
            usaha: $useConfiguration.usaha
        }, 'Create-Item');

        isLoading = false;

        if (status === 'error') {
            toast.error(message);
            return;
        }

        toast.success(message);
        newData.push({
            id: -1,
            name : name,
            jenis : jenis,
            barcode: barcode,
            hargaStok : currencySanitizer(hargaStok),
            hargaJual : currencySanitizer(hargaJual),
            keterangan : keterangan,
            stokItem: stokItem ?? 0,
            stokItemSecond: stokItemSecond ?? 0,
            stokItemThird: stokItemThird ?? 0
        });
        newData = newData;
        removeAll();
    }

    async function updateStock(id: number, stock: number, secondStock: number, thirdStock: number): Promise <void> {
        // if (stock < 1) {
        //     toast.error("Stok tidak boleh dibawah 0!");
        //     return;
        // }

        const { status , message } = await db({
            id : id,
            stock : stock,
            secondStock: secondStock,
            thirdStock: thirdStock
        }, 'Update-Stock');

        if (status === 'error') {
            toast.error(message);
            return;
        }
        
        isModal = false;
        toast.success(message);
    }

    async function updateItem(): Promise <void> {
        const { status , message } = await db({
            id : setUpdate,
            name: name,
            jenis : jenis,
            barcode: barcode,
            hargaStok: currencySanitizer(hargaStok),
            hargaJual: currencySanitizer(hargaJual),
            keterangan: keterangan,
            stok : stokItem ?? 0
        }, 'Update-Item');

        if (status === 'error') {
            toast.error(message,);
            return;
        }

        initializePage();
        isModal = false;
        toast.success(message);
    }

    async function deleteItem(): Promise <void> {
        toast('Penghapusan Item', {
            description: 'Apakah anda yakin?',
            action: {
                label: useNotice.toast.confirmDelete,
                onClick: async () => {
                    if (setDelete === null) {
                        toast.error('Pilih item untuk dihapus terlebih dahulu!');
                        return;
                    }

                    if (setDelete === -1) {
                        toast.error('Item ini dapat dihapus ketika anda berpindah halaman atau memuat ulang!');
                        return;
                    }

                    isLoading = true;

                    const { status, message } = await db({ 
                        id : setDelete 
                    }, 'Delete-Item');
                    
                    isLoading = false;
                    isModal = false;

                    if (status === 'error') {
                        toast.error(message);
                        return;
                    }

                    const index = newData.findIndex((elements: any) => elements.id == setDelete);

                    newData.splice(index, 1);

                    setDelete = null;
                    toast.success(message);
                }
            },
        });
    }

    function removeAll(): void {
        name = '';
        jenis = '';
        barcode = '';
        hargaStok = '';
        hargaJual = '';
        keterangan = '';
        stokItem = null; 
    }

function downloadCSV() {
    if (!newData || newData.length === 0) {
        console.warn("No data to export");
        return;
    }

    // Get headers from the first object
    const headers = Object.keys(newData[0]);

    // Build CSV rows
    const rows: string[] = [];
    rows.push(headers.join(",")); // plain headers, no formatting

    newData.forEach((item: any) => {
        const row: string[] = [];
        headers.forEach((h) => {
            let value = item[h] ?? "";
            // Just escape double quotes
            value = value.toString().replace(/"/g, '""');
            row.push(`"${value}"`);
        });
        rows.push(row.join(","));
    });

    const csv = rows.join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = "data.csv";
    link.click();

    URL.revokeObjectURL(url);
}


</script>
<Navigation/>
<div class="container-fluid px-3 px-md-5 master-page">
    <div class="card card-dashed shadow-sm mt-3 mb-5">

        <!-- Title + the two page actions. Buttons go full-width side by side on a phone. -->
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 px-4 px-md-6 pt-5 pb-4 border-bottom">
            <h1 class="fs-2 fw-bolder mb-0">Master Item</h1>
            <div class="d-flex gap-2 master-actions">
                <button type="button" onclick={viewForm} class="btn btn-sm btn-success d-inline-flex align-items-center justify-content-center">
                    <img src="/icons/pen.svg" class="h-20px me-2" alt="SVG Input Item" /> Buat Item Baru
                </button>
                <button type="button" onclick={downloadCSV} class="btn btn-sm btn-info d-inline-flex align-items-center justify-content-center">
                    <img src="/icons/Item.svg" class="h-20px me-2" alt="SVG Input Item" />
                    <span class="d-none d-md-inline">Unduh Laporan Stok Item</span>
                    <span class="d-md-none">Unduh Stok</span>
                </button>
            </div>
        </div>

        <div class="px-4 px-md-6 pt-4">
            <!-- Search: unchanged behaviour, it still drives stringFilter(). -->
            <label for="setToken" class="form-label fw-bold mb-1">[ESC] Scan Barcode atau Nama Item</label>
            <!-- The button runs the same stringFilter() the keystrokes already do. -->
            <div class="d-flex gap-2 master-search">
                <div class="position-relative flex-grow-1">
                    <img src="/icons/search.svg" class="h-20px position-absolute top-50 translate-middle-y ms-3" alt="SVG Search" />
                    <input type="text" id="setToken" bind:this={searchByNameController} bind:value={searchBar} onkeyup={ () => {stringFilter(searchBar)} } min="0" class="form-control ps-11" placeholder="Cari Item" required />
                </div>
                <button type="button" class="btn btn-primary px-6 flex-shrink-0" onclick={() => stringFilter(searchBar)}>Cari</button>
            </div>

            <!-- Filter toggle: phones only. From md up the filter row is always visible. -->
            <div class="d-flex d-md-none gap-2 mt-3">
                <button type="button" class="btn btn-sm btn-light border flex-grow-1 master-tap fw-semibold btn-shadow master-filter-toggle" onclick={() => showFilter = !showFilter} aria-expanded={showFilter} aria-controls="masterFilter">
                    Filter {showFilter ? '▴' : '▾'}
                    {#if activeFilters > 0}<span class="badge badge-primary ms-1">{activeFilters}</span>{/if}
                </button>
                <button type="button" class="btn btn-sm btn-light master-tap" onclick={resetFilter}>↺ Reset</button>
            </div>

            <div id="masterFilter" class="d-md-flex flex-wrap align-items-end gap-3 mt-3" class:d-none={!showFilter}>
                <div class="master-field-jenis">
                    <label for="filterJenis" class="form-label fw-bold mb-1">Jenis</label>
                    <select id="filterJenis" bind:value={filterJenis} class="form-select form-select-sm">
                        <option value="">Semua Jenis</option>
                        {#each jenisOptions as option}
                            <option value={option}>{option}</option>
                        {/each}
                    </select>
                </div>

                <div class="mt-3 mt-md-0">
                    <span class="form-label fw-bold mb-1 d-block">Rentang Harga</span>
                    <div class="d-flex flex-wrap align-items-center gap-2">
                        <div class="btn-group btn-group-sm" role="group" aria-label="Harga yang difilter">
                            <button type="button" class="btn" class:btn-primary={filterHargaField === 'hargaJual'} class:btn-light={filterHargaField !== 'hargaJual'}
                                    aria-pressed={filterHargaField === 'hargaJual'} onclick={() => filterHargaField = 'hargaJual'}>Jual</button>
                            <button type="button" class="btn" class:btn-primary={filterHargaField === 'hargaStok'} class:btn-light={filterHargaField !== 'hargaStok'}
                                    aria-pressed={filterHargaField === 'hargaStok'} onclick={() => filterHargaField = 'hargaStok'}>Stok</button>
                        </div>
                        <div class="d-flex align-items-center gap-2 master-range">
                            <Rupiah id="filterHargaMin" useClass="form-control form-control-sm" bind:value={filterHargaMin} placeholder="Min Rp" />
                            <span class="text-muted">–</span>
                            <Rupiah id="filterHargaMax" useClass="form-control form-control-sm" bind:value={filterHargaMax} placeholder="Maks Rp" />
                        </div>
                    </div>
                </div>

                <button type="button" class="btn btn-sm btn-light d-none d-md-inline-block" onclick={resetFilter}>↺ Reset Filter</button>
            </div>

            <p class="text-muted fs-7 mt-4 mb-3">
                {#if filteredData.length === 0}
                    Tidak ada item
                {:else}
                    Menampilkan {pageOffset + 1}–{pageOffset + pagedData.length} dari {filteredData.length} item
                {/if}
                {#if filteredData.length !== newDataDefault.length}
                    <span>(total {newDataDefault.length} item)</span>
                {/if}
            </p>
        </div>

        <!-- md and up: table. Fixed column widths so the stock inputs and actions never get squeezed. -->
        <div class="table-responsive d-none d-md-block px-md-4">
            <table class="table align-middle table-hover table-row-dashed gx-3 gy-2 mb-0 master-table">
                <thead>
                    <tr class="fw-bolder text-muted fs-7 text-uppercase">
                        <th class="col-no">#</th>
                        <th class="col-nama">Nama</th>
                        <th>Jenis</th>
                        <th>Barcode</th>
                        <th class="text-end">Harga Stok</th>
                        <th class="text-end">Harga Jual</th>
                        <th class="col-ket">Keterangan</th>
                        <th class="text-center col-stok">Cabang 1</th>
                        <th class="text-center col-stok">Cabang 2</th>
                        <th class="text-center col-stok">Cabang 3</th>
                        <th class="text-end col-aksi">Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {#if pagedData.length === 0}
                        <tr>
                            <td colspan="11" class="text-center text-muted py-10">Tidak ada data</td>
                        </tr>
                    {:else}
                        {#each pagedData as item, index (item)}
                            <tr>
                                <td class="text-muted">{pageOffset + index + 1}</td>
                                <td class="fw-semibold">{item.name}</td>
                                <td><span class="badge badge-light">{item.jenis}</span></td>
                                <td class="text-nowrap font-monospace fs-7">{item.barcode}</td>
                                <td class="text-end text-nowrap">{rupiahFormatter.format(item.hargaStok)}</td>
                                <td class="text-end text-nowrap fw-semibold">{rupiahFormatter.format(item.hargaJual)}</td>
                                <td class="col-ket text-truncate" title={item.keterangan ?? ''}>{item.keterangan ?? '-'}</td>
                                <td><input type="number" bind:value={item.stokItem} class="form-control form-control-sm text-center" aria-label="Stok cabang 1 {item.name}"/></td>
                                <td><input type="number" bind:value={item.stokItemSecond} class="form-control form-control-sm text-center" aria-label="Stok cabang 2 {item.name}"/></td>
                                <td><input type="number" bind:value={item.stokItemThird} class="form-control form-control-sm text-center" aria-label="Stok cabang 3 {item.name}"/></td>
                                <td class="text-end text-nowrap">
                                    <button type="button" onclick={() => updateStock(item.id, item.stokItem, item.stokItemSecond, item.stokItemThird)} class="btn btn-sm btn-icon btn-primary" title="Simpan stok">
                                        <img src="/icons/sync.svg" class="h-20px" alt="SVG Synchronize" />
                                    </button>
                                    <button type="button" onclick={() => viewModal(item.id, "update")} class="btn btn-sm btn-icon btn-warning" title="Ubah item">
                                        <img src="/icons/pen.svg" class="h-20px" alt="SVG Synchronize" />
                                    </button>
                                    <button type="button" onclick={() => viewModal(item.id, 'delete')} class="btn btn-sm btn-icon btn-danger" title="Hapus item">
                                        <img src="/icons/trash.svg" class="h-20px" alt="SVG Trash" />
                                    </button>
                                </td>
                            </tr>
                        {/each}
                    {/if}
                </tbody>
            </table>
        </div>

        <!-- Phones: one card per item, large tap targets. Same bindings and handlers as the table. -->
        <div class="d-md-none px-4">
            {#if pagedData.length === 0}
                <p class="text-center text-muted py-10 mb-0">Tidak ada data</p>
            {:else}
                {#each pagedData as item, index (item)}
                    <div class="border rounded p-4 mb-3">
                        <div class="d-flex justify-content-between align-items-start gap-2">
                            <div class="min-w-0">
                                <div class="fw-bolder fs-6">{pageOffset + index + 1}. {item.name}</div>
                                <div class="text-muted font-monospace fs-7 text-break">{item.barcode}</div>
                            </div>
                            <span class="badge badge-light flex-shrink-0">{item.jenis}</span>
                        </div>

                        <div class="d-flex gap-4 mt-3 fs-7">
                            <div><span class="text-muted d-block">Harga Stok</span>{rupiahFormatter.format(item.hargaStok)}</div>
                            <div><span class="text-muted d-block">Harga Jual</span><span class="fw-bold">{rupiahFormatter.format(item.hargaJual)}</span></div>
                        </div>

                        {#if item.keterangan}
                            <div class="text-muted fs-7 mt-2">{item.keterangan}</div>
                        {/if}

                        <div class="row g-2 mt-2">
                            <div class="col-4">
                                <label class="form-label fs-8 text-muted mb-1" for="stok1-{item.id}-{index}">Cabang 1</label>
                                <input id="stok1-{item.id}-{index}" type="number" inputmode="numeric" bind:value={item.stokItem} class="form-control text-center master-tap"/>
                            </div>
                            <div class="col-4">
                                <label class="form-label fs-8 text-muted mb-1" for="stok2-{item.id}-{index}">Cabang 2</label>
                                <input id="stok2-{item.id}-{index}" type="number" inputmode="numeric" bind:value={item.stokItemSecond} class="form-control text-center master-tap"/>
                            </div>
                            <div class="col-4">
                                <label class="form-label fs-8 text-muted mb-1" for="stok3-{item.id}-{index}">Cabang 3</label>
                                <input id="stok3-{item.id}-{index}" type="number" inputmode="numeric" bind:value={item.stokItemThird} class="form-control text-center master-tap"/>
                            </div>
                        </div>

                        <div class="d-flex gap-2 mt-3">
                            <button type="button" onclick={() => updateStock(item.id, item.stokItem, item.stokItemSecond, item.stokItemThird)} class="btn btn-sm btn-primary flex-grow-1 d-inline-flex align-items-center justify-content-center master-tap">
                                <img src="/icons/sync.svg" class="h-20px me-2" alt="SVG Synchronize" /> Simpan Stok
                            </button>
                            <button type="button" onclick={() => viewModal(item.id, "update")} class="btn btn-sm btn-warning master-tap" aria-label="Ubah {item.name}">
                                <img src="/icons/pen.svg" class="h-20px" alt="SVG Synchronize" />
                            </button>
                            <button type="button" onclick={() => viewModal(item.id, 'delete')} class="btn btn-sm btn-danger master-tap" aria-label="Hapus {item.name}">
                                <img src="/icons/trash.svg" class="h-20px" alt="SVG Trash" />
                            </button>
                        </div>
                    </div>
                {/each}
            {/if}
        </div>

        <!-- Pagination -->
        <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 px-4 px-md-6 py-4 border-top">
            <select bind:value={perPage} class="form-select form-select-sm w-auto" aria-label="Item per halaman">
                <option value={25}>25 / halaman</option>
                <option value={50}>50 / halaman</option>
                <option value={100}>100 / halaman</option>
            </select>
            <div class="d-flex align-items-center gap-1">
                <button type="button" class="btn btn-sm btn-light master-page-btn" disabled={page <= 1} onclick={() => gotoPage(1)} aria-label="Halaman pertama">«</button>
                <button type="button" class="btn btn-sm btn-light master-page-btn" disabled={page <= 1} onclick={() => gotoPage(page - 1)} aria-label="Halaman sebelumnya">‹</button>
                <span class="px-3 fs-7 text-nowrap">{page} / {lastPage}</span>
                <button type="button" class="btn btn-sm btn-light master-page-btn" disabled={page >= lastPage} onclick={() => gotoPage(page + 1)} aria-label="Halaman berikutnya">›</button>
                <button type="button" class="btn btn-sm btn-light master-page-btn" disabled={page >= lastPage} onclick={() => gotoPage(lastPage)} aria-label="Halaman terakhir">»</button>
            </div>
        </div>
    </div>
</div>

<style>
    /* Sizing. Inputs are as wide as what they hold, never the old fixed w-25. */
    .master-search { max-width: 520px; }
    .master-field-jenis { min-width: 200px; }
    .master-range :global(input) { width: 150px; }

    .master-table { min-width: 1100px; }
    .master-table .col-no   { width: 48px; }
    .master-table .col-nama { min-width: 200px; }
    .master-table .col-ket  { max-width: 200px; }
    .master-table .col-stok { width: 88px; }
    .master-table .col-aksi { width: 140px; }
    .master-table td input  { min-width: 72px; }

    .master-page-btn { min-width: 36px; }

    /* Phones: full-width controls and ~44px touch targets. */
    @media (max-width: 767.98px) {
        .master-actions { width: 100%; }
        .master-actions > * { flex: 1 1 0; font-size: 0.85rem; }
        .master-search { max-width: none; }
        .master-field-jenis { min-width: 0; }
        .master-range { flex: 1 1 100%; }
        .master-range :global(input) { width: 100%; flex: 1 1 0; min-width: 0; }
        .master-tap { min-height: 44px; }
        .master-page-btn { min-width: 44px; min-height: 40px; }

        /*
        | The filter is folded away on a phone, so its toggle is raised with a
        | shadow to read as a control rather than a label — easy to miss otherwise.
        | Opened, the panel sits in its own raised box.
        */
        /*
        | Metronic strips box-shadow from every .btn that is not .btn-shadow (or
        | .shadow*), hence that class on the button; !important beats its states.
        */
        .master-filter-toggle {
            background-color: #fff !important;
            color: #181c32 !important;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2) !important;
        }
        .master-filter-toggle:active {
            box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2) !important;
        }
        #masterFilter {
            padding: 1rem;
            border-radius: 0.65rem;
            box-shadow: 0 4px 14px rgba(0, 0, 0, 0.10);
        }
    }
</style>

 <Modal bind:isModal={isModal} size={"md"} title="" onClose={() => isModal = !isModal}>
    {#snippet modalContent()}
        {#if currentPage === "create"}
            {@render formCreate()}
        {:else}
            {@render formUpdel()}
        {/if}
    {/snippet}
</Modal>

{#snippet formCreate()}
    <form onsubmit={createItem} class="border rounded p-3">
        <div class="row my-2">
            <div class="col">
                <div class="form-group">
                    <label for="name" class="form-label fw-bold">Nama</label>
                    <input type="text" bind:value={name} class="form-control form-control-sm" placeholder="Masukkan Nama Produk" required/>
                </div>
            </div>
            <div class="col">
                <div class="form-group">
                    <label for="barcode" class="form-label fw-bold">Barcode</label>
                    <input type="text" bind:value={barcode} class="form-control form-control-sm" placeholder="Masukkan Barcode" required/>
                </div>
            </div>
        </div>
        
        <div class="row my-2">
            <div class="col">
                <div class="form-group">
                    <label for="jenis" class="form-label fw-bold">Jenis</label>
                    <select bind:value={jenis} class="form-select form-select-sm" required>
                        <option value="" disabled selected>Pilih Jenis Item</option>
                        {#each jenisItem as jenis }
                            <option value="{jenis}">{jenis}</option>
                        {/each}
                    </select>
                </div>
            </div>
            <div class="col">
                <div class="form-group">
                    <label for="stokItem" class="form-label fw-bold">Stok Item</label>
                    <input type="number" bind:value={stokItem} min="0" class="form-control form-control-sm" placeholder="Stok" required/>
                </div>
            </div>
        </div>
        <div class="row my-2">
            <div class="col">
                <div class="form-group">
                    <label for="hargaStok" class="form-label fw-bold">Harga Stok</label>
                    <Rupiah id="hargaStok" useClass="form-control form-control-sm" bind:value={hargaStok} disabled={false}/>
                </div>
            </div>
            <div class="col">
                <div class="form-group">
                    <label for="hargaJual" class="form-label fw-bold">Harga Jual</label>
                    <Rupiah id="hargaJual" useClass="form-control form-control-sm" bind:value={hargaJual} disabled={false}/>
                </div>
            </div>
        </div>
        <div class="form-group">
            <label for="keterangan" class="form-label fw-bold">Keterangan</label>
            <textarea class="form-control" bind:value={keterangan} placeholder="Keterangan" rows="3"></textarea>
        </div>

        <button type="submit" class="btn btn-sm btn-primary mt-3 w-100" disabled={isLoading}>
            {#if isLoading}
                Menyimpan...
                <span class="spinner-border spinner-border-sm align-middle ms-2"></span>
            {:else}
                Simpan Item
            {/if}
        </button>
    </form>
{/snippet}

{#snippet formUpdel()}
    {#if currentPage === "delete"}
        <div class="text-center">
            <img src="/icons/alert.svg" class="h-150px mt-10" alt="SVG Alert" />
            <h1 class="fw-bolder">Apakah anda yakin?</h1>
        </div>

        <div class="d-flex justify-content-evenly">
            <button type="button" onclick={deleteItem} class="btn btn-sm btn-danger my-7" disabled={isLoading}>
                {#if isLoading}
                    Menghapus...
                    <span class="spinner-border spinner-border-sm align-middle ms-2"></span>
                {:else}
                    <img src="/icons/trash.svg" class="h-25px" alt="SVG Trash" />
                    Ya, hapus Item ini
                {/if}
            </button>
            <button type="button" onclick={() => isModal = false} class="btn btn-sm btn-secondary my-7">
                <img src="/icons/cancel.svg" class="h-25px" alt="SVG Cancel" />
                Batalkan hapus
            </button>
        </div>
    {:else if currentPage === "update"}
        <form onsubmit={updateItem}>
            <div class="form-group">
                <label for="name" class="form-label fw-bold">Nama</label>
                <input type="text" bind:value={name} class="form-control form-control-sm" placeholder="Masukkan Nama Produk" required/>
            </div>
            <div class="form-group my-2">
                <label for="barcode" class="form-label fw-bold">Barcode</label>
                <input type="text" bind:value={barcode} class="form-control form-control-sm" placeholder="Masukkan Barcode" required/>
            </div>
            <div class="form-group">
                <label for="jenis" class="form-label fw-bold">Jenis</label>
                <select bind:value={jenis} class="form-select form-select-sm" required>
                    <option value="" disabled selected>Pilih Jenis Item</option>
                    {#each jenisItem as jenis }
                        <option value="{jenis}">{jenis}</option>
                    {/each}
                </select>
            </div>
            <div class="form-group my-2">
                <label for="stokItem" class="form-label fw-bold">Stok Item</label>
                <input type="number" bind:value={stokItem} min="0" class="form-control form-control-sm" placeholder="Stok" required/>
            </div>
            <div class="form-group">
                <label for="hargaStokUpdate" class="form-label fw-bold">Harga Stok</label>
                <Rupiah id="hargaStokUpdate" useClass="form-control form-control-sm" bind:value={hargaStok} disabled={false}/>
            </div>
            <div class="form-group my-2">
                <label for="hargaJualUpdate" class="form-label fw-bold">Harga Jual</label>
                <Rupiah id="hargaJualUpdate" useClass="form-control form-control-sm" bind:value={hargaJual} disabled={false}/>
            </div>
            <div class="form-group">
                <label for="keterangan" class="form-label fw-bold">Keterangan</label>
                <textarea class="form-control" bind:value={keterangan} placeholder="Keterangan" rows="3"></textarea>
            </div>

            <button type="submit" class="btn btn-sm btn-primary mt-3 w-100" disabled={isLoading}>
                {#if isLoading}
                    Menyimpan...
                    <span class="spinner-border spinner-border-sm align-middle ms-2"></span>
                {:else}
                    Update Item
                {/if}
            </button>
        </form>
    {/if}
{/snippet}