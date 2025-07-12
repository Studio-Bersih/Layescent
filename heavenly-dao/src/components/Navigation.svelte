<script lang="ts">
	import { onMount } from 'svelte';
	import { useConfiguration } from '../config/useConfiguration';
	import { goto } from '$app/navigation';
	import { toast } from 'svelte-sonner';
	import { db } from '../library/hooks/db';
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
    let isOption: boolean = $state(false);
    let sideBar: Sidebar[] = $state([]);

    const transaksiBar: Sidebar[] = [
        { icon: '/icons/outlet/Assets-Transaksi/Retail.svg', name: 'Penjualan Retail', url: '/retail', isAdministrator: false },
        { icon: '/icons/outlet/Assets-Transaksi/Pesanan.svg', name: 'E Money', url: '/e-money', isAdministrator: false },
    ];

    const adjustmentBar: Sidebar[] = [
        { icon: '/icons/outlet/Assets-Adjustment/Pre-Adjustment.svg', name: 'Master Produk', url: '/outlet/adjustment/pre-adjustment', isAdministrator: false },
        { icon: '/icons/outlet/Assets-Adjustment/Pre-Adjustment.svg', name: 'Set E-Payment', url: '/configuration/e-money', isAdministrator: false },
        { icon: '/icons/outlet/Assets-Adjustment/Item-Transfer.svg', name: 'Item Masuk', url: '/outlet/adjustment/item-transfer', isAdministrator: false },
        { icon: '/icons/outlet/Assets-Adjustment/Item-Keluar.svg', name: 'Item Keluar', url: '/outlet/adjustment/item-keluar', isAdministrator: false },
    ];

    const orderBar: Sidebar[] = [
        // { icon: '/icons/outlet/Assets-Order-Kitchen/List-Order.svg', name: 'Stok Outlet', url: '/outlet/order-kitchen/stok-outlet', isAdministrator: false },
        { icon: '/icons/outlet/Assets-Order-Kitchen/List-Order.svg', name: 'List Order', url: '/outlet/order-kitchen/list-order', isAdministrator: false },
        { icon: '/icons/outlet/Assets-Order-Kitchen/Pengiriman.svg', name: 'Pengiriman', url: '/outlet/order-kitchen/pengiriman', isAdministrator: false },
    ];

    const productionBar: Sidebar[] = [
        { icon: '/icons/outlet/Assets-Order-Kitchen/Draft-Produksi.svg', name: 'Draft Produksi', url: '/outlet/order-kitchen/draft-produksi', isAdministrator: false },
        { icon: '/icons/outlet/Assets-Order-Kitchen/List-Produksi.svg', name: 'List Produksi', url: '/outlet/order-kitchen/list-produksi', isAdministrator: false },
        { icon: '/icons/outlet/Assets-Order-Kitchen/Afkir-Produksi.svg', name: 'Afkir Produksi', url: '/outlet/order-kitchen/afkir-produksi', isAdministrator: false },
    ];

    const akuntansiBar: Sidebar[] = [
        { icon: '/icons/outlet/Assets-Akutansi/Kas-Masuk.svg', name: 'Kas Masuk', url: '/outlet/akuntansi/kas-masuk', isAdministrator: false },
        { icon: '/icons/outlet/Assets-Akutansi/Kas-Keluar.svg', name: 'Kas Keluar', url: '/outlet/akuntansi/kas-keluar', isAdministrator: false },
        { icon: '/icons/outlet/Assets-Akutansi/Session.svg', name: 'Session', url: '/outlet/akuntansi/session', isAdministrator: false },
        { icon: '/icons/outlet/Assets-Akutansi/Closing.svg', name: 'Closing', url: '/outlet/akuntansi/closing', isAdministrator: false },
    ];

    const perbaikanBar: Sidebar[] = [
        { icon: '/icons/outlet/Assets-Perbaikan-Transaksi/Request-Perbaikan.svg', name: 'Perbaikan Transaksi Outlet', url: '/outlet/perbaikan-transaksi/staff', isAdministrator: false },
    ];

    const csvBar: Sidebar[] = [
        { icon: '/icons/outlet/Assets-Report/CSV/Forecast.svg', name: 'Forecast Outlet', url: '/outlet/report/csv/forecast', isAdministrator: false },
        { icon: '/icons/outlet/Assets-Report/CSV/Kartu-Stok.svg', name: 'Kartu Stok', url: '/outlet/report/csv/kartu-stok', isAdministrator: false },
        { icon: '/icons/outlet/Assets-Report/CSV/Rekap-Penjualan.svg', name: 'Rekap Penjualan', url: '/outlet/report/csv/penjualan-pesanan', isAdministrator: false },
        { icon: '/icons/outlet/Assets-Report/CSV/Rekap-Pesanan.svg', name: 'Rekap Pesanan', url: '/outlet/report/csv/penjualan-pesanan', isAdministrator: false },
        { icon: '/icons/outlet/Assets-Report/CSV/Ultah-Member.svg', name: 'Ulang Tahun Member', url: '/outlet/report/csv/ultah-member', isAdministrator: false },
        { icon: '/icons/outlet/Assets-Report/CSV/Stok-Opname.svg', name: 'Stok Opname', url: '/outlet/report/csv/opname', isAdministrator: false },
        { icon: '/icons/outlet/Assets-Report/CSV/Buku-Besar.svg', name: 'Buku Besar', url: '/outlet/report/csv/buku-besar', isAdministrator: false },
        { icon: '/icons/outlet/Assets-Report/CSV/Selisih-Kas.svg', name: 'Selisih Kas', url: '/outlet/report/csv/selisih-kas', isAdministrator: false },
        { icon: '/icons/outlet/Assets-Report/CSV/Mutasi-Item.svg', name: 'Mutasi Item', url: '/outlet/report/csv/mutasi-item', isAdministrator: false },
        { icon: '/icons/outlet/Assets-Report/CSV/Item-Keluar.svg', name: 'Item Keluar', url: '/outlet/report/csv/item-keluar', isAdministrator: false },
        { icon: '/icons/outlet/Assets-Report/CSV/Afkir.svg', name: 'Afkir', url: '/outlet/report/csv/afkir', isAdministrator: false },
    ];

    const reportBar: Sidebar[] = [
        { icon: '/icons/outlet/Assets-Report/Rekap-Pesanan.svg', name: 'Omset Bulanan', url: '/outlet/report/rekap-pesanan', isAdministrator: false },
        { icon: '/icons/outlet/Assets-Report/Pembelian.svg', name: 'Keuntungan E-Money', url: '/report/e-money', isAdministrator: false },
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
        const { status, message } = await db({
            LOGS: ''
        }, 'Auth/Keluar');

        if (status === "success") {
            toast.info(message);
        } else {
            toast.error(message);
            return;
        }

        $useConfiguration.token = '';
        $useConfiguration.roles = '';
        $useConfiguration.usaha = '';
        return goto('/')
    }
</script>
<nav class="outlet-nav p-2 bg-white shadow-sm">
    <div class="row">
        <div class="col">
            <div class="row">
                <!-- <div class="col-2">
                    {#if permissibleRoutes.includes(page.url.pathname) }
                        <img src="/icons/Chocoa.svg" alt="" class="h-20px ms-7 mt-3">
                    {:else}
                        <button type="button" onclick={goBack} class="btn btn-xs btn-dark mt-2">
                            <img src="/icons/Back.svg" alt="Back Icon" class="h-10px me-2 svg-white" />
                            Halaman Sebelumnya
                        </button>
                    {/if}
                </div> -->
                <div class="col">
                    <div class="form-group mt-1">
                        <button type="button" onclick={() => openSidebar('Bar')} class="btn btn-sm fw-bolder {activeMenu ===  'Bar' ? 'text-golden' : 'text-gray-600' }">Chocoa's Bar</button>
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
            </div>
        </div>
    </div>
</nav>

{#if isOption}
    <div class="d-flex justify-content-end rounded-bottom" style="position: absolute; z-index: 1000;left: 0; right: 0;top: 52px;">
        <div class="p-5 rounded-bottom bg-white" style="box-shadow: 0 4px 8px rgba(0,0,0,0.2)">
            <a href="/outlet/pengaturan" class="btn btn-flush btn-sm w-100 text-start mb-2">
                <img src="/icons/Gear.svg" class="h-20px me-3" alt="Pengaturan" /> Pengaturan
            </a>
            <button type="button" onclick={logOut} class="btn btn-flush btn-sm w-100 mt-1 text-start">
                 <img src="/icons/Keluar.svg" class="h-15px me-5" alt="Keluar" /> Keluar
            </button>
        </div>
    </div>
{/if}

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
            {@render useBar('Rekap Transaksi', transaksiBar)}
            {@render useBar('Adjustment', adjustmentBar)}
            <!-- {@render useBar('Order Kitchen', orderBar)} -->
            <!-- {@render useBar('Production', productionBar)} -->
            <!-- {@render useBar('Akuntansi', akuntansiBar)} -->
            <!-- {@render useBar('Perbaikan Transaksi', perbaikanBar)} -->
        {:else if activeMenu === "Report"}
            <!-- {@render useBar('Ekspor CSV', csvBar)} -->
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