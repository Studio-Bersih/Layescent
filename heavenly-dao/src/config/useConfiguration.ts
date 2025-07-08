import { writable } from "svelte/store";

const useConfiguration = writable({
    isProduction: false,
    token: '',
    usaha: '',
    roles: ''
});

export { useConfiguration };