<script lang="ts">
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";
    import { db } from "../../../library/hooks/db";
	import { Carbon } from "../../../library/utils/Carbon";
    import { useConfiguration } from "../../../config/useConfiguration";
    import { rupiahFormatter } from "../../../library/utils/useFormatter";
	import { initializeDate } from "../../../library/validator/useDefault";

    import Navigation from "../../../components/Navigation.svelte";
    
    interface Rekap {
        ID: number;
        TYPE: string;
        AMOUNT: number;
        FEE: number;
        TOKEN: string;
        USAHA: string;
        CREATED_AT: string;
    }

    let reports: Rekap[] = $state([]);
    let filteredToken: string = $state("");
    let startDate: string = $state(initializeDate("first"));
    let endDate: string = $state(initializeDate("last"));
    let usaha: string = $useConfiguration.usaha;

    let totalAmount = $state(0);
    let totalFee = $state(0);

    onMount(() => initializePage());

    async function initializePage(): Promise<void> {
        const { status, message, data } = await db({
            start_date: startDate,
            end_date: endDate,
            usaha: usaha
        }, 'Report/EMoney');

        if (status === "error") {
            toast.error(message);
            return;
        }

        reports = data;
        recalculateTotals();
    }

    function recalculateTotals() {
        totalAmount = 0;
        totalFee = 0;

        reports
            .filter(item => filteredToken ? item.TOKEN === filteredToken : true)
            .forEach(item => {
                totalAmount += item.AMOUNT ?? 0;
                totalFee += item.FEE ?? 0;
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
                    <label for="setPIC" class="form-label fw-bold">Person in Charge</label>
                    <input type="text" class="form-control" bind:value={filteredToken} placeholder="Cth: tokengopay123" />
                </div>
                <div class="col-md-3 d-flex align-items-end">
                    <button class="btn btn-primary w-100" onclick={initializePage}>Tampilkan</button>
                </div>
            </div>

            <div class="card mb-4">
                <div class="card-body">
                    <h5>Ringkasan</h5>
                    <p>Total Nominal: <strong>{rupiahFormatter.format(totalAmount)}</strong></p>
                    <p>Total Admin: <strong>{rupiahFormatter.format(totalFee)}</strong></p>
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
                        <th>Admin</th>
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
                                <td>{rupiahFormatter.format(item.FEE)}</td>
                                <td>{item.TOKEN}</td>
                            </tr>
                        {/each}
                        <tr>
                            <td colspan="3" class="text-end"></td>
                            <td class=""><strong>{rupiahFormatter.format(totalAmount)}</strong></td>
                            <td class=""><strong>{rupiahFormatter.format(totalFee)}</strong></td>
                            <td></td>
                        </tr>
                    {/if}
                </tbody>
            </table>
        </div>
    </div>
</div>
