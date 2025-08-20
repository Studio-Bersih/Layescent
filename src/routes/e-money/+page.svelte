<script lang="ts">
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";
    import { db } from "../../library/hooks/db";
    import { loadToken } from "../../library/validator/useAuth";
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
    let isLoading: boolean = $state(false);

    // NEW: For command mode
    let commandInput: string = $state('');
    let parsedCommand: Transaction | null = $state(null);

    let safeMode: boolean = $state(false);

    onMount(() => initializePage());

    async function initializePage(): Promise<void> {
        loadToken();
        const { status, message, data } = await db({
            'USAHA': $useConfiguration.usaha
        }, 'E-Money/Ranged');

        if (status === "error") {
            toast.error(message);
            return;
        }

        transactionTypes = data;
        console.log(transactionTypes)
        selectedType = '';
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
                    try {
                        if (!selectedType || !transactionAmount) {
                            toast.error(useNotice.general.invalidField);
                            return;
                        }

                        const sanitizedAmount = currencySanitizer(transactionAmount);
                        const useFee = calculateFee(selectedType, transactionAmount);

                        isLoading = true;

                        const { status, message, data } = await db({
                            TYPE: selectedType,
                            AMOUNT: sanitizedAmount,
                            FEE: useFee,
                            TOKEN: $useConfiguration.token,
                            USAHA: $useConfiguration.usaha
                        }, 'E-Money/Insert');

                        isLoading = false;

                        if (status === "error") {
                            toast.error(message);
                            return;
                        }

                        transactions = [...transactions, {
                            type: selectedType,
                            amount: sanitizedAmount,
                            fee: data ?? 0,
                            timestamp: new Date().toLocaleString()
                        }];

                        selectedType = '';
                        transactionAmount = '';
                        toast.success(message);
                    } catch (error) {
                        isLoading = false;
                        toast.error(useNotice.connection.default);
                    }
                }
            },
        });
    }

    // NEW: parse command input
    function parseCommand(input: string): Transaction | null {
        // If transactionTypes hasn't been loaded
        if (transactionTypes.length < 1) {
            toast.error("Konfigurasi transaksi dimuat. Semoga lancar :)");
            return null;
        }

        // Match format: <keyword>-<amount>
        const match = input.match(/^([a-zA-Z]+)-(\d+)$/i);
        if (!match) return null;

        const keyword = match[1].toLowerCase();
        const amount = parseInt(match[2]);

        // Strict match (case-insensitive)
        const foundType = transactionTypes.find(
            t => t.NAME.toLowerCase() === keyword
        );

        if (!foundType) {
            const available = transactionTypes.map(t => t.NAME).join(", ");
            toast.error(
                `Tipe transaksi "${keyword}" tidak ditemukan. ` +
                `Gunakan salah satu dari: ${available}`
            );
            return null;
        }

        const fee = calculateFee(foundType.NAME, String(amount));

        return {
            type: foundType.NAME,
            amount,
            fee,
            timestamp: new Date().toLocaleString()
        };
    }

    $effect(() => {
        parsedCommand = parseCommand(commandInput);
    });

    async function doCommandPost(): Promise<void> {
        try {
            if (!parsedCommand) {
                toast.error("Format perintah salah. Gunakan TT-100000 atau TF-50000");
                return;
            }
            isLoading = true;

            const { status, message, data } = await db({
                TYPE: parsedCommand.type,
                AMOUNT: parsedCommand.amount,
                FEE: parsedCommand.fee,
                TOKEN: $useConfiguration.token,
                USAHA: $useConfiguration.usaha
            }, 'E-Money/Insert');

            isLoading = false;

            if (status === "error") {
                toast.error(message);
                return;
            }

            parsedCommand.fee = data ?? 0;

            transactions = [...transactions, parsedCommand];
            commandInput = '';
            toast.success(message);
        } catch (error) {
            isLoading = false;
            toast.error(useNotice.connection.default);
        }
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
            
        <button type="button" onclick={() => safeMode = true} class="btn btn-sm btn-primary my-1 mx-1">Safe Mode</button>
        <button type="button" onclick={() => safeMode = false} class="btn btn-sm btn-warning my-1 mx-1">Typing Mode</button>

        <div class="separator my-2"></div>

        {#if safeMode}
            {@render manualMode()}
        {:else}
            {@render commandMode()}
        {/if}
        </div>
    </div>
{/snippet}  

{#snippet commandMode()}
    <div class="tab-pane fade show active" id="commandMode">
        <form onsubmit={doCommandPost}>
            <div class="form-group">
                <label for="commandInput" class="form-label fw-bold">Quick Command</label>
                <input id="commandInput" type="text" class="form-control" placeholder="e.g. TT-100000 or TF-53200" bind:value={commandInput} 
                />
            </div>

            {#if parsedCommand}
                <div class="alert alert-info mt-3">
                    <b>{parsedCommand.type}</b> sebesar 
                    {rupiahFormatter.format(parsedCommand.amount)} <br/>
                    <!-- Biaya Admin: {rupiahFormatter.format(parsedCommand.fee)} -->
                </div>
            {/if}

            <button type="submit" class="btn btn-success mt-3" disabled={isLoading}>
                    {#if isLoading}
                        Menyimpan...
                        <span class="spinner-border spinner-border-sm align-middle ms-2"></span>
                    {:else}
                        Proses Transaksi
                    {/if}
            </button>
        </form>
    </div>
{/snippet}

{#snippet manualMode()}
    <form onsubmit={doPost}>
        <div class="form-group">
            <label for="transactionType" class="form-label fw-bold">Jenis Transaksi</label>
            <select id="transactionType" class="form-select" bind:value={selectedType}>
                <option value="" disabled>Pilih Tipe</option>
                {#each transactionTypes as type}
                    <option value={type.NAME}>{type.NAME}</option>
                {/each}
            </select>
        </div>
        <div class="form-group my-3">
            <label for="payment" class="form-label fw-bold">Jumlah Transaksi</label>
            <Rupiah id="payment" bind:value={transactionAmount} useClass="form-control mt-2"/>
        </div>
        <button type="submit" class="btn btn-primary mt-3">Simpan Pembayaran</button>
    </form>
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
