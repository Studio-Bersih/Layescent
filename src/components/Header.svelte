<script lang="ts">
    const sessionStorage = localStorage.getItem('once');
    const currentSession: { token: string; roles: "Admin" | "User" } = sessionStorage ? JSON.parse(sessionStorage) : null;
</script>
<div class="form-group">
    <a href="/penjualan" class="btn btn-sm btn-primary me-1 mb-1">
        <img src="/icons/cart.svg" class="h-20px me-2" alt="SVG Penjualan" /> Penjualan
    </a>
    <a href="/transaksi" class="btn btn-sm btn-info me-1 mb-1">
        <img src="/icons/history.svg" class="h-20px me-2" alt="SVG History" /> Riwayat
    </a>
    {#if currentSession.roles === "Admin"}
        <a href="/products" class="btn btn-sm btn-danger me-1 mb-1">
            <img src="/icons/box.svg" class="h-20px me-2" alt="SVG Master Produk" /> Master Produk
        </a>
        <a href="/charts" class="btn btn-sm btn-warning me-1 mb-1">
            <img src="/icons/box.svg" class="h-20px me-2" alt="SVG Master Produk" /> Statistik
        </a>
    {/if}
</div>