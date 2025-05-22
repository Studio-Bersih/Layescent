<script lang="ts">
	import { db } from '$lib/utils/db';
	import { goto } from '$app/navigation';
    import toast, { Toaster } from 'svelte-french-toast';
    
    let token: string = 'NICO1115';
    let year: number = new Date().getFullYear();

    let isLoading: boolean = false;

    async function login(): Promise <void> {
        if(token === ''){
            toast.error("Harap masukkan token!");
            return;
        }

        isLoading = true;

        try {
            const { status, message, data } = await db({
                token: token
            },'Check-Token');

            if (status === 'error') {
                token = '';
                toast.error(message);
                return;
            }

            localStorage.setItem('once', JSON.stringify(data));
            return goto('/penjualan');

        } catch (error) {
            toast.error("Terjadi kesalahan saat login!");
        }
    }
</script>
<Toaster/>
<div class="log-centered">
    <div class="card shadow">
        <div class="card-header">
            <div class="card-title">
                <a href="https://wa.me/6285790801918" target="_blank" class="btn btn-sm btn-success">
                    <img src="/icons/key.svg" class="h-20px me-1" alt=""/>
                    Lupa Token?
                </a>
            </div>
            <div class="card-toolbar fw-bold">
                User Login
            </div>
        </div>
        <div class="card-body">

            <form on:submit|preventDefault={login} class="row">
                <div class="col-1">
                    <img src="/icons/person.svg" class="h-40px mt-9" alt="SVG Login" />
                </div>
                <div class="col-11">
                    <label for="setToken" class="form-label fw-bold">Masukkan Token</label>
                    <input type="text" id="setToken" bind:value={token} class="form-control" placeholder="Token" required/>
                </div>

                <div class="d-flex justify-content-end">
                    <button type="submit" class="btn btn-sm btn-primary w-50 mt-5" disabled={isLoading}>
                        {#if isLoading}
                            Masuk...
                            <span class="spinner-border spinner-border-sm align-middle ms-2"></span>
                        {:else}
                            <img src="/icons/auth.svg" class="h-20px me-2" alt="SVG Auth" /> Login
                        {/if}
                    </button>
                </div>
            </form>

        </div>
        <div class="card-footer fw-semibold">
            © {year} - Gilby Dhilega Yodiaz
        </div>
    </div>
</div>
