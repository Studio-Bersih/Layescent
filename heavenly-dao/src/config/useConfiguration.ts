import { writable } from "svelte/store";

const useConfiguration = writable({
    isProduction: false,
    token: ''
});

export { useConfiguration };