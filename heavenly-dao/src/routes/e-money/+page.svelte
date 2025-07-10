<script lang="ts">
	import { toast } from "svelte-sonner";
	import Navigation from "../../components/Navigation.svelte";
	import Rupiah from "../../components/shared/Rupiah.svelte";
	import { useNotice } from "../../library/validator/useNotice";
	import { currencySanitizer, rupiahFormatter } from "../../library/utils/useFormatter";

    interface Transaction {
        type: string;
        amount: number;
        fee: number;
        timestamp: string;
    }

    interface PaymentRange {
        rangeStart: number;
        rangeEnd: number;
        fee: number;
    }
    const transactionTypes: string[] = [
        "Pilih Tipe Transaksi",
        "Transfer Antar Bank & EDC",
        "Penarikan GoPay & QRIS",
        "Top Up Maxim",
        "Isi Ulang Token PLN"
    ];

    const paymentRanges: Record<string, PaymentRange[]> = {
        "Transfer Antar Bank & EDC": [
            { rangeStart: 10000, rangeEnd: 200000, fee: 5000 },
            { rangeStart: 201000, rangeEnd: 500000, fee: 8000 },
            { rangeStart: 501000, rangeEnd: 1000000, fee: 10000 },
            { rangeStart: 1010000, rangeEnd: 2000000, fee: 15000 },
            { rangeStart: 2010000, rangeEnd: 3000000, fee: 20000 },
            { rangeStart: 3010000, rangeEnd: 4000000, fee: 25000 },
            { rangeStart: 4010000, rangeEnd: 5000000, fee: 30000 },
            { rangeStart: 5010000, rangeEnd: 6000000, fee: 35000 },
            { rangeStart: 6010000, rangeEnd: 7000000, fee: 40000 },
            { rangeStart: 7010000, rangeEnd: 8000000, fee: 45000 },
            { rangeStart: 8010000, rangeEnd: 10000000, fee: 50000 },
        ],
        "Penarikan GoPay & QRIS": [
            { rangeStart: 5000, rangeEnd: 25000, fee: 2000 },
            { rangeStart: 26000, rangeEnd: 50000, fee: 3000 },
            { rangeStart: 51000, rangeEnd: 101000, fee: 4000 },
            { rangeStart: 102000, rangeEnd: 200000, fee: 5000 },
            { rangeStart: 201000, rangeEnd: 500000, fee: 8000 },
            { rangeStart: 501000, rangeEnd: 1000000, fee: 10000 },
            { rangeStart: 1010000, rangeEnd: 1500000, fee: 15000 },
            { rangeStart: 1501000, rangeEnd: 2000000, fee: 20000 },
            { rangeStart: 2010000, rangeEnd: 3000000, fee: 30000 },
        ],
        "Top Up Maxim": [
            { rangeStart: 10000, rangeEnd: 200000, fee: 5000 },
            { rangeStart: 200000, rangeEnd: 500000, fee: 8000 },
            { rangeStart: 500000, rangeEnd: 1000000, fee: 10000 },
            { rangeStart: 1000000, rangeEnd: 2000000, fee: 15000 }
        ],
        "Isi Ulang Token PLN": [
            { rangeStart: 10000, rangeEnd: 200000, fee: 5000 },
            { rangeStart: 200000, rangeEnd: 500000, fee: 8000 },
            { rangeStart: 500000, rangeEnd: 1000000, fee: 10000 },
            { rangeStart: 1000000, rangeEnd: 2000000, fee: 15000 },
            { rangeStart: 2000000, rangeEnd: 3000000, fee: 20000 },
            { rangeStart: 3000000, rangeEnd: 4000000, fee: 25000 }
        ]
    };

    let selectedType: string = $state(transactionTypes[0]);
    let transactionAmount: string = $state('');

    let transactions: Transaction[] = $state([]);

    function calculateFee(type: string, amount: number): number {
        const selectedRange = paymentRanges[type];
        
        if (!selectedRange) {
            toast.error(useNotice.general.invalidField);
            return 0;
        }
        
        if (amount <= 0) {
            toast.error(useNotice.general.invalidField);
            return 0;
        }
        
        for (let range of selectedRange) {
            if (amount >= range.rangeStart && amount <= range.rangeEnd) {
                return range.fee;
            }
        }

        return 0;
    }

    async function doPost(): Promise <void> {
        if (selectedType === transactionTypes[0]) {
            toast.error(useNotice.general.invalidField);
            return;
        }

        const useFee = calculateFee(selectedType, currencySanitizer(transactionAmount));

        transactions = [...transactions, {
            type: selectedType,
            amount: currencySanitizer(transactionAmount),
            fee: useFee,
            timestamp: new Date().toLocaleString()
        }]

        selectedType = transactionTypes[0];
        transactionAmount = '';
        toast.success("Transaksi berhasil disimpan!");
    }
</script>
<Navigation/>
<div class="container">
    <div class="row">
        <div class="col">{@render useForm()}</div>
        <div class="col">{@render useHistory()}</div>
    </div>
</div>

{#snippet useForm()}
    <div class="card shadow-sm my-7">
        <div class="card-body">
            <form onsubmit={doPost}>
                <div class="form-group">
                    <label for="transactionType" class="form-label fw-bold">Jenis Transaksi</label>
                    <select id="transactionType" class="form-select" bind:value={selectedType}>
                        {#each transactionTypes as type}
                            <option value={type}>{type}</option>
                        {/each}
                    </select>
                </div>
                <div class="form-group my-3">
                    <label for="payment" class="form-label fw-bold">Jumlah Transaksi</label>
                    <Rupiah id="payment" bind:value={transactionAmount} useClass="form-control mt-2" />
                </div>
                <button type="submit" class="btn btn-primary mt-3">Simpan Pembayaran</button>
            </form>
        </div>
    </div>
{/snippet}

{#snippet useHistory()}
    <div class="card shadow-sm my-7">
        <div class="card-body">
            
            <h2>Riwayat Transaksi</h2>
            <table class="table table-bordered mt-3">
                <thead>
                    <tr class="text-center fw-bold">
                        <th>Waktu</th>
                        <th>Tipe</th>
                        <th>Jumlah</th>
                        <th>Biaya Admin</th>
                    </tr>
                </thead>
                <tbody>
                    {#if transactions.length === 0}
                        <tr>
                            <td colspan="4" class="text-center">Tidak ada data.</td>
                        </tr>
                    {:else}
                        {#each transactions as tx}
                            <tr>
                                <td>{tx.timestamp}</td>
                                <td>{tx.type}</td>
                                <td>{rupiahFormatter.format(tx.amount)}</td>
                                <td>{rupiahFormatter.format(tx.fee)}</td>
                            </tr>
                        {/each}
                    {/if}
                </tbody>
            </table>

        </div>
    </div>
{/snippet}