<script lang="ts">
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";
	import { db } from "../../../library/hooks/db";
	import { useNotice } from "../../../library/validator/useNotice";
	import { useConfiguration } from "../../../config/useConfiguration";
	import { currencySanitizer, rupiahFormatter } from "../../../library/utils/useFormatter";
	
	import Rupiah from "../../../components/shared/Rupiah.svelte";
	import Navigation from "../../../components/Navigation.svelte";
   
	interface Types {
		ID: number;
		NAME: string;
		USAHA: string;
		CREATED_AT: string;
		UPDATED_AT: string;
	}

	interface Ranges {
		ID: number;
		TYPE_ID: number;
		TYPE_NAME: string;
		USAHA: string;
		RANGE_START: number;
		RANGE_END: number;
		FEE: number;
		CREATED_AT: string;
		UPDATED_AT: string;
	}

	let rangeTypes: Types[] = $state([]);
    let ranges: Ranges[] = $state([]);

    let usaha: string = $useConfiguration.usaha;
    let newTypeName: string = $state('');

    let selectedTypeId: number = $state(0);
    let rangeStart: string = $state('');
    let rangeEnd: string = $state('');
    let fee: string = $state('');

    onMount(async () => {
        await loadTypes();
        await loadRanges();
    });

    async function loadTypes(): Promise <void> {
		const { status, message, data } = await db({
			USAHA: usaha
		}, 'E-Money/Ranged');

		if (status === "error") {
			toast.error(message);
			return;
		}

		rangeTypes = data;
    }

    async function loadRanges(): Promise <void> {
  		const { status, message, data } = await db({
			USAHA: usaha
		}, 'E-Money/Ranged-Types');

		if (status === "error") {
			toast.error(message);
			return;
		}

		let updatedRanges: Ranges[] = [];
		data.forEach((rangeItem: Ranges) => {
			const matchedType = rangeTypes.find((type: Types) => type.ID === rangeItem.TYPE_ID);
			const typeName = matchedType ? matchedType.NAME : 'Tidak Ditemukan';

			updatedRanges = [...updatedRanges,{
				ID: rangeItem.ID,
				TYPE_ID: rangeItem.TYPE_ID,
				TYPE_NAME: typeName,
				USAHA: rangeItem.USAHA,
				RANGE_START: rangeItem.RANGE_START,
				RANGE_END: rangeItem.RANGE_END,
				FEE: rangeItem.FEE,
				CREATED_AT: rangeItem.CREATED_AT,
				UPDATED_AT: rangeItem.UPDATED_AT
			}];
		});

		ranges = updatedRanges;
    }

    async function addType() {
		toast('Anda akan membuat tipe baru.', {
			action: {
			label: useNotice.toast.areYouSure,
				onClick: async () => {
					const { status, message, data } = await db({
						name: newTypeName,
						usaha: usaha,
					}, 'E-Money/Insert-Type');

					if (status === "error") {
						toast.error(message);
						return;
					}

					toast.success(message);
					await loadTypes();
				}
			},
		});
    }

    async function addRange() {
		toast('Anda akan membuat rentang baru.', {
			action: {
			label: useNotice.toast.areYouSure,
				onClick: async () => {
					const { status, message, data } = await db({
						type_id: selectedTypeId,
						range_start: currencySanitizer(rangeStart),
						range_end: currencySanitizer(rangeEnd),
						fee: currencySanitizer(fee)
					}, 'E-Money/Insert-Range');

					if (status === "error") {
						toast.error(message);
						return;
					}

					toast.success(message);
					rangeStart =  '';
					rangeEnd = ''; 
					fee = '';
					await loadRanges();
				}
			},
		});
    }

    async function deleteRange(id: number) {
		toast('Konfirmasi Penghapusan!', {
			description: 'Anda tidak dapat mengembalikan tindakan ini',
			action: {
			label: useNotice.toast.confirmDelete,
				onClick: async () => {
					const { status, message } = await db({
						id: id
					}, 'E-Money/Delete-Range');

					if (status === "error") {
						toast.error(message);
						return;
					}

					toast.success(message);
					rangeStart =  '';
					rangeEnd = ''; 
					fee = '';
					await loadRanges();
				}
			},
		});
    }
</script>
<Navigation/>
<div class="container my-5">
    <div class="row">
        <!-- Add New Type -->
        <div class="col-md-6">
            <div class="card mb-4">
                <div class="card-body">
                    <h5 class="card-title">Tambah Tipe Transaksi</h5>
                    <div class="mb-3">
                        <label for="namaTipe" class="form-label">Nama Tipe</label>
                        <input type="text" bind:value={newTypeName} class="form-control" placeholder="Cth: Pembayaran E-Money" />
                    </div>
                    <button onclick={addType} class="btn btn-primary">Tambah</button>
                </div>
            </div>
        </div>

        <!-- Add New Range -->
        <div class="col-md-6">
            <div class="card mb-4">
                <div class="card-body">
                    <h5 class="card-title">Tambah Range Biaya</h5>
                    <div class="mb-3">
                        <label for="pilihTipe" class="form-label">Pilih Tipe</label>
                        <select bind:value={selectedTypeId} class="form-select">
                            <option value={0}>-- Pilih Tipe --</option>
                            {#each rangeTypes as type}
                                <option value={type.ID}>{type.NAME}</option>
                            {/each}
                        </select>
                    </div>
                    <div class="mb-3">
                        <label for="rangeAwal" class="form-label">Range Awal</label>
						<Rupiah id="startRange" bind:value={rangeStart} useClass="form-control"/>
                    </div>
                    <div class="mb-3">
                        <label for="rangeAkhir" class="form-label">Range Akhir</label>
						<Rupiah id="endRange" bind:value={rangeEnd} useClass="form-control"/>
                    </div>
                    <div class="mb-3">
                        <label for="biaya" class="form-label">Biaya</label>
						<Rupiah id="fees" bind:value={fee} useClass="form-control"/>
                    </div>
                    <button onclick={addRange} class="btn btn-success">Tambah Range</button>
                </div>
            </div>
        </div>
    </div>

    <!-- Ranges Table -->
    <div class="card">
        <div class="card-body">
            <h5 class="card-title">Daftar Range Biaya</h5>
            <table class="table table-bordered table-striped">
                <thead>
                    <tr class="text-center fw-bold">
                        <th>Tipe</th>
                        <th>Range Start</th>
                        <th>Range End</th>
                        <th>Fee</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {#each ranges as data}
                        <tr>
                            <td>{data.TYPE_NAME}</td>
                            <td>{rupiahFormatter.format(data.RANGE_START)}</td>
                            <td>{rupiahFormatter.format(data.RANGE_END)}</td>
                            <td>{rupiahFormatter.format(data.FEE)}</td>
                            <td>
                                <button class="btn btn-danger btn-sm" onclick={() => deleteRange(data.ID)}>Hapus</button>
                            </td>
                        </tr>
                    {/each}
                </tbody>
            </table>
        </div>
    </div>
</div>
