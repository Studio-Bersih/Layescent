<script lang="ts">
	import { db } from "$lib/utils/db";
	import { empty } from "$lib/utils/empty";
	import Modal from "../../components/Modal.svelte";
    import Header from "../../components/Header.svelte";
    import toast, { Toaster } from 'svelte-french-toast';
	import { defaultStrings } from "$lib/strings/strings";
	import type { Master } from "$lib/interface/MasterProduk";
	import Money from "../../components/partials/Money.svelte";
	import { currencySanitizer, rupiahFormatter } from "$lib/utils/formatter";

    export let data;
    let newData: Master[] = data.items;

    let name: string = '';
    let jenis: string = '';
    let barcode: string = '';
    let hargaStok: string = '';
    let hargaJual: string = '';
    let keterangan: string = '';
    let stokItem: number | null = null; 

    let isModal: boolean = false;
    let isLoading: boolean = false;

    let setDelete: number | null = null; 

    function viewModal(id: number) {
        setDelete = id;
        openModal();
    }

    const openModal = () => {
        isModal = true
    };

    const closeModal = () => {
        isModal = false
    };

    async function createItem(): Promise <void> {
        if (empty(currencySanitizer(hargaStok)) || empty(currencySanitizer(hargaJual))) {
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
            stok : stokItem ?? 1
        },'Create-Item');

        isLoading = false;

        if (status === 'success') {
            toast.success(message);
            newData.push({
                id: -1,
                name : name,
                jenis : jenis,
                barcode: barcode,
                hargaStok : currencySanitizer(hargaStok),
                hargaJual : currencySanitizer(hargaJual),
                keterangan : keterangan,
                stokItem: stokItem ?? 1
            });
            newData = newData;
            removeAll();
            return;
        }

        toast.error(message);
    }

    async function deleteItem(): Promise <void> {
        if (setDelete === null) {
            toast.error('Pilih item untuk dihapus terlebih dahulu!');
            return;
        }

        if (setDelete === -1) {
            toast.error('Item ini dapat dihapus ketika anda berpindah halaman atau memuat ulang!');
            return;
        }

        isLoading = true;

        const { status, message } = await db({ id : setDelete }, 'Delete-Item');
        closeModal();

        isLoading = false;

        if (status === 'success') {
            const index = newData.findIndex((elements: any) => elements.id == setDelete);

            newData.splice(index, 1);
            newData = newData;            

            setDelete = null;
            toast.success(message);
            return;
        }

        toast.error(message);
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
<Toaster/>
<div class="container-fluid">
    <div class="card card-dashed shadow mt-3">
        <div class="card-header">
            <div class="card-title"><Header/></div>
            <div class="card-toolbar">
                <button type="button" class="btn btn-sm btn-success me-1 mb-1">
                    <img src="/icons/pen.svg" class="h-20px me-2" alt="SVG Input Item" /> Buat Item Baru
                </button>
            </div>
        </div>
        <div class="card-body">

            <form on:submit|preventDefault={createItem} class="border rounded p-3">
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
                                {#each defaultStrings.jenis as jenis }
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
                            <Money bind:value={hargaStok}/>
                        </div>
                    </div>
                    <div class="col">
                        <div class="form-group">
                            <label for="hargaJual" class="form-label fw-bold">Harga Jual</label>
                            <Money bind:value={hargaJual}/>
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

            <div class="separator my-10" />

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
                            <th class="text-center">Stok Item</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {#if newData.length === 0}
                            <tr>
                                <td colspan="8" class="text-center">Tidak ada data</td>
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
                                    <td>{newData.keterangan}</td>
                                    <td class="text-center">{newData.stokItem}</td>
                                    <td>
                                        <button type="button" on:click={() => viewModal(newData.id)} class="btn btn-sm btn-icon btn-danger">
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

<!-- Modal -->
{#if isModal}
    <Modal open={isModal} onClose={closeModal}>
        <div class="text-center">
            <img src="/icons/alert.svg" class="h-150px mt-10" alt="SVG Alert" />
            <h1 class="fw-bolder">Apakah anda yakin?</h1>
        </div>

        <div class="d-flex justify-content-evenly">
            <button type="button" on:click={deleteItem} class="btn btn-sm btn-danger my-7" disabled={isLoading}>
                {#if isLoading}
                    Menghapus...
                    <span class="spinner-border spinner-border-sm align-middle ms-2"></span>
                {:else}
                    <img src="/icons/trash.svg" class="h-25px" alt="SVG Trash" />
                    Ya, hapus Item ini
                {/if}
            </button>
            <button type="button" on:click={() => isModal = false} class="btn btn-sm btn-secondary my-7">
                <img src="/icons/cancel.svg" class="h-25px" alt="SVG Cancel" />
                Batalkan hapus
            </button>
        </div>
    </Modal>
{/if}