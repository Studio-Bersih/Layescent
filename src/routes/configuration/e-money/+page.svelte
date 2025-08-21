<script lang="ts">
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";
	import { db } from "../../../library/hooks/db";
	import { useNotice } from "../../../library/validator/useNotice";
	import { useConfiguration } from "../../../config/useConfiguration";
	import { currencySanitizer, rupiahFormatter } from "../../../library/utils/useFormatter";
	
	import Rupiah from "../../../components/shared/Rupiah.svelte";
	import Navigation from "../../../components/Navigation.svelte";
	import { loadToken } from "../../../library/validator/useAuth";
	import Drawer from "../../../components/shared/Drawer.svelte";
   
	interface Types {
		ID: number;
		NAME: string;
		USAHA: string;
		COUNTER: string;
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

	interface RangeTypes {
		ID: number | null;
		RANGE_START: number;
		RANGE_END: number;
		FEE: number;
	}

	let rangeTypes: Types[] = $state([]);
    let ranges: Ranges[] = $state([]);

    let usaha: string = $useConfiguration.usaha;
    let newTypeName: string = $state('');
	let setType: string = $state('');

    let selectedTypeId: number = $state(0);
    let rangeStart: string = $state('');
    let rangeEnd: string = $state('');
    let fee: string = $state('');

	let rangeView: RangeTypes = $state({
		ID: null,
		RANGE_START: 0,
		RANGE_END: 0,
		FEE: 0
	})

	let isDrawer: boolean = $state(false);

    onMount(async () => initializePage());

	async function initializePage(): Promise <void> {
		loadToken();
        await loadTypes();
        await loadRanges();
	}

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
					const { status, message } = await db({
						name: newTypeName,
						type: setType,
						usaha: usaha,
					}, 'E-Money/Insert-Type');

					if (status === "error") {
						toast.error(message);
						return;
					}

					newTypeName = "";
					setType = "";
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

	async function editRange(id: number): Promise <void> {
		const { status, message, data } = await db({
			id: id
		}, 'E-Money/View-Range');

		if (status === "error") {
			toast.error(message);
			return;
		}

		rangeView = data;
		isDrawer = true;
	}

	async function updateRange(): Promise <void> {
		const { status, message, data } = await db({
			START: rangeView.RANGE_START,
			END: rangeView.RANGE_END,
			FEE: rangeView.FEE,
			ID: rangeView.ID
		}, 'E-Money/Update-Range');

		if ( status === "error") {
			toast.error(message);
			return;
		}

		initializePage();
		toast.success(message);
		isDrawer = false;
	}

	async function editMainRange(id: number, name: string, counter: string): Promise <void> {
		toast('Update Kategori Utama', {
			description: 'Perubahan ini tidak dapat dikembalikan.',
			action: {
			label: useNotice.toast.areYouSure,
				onClick: async () => {
					try {
						const { status, message } = await db({
							ID: id,
							NAME: name,
							COUNTER: counter
						}, 'E-Money/Edit-Ranged-Types');

						if (status === "error") {
							toast.error(message);
							return;
						}

						toast.success(message);
						initializePage();
					} catch (error) {
						toast.error(useNotice.connection.default)
					}
				}
			},
		});
	}

	async function deleteMainRange(id: number): Promise <void> {
		toast.error('Penghapusan Kategori Utama', {
			description: 'Perubahan ini tidak dapat dikembalikan.',
			action: {
			label: useNotice.toast.areYouSure,
				onClick: async () => {
					try {
						const { status, message } = await db({
							ID: id,
						}, 'E-Money/Delete-Ranged-Types');

						if (status === "error") {
							toast.error(message);
							return;
						}

						toast.success(message);
						initializePage();						
					} catch (error) {
						toast.error(useNotice.connection.default)
					}
				}
			},
		});
	}
</script>
<div class="container my-5">
	<Navigation/>
    <div class="row my-7">
        <!-- Add New Type -->
        <div class="col-md-6">
            <div class="card mb-4">
                <form onsubmit={addType} class="card-body">
                    <h5 class="card-title">Tambah Tipe Transaksi</h5>
                    <div class="mb-3">
                        <label for="namaTipe" class="form-label">Nama Tipe</label>
                        <input type="text" bind:value={newTypeName} class="form-control" placeholder="Cth: Pembayaran E-Money" required/>
                    </div>
                    <div class="mb-3">
                        <label for="namaTipe" class="form-label">Tipe E-Money</label>
						<select bind:value={setType} class="form-select" required>
							<option value="" selected disabled>Pilih</option>
							<option value="Decrease">Mengurangi Uang Fisik</option>
							<option value="Increase">Menambah Uang Fisik</option>
						</select>
                    </div>
                    <button type="submit" class="btn btn-primary">Tambah</button>
                </form>
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
						<Rupiah id="startRange" bind:value={rangeStart} useClass="form-control" disabled={false}/>
                    </div>
                    <div class="mb-3">
                        <label for="rangeAkhir" class="form-label">Range Akhir</label>
						<Rupiah id="endRange" bind:value={rangeEnd} useClass="form-control" disabled={false}/>
                    </div>
                    <div class="mb-3">
                        <label for="biaya" class="form-label">Biaya</label>
						<Rupiah id="fees" bind:value={fee} useClass="form-control" disabled={false}/>
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
            <table class="table table-bordered table-striped text-center">
                <thead>
                    <tr class="fw-bold">
						<th>#</th>
                        <th>Tipe</th>
                        <th>Range Start</th>
                        <th>Range End</th>
                        <th>Fee</th>
                        <th>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {#if ranges.length === 0}
						<tr>
							<td colspan="6" class="text-center">Sedang memuat..</td>
						</tr>
					{:else}
						{#each ranges as data, index}
							<tr>
								<td>{index + 1}</td>
								<td>{data.TYPE_NAME}</td>
								<td>{rupiahFormatter.format(data.RANGE_START)}</td>
								<td>{rupiahFormatter.format(data.RANGE_END)}</td>
								<td>{rupiahFormatter.format(data.FEE)}</td>
								<td>
									<button class="btn btn-primary btn-sm btn-icon" onclick={() => editRange(data.ID)}>
										<img src="/icons/elements/Edit.svg" alt="Edit Icon" class="h-15px">
									</button>
									<button class="btn btn-danger btn-sm btn-icon" onclick={() => deleteRange(data.ID)}>
										<img src="/icons/trash.svg" alt="Delete Icon" class="h-25px">
									</button>
								</td>
							</tr>
						{/each}
					{/if}
                </tbody>
            </table>
        </div>
    </div>

    <!-- Ranges Table -->
    <div class="card my-5">
        <div class="card-body">
            <h5 class="card-title">Konfigurasi Range Utama</h5>
            <table class="table table-bordered table-striped text-center">
                <thead>
                    <tr class="fw-bold">
						<th>#</th>
                        <th class="w-25">Nama Tipe</th>
                        <th class="w-25">Tipe E-Money</th>
						<th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {#if ranges.length === 0}
						<tr>
							<td colspan="3" class="text-center">Sedang memuat..</td>
						</tr>
					{:else}
						{#each rangeTypes as data, index}
							<tr>
								<td>{index + 1}</td>
								<td>
									<input type="text" class="form-control form-control-sm text-center" bind:value={data.NAME} />
								</td>
								<td>
									<select bind:value={data.COUNTER} class="form-select form-control-sm" required>
										<option value="" selected disabled>Pilih</option>
										<option value="Decrease">Mengurangi Uang Fisik</option>
										<option value="Increase">Menambah Uang Fisik</option>
									</select>
								</td>
								<td>
									<button class="btn btn-primary btn-sm btn-icon" onclick={() => editMainRange(data.ID, data.NAME, data.COUNTER)}>
										<img src="/icons/sync.svg" alt="Edit Icon" class="h-25px">
									</button>
									<button class="btn btn-danger btn-sm btn-icon" onclick={() => deleteMainRange(data.ID)}>
										<img src="/icons/trash.svg" alt="Delete Icon" class="h-25px">
									</button>
								</td>
							</tr>
						{/each}
					{/if}
                </tbody>
            </table>
        </div>
    </div>
</div>

<Drawer isOpen={isDrawer} position="right" width="600px" onClose={() => isDrawer = !isDrawer}>
    <div class="p-5 w-100">
		<h3>Edit Range Biaya</h3>
		<div class="separator my-3"></div>

		<form onsubmit={updateRange}>
			<div class="form-group">
				<label for="startRange" class="form-label fw-bold">Range Start</label>
				<input type="text" bind:value={rangeView.RANGE_START} class="form-control form-control-sm" placeholder="Range Mulai" required/>
			</div>
			
			<div class="form-group">
				<label for="startRange" class="form-label fw-bold">Range End</label>
				<input type="text" bind:value={rangeView.RANGE_END} class="form-control form-control-sm" placeholder="Range Mulai" required/>
			</div>
	
			<div class="form-group">
				<label for="startRange" class="form-label fw-bold">Fee</label>
				<input type="text" bind:value={rangeView.FEE} class="form-control form-control-sm" placeholder="Range Mulai" required/>
			</div>

			<div class="d-flex justify-content-end my-3">
				<button type="submit" class="btn btn-sm btn-primary">Update Range</button>
			</div>
		</form>

    </div>
</Drawer>