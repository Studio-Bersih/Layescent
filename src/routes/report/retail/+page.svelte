<script lang="ts">
    import { onMount } from "svelte";
	import { toast } from "svelte-sonner";
	import { db } from "../../../library/hooks/db";
	import { useNotice } from "../../../library/validator/useNotice";
	import { useConfiguration } from "../../../config/useConfiguration";
	import { rupiahFormatter } from "../../../library/utils/useFormatter";
	import { initializeDate } from "../../../library/validator/useDefault";

	import Modal from "../../../components/shared/Modal.svelte";
    import Navigation from "../../../components/Navigation.svelte";
	import { loadToken } from "../../../library/validator/useAuth";

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

    interface Users { 
        ID: number; 
        TOKEN: string; 
        ROLE: "Admin" | "User";
        CABANG: number;
        USAHA: string;
    }

    let isLoading: boolean = $state(false);
    let isModal: boolean = $state(false);

    let newData: HistoryPenjualan[] = $state([]);

    let setDelete: number | null = $state(null);

    let totalTransaksi: number = $state(0);

    let totalTarikTunai: number = $state(0);
    let totalTransfer: number = $state(0);
    let totalAdmin: number = $state(0);

    let totalBersih: number = $state(0);

    let allStaff: Users[] = $state([]);
    let selectedStaff: string = $state($useConfiguration.token);

    let start: string = $state(initializeDate("current"));
    let end: string = $state(initializeDate("current"));

    let updateId: number | null = $state(null);
    let setDate: string = $state('');

    onMount(async () => {
        loadToken();
        getReports();
        getStaff();
    });

    async function getReports(): Promise <void> {
        const { status, message, data } = await db({
            staff : selectedStaff,
            start: start,
            end: end
        }, 'Riwayat-Penjualan')

        if (status === "error") {
            toast.error(message);
            return;
        }

        newData = data.items;

        totalTarikTunai = Number(data.decrease_total) ?? 0;
        totalTransfer = Number(data.increase_total) ?? 0;
        totalAdmin = Number(data.fee_total) ?? 0;

        totalTransaksi = newData.reduce( (acc, item) => acc + item.TOTAL_TRANSAKSI, 0) ?? 0;

        // Calculate total bersih
        totalBersih = newData.reduce(
            (acc, item) => acc + ((item.HARGA_JUAL * item.TERJUAL) - (item.HARGA_BELI * item.TERJUAL)), 
            0
        ) ?? 0;
    }

    async function getStaff(): Promise <void> {
        const { status, message, data } = await db({
            usaha: $useConfiguration.usaha
        }, 'Users');

        if (status === "error") {
            toast.error(message);
            return;
        }

        allStaff = data;
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

    async function edit(index: number, id: number) {
        isModal = true;
        updateId = id;
        const raw = newData[index].WAKTU_TRANSAKSI;

        if (!raw) {
            setDate = "";
            return;
        }

        const [datePart] = raw.split(" "); 
        const [day, month, year] = datePart.split("/");

        setDate = `${year}-${month}-${day}`;
    }

    async function updateForm(): Promise <void> {
        const { status, message } = await db({
            ID: updateId,
            CREATED_AT: setDate
        }, "Tanggal-Penjualan");

        if (status === "error") {
            toast.error(message);
            return;
        }

        toast.success(message);
    }
</script>
<div class="container">
    <Navigation/>
    <div class="card card-dashed shadow mt-3">
        <div class="card-body">

            <div class="row mb-3">
                <div class="col">
                    <span class="h4 text-gray-800">Riwayat Penjualan</span>
                </div>
                {#if $useConfiguration.roles === "Admin"}
                    <div class="col-8">
                        <div class="row">
                            <div class="col">
                                <label for="" class="form-label fw-bold">Start</label>
                                <input type="date" bind:value={start} class="form-control form-control-sm"/>
                            </div>
                            <div class="col">
                                <label for="" class="form-label fw-bold">End</label>
                                <input type="date" bind:value={end} class="form-control form-control-sm"/>
                            </div>
                            <div class="col">
                                <label for="" class="form-label fw-bold">Staff</label>
                                <select id="chooseStaff" class="form-select form-select-sm" bind:value={selectedStaff}>
                                    <option value="" selected disabled>Pilih Staff Kasir</option>"
                                    {#each allStaff as staff}
                                        <option value={staff.TOKEN}>{staff.TOKEN} ({staff.ROLE})</option>
                                    {/each}
                                </select>
                            </div>
                            <div class="col-2">
                                <button type="button" class="btn btn-sm btn-primary mt-8" onclick={getReports}>Cari</button>
                            </div>
                        </div>
                    </div>
                {/if}
            </div>

            <div class="separator my-7"></div>
            
            <div class="table-responsive">
                <table class="table align-middle table-hover gx-1 gy-1">
                    <thead>
                        <tr class="text-center fw-bold">
                            <th>#</th>
                            <th>Nama</th>
                            <th>Terjual</th>
                            <th>Sisa Stok</th>
                            {#if $useConfiguration.roles === "Admin"}                            
                                <th>Harga Beli</th>
                            {/if}
                            <th>Harga Jual</th>
                            <th>Total Transaksi</th>
                            <th>Waktu Transaksi</th>
                            {#if $useConfiguration.roles === "Admin"}
                                <th>Keuntungan Bersih</th>
                                <th>Action</th>
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
                                    <td>{newData.TERJUAL}</td>
                                    <td>{newData.SISA_STOK}</td>
                                    {#if $useConfiguration.roles === "Admin"}                                    
                                        <td>{rupiahFormatter.format(newData.HARGA_BELI)}</td>
                                    {/if}
                                    <td>{rupiahFormatter.format(newData.HARGA_JUAL)}</td>
                                    <td>{rupiahFormatter.format(newData.TOTAL_TRANSAKSI)}</td>
                                    <td>{newData.WAKTU_TRANSAKSI}</td>
                                    {#if $useConfiguration.roles === "Admin"}
                                        <td>{rupiahFormatter.format((newData.HARGA_JUAL * newData.TERJUAL) - (newData.HARGA_BELI * newData.TERJUAL))}</td>
                                        <td>
                                            <button type="button" onclick={() => edit(index, newData.ID)} class="btn btn-sm btn-icon btn-primary">
                                                <img src="/icons/elements/Edit.svg" class="h-15px" alt="SVG Edit" />
                                            </button>
                                            <button type="button" onclick={() => confirmDelete(newData.ID)} class="btn btn-sm btn-icon btn-danger">
                                                <img src="/icons/trash.svg" class="h-25px" alt="SVG Trash" />
                                            </button>
                                        </td>
                                    {/if}
                                </tr>
                            {/each}
                            <tr>
                                <td></td>
                                <td></td>
                                <td></td>
                                <td class="text-center"></td>
                                <td class="text-center"></td>
                                <td class="text-center"></td>
                                <td class="text-center">{rupiahFormatter.format(totalTransaksi)}</td>
                                <td class="text-center"></td>
                                <td class="text-center text-success fw-bold">{rupiahFormatter.format(totalBersih)}</td>
                                <td class="text-center"></td>
                            </tr>
                        {/if}
                    </tbody>
                </table>
            </div>

            <div class="separator my-3"></div>
            <h3>Ringkasan Penjualan Hari Ini</h3>

            <table class="table table-striped align-center mt-5">
                <thead>
                    <tr class="fw-bolder">
                        <th>Total Transaksi</th>
                        <th>Total Tarik Tunai</th>
                        <th>Total Transfer</th>
                        {#if $useConfiguration.roles === "Admin"}
                            <th>Total Admin</th>
                            <th>Total Kas (Dengan Admin)</th>
                        {/if}
                        <th>Total Kas (Tanpa Admin)</th>
                    </tr>
                </thead>
                <tbody>
                    <tr class="">
                        <td>{rupiahFormatter.format(totalTransaksi)}</td>
                        <td>- {rupiahFormatter.format(totalTarikTunai)}</td>
                        <td>{rupiahFormatter.format(totalTransfer)}</td>
                        {#if $useConfiguration.roles === "Admin"}
                            <td>{rupiahFormatter.format(totalAdmin)}</td>
                            <td>{rupiahFormatter.format(totalTransaksi + (totalTransfer - totalTarikTunai + totalAdmin))}</td>
                        {/if}
                        <td>{rupiahFormatter.format(totalTransaksi + (totalTransfer - totalTarikTunai))}</td>
                    </tr>
                </tbody>
            </table>

        </div>
    </div>
</div>

<Modal bind:isModal={isModal} size={"md"} title="" onClose={() => isModal = !isModal}>
    {#snippet modalContent()}
        <div class="form-group">
            <label for="" class="fw-bold form-label">Pindah Tanggal</label>
            <input type="date" bind:value={setDate} class="form-control form-control-sm" />
        </div>

        <button type="button" onclick={updateForm} class="btn btn-sm btn-primary">Simpan</button>
    {/snippet}
</Modal>