<script lang="ts">
	import { onMount } from "svelte";
    import { db } from "$lib/utils/db";
	import toast from "svelte-french-toast";
	import { doFetch } from "$lib/utils/fetcher";
	import type { Users } from "$lib/interface/Users";

    let newData: Users[] = [];

    onMount(async () => {
        const obtainUsers: { status: "success" | "error"; message: string; data: Users[] } = await doFetch('Users');
        newData = obtainUsers.data;
    });

    async function changeToken(id: number, token: string): Promise <void> {
        if(token === '') {
            toast.error("Token tidak boleh kosong")
        }

        const { status, message } = await db({
            id: id,
            token : token
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
                        <button type="button" on:click={() => changeToken(newData.ID, newData.TOKEN)} class="btn btn-sm btn-primary">Simpan</button>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>