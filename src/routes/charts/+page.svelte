<script lang="ts">
    import { db } from "$lib/utils/db";
    import { onMount } from "svelte";
	import { rupiahFormatter } from "$lib/utils/formatter";
    import toast, { Toaster } from "svelte-french-toast";

    import Header from "../../components/Header.svelte";
    import Users from "../../components/features/Users.svelte";

    let staff: string = "";
    let searchDate: string = "";

    interface Item {
        ID: number;
        NAMA: string;
        HARGA_BELI: number;
        HARGA_JUAL: number;
        JUMLAH: number;
        KEUNTUNGAN_BERSIH: number;
    }

    interface Summary {
        TOTAL_HARGA_BELI: number;
        TOTAL_HARGA_JUAL: number;
        TOTAL_KEUNTUNGAN_BERSIH: number;
    }

    let items: Item[] = [];
    let summary: Summary = { TOTAL_HARGA_BELI: 0, TOTAL_HARGA_JUAL: 0, TOTAL_KEUNTUNGAN_BERSIH: 0 };
    let loading = false;
    let error = "";

    let listUsers: Users[] = [];

    async function getUsers(): Promise<void> {
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
    }

    async function fetchKeuntungan() {
        loading = true;
        error = "";
        items = [];
        summary = { TOTAL_HARGA_BELI: 0, TOTAL_HARGA_JUAL: 0, TOTAL_KEUNTUNGAN_BERSIH: 0 };
        try {

            if (!staff || !searchDate) {
                toast.error("Silakan pilih staff dan tanggal pencarian");
                loading = false;
                return;
            }

            const { status, message, data } = await db({
                staff: staff,
                searchDate: searchDate
            }, 'Report/Omset');

            if (status === "error") {
                loading = false;
                toast.error(message);
                return;
            }

            items = data.items;
            summary = data.summary;

            toast.success(message);
        } catch (e) {
            error = "Terjadi kesalahan saat mengambil data";
        }
        loading = false;
    }

    onMount(() => {
        getUsers();
    });
</script>
<Toaster/>
<div class="container-fluid">
    <div class="card card-dashed shadow mt-3">
        <div class="card-header">
            <div class="card-title">
                <Header/>
            </div>
        </div>
        <div class="card-body">

            <div class="row">
                <div class="col">
                    <select class="form-control form-control-sm" bind:value={staff}>
                        <option value="" disabled selected>Pilih staff</option>
                        {#each listUsers as user}
                            <option value={user.TOKEN}>{user.TOKEN}</option>
                        {/each}
                    </select>
                </div>
                <div class="col">
                    <input type="date" class="form-control form-control-sm" bind:value={searchDate} placeholder="Tanggal Pencarian" />
                </div>
                <div class="col">
                    <button class="btn btn-sm btn-primary" on:click={fetchKeuntungan} disabled={loading || !staff}>
                        {loading ? "Memuat..." : "Generate"}
                    </button>
                </div>
            </div>

            <div class="separator my-10"></div>

            {#if error}
                <div class="alert alert-danger">{error}</div>
            {/if}
            {#if items.length !== 0}
                <table class="table table-bordered table-striped">
                    <thead>
                        <tr>
                            <th>Nama</th>
                            <th>Harga Beli</th>
                            <th>Harga Jual</th>
                            <th>Jumlah</th>
                            <th>Keuntungan Bersih</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each items as item}
                            <tr>
                                <td>{item.NAMA}</td>
                                <td>{rupiahFormatter.format(item.HARGA_BELI)}</td>
                                <td>{rupiahFormatter.format(item.HARGA_JUAL)}</td>
                                <td>{item.JUMLAH}</td>
                                <td>{rupiahFormatter.format(item.KEUNTUNGAN_BERSIH)}</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
                <div class="mt-3">
                    <strong>Total Harga Beli:</strong> {rupiahFormatter.format(summary.TOTAL_HARGA_BELI)}<br>
                    <strong>Total Harga Jual:</strong> {rupiahFormatter.format(summary.TOTAL_HARGA_JUAL)}<br>
                    <strong>Total Keuntungan Bersih:</strong> {rupiahFormatter.format(summary.TOTAL_KEUNTUNGAN_BERSIH)}
                </div>
            {:else}
                <span class="text-muted">Tidak ada data.</span>
            {/if}
        </div>
    </div>
</div>