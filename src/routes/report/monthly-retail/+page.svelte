<script lang="ts">
	import { onMount } from "svelte";
	import { toast } from "svelte-sonner";
	import { db } from "../../../library/hooks/db";
	import { Carbon } from "../../../library/utils/Carbon";
	import { loadToken } from "../../../library/validator/useAuth";
	import { useConfiguration } from "../../../config/useConfiguration";
	import { rupiahFormatter } from "../../../library/utils/useFormatter";
	import { initializeDate } from "../../../library/validator/useDefault";
    
	import Navigation from "../../../components/Navigation.svelte";

    interface DailyData {
        tanggal: string;
        jumlah_transaksi: number;
        total_cash: number;
        total_kembali: number;
        total_transaksi: number;
        total_penjualan: number;
        total_net: number;  
    }

    interface Totals {
        total_cash: number;
        total_kembali: number;
        total_transaksi: number;
        total_net: number;
        total_penjualan: number;
    }

    interface BranchAnalysis {
        TOTAL_TRANSACTION: number;
        TOTAL_NET: number;
    }

    interface ReportBranch {
        CABANG_1: BranchAnalysis;
        CABANG_2: BranchAnalysis;
        CABANG_3: BranchAnalysis;
    }

    interface Users { 
        ID: number; 
        TOKEN: string; 
        ROLE: "Admin" | "User";
        CABANG: number;
        USAHA: string;
    }
 
    let startDate = $state(initializeDate("first"));
    let endDate = $state(initializeDate("last"));

    let usaha = $useConfiguration.usaha;
    let users: Users[] = $state([]);
    let reportType: string = $state("");

    let isLoading: boolean = $state(false);

    let report: DailyData[] = $state([]);
    let totals: Totals = $state({
        total_penjualan: 0,
        total_cash: 0,
        total_kembali: 0,
        total_transaksi: 0,
        total_net: 0
    });
    let analysisAllBranch: ReportBranch = $state({
        CABANG_1: { TOTAL_TRANSACTION: 0, TOTAL_AMOUNT: 0, TOTAL_NET: 0 },
        CABANG_2: { TOTAL_TRANSACTION: 0, TOTAL_AMOUNT: 0, TOTAL_NET: 0 },
        CABANG_3: { TOTAL_TRANSACTION: 0, TOTAL_AMOUNT: 0, TOTAL_NET: 0 },
    });

    async function loadReport() {
        try {
            loadToken();
            isLoading = true;

            const { status, message, data } = await db({
                usaha: $useConfiguration.usaha,
                start_date: startDate,
                end_date: endDate,
                type: reportType
            }, 'Report/Monthly-Sales');

            isLoading = false;

            if (status === 'error') {
                toast.error(message);
                return;
            }

            report = data.daily;
            totals = data.totals;
            analysisAllBranch = data.total_transactions_all_branch;
            toast.success(message);
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

            users = data
        } catch (error) {
            toast.error("Terjadi kesalahan saat memuat daftar staff.");
        }
    }

    onMount(() => {
        try {
            loadEmployee()
        } catch (error) {
            loadToken();
            loadEmployee();
        }
    });
</script>
<div class="container">
    <Navigation />

    <div class="card shadow-sm my-4">
        <div class="card-body">

            <h2>Laporan Penjualan</h2>

            <form onsubmit={loadReport} class="row mb-4">
                <div class="col">
                    <label for="startDate" class="form-label">Tanggal Mulai</label>
                    <input type="date" class="form-control" bind:value={startDate} required/>
                </div>
                <div class="col">
                    <label for="endDate" class="form-label">Tanggal Akhir</label>
                    <input type="date" class="form-control" bind:value={endDate} required/>
                </div>
                <div class="col">
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
                <div class="col d-flex align-items-end">
                    <button type="submit" class="btn btn-primary w-100" disabled={isLoading}>
                        {#if isLoading}
                            Memuat
                            <span class="spinner-border spinner-border-sm align-middle ms-2"></span>
                        {:else}
                            Tampilkan
                        {/if}
                    </button>
                </div>
            </form>

            <!-- <div class="separator my-4"></div> -->

            <!-- <h5 class="card-title">Total Keseluruhan</h5>
            <p><strong>Total Cash:</strong> {rupiahFormatter.format(totals.total_cash || 0)}</p>
            <p><strong>Total Kembali:</strong> {rupiahFormatter.format(totals.total_kembali || 0)}</p>
            <p><strong>Total Transaksi:</strong> {rupiahFormatter.format(totals.total_transaksi || 0)}</p> -->
        </div>
    </div>

    <div class="card">
        <div class="card-body">
            <h5 class="card-title">Detail Per Hari</h5>
            <table class="table table-striped">
                <thead>
                    <tr class="fw-bold">
                        <th class="text-center">Tanggal</th>
                        <th class="text-center">Jumlah Transaksi</th>
                        <th>Total Cash</th>
                        <th>Keuntungan Bersih</th>
                    </tr>
                </thead>
                <tbody>
                    {#if report.length === 0}
                        <tr><td colspan="5" class="text-center">Tidak ada data</td></tr>
                    {:else}
                        {#each report as item}
                            <tr>
                                <td class="text-center">{Carbon(item.tanggal, "date-short")}</td>
                                <td class="text-center">{Number(item.jumlah_transaksi)}</td>
                                <td>{rupiahFormatter.format(Number(item.total_penjualan))}</td>
                                <td>{rupiahFormatter.format(Number(item.total_net))}</td>
                            </tr>
                        {/each}
                        <tr>
                            <td colspan="2"></td>
                            <td class="fw-bold">{rupiahFormatter.format(totals.total_penjualan || 0)}</td>
                            <td class="fw-bold">{rupiahFormatter.format(totals.total_net || 0)}</td>
                        </tr>
                    {/if}
                </tbody>
            </table>
            <div class="separator my-5"></div>
            <h1>Analisis Performa Cabang</h1>

            <div class="table-responsive">
                <table class="table align-middle text-center table-striped table-border table-hover">
                    <thead>
                        <tr class="fw-bolder">
                            <td colspan="2">Cabang 1</td>
                            <td colspan="2">Cabang 2</td>
                            <td colspan="2">Cabang 3</td>
                        </tr>
                        <tr class="fw-bold">
                            <th>Total Transaksi</th>
                            <th>Omset Net (Rp.)</th>
                            <th>Total Transaksi</th>
                            <th>Omset Net (Rp.)</th>
                            <th>Total Transaksi</th>
                            <th>Omset Net (Rp.)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{analysisAllBranch.CABANG_1.TOTAL_TRANSACTION}</td>
                            <td>{rupiahFormatter.format(Number(analysisAllBranch.CABANG_1.TOTAL_NET))}</td>
                            <td>{analysisAllBranch.CABANG_2.TOTAL_TRANSACTION}</td>
                            <td>{rupiahFormatter.format(Number(analysisAllBranch.CABANG_2.TOTAL_NET))}</td>
                            <td>{analysisAllBranch.CABANG_3.TOTAL_TRANSACTION}</td>
                            <td>{rupiahFormatter.format(Number(analysisAllBranch.CABANG_3.TOTAL_NET))}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>
    </div>
</div>
