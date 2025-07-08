import { get } from "svelte/store";
import { toast } from "svelte-sonner";
import { useNotice } from "../validator/useNotice";
import { phraseBox } from "../../resources/phraseBox";
import { useConfiguration } from "../../config/useConfiguration";

interface ResponseType {
    data: any;
    status: string;
    message: string;
}

interface FetchOptions extends RequestInit {
    timeout?: number;
}

const fetchWithTimeout = async (
    url: string, 
    options: FetchOptions = {}
): Promise<Response> => {
    const { timeout = 10000, ...fetchOptions } = options;

    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...fetchOptions,
            signal: controller.signal
        });
        clearTimeout(id);
        return response;
    } catch (error) {
        clearTimeout(id);
        if (error instanceof Error) {
            if (error.name === 'AbortError') {
                throw new Error('Request timeout');
            }
        }
        throw error;
    }
}

export async function db(data: FormData | Record<string, any>, url: string): Promise<ResponseType> {
    const isDev = get(useConfiguration);

    try {
        if (data instanceof FormData) {
            return await postForms(data, url);
        } else {
            return await postJson(data, url);
        }
    } catch (error) {
        handleFetchError(error);
        return { 
            status: 'error', 
            message: getErrorMessage(error), 
            data: null 
        };
    }
}

async function postForms(forms: FormData, url: string): Promise<ResponseType> {
    try {
        const baseConfigValue = get(useConfiguration);
        const doPost = await fetchWithTimeout(phraseBox.url + url, {
            method: 'POST',
            headers: {
                'Authorization': baseConfigValue.token,
                'Bearer': baseConfigValue.token
            },
            body: forms,
            timeout: 15000
        });

        if (!doPost.ok) {
            throw new Error(`HTTP error! status: ${doPost.status}`);
        }

        return await doPost.json();
    } catch (error) {
        throw error;
    }
}

async function postJson(jsons: Record<string, any>, url: string): Promise<ResponseType> {
    try {
        const baseConfigValue = get(useConfiguration);
        const doPost = await fetchWithTimeout(phraseBox.url + url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': baseConfigValue.token,
                'Bearer': baseConfigValue.token
            },
            body: JSON.stringify(jsons),
            timeout: 15000
        });

        if (!doPost.ok) {
            throw new Error(`HTTP error! status: ${doPost.status}`);
        }

        return await doPost.json();
    } catch (error) {
        throw error;
    }
}

function handleFetchError(error: unknown): void {
    if (error instanceof Error) {
        switch (error.message) {
            case 'Request timeout':
                toast.error(useNotice.connection.timeout);
                break;
            case 'Failed to fetch':
                toast.error(useNotice.connection.failedToFetch);
                break;
            default:
                toast.error(useNotice.connection.default);
        }
    } else {
        toast.error(useNotice.connection.default);
    }
}

function getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
        switch (error.message) {
            case 'Request timeout':
                return 'Waktu Permintaan Habis';
            case 'Failed to fetch':
                return 'Server Tidak Dapat Diakses';
            default:
                return 'Kendala Sistem';
        }
    }
    return 'Kendala Sistem';
}