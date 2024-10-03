import { fetchItems } from '$lib/modules/loadItems';

export const load = async ({ fetch }) => {
    const items = await fetchItems();
    return {
        items: items
    }
}