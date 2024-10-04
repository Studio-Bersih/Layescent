interface HistoryPenjualan {
    ID: number;
    NAMA: string;
    TERJUAL: number;
    SISA_STOK: number;
    HARGA_BELI: number;
    HARGA_JUAL: number;
    TOTAL_TRANSAKSI: number;
    WAKTU_TRANSAKSI: string;
}

export type { HistoryPenjualan };
