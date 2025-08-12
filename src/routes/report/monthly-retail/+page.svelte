<script lang="ts">
	import { onMount } from "svelte";
	import { toast } from "svelte-sonner";
	import { db } from "../../../library/hooks/db";
	import { useConfiguration } from "../../../config/useConfiguration";
	import { rupiahFormatter } from "../../../library/utils/useFormatter";
	import { initializeDate } from "../../../library/validator/useDefault";
    
	import Navigation from "../../../components/Navigation.svelte";
	import { Carbon } from "../../../library/utils/Carbon";
	import { loadToken } from "../../../library/validator/useAuth";
 
    let startDate = $state(initializeDate("first"));
    let endDate = $state(initializeDate("last"));
    let usaha = $useConfiguration.usaha;

    interface DailyData {
        tanggal: string;
        jumlah_transaksi: number;
        total_cash: number;
        total_kembali: number;
        total_transaksi: number;
    }

    interface Totals {
        total_cash: number;
        total_kembali: number;
        total_transaksi: number;
    }

    let report: DailyData[] = $state([]);
    let totals: Totals = $state({
        total_cash: 0,
        total_kembali: 0,
        total_transaksi: 0
    });

    async function loadReport() {
        loadToken();
        const { status, message, data } = await db({
            usaha,
            start_date: startDate,
            end_date: endDate
        }, 'Report/Monthly-Sales');

        if (status === 'error') {
            toast.error(message);
            return;
        }

        report = data.daily;
        totals = data.totals;
        toast.success(message);
    }

    onMount(() => loadReport());
</script>
<div class="container">
    <Navigation />

    <div class="card shadow-sm my-4">
        <div class="card-body">

            <h2>Laporan Penjualan</h2>

            <div class="row mb-4">
                <div class="col">
                    <label for="startDate" class="form-label">Tanggal Mulai</label>
                    <input type="date" class="form-control" bind:value={startDate} />
                </div>
                <div class="col">
                    <label for="endDate" class="form-label">Tanggal Akhir</label>
                    <input type="date" class="form-control" bind:value={endDate} />
                </div>
                <div class="col d-flex align-items-end">
                    <button class="btn btn-primary w-100" onclick={loadReport}>Tampilkan</button>
                </div>
            </div>

            <div class="separator my-4"></div>

            <h5 class="card-title">Total Keseluruhan</h5>
            <p><strong>Total Cash:</strong> {rupiahFormatter.format(totals.total_cash || 0)}</p>
            <p><strong>Total Kembali:</strong> {rupiahFormatter.format(totals.total_kembali || 0)}</p>
            <p><strong>Total Transaksi:</strong> {rupiahFormatter.format(totals.total_transaksi || 0)}</p>
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
                        <th>Total Kembali</th>
                        <th>Total Transaksi</th>
                    </tr>
                </thead>
                <tbody>
                    {#if report.length === 0}
                        <tr><td colspan="5" class="text-center">Tidak ada data</td></tr>
                    {:else}
                        {#each report as item}
                            <tr>
                                <td class="text-center">{Carbon(item.tanggal, "date-short")}</td>
                                <td class="text-center">{item.jumlah_transaksi}</td>
                                <td>{rupiahFormatter.format(item.total_cash)}</td>
                                <td>{rupiahFormatter.format(item.total_kembali)}</td>
                                <td>{rupiahFormatter.format(item.total_transaksi)}</td>
                            </tr>
                        {/each}
                        <tr>
                            <td colspan="2"></td>
                            <td class="fw-bold">{rupiahFormatter.format(totals.total_cash || 0)}</td>
                            <td class="fw-bold">{rupiahFormatter.format(totals.total_kembali || 0)}</td>
                            <td class="fw-bold">{rupiahFormatter.format(totals.total_transaksi || 0)}</td>
                        </tr>
                    {/if}
                </tbody>
            </table>
        </div>
    </div>
</div>
