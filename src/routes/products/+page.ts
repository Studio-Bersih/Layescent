import { baseConfiguration } from '$lib/baseConfiguration.js'
import type { Master } from '$lib/interface/MasterProduk.js';

export const load = async ({ fetch }) => {
    const getItem = await fetch(baseConfiguration.url + 'List-Item');
    const doResponse = await getItem.json();

    let data: Master[] = [];

    doResponse.data.forEach((element: { ID: number, NAMA: string, BARCODE: string, JENIS: string, STOK_ITEM: number, HARGA_STOK: number, HARGA_JUAL: number, KETERANGAN: string }) => {
        data.push({
            id : element.ID,
            name : element.NAMA,
            jenis : element.JENIS,
            barcode : element.BARCODE,
            hargaStok: element.HARGA_STOK,
            hargaJual: element.HARGA_JUAL,
            keterangan: element.KETERANGAN,
            stokItem : element.STOK_ITEM
        })
    });

    data = data;

    return {
        items: data
    }
}