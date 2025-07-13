import { writable } from "svelte/store";

const useConfiguration = writable({
    isProduction: false,
    token: '',
    usaha: '',
    roles: '',
    cabang: 1,
    emoney: {
        "Transfer Antar Bank & EDC": [
            { rangeStart: 10000, rangeEnd: 50000, fee: 1000 },
            { rangeStart: 50001, rangeEnd: 100000, fee: 2000 },
            { rangeStart: 100001, rangeEnd: 500000, fee: 3000 },
            { rangeStart: 500001, rangeEnd: Infinity, fee: 5000 }
        ],
        "Penarikan GoPay & QRIS": [
            { rangeStart: 10000, rangeEnd: 50000, fee: 1500 },
            { rangeStart: 50001, rangeEnd: 100000, fee: 2500 },
            { rangeStart: 100001, rangeEnd: Infinity, fee: 4000 }
        ],
        "Top Up Maxim": [
            { rangeStart: 10000, rangeEnd: Infinity, fee: 2000 }
        ],
        "Isi Ulang Token PLN": [
            { rangeStart: 20000, rangeEnd: Infinity, fee: 3000 }
        ]
    }
});

export { useConfiguration };