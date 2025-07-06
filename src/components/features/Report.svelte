<script lang="ts">
	import { onMount } from 'svelte';
    import { db } from '$lib/utils/db';
	import { doFetch } from '$lib/utils/fetcher';
	import type { Users } from '$lib/interface/Users';
    import toast, { Toaster } from 'svelte-french-toast';

    let date: Date | null = null;
    let users: string = '';

    let listUsers: Users[] = [];

    onMount(async () => {
        const sessionStorage = localStorage.getItem('once');
        const currentSession: { token: string; roles: "Admin" | "User"; usaha: string; } = sessionStorage ? JSON.parse(sessionStorage) : null;

        const { status, message, data } = await db({
            usaha: currentSession.usaha
        }, 'Users');

        if (status === "error") {
            toast.error(message);
            return;
        }

        listUsers = data;

    });

    async function doPost(): Promise <void> {
        if (date === null) {
            toast.error("Tanggal tidak boleh kosong!");
            return;
        }

        const { status, message, data } = await db({
            type : 'dailyReport',
            date : date,
            pic : users
        }, 'Report');

        if (status === 'success') {
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
            return;
        }

        toast.error(message);
    }
</script>
<Toaster/>
<form on:submit|preventDefault={doPost} class="row">
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