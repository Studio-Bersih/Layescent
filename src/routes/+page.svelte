<script lang="ts">
	import { toast } from "svelte-sonner";
	import { db } from "../library/hooks/db";
	import { useNotice } from "../library/validator/useNotice";
	import { goto } from "$app/navigation";
	import { useConfiguration } from "../config/useConfiguration";

    let token: string = $state('');
    let year: number = new Date().getFullYear();

    let isLoading: boolean = $state(false);

    async function login(): Promise <void> {
        if(token === ''){
            toast.error(useNotice.general.missingField);
            return;
        }

        isLoading = true;

        try {
            const { status, message, data } = await db({
                token: token
            }, 'Check-Token');

            isLoading = false;

            if (status === 'error') {
                token = '';
                toast.error(message);
                return;
            }

            $useConfiguration.token = data.token;
            $useConfiguration.usaha = data.usaha;
            $useConfiguration.roles = data.roles;
            $useConfiguration.emoney = data.emoney;
            $useConfiguration.cabang = data.cabang;

            localStorage.setItem('token', JSON.stringify(data));
            return goto('/retail');

        } catch (error) {
            isLoading = false;
            toast.error("Terjadi kesalahan saat login!");
        }
    }
</script>
<div class="log-centered">
    <div class="card shadow">
        <div class="card-header">
            <div class="card-title">
                <a href="https://wa.me/628984170335" target="_blank" class="btn btn-sm btn-success">
                    <img src="/icons/key.svg" class="h-20px me-1" alt=""/>
                    Lupa Token?
                </a>
            </div>
            <div class="card-toolbar fw-bold">
                User Login
            </div>
        </div>
        <div class="card-body">

            <form onsubmit={login} class="row">
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

<style>
    .log-centered {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        min-width: 600px;
    }
</style>