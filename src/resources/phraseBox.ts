import { get } from "svelte/store";
import { useConfiguration } from "../config/useConfiguration";

const config = get(useConfiguration);
const ip: string = config.isProduction ? 'http://202.157.189.77' : 'http://localhost:8000';

export const phraseBox = {
    url: `${ip}/api/POS/`,
    rawLink : `${ip}/`,
}