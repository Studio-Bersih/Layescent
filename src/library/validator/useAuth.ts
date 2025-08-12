import { toast } from 'svelte-sonner';
import { useNotice } from './useNotice';
import { useConfiguration } from '../../config/useConfiguration';

function loadToken() {
    try {
        const tokenRaw = localStorage.getItem('token');

        if (!tokenRaw) {
            toast.warning(useNotice.connection.relogSafe);
            return;
        }

        const tokenData: any = JSON.parse(tokenRaw);

        const convertedEmoney: any = {};
        for (const [category, fees] of Object.entries(tokenData.emoney || {})) {
            convertedEmoney[category] = fees.map((f: any) => ({
                rangeStart: f.RANGE_START,
                rangeEnd: f.RANGE_END,
                fee: f.FEE
            }));
        }

        useConfiguration.update((config: any) => ({
            ...config,
            token: tokenData.token,
            roles: tokenData.roles,
            usaha: tokenData.usaha,
            cabang: Number(tokenData.cabang) || 1,
            emoney: {
                ...config.emoney,
                ...convertedEmoney
            }
        }));

    } catch (error) {
        toast.error(useNotice.connection.relog);
        console.error("loadToken() failed:", error);
    }
}

export { loadToken };