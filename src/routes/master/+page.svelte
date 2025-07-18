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

    onMount(() => initializePage());

    async function initializePage(): Promise <void> {
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
            stok : stokItem ?? 1,
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
        if (stock < 1) {
            toast.error("Stok tidak boleh dibawah 0!");
            return;
        }

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
            stok : stokItem ?? 1
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

    function removeAll() {
        name = '';
        jenis = '';
        barcode = '';
        hargaStok = '';
        hargaJual = '';
        keterangan = '';
        stokItem = null; 
    }
</script>
<Navigation/>
<div class="container-fluid">
    <div class="card card-dashed shadow mt-3">
        <div class="card-header">
            <div class="card-toolbar">
                <button type="button" onclick={viewForm} class="btn btn-sm btn-success me-1 mb-1">
                    <img src="/icons/pen.svg" class="h-20px me-2" alt="SVG Input Item" /> Buat Item Baru
                </button>
            </div>
        </div>
        <div class="card-body">

            <div class="row">
                <div class="col-1 text-center">
                    <img src="/icons/search.svg" class="h-40px" alt="SVG Search" />
                </div>
                <div class="col">
                    <label for="setToken" class="form-label fw-bold ms-1">[ESC] Scan Barcode atau Nama Item</label>
                    <input type="text" id="setToken" bind:this={searchByNameController} bind:value={searchBar} onkeyup={ () => {stringFilter(searchBar)} } min="0" class="form-control form-control-sm w-25" placeholder="Cari Item" required />
                </div>
            </div>

            <div class="separator my-10"></div>

            <h1 class="mb-7">Daftar Item</h1>

            <div class="table-responsive">
                <table class="table align-middle table-hover gx-1 gy-1">
                    <thead>
                        <tr class="fw-bolder">
                            <th>#</th>
                            <th>Nama</th>
                            <th>Jenis</th>
                            <th>Barcode</th>
                            <th class="text-center">Harga Stok</th>
                            <th class="text-center">Harga Jual</th>
                            <th>Keterangan</th>
                            <th class="text-center">Cabang 1</th>
                            <th class="text-center">Cabang 2</th>
                            <th class="text-center">Cabang 3</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {#if newData.length === 0}
                            <tr>
                                <td colspan="10" class="text-center">Tidak ada data</td>
                            </tr>
                        {:else}
                            {#each newData as newData, index }
                                <tr>
                                    <td>{index + 1}</td>
                                    <td>{newData.name}</td>
                                    <td>{newData.jenis}</td>
                                    <td>{newData.barcode}</td>
                                    <td class="text-center">{rupiahFormatter.format(newData.hargaStok)}</td>
                                    <td class="text-center">{rupiahFormatter.format(newData.hargaJual)}</td>
                                    <td>{newData.keterangan ?? '-'}</td>
                                    <td width="10%" class="text-center">
                                        <input type="number" bind:value={newData.stokItem} class="form-control form-control-sm text-center"/>
                                    </td>
                                    <td width="10%" class="text-center">
                                        <input type="number" bind:value={newData.stokItemSecond} class="form-control form-control-sm text-center"/>
                                    </td>
                                    <td width="10%" class="text-center">
                                        <input type="number" bind:value={newData.stokItemThird} class="form-control form-control-sm text-center"/>
                                    </td>
                                    <td>
                                        <button type="button" onclick={() => updateStock(newData.id, newData.stokItem, newData.stokItemSecond, newData.stokItemThird)} class="btn btn-sm btn-icon btn-primary mb-1">
                                            <img src="/icons/sync.svg" class="h-25px" alt="SVG Synchronize" />
                                        </button>
                                        <button type="button" onclick={() => viewModal(newData.id, "update")} class="btn btn-sm btn-icon btn-warning mb-1">
                                            <img src="/icons/pen.svg" class="h-25px" alt="SVG Synchronize" />
                                        </button>
                                        <button type="button" onclick={() => viewModal(newData.id, 'delete')} class="btn btn-sm btn-icon btn-danger mb-1">
                                            <img src="/icons/trash.svg" class="h-25px" alt="SVG Trash" />
                                        </button>
                                    </td>
                                </tr>
                            {/each}
                        {/if}
                    </tbody>
                </table>
            </div>

        </div>
    </div>
</div>

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
                    <input type="number" bind:value={stokItem} min="1" class="form-control form-control-sm" placeholder="Stok" required/>
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
                <input type="number" bind:value={stokItem} min="1" class="form-control form-control-sm" placeholder="Stok" required/>
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