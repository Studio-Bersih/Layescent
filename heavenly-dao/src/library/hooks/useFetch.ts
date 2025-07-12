import { get } from "svelte/store";
import { toast } from "svelte-sonner";
import { useConfiguration } from "../../config/useConfiguration";
import { phraseBox } from "../../resources/phraseBox";

async function useFetch(id: string, type: "base" | "raw" | "first") {
    try {
        if(type !== "first") {
            // loadToken();
        }
        
        let URL: string = phraseBox.url;

        if (type === "raw") {
            URL = phraseBox.rawLink;
        }

        const sendRequest = await fetch(`${URL}${id}`, {
            method: "get",
            headers: {
                'Accept-Encoding': 'gzip',
                'Authorization': get(useConfiguration).token,
                'Bearer': get(useConfiguration).usaha
            },
            credentials: 'include',
        });

        if (!sendRequest.ok) {
            toast.error(`Error: ${sendRequest.status} - ${sendRequest.statusText}`);
            return;
        }

        const buffer = await sendRequest.arrayBuffer();
        const text = new TextDecoder('utf-8').decode(new Uint8Array(buffer));
        const doResponse = JSON.parse(text);

        if (doResponse.status === "success") {
            return doResponse.data;
        } else {
            toast.error(`Unexpected response format: ${doResponse.message}`);
            throw new Error();
        }
    } catch (error) {
        console.error("An error occurred during the fetch:", error);
        throw error;
    }
}

export { useFetch };