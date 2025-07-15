<script lang="ts">
	import { onMount } from "svelte";
    import { toast } from "svelte-sonner";
	import { db } from "../../../library/hooks/db";
	import { useNotice } from "../../../library/validator/useNotice";
	import { useConfiguration } from "../../../config/useConfiguration";
	import { initializeDate } from "../../../library/validator/useDefault";

    import Navigation from "../../../components/Navigation.svelte";

    interface Users { 
        ID: number; 
        TOKEN: string; 
        ROLE: "Admin" | "User";
        CABANG: number;
        USAHA: string;
    }

    let date: string = $state(initializeDate("current"));
    let users: string = $state('');

    let listUsers: Users[] = $state([]);

    onMount(async () => initializePage());

    async function initializePage(): Promise <void> {
        const { status, message, data } = await db({
            usaha: $useConfiguration.usaha
        }, 'Users');

        if (status === "error") {
            toast.error(message);
            return;
        }

        listUsers = data;
    }

    async function doPost(): Promise <void> {
        if (date === '') {
            toast.error(useNotice.general.missingField);
            return;
        }

        const { status, message, data } = await db({
            type : 'dailyReport',
            date : date,
            pic : users
        }, 'Report');

        if (status === 'error') {
            toast.error(message);
            return;
        }

        if (data.length === 0) {
            toast.error("Tidak ada data pada tanggal tersebut!");
        }

        console.log(data)
        const csvRows = [];
        const headers = Object.keys(data[0]);
        csvRows.push(headers.join(','));

        for (const row of data) {
            const values = headers.map(header => {
                const val = row[header] === null ? '' : row[header];
                return `"${val}"`;
            });
            csvRows.push(values.join(','));
        }

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'Laporan Transaksi.csv';
        link.click();
        URL.revokeObjectURL(url);

    }
</script>
<div class="container">
    <Navigation/>
    <div class="card shadow-sm my-7">
        <div class="card-body">
            <form onsubmit={doPost} class="row">
                <div class="col">
                    <label for="chooseDate" class="form-label fw-bold">Pilih Tanggal</label>
                    <input id="chooseDate" type="date" bind:value={date} class="form-control form-control-sm" required/>
                </div>
                <div class="col">
                    <label for="chooseUser" class="form-label fw-bold">Pilih Pengguna</label>
                    <select bind:value={users} class="form-select form-select-sm" required>
                        <option value="" selected disabled>Pilih User</option>
                        {#each listUsers as data}
                            <option value="{data.TOKEN}">{data.TOKEN}</option>
                        {/each}
                    </select>
                </div>
                <button type="submit" class="btn btn-sm btn-success w-100 my-3">
                    <img src="/icons/excel.svg" class="h-20px me-2" alt="SVG Excel" /> Unduh Laporan
                </button>
            </form>
        </div>
    </div>
</div>