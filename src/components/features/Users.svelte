<script lang="ts">
	import { onMount } from "svelte";
    import { db } from "$lib/utils/db";
	import toast from "svelte-french-toast";
	import type { Users } from "$lib/interface/Users";

    let newData: Users[] = [];

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

        newData = data;

    });

    async function changeToken(id: number, token: string, cabang: number, usaha: string): Promise <void> {
        if(token === '') {
            toast.error("Token tidak boleh kosong")
        }

        const { status, message } = await db({
            id: id,
            token : token,
            cabang: cabang,
            usaha: usaha
        }, 'Update-Users');

        if (status === 'success') {
            toast.success(message);
            return;
        }

        toast.error(message);

    }
</script>
<div class="table-responsive">
    <table class="table align-middle table-hover">
        <thead>
            <tr class="fw-bold">
                <th>#</th>
                <th>Token</th>
                <th>Role</th>
                <th>Cabang</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
            {#each newData as newData,index }
                <tr>
                    <td>{index + 1}</td>
                    <td>
                        <input type="text" bind:value={newData.TOKEN} class="form-control form-control-sm" placeholder="Token User" />
                    </td>
                    <td>{newData.ROLE}</td>
                    <td>
                        <select bind:value={newData.CABANG} class="form-select form-select-sm">
                            <option value="">Pilih Cabang</option>
                            <option value="1">Cabang 1</option>
                            <option value="2">Cabang 2</option>
                            <option value="3">Cabang 3</option>
                        </select>
                    </td>
                    <td>
                        <button type="button" on:click={() => changeToken(newData.ID, newData.TOKEN, newData.CABANG, newData.USAHA)} class="btn btn-sm btn-primary">Simpan</button>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>