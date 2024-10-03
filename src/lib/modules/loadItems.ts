import { baseConfiguration } from "$lib/baseConfiguration";
import type { Master } from "$lib/interface/MasterProduk";

const fetchItems = async (): Promise<Master[]> => {
    const response = await fetch(baseConfiguration.url + 'List-Item');
    const data = await response.json();

    return data.data.map((element: { ID: number; NAMA: string; BARCODE: string; JENIS: string; STOK_ITEM: number; HARGA_STOK: number; HARGA_JUAL: number; KETERANGAN: string }) => ({
        id: element.ID,
        name: element.NAMA,
        jenis: element.JENIS,
        barcode: element.BARCODE,
        hargaStok: element.HARGA_STOK,
        hargaJual: element.HARGA_JUAL,
        keterangan: element.KETERANGAN,
        stokItem: element.STOK_ITEM,
    }));
};

export { fetchItems };