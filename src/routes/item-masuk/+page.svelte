<script lang="ts">
	import { onMount, tick } from "svelte";
	import { toast } from "svelte-sonner";
	import { db } from "../../library/hooks/db";
	import { loadToken } from "../../library/validator/useAuth";
	import { useNotice } from "../../library/validator/useNotice";
	import { useConfiguration } from "../../config/useConfiguration";
	import { currencySanitizer, rupiahFormatter } from "../../library/utils/useFormatter";

	import Navigation from "../../components/Navigation.svelte";

    interface Master { 
        id: number;
        name: string; 
        jenis: string; 
        barcode: string; 
        hargaStok: number; 
        hargaJual: number; 
        keterangan: string; 
        stokItem: number 
    }

    interface Cart { 
        id: number; 
        name: string; 
        amount: number; 
        hargaJual: number; 
        totalHarga: number 
    }

    let searchByNameController: HTMLElement;
    let searchBar: string = $state('');

    let masterProduk: Master[] = $state([]);
    let masterProdukDefault: Master[] = $state([]);

    let cartData: Cart[] = $state([]);

    let paidAmount: string = $state('');
    let paidTotal: number = $state(0);
    let paidChanges: string = $state('');
    let keterangan: string = $state('');

    let key: string = $state('');
    let isLoading: boolean = $state(false);
    let currentIndex: number = $state(0);

    let setBranch: string = $state('');

    $effect(() => {
        paidChanges = rupiahFormatter.format(currencySanitizer(paidAmount) - paidTotal);
    })

    let idleTimeout: ReturnType<typeof setTimeout>;
    let refreshTimeout: ReturnType<typeof setTimeout>;

    function resetIdleTimer() {
        clearTimeout(idleTimeout);
        clearTimeout(refreshTimeout);


        idleTimeout = setTimeout(() => {
            if (searchByNameController) {
                searchByNameController.focus();
            }
        }, 10000); // 20 seconds

        refreshTimeout = setTimeout(() => {
            initializePage();
        }, 300000); // 5 minutes
    }

    onMount(() => {
        const events = ['mousemove', 'keydown', 'mousedown', 'touchstart'];
        events.forEach(event => window.addEventListener(event, resetIdleTimer));
        resetIdleTimer(); // initialize
        initializePage()
    });

    async function initializePage(): Promise <void>{
        loadToken();
        const { status, message, data } = await db({
            TOKEN: $useConfiguration.token,
            USAHA: $useConfiguration.usaha,
            CABANG: $useConfiguration.cabang
        }, 'List-Item');

        if (status === "error") {
            toast.error(message);
            return
        }

        masterProduk = data.map((element: { ID: number; NAMA: string; BARCODE: string; JENIS: string; STOK_ITEM: number; HARGA_STOK: number; HARGA_JUAL: number; KETERANGAN: string }) => ({
            id: element.ID,
            name: element.NAMA,
            jenis: element.JENIS,
            barcode: element.BARCODE,
            hargaStok: element.HARGA_STOK,
            hargaJual: element.HARGA_JUAL,
            keterangan: element.KETERANGAN,
            stokItem: element.STOK_ITEM,
        }));
        masterProduk = masterProduk;
        masterProdukDefault = masterProduk;
    } 

    function stringFilter(ID: string): void {
        if (ID === '') {
            masterProduk = masterProdukDefault;
        } else {
            const searchID = ID.toLowerCase();
            masterProduk = masterProdukDefault.filter((item: { barcode: string; name: string | string[]; }) => {
                const nameMatches = typeof item.name === 'string'
                    ? item.name.toLowerCase().includes(searchID)
                    : Array.isArray(item.name) && item.name.some(name => name.toLowerCase().includes(searchID));

                const barcodeMatches = item.barcode?.toLowerCase().includes(searchID) ?? false;

                return nameMatches || barcodeMatches;
            });
        }
    }

    function addToCart(event: Event) {
        event.preventDefault();
        if(masterProduk.length === 1){
            const item: Master = masterProduk[0];

            const duplicateFinder = cartData.find((element) => element.id === item.id);

            if(duplicateFinder) {
                duplicateFinder.amount += 1;
                duplicateFinder.totalHarga = duplicateFinder.amount * item.hargaJual;
                cartData = cartData;
                startFocus();
                return recalculatePrice(cartData);
            }

            cartData.push({
                id : item.id,
                name : item.name,
                amount : 1,
                hargaJual: item.hargaJual,
                totalHarga: 1 * item.hargaJual
            });
            cartData = cartData;
            startFocus();
            return recalculatePrice(cartData);
        }
    }

    function editCartQuantity(ID: number,value:number) {
        const findOnCart = cartData[ID];
        const mainItem = masterProdukDefault.find((objectKey) => objectKey.id === findOnCart.id)

        if(!mainItem){
            return toast.error("Item tidak ditemukan!");
        }

        cartData[ID].totalHarga = value * findOnCart.hargaJual
        cartData = cartData;
        return recalculatePrice(cartData);
    }

    function removeItem(id: number) {
        cartData.splice(id, 1);
        cartData = cartData;
        return recalculatePrice(cartData);
    }

    function recalculatePrice(cartData:any){
        paidTotal = 0;
        const sumTotal = cartData.reduce( (accumulator: any, object: { totalHarga: number }) => {
            return accumulator + Number(object.totalHarga);
        }, 0 );
        paidTotal = sumTotal;
        return paidTotal;
    }

    async function startFocus(){
        searchBar = '';
        await tick();
        searchByNameController.focus(); // It can't even focus on the input element
    }

    function removeAll(){
        cartData = [];
        paidAmount = '';
        paidTotal = 0;
        paidChanges = '';
        keterangan = '';
        isLoading = false;
        searchBar = '';
    }

    function focusButton(index: number) {
        const btn = document.getElementById(`selectable_${index}`) as HTMLButtonElement;
        if (btn) {
            btn.focus();
        }
    }
    
    function startPaid(event: KeyboardEvent){
        key = event.key;
        if (key == 'Escape'){
            startFocus();
        } else if (event.ctrlKey && event.key == 'Enter') {
            if(!isLoading) {
                doPost();
            }
        } 

        else if (key === 'ArrowDown') {
            event.preventDefault();
            currentIndex = Math.min(currentIndex + 1, masterProduk.length - 1);
            focusButton(currentIndex);
        } else if (key === 'ArrowUp') {
            event.preventDefault();
            currentIndex = Math.max(currentIndex - 1, 0);
            focusButton(currentIndex);
        }

    }

    async function addByButton(index: number) {
        const item: Master = masterProduk[index];

        const duplicateFinder = cartData.find((element) => element.id === item.id);

        if(duplicateFinder) {
            duplicateFinder.amount += 1;
            duplicateFinder.totalHarga = duplicateFinder.amount * item.hargaJual;
            cartData = cartData;
            startFocus();
            return recalculatePrice(cartData);
        }

        cartData.push({
            id : item.id,
            name : item.name,
            amount : 1,
            hargaJual: item.hargaJual,
            totalHarga: 1 * item.hargaJual
        });
        cartData = cartData;
        startFocus();
        return recalculatePrice(cartData);
    }

    async function doPost(): Promise <void> {
        if ( cartData.length === 0 ) {
            toast.error(useNotice.general.emptyCarts);
            return;
        }

        if (setBranch === '') {
            toast.error('Pilih Cabang terlebih dahulu!');
            return;
        }

        isLoading = true;

        const { status, message } = await db({
            cart : cartData,
            cash: currencySanitizer(paidAmount),
            totalTransaksi : paidTotal,
            kembalian: currencySanitizer(paidChanges),
            keterangan: keterangan,
            pic : $useConfiguration.token,
            usaha: $useConfiguration.usaha,
            cabangTujuan: Number(setBranch),
            cabangAsal: Number($useConfiguration.cabang)
        }, 'Item-Masuk');

        isLoading = false;

        if (status === 'error') {
            toast.error(message);
            return;
        }
        
        toast.success(message);
        removeAll();
        initializePage();
    }
</script>
<div class="container-fluid">
    <Navigation/>
    <div class="card shadow card-dashed mt-3">
        <div class="card-header">
            <div class="card-title text-primary fw-bolder">Item Masuk</div>
            <div class="card-toolbar">
                <span class="h2 fw-bolder text-success mt-3">{rupiahFormatter.format(paidTotal)}</span>
            </div>
        </div>
        <div class="card-body">
            
            <div class="row">
                <div class="col">
                    
                    <form onsubmit={addToCart} class="row">
                        <div class="col-1 text-center">
                            <img src="/icons/search.svg" class="h-40px mt-5" alt="SVG Search" />
                        </div>
                        <div class="col">
                            <label for="setToken" class="form-label fw-bold ms-1">[ESC] Scan Barcode atau Nama Item</label>
                            <input type="text" id="setToken" bind:this={searchByNameController} bind:value={searchBar} onkeyup={ () => {stringFilter(searchBar)} } min="0" class="form-control form-control-sm" placeholder="Cari Item" required />
                        </div>
                        <div class="col-2">
                            <button type="submit" class="btn btn-sm btn-icon btn-primary mt-8">
                                <img src="/icons/add.svg" class="h-25px" alt="SVG Add" />
                            </button>
                        </div>
                    </form>

                    <div class="separator my-5"></div>

                    <div class="overflow-auto" style="height: 250px;">
                        <div class="table-responsive">
                            <table class="table align-middle gx-1 gy-1 table-hover">
                                <thead>
                                    <tr class="text-center fw-bold">
                                        <th>#</th>
                                        <th>Nama</th>
                                        <th>Stok</th>
                                        <th>Harga</th>
                                        <th class="text-end">Barcode</th>
                                        <th>Act</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {#each masterProduk as newData,index }
                                        <tr>
                                            <td class="text-center">{index + 1}</td>
                                            <td>{newData.name}</td>
                                            <td class="text-center">{newData.stokItem}</td>
                                            <td class="text-center">{rupiahFormatter.format(newData.hargaJual)}</td>
                                            <td class="text-end text-muted">{newData.barcode}</td>
                                            <td class="text-center">
                                                <button id={`selectable_${index}`} tabindex="0" onclick={() => addByButton(index)} type="button" class="btn btn-sm btn-icon btn-light-primary">
                                                    <img src="/icons/add.svg" class="h-25px" alt="SVG Add"/>
                                                </button>
                                            </td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="pilihCabang" class="form-label fw-bold">Pilih Cabang</label>
                        <select id="pilihCabang" bind:value={setBranch} class="form-select form-select-sm">
                            <option value="" disabled selected>Pilih Cabang</option>
                            <option value=1>1</option>
                            <option value=2>2</option>
                            <option value=3>3</option>
                        </select>
                    </div>

                    <div class="form-group my-3">
                        <label for="setKeterangan" class="form-label fw-bold">Keterangan Item Masuk</label>
                        <textarea class="form-control" bind:value={keterangan} rows="3" placeholder="Masukkan Keterangan"></textarea>
                    </div>

                    <button type="button" onclick={doPost} class="btn btn-lg btn-primary my-1 w-100" disabled={isLoading}>
                        {#if isLoading}
                            Menyimpan...
                            <span class="spinner-border spinner-border-sm align-middle ms-2"></span>
                        {:else}
                            [CTRL + ENTER] Simpan Transaksi
                        {/if}
                    </button>
                    
                </div>
                <div class="col">
                    <div class="table-responsive">
                        <table class="table align-middle table-hover">
                            <thead>
                                <tr class="fw-bold text-center gx-1 gy-1">
                                    <th>#</th>
                                    <th>Nama</th>
                                    <th>Jumlah</th>
                                    <th>Harga</th>
                                    <th>Total Harga</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#if cartData.length === 0}
                                    <tr>
                                        <td class="text-center" colspan="6">Tidak ada data</td>
                                    </tr>
                                {:else}
                                    {#each cartData as cart,index }
                                        <tr>
                                            <td class="text-center">{index + 1}</td>
                                            <td>{cart.name}</td>
                                            <td  width="15%" class="text-center">
                                                <input type="number" class="form-control-sm form-control text-center" min="1" bind:value={cart.amount} onchange={() => editCartQuantity(index, cart.amount)} onkeyup={() => editCartQuantity(index, cart.amount)}/>
                                            </td>
                                            <td class="text-center">{rupiahFormatter.format(cart.hargaJual ?? 0)}</td>
                                            <td class="text-center">{rupiahFormatter.format(cart.totalHarga ?? 0)}</td>
                                            <td class="text-center">
                                                <button type="button" onclick={() => removeItem(index)} class="btn btn-sm btn-icon btn-danger">
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
    </div>
</div>

<svelte:window on:keydown={startPaid} />