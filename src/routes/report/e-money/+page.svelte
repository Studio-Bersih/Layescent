<script lang="ts">
    import { toast } from "svelte-sonner";
    import { db } from "../../../library/hooks/db";
	import { Carbon } from "../../../library/utils/Carbon";
	import { loadToken } from "../../../library/validator/useAuth";
    import { useConfiguration } from "../../../config/useConfiguration";
    import { rupiahFormatter } from "../../../library/utils/useFormatter";
	import { initializeDate } from "../../../library/validator/useDefault";

    import Navigation from "../../../components/Navigation.svelte";
	import { onMount } from "svelte";
    
    interface Rekap {
        ID: number;
        TYPE: string;
        AMOUNT: number;
        FEE: number;
        TOKEN: string;
        USAHA: string;
        CREATED_AT: string;
    }

    interface Users { 
        ID: number; 
        TOKEN: string; 
        ROLE: "Admin" | "User";
        CABANG: number;
        USAHA: string;
    }

    let reports: Rekap[] = $state([]);
    let filteredToken: string = $state("");
    let startDate: string = $state(initializeDate("first"));
    let endDate: string = $state(initializeDate("last"));
    let reportType: string = $state("");
    let usaha: string = $useConfiguration.usaha;
    let users: Users[] = $state([]);

    let isLoading: boolean = $state(false);

    let totalAmount = $state(0);
    let totalFee = $state(0);

    onMount(() => loadEmployee());

    async function initializePage(): Promise<void> {
        try {
            loadToken();
            isLoading = true;

            const { status, message, data } = await db({
                start_date: startDate,
                end_date: endDate,
                usaha: usaha,
                type: reportType
            }, 'Report/EMoney');

            isLoading = false;

            if (status === "error") {
                toast.error(message);
                return;
            }

            toast.success(message);
            reports = data;
            recalculateTotals();
        } catch (error) {
            isLoading = false;
            toast.error("Terjadi kesalahan saat memuat laporan.");
        }
    }

    async function loadEmployee() {
        try {
            loadToken();
            const { status, message, data } = await db({
                usaha: $useConfiguration.usaha
            }, 'Users');

            if (status === 'error') {
                toast.error(message);
                return;
            }

            users = data;
        } catch (error) {
            toast.error("Terjadi kesalahan saat memuat daftar staff.");
        }
    }

    function recalculateTotals() {
        totalAmount = 0;
        totalFee = 0;

        reports
            .filter(item => filteredToken ? item.TOKEN === filteredToken : true)
            .forEach(item => {
                totalAmount += Number(item.AMOUNT) || 0;
                totalFee += Number(item.FEE) || 0;
            });
    }
</script>
<div class="container">
    <Navigation/>
    <div class="card my-4">
        <div class="card-body">

            <h2>Laporan E-Money</h2>

            <div class="row g-3 my-3">
                <div class="col-md-3">
                    <label for="startDate" class="form-label fw-bold">Tanggal Mulai</label>
                    <input type="date" class="form-control" bind:value={startDate} />
                </div>
                <div class="col-md-3">
                    <label for="endDate" class="form-label fw-bold">Tanggal Selesai</label>
                    <input type="date" class="form-control" bind:value={endDate} />
                </div>
                <div class="col-md-3">
                    <label for="selectRange" class="form-label">Tipe Laporan</label>
                    <select bind:value={reportType} class="form-select" required>
                        <option value="" selected disabled>Pilih Tipe</option>
                        <optgroup label="Per PIC">
                            {#if users.length === 0}
                                <option value="" disabled>Sedang memuat staff..</option>
                            {:else}
                                {#each users as users }
                                    <option value={users.TOKEN}>{users.TOKEN}</option>
                                {/each}
                            {/if}
                        </optgroup>
                        <optgroup label="Per Cabang">
                            <option value="Cabang 1">Cabang 1</option>
                            <option value="Cabang 2">Cabang 2</option>
                            <option value="Cabang 3">Cabang 3</option>
                        </optgroup>
                        <optgroup label="Laporan Bulanan">
                            <option value="Semua">Semua Cabang & Staff</option>
                        </optgroup>
                    </select>
                </div>
                <div class="col-md-3 d-flex align-items-end">
                    <button class="btn btn-primary w-100" onclick={initializePage} disabled={isLoading}>
                        {#if isLoading}
                            Memuat
                            <span class="spinner-border spinner-border-sm align-middle ms-2"></span>
                        {:else}
                            Tampilkan
                        {/if}
                    </button>
                </div>
            </div>

            <div class="card mb-4">
                <div class="card-body">
                    <h5>Ringkasan</h5>
                    <p>Total Nominal: <strong>{rupiahFormatter.format(totalAmount)}</strong></p>
                    {#if $useConfiguration.roles === "Admin"}
                        <p>Total Admin: <strong>{rupiahFormatter.format(totalFee)}</strong></p>
                    {/if}
                </div>
            </div>

            <div class="separator my-3"></div>

            <table class="table table-bordered table-hover">
                <thead class="table-light fw-bold">
                    <tr>
                        <th>#</th>
                        <th>Waktu</th>
                        <th>Jenis</th>
                        <th>Nominal</th>
                        {#if $useConfiguration.roles === "Admin"}
                            <th>Keuntungan Bersih</th>
                        {/if}
                        <th>Token</th>
                    </tr>
                </thead>
                <tbody>
                    {#if reports.length === 0}
                        <tr>
                            <td colspan="6" class="text-center">Tidak ada data</td>
                        </tr>
                    {:else}
                        {#each reports.filter(r => !filteredToken || r.TOKEN === filteredToken) as item, index}
                            <tr>
                                <td>{index + 1}</td>
                                <td>{Carbon(item.CREATED_AT, "date-short-with-time")} WIB</td>
                                <td>{item.TYPE}</td>
                                <td>{rupiahFormatter.format(item.AMOUNT)}</td>
                                {#if $useConfiguration.roles === "Admin"}
                                    <td>{rupiahFormatter.format(item.FEE)}</td>
                                {/if}
                                <td>{item.TOKEN}</td>
                            </tr>
                        {/each}
                        <tr>
                            <td colspan="3" class="text-end"></td>
                            <td class=""><strong>{rupiahFormatter.format(totalAmount)}</strong></td>
                            {#if $useConfiguration.roles === "Admin"}
                                <td class=""><strong>{rupiahFormatter.format(totalFee)}</strong></td>
                            {/if}
                            <td></td>
                        </tr>
                    {/if}
                </tbody>
            </table>
        </div>
    </div>
</div>
