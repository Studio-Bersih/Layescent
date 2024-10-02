import { baseConfiguration } from "$lib/baseConfiguration";
import { get } from "svelte/store";

async function doFetch(id: string) {
    try {
        const URL: string = baseConfiguration.url;

        const sendRequest = await fetch(`${URL}${id}`, {
            method: "GET",
            headers : { 
                'Accept-Encoding' : 'gzip',
            },
            credentials: 'include',
        });

        if (!sendRequest.ok) {
            throw new Error(`Error: ${sendRequest.status} - ${sendRequest.statusText}`);
        }

        const buffer = await sendRequest.arrayBuffer();
        const text = new TextDecoder('utf-8').decode(new Uint8Array(buffer));

        const doResponse = JSON.parse(text);
        return doResponse;
    } catch (error) {
        console.error("An error occurred during the fetch:", error);
        throw error;
    }
}

export { doFetch };