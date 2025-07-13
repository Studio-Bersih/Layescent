<script lang="ts">
    import { onMount } from "svelte";
	import { toast } from "svelte-sonner";
	import { goto } from "$app/navigation";
	import { db } from "../../../library/hooks/db";
	import { useNotice } from "../../../library/validator/useNotice";
	import { useConfiguration } from "../../../config/useConfiguration";
	import { rupiahFormatter } from "../../../library/utils/useFormatter";

    import Navigation from "../../../components/Navigation.svelte";

    interface HistoryPenjualan {
        ID: number;
        NAMA: string;
        TERJUAL: number;
        SISA_STOK: number;
        HARGA_BELI: number;
        HARGA_JUAL: number;
        TOTAL_TRANSAKSI: number;
        WAKTU_TRANSAKSI: string;
    }

    let isModal: boolean = $state(false);
    let isLoading: boolean = $state(false);

    let userContents: string = $state('report');

    let newData: HistoryPenjualan[] = $state([]);

    let setDelete: number | null = $state(null);

    let totalTransaksi: number = $state(0);

    onMount(async () => initializePage());

    async function initializePage(): Promise <void> {
        const { status, message, data } = await db({
            staff : $useConfiguration.token,
        }, 'Riwayat-Penjualan')

        if (status === "error") {
            toast.error(message);
            return;
        }

        newData = data;
        totalTransaksi = newData.reduce( (acc, item) => acc + item.TOTAL_TRANSAKSI, 0) ?? 0;
    }

    async function confirmDelete(id: number): Promise <void>{
        toast('Penghapusan Item', {
            description:'Apakah anda yakin?',
            action: {
                label: useNotice.toast.confirmDelete,
                onClick: async () => {
                    if (id === null) {
                        toast.error('Pilih item untuk dihapus terlebih dahulu!');
                        return;
                    }

                    isLoading = true;

                    if (setDelete === -1) {
                        toast.error('Item ini dapat dihapus ketika anda berpindah halaman atau memuat ulang!');
                        return;
                    }

                    const { status, message } = await db({ 
                        id : id,
                        token: $useConfiguration.token,
                        usaha: $useConfiguration.usaha
                    }, 'Delete-Detail-Penjualan');

                    isLoading = false;

                    if (status === 'error') {
                        toast.error(message);
                        return;
                    }

                    const index = newData.findIndex((elements) => elements.ID == setDelete);

                    newData.splice(index, 1);
                    newData = newData;            

                    setDelete = null;
                    toast.success(message);
                }
            },
        });
    }
</script>
<div class="container">
    <Navigation/>
    <div class="card card-dashed shadow mt-3">
        <div class="card-body">
            
            <div class="table-responsive">
                <table class="table align-middle table-hover gx-1 gy-1">
                    <thead>
                        <tr class="text-center fw-bold">
                            <th>#</th>
                            <th>Nama</th>
                            <th>Sisa Stok</th>
                            {#if $useConfiguration.roles === "Admin"}                            
                                <th>Harga Beli</th>
                            {/if}
                            <th>Terjual</th>
                            <th>Harga Jual</th>
                            <th>Total Transaksi</th>
                            <th>Waktu Transaksi</th>
                            {#if $useConfiguration.roles === "Admin"}
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
                                    {#if $useConfiguration.roles === "Admin"}                                    
                                        <td>{rupiahFormatter.format(newData.HARGA_BELI)}</td>
                                    {/if}
                                    <td>{newData.TERJUAL}</td>
                                    <td>{rupiahFormatter.format(newData.HARGA_JUAL)}</td>
                                    <td>{rupiahFormatter.format(newData.TOTAL_TRANSAKSI)}</td>
                                    <td>{newData.WAKTU_TRANSAKSI}</td>
                                    {#if $useConfiguration.roles === "Admin"}
                                        <td>
                                            <button type="button" onclick={() => confirmDelete(newData.ID)} class="btn btn-sm btn-icon btn-danger">
                                                <img src="/icons/trash.svg" class="h-25px" alt="SVG Trash" />
                                            </button>
                                        </td>
                                    {/if}
                                </tr>
                            {/each}
                            <tr>
                                <td colspan="6" class="text-center fw-bolder bg-light-success">Total Transaksi</td>
                                <td class="text-center">{rupiahFormatter.format(totalTransaksi)}</td>
                            </tr>
                        {/if}
                    </tbody>
                </table>
            </div>

        </div>
    </div>
</div>