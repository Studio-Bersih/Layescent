import { baseConfiguration } from '$lib/baseConfiguration.js'

export const load = async ({fetch}) => {
    const getItem = await fetch(baseConfiguration.url + 'Riwayat-Penjualan');
    const doResponse = await getItem.json();

    return {
        data : doResponse.data
    }
}