<script lang="ts">
	import { onMount } from "svelte";
	import { toast } from "svelte-sonner";
	import { db } from "../../library/hooks/db";
	import { useNotice } from "../../library/validator/useNotice";
	import { useConfiguration } from "../../config/useConfiguration";
	import { currencySanitizer, rupiahFormatter } from "../../library/utils/useFormatter";

    import Rupiah from "../../components/shared/Rupiah.svelte";
	import Navigation from "../../components/Navigation.svelte";

    interface Transaction {
        type: string;
        amount: number;
        fee: number;
        timestamp: string;
    }

    interface PaymentRange {
        ID: number;
        RANGE_START: number;
        RANGE_END: number;
        USAHA: string;
        FEE: number;
    }

    interface TransactionType {
        "ID": number,
        "NAME": string,
        "USAHA": string,
        "CREATED_AT": string,
        "UPDATED_AT": string
    }
    
    let transactionTypes: TransactionType[] = $state([]);

    const paymentRanges: Record<string, PaymentRange[]> = $state($useConfiguration.emoney as any);

    let selectedType: string = $state('');
    let transactionAmount: string = $state('');

    let transactions: Transaction[] = $state([]);

    onMount(() => initializePage());

    async function initializePage(): Promise <void> {
        const { status, message, data } = await db({
            'USAHA': $useConfiguration.usaha
        }, 'E-Money/Ranged');

        if (status === "error") {
            toast.error(message);
            return;
        }

        transactionTypes = data;
        selectedType = ''
    }

    function calculateFee(type: string, rawAmount: string): number {
        const amount = currencySanitizer(rawAmount);

        if (!type || amount <= 0) {
            toast.error(useNotice.general.invalidField);
            return 0;
        }

        const ranges = paymentRanges[type];

        if (!ranges || !Array.isArray(ranges)) {
            toast.error("Konfigurasi biaya tidak ditemukan untuk tipe ini.");
            return 0;
        }

        const matchedRange = ranges.find(range =>
            amount >= range.RANGE_START && amount <= range.RANGE_END
        );

        return matchedRange ? matchedRange.FEE : 0;
    }

    async function doPost(): Promise<void> {
        toast('Pencatatan Transaksi', {
            description: 'Pastikan data yang dimasukkan sudah benar.',
            action: {
            label: useNotice.toast.areYouSure,
                onClick: async () => {
                    if (!selectedType || !transactionAmount) {
                        toast.error(useNotice.general.invalidField);
                        return;
                    }

                    const sanitizedAmount = currencySanitizer(transactionAmount);
                    const useFee = calculateFee(selectedType, transactionAmount);
                    
                    const { status, message } = await db({
                        TYPE: selectedType,
                        AMOUNT: sanitizedAmount,
                        FEE: useFee,
                        TOKEN: $useConfiguration.token,
                        USAHA: $useConfiguration.usaha
                    }, 'E-Money/Insert')

                    if (status === "error") {
                        toast.error(message);
                        return;
                    }

                    transactions = [...transactions, {
                        type: selectedType,
                        amount: sanitizedAmount,
                        fee: useFee,
                        timestamp: new Date().toLocaleString()
                    }];

                    selectedType = '';
                    transactionAmount = '';
                    toast.success(message);
                }
            },
        })

    }
</script>
<div class="container">
    <Navigation/>
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
                        <option value="" selected disabled>Pilih Tipe</option>
                        {#each transactionTypes as type}
                            <option value={type.NAME}>{type.NAME}</option>
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