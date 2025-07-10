export const useNotice = {
    date: {
        preventEmpty: 'Harap isi tanggal awal dan akhir.'
    },
    connection: {
        default: 'Terjadi kendala sistem.',
        noInternet: 'Tidak ada koneksi internet.',
        timeout: 'Waktu permintaan habis, coba lagi.',
        failedToFetch: 'Server tidak dapat diakses, periksa koneksi Anda.',
        relog: 'Terjadi kendala sistem. Silahkan login ulang.',
        relogSafe: 'Harap login terlebih dahulu.',
        loaded: 'Data berhasil dimuat!'
    },
    member: {
        emptyField: 'Harap isi field member.',
        notFound: 'Member tidak ditemukan.',
        errorCreating: 'Gagal menambahkan member.'
    },
    general: {
        noMaster: 'Tidak ada data master yang dimuat.',
        noPackaging: 'Harap isi packaging.',
        cutProductsNotEnoughStock: 'Stok tidak cukup.',
        cutProductsOnCart: 'Produk sudah ada dalam daftar.',
        updatingPrice: 'Ada kesalahan ketika mengupdate harga',
        promoErased: 'Promo telah dihapus',
        promoNotApplied: 'Promo tidak diterapkan.',
        emptyCarts: 'Keranjang tidak boleh kosong',
        overCashless: 'Pembayaran Tunai & E-Money melebihi total transaksi!',
        orderDetails: 'Lengkapi data pesanan.',
        missingField: 'Harap isi field yang kosong.',
        missingAttachment: 'Harap sertakan lampiran.',
        notFound: 'Data tidak ditemukan.',
        areYouSure: 'Apakah Anda yakin?',
        duplicate: 'Data ini duplikat',
        forbidden: 'Akses anda tidak cukup. Hubungi Admin.',
        noHistory: 'Tidak ada riwayat. Kembali ke halaman awal.',
        failedReceipt: 'Pencetakan nota gagal. Cek kembali koneksi anda',
        invalidField: 'Field tidak valid.',
    },
    setting: {
        missingDateAndOutlet: 'Harap isi tanggal dan outlet.'
    },
    toast: {
        areYouSure: 'Ya, Lakukan!',
        proceed: 'Ya, Lanjutkan!',
        confirmRepair: 'Ya, Perbaiki',
        confirmCancel: 'Ya, Batalkan',
        confirmDelete: 'Ya, Hapus'
    },
};