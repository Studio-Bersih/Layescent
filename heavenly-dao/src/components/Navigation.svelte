<script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import { goto } from '$app/navigation';
	import { useNotice } from '../library/validator/useNotice';
	import { useConfiguration } from '../config/useConfiguration';
	import { capitalizeEachWord } from '../library/utils/useFormatter';

    import Drawer from './shared/Drawer.svelte';

    interface Sidebar { 
        icon: string;
        name: string;
        url: string;
        isAdministrator: boolean;
    };

    const Auth: string = $useConfiguration.roles;

    let time: Date = $state(new Date());
    let activeMenu: string = $state('Bar');
    let isDrawer: boolean = $state(false);
    let sideBar: Sidebar[] = $state([]);

    const transaksiBar: Sidebar[] = [
        { icon: '/icons/outlet/Assets-Transaksi/Retail.svg', name: 'Penjualan Retail', url: '/transaksi/retail', isAdministrator: false },
        { icon: '/icons/outlet/Assets-Transaksi/Pesanan.svg', name: 'E Money', url: '/e-money', isAdministrator: false },
    ];

    const adjustmentBar: Sidebar[] = [
        { icon: '/icons/outlet/Assets-Adjustment/Pre-Adjustment.svg', name: 'Master Produk', url: '/master', isAdministrator: true },
        { icon: '/icons/outlet/Assets-Adjustment/Pre-Adjustment.svg', name: 'Set E-Payment', url: '/configuration/e-money', isAdministrator: true },
        { icon: '/icons/outlet/Assets-Adjustment/Item-Transfer.svg', name: 'Karyawan', url: '/employee', isAdministrator: true },
    ];

    const reportBar: Sidebar[] = [
        { icon: '/icons/outlet/Assets-Transaksi/Retail.svg', name: 'Penjualan Retail', url: '/report/retail', isAdministrator: false },
        { icon: '/icons/outlet/Assets-Report/Pembelian.svg', name: 'Keuntungan E-Money', url: '/report/e-money', isAdministrator: false },
        { icon: '/icons/outlet/Assets-Report/Rekap-Pesanan.svg', name: 'Omset Bulanan', url: '/report/monthly-retail', isAdministrator: true },
        { icon: '/icons/outlet/Assets-Report/Buku-Besar.svg', name: 'Laporan CSV', url: '/report/csv', isAdministrator: true },
        { icon: '/icons/outlet/Assets-Report/CSV/Item-Keluar.svg', name: 'Riwayat', url: '/report/logs', isAdministrator: false },
    ];

    onMount(() => {
        const handleContextMenu = (event: MouseEvent) => {
            event.preventDefault();
        };
        document.addEventListener('contextmenu', handleContextMenu);

    })

    $effect(() => {
        const timeInterval = setInterval(() => {
            time = new Date();
        }, 1000)

        sideBar = transaksiBar;

        return () => {
            clearInterval(timeInterval);
        };
    });

    function openSidebar(id: "Bar" | "Report"){
        activeMenu = id;
        isDrawer = !isDrawer;
    }

    async function logOut() {
        toast('Logout', {
            description: 'Apakah anda yakin?',
            action: {
                label: useNotice.toast.areYouSure,
                onClick: () => {
                    $useConfiguration = {
                        isProduction: false,
                        token: '',
                        usaha: '',
                        roles: '',
                        cabang: 1,
                        emoney: {
                            "Transfer Antar Bank & EDC": [
                                { rangeStart: 10000, rangeEnd: 50000, fee: 1000 },
                                { rangeStart: 50001, rangeEnd: 100000, fee: 2000 },
                                { rangeStart: 100001, rangeEnd: 500000, fee: 3000 },
                                { rangeStart: 500001, rangeEnd: Infinity, fee: 5000 }
                            ],
                            "Penarikan GoPay & QRIS": [
                                { rangeStart: 10000, rangeEnd: 50000, fee: 1500 },
                                { rangeStart: 50001, rangeEnd: 100000, fee: 2500 },
                                { rangeStart: 100001, rangeEnd: Infinity, fee: 4000 }
                            ],
                            "Top Up Maxim": [
                                { rangeStart: 10000, rangeEnd: Infinity, fee: 2000 }
                            ],
                            "Isi Ulang Token PLN": [
                                { rangeStart: 20000, rangeEnd: Infinity, fee: 3000 }
                            ]
                        }
                    }

                    localStorage.clear();
                    toast.dismiss();
                    toast.success("Anda berhasil keluar dari sistem.")
                    return goto('/');
                }
            },
        });
    }
</script>
<nav class="outlet-nav p-2 bg-white shadow-sm">
    <div class="row mx-3">
        <div class="col">
            <div class="row">
                <div class="col">
                    <div class="form-group mt-1">
                        <button type="button" onclick={() => openSidebar('Bar')} class="btn btn-sm fw-bolder {activeMenu ===  'Bar' ? 'text-golden' : 'text-gray-600' }">Menu</button>
                        <button type="button" onclick={() => openSidebar('Report')} class="btn btn-sm fw-bolder {activeMenu ===  'Report' ? 'text-golden' : 'text-gray-600' }">Report</button>
                        <button type="button" class="btn btn-sm btn-flush text-muted disabled">|</button>
                        <a href="/retail" class="btn btn-sm fw-bolder {activeMenu ===  'Retail' ? 'text-golden' : 'text-gray-600' }">Retail</a>
                        <a href="/e-money" class="btn btn-sm fw-bolder {activeMenu ===  'Pesanan' ? 'text-golden' : 'text-gray-600' }">E-Money</a>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-3">
            <div class="row">
                <div class="col text-end">
                    <span class="fw-bolder">
                        <span class="text-danger fw-bolder">[{$useConfiguration.usaha}]</span> 
                        Hello, <span class="text-golden">{capitalizeEachWord($useConfiguration.token)}</span>
                    </span> <br/>
                    <small class="fw-bolder text-gray-500">
                        {new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(time)}, 
                        {`${String(time.getDate()).padStart(2, '0')}/${String(time.getMonth() + 1).padStart(2, '0')}/${time.getFullYear()}`} - 
                        {`${String(time.getHours()).padStart(2, '0')}:${String(time.getMinutes()).padStart(2, '0')}:${String(time.getSeconds()).padStart(2, '0')}`} WIB
                    </small>
                </div>
                <div class="col-2">
                    <button type="button" onclick={logOut} class="btn btn-sm btn-icon btn-danger">
                        <img src="/icons/power.svg" class="h-25px" alt="Power off"/>
                    </button>
                </div>
            </div>
        </div>
    </div>
</nav>

<Drawer isOpen={isDrawer} position="left" width="300px" onClose={() => isDrawer = !isDrawer}>
    <div class="p-4">
        <div class="row">
            <div class="col text-start">
                <span class="h5">{capitalizeEachWord($useConfiguration.token)}</span>
                <p class="text-muted fw-semibold">{$useConfiguration.roles}</p>
            </div>
        </div>
        
        <div class="separator mb-2"></div>
        
        <div class="my-5"></div>
        
        {#if activeMenu === "Bar"}
            {@render useBar('Konfigurasi', adjustmentBar)}
        {:else if activeMenu === "Report"}
            {@render useBar('Report Outlet', reportBar)}
        {/if}

    </div>
</Drawer>

{#snippet useBar(title: string, data: Sidebar[])}
    <div class="my-5"></div>
    <span class="fw-bolder text-muted my-5">{title}</span>
    <div class="mb-3"></div>
    {#each data as { name, url, icon, isAdministrator }}
        {#if !isAdministrator || (isAdministrator && Auth === "Admin")}
            <a href={url} class="sidebar-link btn btn-active-secondary btn-xs w-100 text-start fw-bold">
                <img src={icon} class="h-20px me-5 svg-gray" alt={name}/>{name}
            </a>
        {/if}
    {/each}
{/snippet}

<style>
    .sidebar-link {
        position: relative;
        color: inherit;
        transition: color 0.3s ease;
        overflow: hidden;
        display: inline-flex;
        align-items: center;
    }

    .sidebar-link::after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 2px;
        background-color: #B72024;
        transform: translateX(-100%);
        transition: transform 0.3s ease;
    }

    .sidebar-link:hover {
        color: #B72024 !important;
    }

    .sidebar-link:hover::after {
        transform: translateX(0);
    }

    .sidebar-link img.svg-gray {
        transition: filter 0.3s ease;
        /* filter: grayscale(100%) brightness(0%) sepia(100%) hue-rotate(-20deg) saturate(800%) contrast(1); */
        filter: invert(74%) sepia(21%) saturate(179%) hue-rotate(169deg) brightness(86%) contrast(88%);
    }

    .sidebar-link:hover img.svg-gray {
        filter: invert(25%) sepia(100%) saturate(7500%) hue-rotate(350deg) brightness(95%) contrast(95%);
    }
</style>