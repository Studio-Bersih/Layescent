<script lang="ts">
	import { onMount } from "svelte";
	import { db } from "$lib/utils/db";
	import { goto } from "$app/navigation";
    import Modal from "../../components/Modal.svelte";
	import Header from "../../components/Header.svelte";
    import toast, { Toaster } from 'svelte-french-toast';
	import { rupiahFormatter } from "$lib/utils/formatter";
	import Users from "../../components/features/Users.svelte";
	import Report from "../../components/features/Report.svelte";
	import type { HistoryPenjualan } from "$lib/interface/Riwayat";

    let isModal: boolean = false;
    let isLoading: boolean = false;
    let userContents: string = 'report';

    let newData: HistoryPenjualan[] = [];

    let setDelete: number | null = null;

    let totalTransaksi: number = 0;

    $: totalTransaksi = newData.reduce( (acc, item) => acc + item.TOTAL_TRANSAKSI, 0) ?? 0;

    const sessionStorage = localStorage.getItem('once');
    const currentSession: { token: string; roles: "Admin" | "User"; usaha: string; } = sessionStorage ? JSON.parse(sessionStorage) : null;

    onMount(async () => {
        const { status, data } = await db({
            staff : currentSession.token,
        }, 'Riwayat-Penjualan')

        if (status === "success") {
            newData = data
        }
    });

    function viewModal(id: string) {
        userContents = id;
        openModal();
    }

    const openModal = () => {
        isModal = true
    };

    const closeModal = () => {
        isModal = false
    };

    async function confirmDelete(id: number){
        setDelete = id;
        userContents = 'delete';
        console.log(id)
        openModal();
    }

    async function removeItem(): Promise <void> {
        if (setDelete === null) {
            toast.error('Pilih item untuk dihapus terlebih dahulu!');
            return;
        }

        isLoading = true;

        if (setDelete === -1) {
            toast.error('Item ini dapat dihapus ketika anda berpindah halaman atau memuat ulang!');
            return;
        }

        const { status, message } = await db({ id : setDelete }, 'Delete-Detail-Penjualan');
        closeModal();

        isLoading = false;

        if (status === 'success') {
            const index = newData.findIndex((elements) => elements.ID == setDelete);

            newData.splice(index, 1);
            newData = newData;            

            setDelete = null;
            toast.success(message);
            return;
        }

        toast.error(message);
    }

    function endSession() {
        localStorage.clear();
        return goto('/');
    }
</script>
<Toaster/>
<div class="container-fluid">
    <div class="card card-dashed shadow mt-3">
        <div class="card-header">
            <div class="card-title">
                <Header/>
            </div>
            <div class="card-toolbar">
                {#if currentSession.roles === "Admin"}
                    <button type="button" on:click={() => viewModal('report')}  class="btn btn-sm btn-success me-2 mb-1">
                        <img src="/icons/excel.svg" class="h-20px me-2" alt="SVG Excel" /> Unduh Laporan
                    </button>
                    <button type="button" on:click={() => viewModal('users')} class="btn btn-sm btn-warning me-2 mb-1">
                        <img src="/icons/users.svg" class="h-20px me-2" alt="SVG Excel" /> Pengguna
                    </button>
                {/if}
                <button type="button" on:click={() => viewModal('logOff')} class="btn btn-sm btn-dark me-2 mb-1">
                    <img src="/icons/power.svg" class="h-20px me-2" alt="SVG Log Off" /> Akhiri Sesi
                </button>
            </div>
        </div>
        <div class="card-body">
            
            <div class="table-responsive">
                <table class="table align-middle table-hover gx-1 gy-1">
                    <thead>
                        <tr class="text-center fw-bold">
                            <th>#</th>
                            <th>Nama</th>
                            <th>Sisa Stok</th>
                            {#if currentSession.roles === "Admin"}                            
                                <th>Harga Beli</th>
                            {/if}
                            <th>Terjual</th>
                            <th>Harga Jual</th>
                            <th>Total Transaksi</th>
                            <th>Waktu Transaksi</th>
                            {#if currentSession.roles === "Admin"}
                                <th>Hapus Transaksi</th>
                            {/if}
                        </tr>
                    </thead>
                    <tbody>
                        {#if newData.length === 0}
                            <tr>
                                <td colspan="7" class="text-center">Tidak ada data</td>
                            </tr>
                        {:else}
                            {#each newData as newData,index }
                                <tr class="text-center">
                                    <td>{index + 1}</td>
                                    <td class="text-start">{newData.NAMA}</td>
                                    <td>{newData.SISA_STOK}</td>
                                    {#if currentSession.roles === "Admin"}                                    
                                        <td>{rupiahFormatter.format(newData.HARGA_BELI)}</td>
                                    {/if}
                                    <td>{newData.TERJUAL}</td>
                                    <td>{rupiahFormatter.format(newData.HARGA_JUAL)}</td>
                                    <td>{rupiahFormatter.format(newData.TOTAL_TRANSAKSI)}</td>
                                    <td>{newData.WAKTU_TRANSAKSI}</td>
                                    {#if currentSession.roles === "Admin"}
                                        <td>
                                            <button type="button" on:click={() => confirmDelete(newData.ID)} class="btn btn-sm btn-icon btn-danger">
                                                <img src="/icons/trash.svg" class="h-25px" alt="SVG Trash" />
                                            </button>
                                        </td>
                                    {/if}
                                </tr>
                            {/each}
                            <tr>
                                <td colspan="6" class="text-center fw-bolder bg-light-success">Total Transaksi</td>
                                <td class="text-start" colspan="2">{rupiahFormatter.format(totalTransaksi)}</td>
                            </tr>
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
        {#if userContents === 'users'}
            <Users/>
        {:else if userContents === 'report'}
            <Report/>
        {:else if userContents === 'delete'}
            <div class="text-center">
                <img src="/icons/alert.svg" class="h-150px mt-10" alt="SVG Alert" />
                <h1 class="fw-bolder">Apakah anda yakin?</h1>
            </div>
            <div class="d-flex justify-content-evenly">
                <button type="button" on:click={removeItem} class="btn btn-sm btn-danger my-7" disabled={isLoading}>
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
        {:else if userContents === 'logOff'}
            <p class="text-center">Anda akan mengakhiri sesi dan keluar dari sistem!</p>
            <button type="button" on:click={endSession} class="btn btn-sm btn-danger my-5 w-100">Akhiri sesi saya!</button>
        {/if}
    </Modal>
{/if}