<script lang="ts">
	import { onMount } from "svelte";
	import { toast } from "svelte-sonner";
	import { db } from "../../library/hooks/db";
	import { useNotice } from "../../library/validator/useNotice";
	import { useConfiguration } from "../../config/useConfiguration";

	import Navigation from "../../components/Navigation.svelte";

    interface Users { 
        ID: number; 
        TOKEN: string; 
        ROLE: "Admin" | "User";
        CABANG: number;
        USAHA: string;
    }

    let newData: Users[] = $state([]);

    onMount(() => initializePage());

    async function initializePage(): Promise <void> {
        const { status, message, data } = await db({
            usaha: $useConfiguration.usaha
        }, 'Users');

        if (status === "error") {
            toast.error(message);
            return;
        }

        newData = data;
    }

    async function changeToken(id: number, token: string, cabang: number, usaha: string): Promise <void> {
        toast('Pengubahan Token!', {
            description: 'Apakah anda yakin?',
            action: {
                label: useNotice.toast.areYouSure,
                onClick: async () => {
                    try {
                        if(token == '') {
                            toast.error("Token tidak boleh kosong")
                            return;
                        }

                        if (cabang == 0) {
                            toast.error("Cabang tidak boleh kosong");
                            return;
                        }

                        const { status, message } = await db({
                            id: id,
                            token : token,
                            cabang: cabang,
                            usaha: usaha
                        }, 'Update-Users');

                        if (status === 'error') {
                            toast.error(message);
                            return;
                        }
                        
                        toast.success(message);
                    } catch (error) {
                        toast.error(useNotice.connection.default);
                        console.error(error);
                    }
                }
            },
        });
    }
</script>
<div class="container">
    <Navigation/>
    <div class="card shadow-sm my-7">
        <div class="card-body">
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
                                        <option value="0">Pilih Cabang</option>
                                        <option value="1">Cabang 1</option>
                                        <option value="2">Cabang 2</option>
                                        <option value="3">Cabang 3</option>
                                    </select>
                                </td>
                                <td>
                                    <button type="button" onclick={() => changeToken(newData.ID, newData.TOKEN, newData.CABANG, newData.USAHA)} class="btn btn-sm btn-primary">Update</button>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</div>