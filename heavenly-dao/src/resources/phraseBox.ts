import { get } from "svelte/store";
import { useConfiguration } from "../config/useConfiguration";

const config = get(useConfiguration);
const ip: string = config.isProduction ? 'https://fae.deabakery.co.id/' : 'http://localhost:8000/';

export const phraseBox = {
    url: `${ip}/api/v1/`,
    rawLink : `${ip}/`,
}