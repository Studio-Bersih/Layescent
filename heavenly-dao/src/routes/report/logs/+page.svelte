<script lang="ts">
	import { toast } from "svelte-sonner";
	import { db } from "../../../library/hooks/db";
	import { Carbon } from "../../../library/utils/Carbon";
	import { useConfiguration } from "../../../config/useConfiguration";
	import { initializeDate } from "../../../library/validator/useDefault";

    import Navigation from "../../../components/Navigation.svelte";
    
    interface Logs {
        USAHA: string;
        TOKEN: string;
        TEXT: string;
        CREATED_AT: string;
    }

    let startDate: string = $state(initializeDate("current"));
    let endDate: string = $state(initializeDate("current"));

    let newData: Logs[] = $state([]);

    async function doPost(): Promise<void> {
        if (!startDate || !endDate) {
            toast.error("Tanggal mulai dan selesai harus diisi.");
            return;
        }

        const { status, message, data } = await db({
            startDate: startDate,
            endDate: endDate,
            usaha: $useConfiguration.usaha,
        }, 'Logs');

        if (status === 'error') {
            toast.error(message);
            return;
        }

        console.log({
             startDate: startDate,
            endDate: endDate,
            usaha: $useConfiguration.usaha,
        });

        newData = data;
        toast.success("Data berhasil dimuat.");
    }
</script>
<div class="container">
    <Navigation/>
    <div class="card shadow-sm my-7">
        <div class="card-body">
            <h2>Laporan Riwayat</h2>

            <div class="row g-3 my-3">
                <div class="col-md-3">
                    <label for="startDate" class="form-label fw-bold">Tanggal Mulai</label>
                    <input type="date" class="form-control" bind:value={startDate} />
                </div>
                <div class="col-md-3">
                    <label for="endDate" class="form-label fw-bold">Tanggal Selesai</label>
                    <input type="date" class="form-control" bind:value={endDate} />
                </div>
                <div class="col-md-3 d-flex align-items-end">
                    <button class="btn btn-primary w-100" onclick={doPost}>Tampilkan</button>
                </div>
            </div>

            <div class="separator my-7"></div>

            <div class="table-responsive">
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Token</th>
                            <th>Pesan</th>
                            <th>Tanggal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#if newData.length === 0}
                            <tr>
                                <td colspan="4" class="text-center">Tidak ada data yang ditemukan.</td>
                            </tr>
                        {:else}
                            {#each newData as log, index}
                                <tr>
                                    <td>{index + 1}</td>
                                    <td>{log.TOKEN}</td>
                                    <td>{log.TEXT}</td>
                                    <td>{Carbon(log.CREATED_AT, "date-short-with-time")}</td>
                                </tr>
                            {/each}
                        {/if}
                    </tbody>
                </table>
            </div>

        </div>
    </div>
</div>