<script lang="ts">
	import { db } from "$lib/utils/db";
	import type { Cart } from "$lib/interface/Cart";
	import { fetchItems } from "$lib/modules/loadItems";
    import Header from "../../components/Header.svelte";
    import toast, { Toaster } from 'svelte-french-toast';
	import Cash from "../../components/partials/Cash.svelte";
	import type { Master } from "$lib/interface/MasterProduk";
	import Changes from "../../components/partials/Changes.svelte";
	import { currencySanitizer, rupiahFormatter } from "$lib/utils/formatter";

    export let data;

    let cashController: HTMLElement;
    let searchByNameController: HTMLElement;
    let searchBar: string = '';

    let masterProduk: Master[] = data.items;
    let masterProdukDefault: Master[] = masterProduk;

    let cartData: Cart[] = [];

    let paidAmount: string = '';
    let paidTotal: number = 0;
    let paidChanges: string = '';
    let keterangan: string = '';

    let key: string;
    let isLoading: boolean = false;

    $: paidChanges = rupiahFormatter.format(currencySanitizer(paidAmount) - paidTotal);

    const sessionStorage = localStorage.getItem('once');
    const currentSession: { token: string; roles: "Admin" | "User" } = sessionStorage ? JSON.parse(sessionStorage) : null;

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

    function addToCart() {
        if(masterProduk.length === 1){
            const item: Master = masterProduk[0];

            const duplicateFinder = cartData.find((element) => element.id === item.id);

            if(duplicateFinder) {
                console.log("pass")
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
            return toast.error("Item tidak ditemukan!", { position : 'top-right' });
        }

        if (value > mainItem.stokItem) {
            toast.error('Stok tidak cukup!');
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

    async function doPost(): Promise <void> {
        if ( cartData.length === 0 ) {
            toast.error("Harap mengisi keranjang terlebih dahulu!", { position : 'top-right' });
            return;
        }

        if(currencySanitizer(paidAmount) < 1) {
            toast.error("Pembayaran harus diisi!", { position : 'top-right' });
            return;
        }

        isLoading = true;

        const { status, message } = await db({
            cart : cartData,
            cash: currencySanitizer(paidAmount),
            totalTransaksi : paidTotal,
            kembalian: currencySanitizer(paidChanges),
            keterangan: keterangan,
            pic : currentSession.token
        }, 'Post-Transaction');

        isLoading = false;

        if (status === 'success') {
            toast.success(message);
            removeAll();
            masterProduk = await fetchItems();
            masterProdukDefault = masterProduk;
            return;
        }

        toast.error(message);
    }

    function startFocus(){
        searchBar = '';
        searchByNameController.focus();
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
    
    function startPaid(eventPressed:any){
        key = eventPressed.key;
        if (key == 'Escape'){
            startFocus();
        } else if (key == '`') {
            cashController.focus();
        } else if (eventPressed.ctrlKey && eventPressed.key == 'Enter') {
            if(!isLoading) {
                doPost();
            }
        }
    }
</script>
<Toaster/>
<div class="container-fluid">
    <div class="card shadow card-dashed mt-3">
        <div class="card-header">
            <div class="card-title">
                <Header/>
            </div>
            <div class="card-toolbar">
                <span class="h2 fw-bolder text-success mt-3">{rupiahFormatter.format(paidTotal)}</span>
            </div>
        </div>
        <div class="card-body">
            
            <div class="row">
                <div class="col">
                    
                    <form on:submit|preventDefault={addToCart} class="row">
                        <div class="col-1 text-center">
                            <img src="/icons/search.svg" class="h-40px mt-5" alt="SVG Search" />
                        </div>
                        <div class="col">
                            <label for="setToken" class="form-label fw-bold ms-1">[ESC] Scan Barcode atau Nama Item</label>
                            <input type="text" id="setToken" bind:this={searchByNameController} bind:value={searchBar} on:keyup={ () => {stringFilter(searchBar)} } min="0" class="form-control form-control-sm" placeholder="Cari Item" required />
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
                                                <button type="button" class="btn btn-sm btn-icon btn-primary">
                                                    <img src="/icons/add.svg" class="h-25px" alt="SVG Add"/>
                                                </button>
                                            </td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="separator my-5"></div>

                    <div class="row">
                        <div class="col">
                            <label for="setPembayaran" class="form-label fw-bold">Pembayaran</label>
                            <Cash bind:value={paidAmount} bind:cashController/>
                        </div>
                        <div class="col">
                            <label for="viewKembalian" class="form-label fw-bold">Kembalian</label>
                            <Changes bind:value={paidChanges}/>
                        </div>
                    </div>

                    <div class="form-group my-3">
                        <label for="setKeterangan" class="form-label fw-bold">Keterangan</label>
                        <textarea class="form-control" bind:value={keterangan} rows="3" placeholder="Masukkan Keterangan" />
                    </div>

                    <button type="button" on:click={doPost} class="btn btn-lg btn-primary my-1 w-100" disabled={isLoading}>
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
                                                <input type="number" class="form-control-sm form-control text-center" min="1" bind:value={cart.amount} on:change={() => editCartQuantity(index, cart.amount)} on:keyup={() => editCartQuantity(index, cart.amount)}/>
                                            </td>
                                            <td class="text-center">{rupiahFormatter.format(cart.hargaJual ?? 0)}</td>
                                            <td class="text-center">{rupiahFormatter.format(cart.totalHarga ?? 0)}</td>
                                            <td class="text-center">
                                                <button type="button" on:click={() => removeItem(index)} class="btn btn-sm btn-icon btn-danger">
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