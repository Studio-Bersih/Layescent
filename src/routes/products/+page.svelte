<script lang="ts">
	import { db } from "$lib/utils/db";
	import { empty } from "$lib/utils/empty";
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

    let isLoading: boolean = false;

    async function createItem(): Promise <void> {
        console.log(currencySanitizer(hargaStok));
        if (empty(currencySanitizer(hargaStok)) || empty(currencySanitizer(hargaJual))) {
            toast.error('Harap mengisi harga stok dan harga jual!');
            return;
        }

        const { status, message } = await db({
            name: name,
            jenis : jenis,
            barcode: barcode,
            hargaStok: currencySanitizer(hargaStok),
            hargaJual: currencySanitizer(hargaJual),
            keterangan: keterangan,
            stok : stokItem ?? 1
        },'Create-Item');

        if ( status === 'success') {
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
                        Memuat
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
                            <th>Harga Stok</th>
                            <th>Harga Jual</th>
                            <th>Keterangan</th>
                            <th>Stok Item</th>
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
                                    <td>{rupiahFormatter.format(newData.hargaStok)}</td>
                                    <td>{rupiahFormatter.format(newData.hargaJual)}</td>
                                    <td>{newData.keterangan}</td>
                                    <td>{newData.stokItem}</td>
                                </tr>
                            {/each}
                        {/if}
                    </tbody>
                </table>
            </div>

        </div>
    </div>
</div>