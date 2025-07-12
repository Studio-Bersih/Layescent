<!-- <script lang="ts">
	import { onMount } from 'svelte';
	import { toast } from 'svelte-sonner';
	import Navigation from '../../../components/Navigation.svelte';

	let types = $state([]);
	let ranges = $state([]);
	let selectedTypeId: number | null = $state(null);

	let newTypeName = $state('');
	let newRange = $state({
		range_start: '',
		range_end: '',
		fee: ''
	});

	interface PaymentRangeType {
		id: number;
		name: string;
	}

	interface PaymentRange {
		id: number;
		type_id: number;
		range_start: number;
		range_end: number;
		fee: number;
	}

	// ========== MOCKED API PLACEHOLDERS ==========
	async function fetchTypes() {
		// types = [
		// 	{ id: 1, name: "Transfer Antar Bank & EDC" },
		// 	{ id: 2, name: "Penarikan GoPay & QRIS" }
		// ];
	}

	async function fetchRanges(typeId: number) {
		// ranges = [
		// 	{ id: 1, type_id: typeId, range_start: 10000, range_end: 200000, fee: 5000 },
		// 	{ id: 2, type_id: typeId, range_start: 201000, range_end: 500000, fee: 8000 }
		// ];
	}

	async function addType() {
		// if (!newTypeName.trim()) return toast.error("Nama tipe tidak boleh kosong!");
		// const newType = { id: Date.now(), name: newTypeName };
		// types = [...types, newType];
		// newTypeName = '';
		// toast.success("Jenis transaksi ditambahkan.");
	}

	async function deleteType(id: number) {
		// if (!confirm("Yakin ingin menghapus tipe ini beserta semua range-nya?")) return;
		// types = types.filter(t => t.id !== id);
		// if (selectedTypeId === id) {
		// 	selectedTypeId = null;
		// 	ranges = [];
		// }
		// toast.success("Tipe berhasil dihapus.");
	}

	async function addRange() {
		// const { range_start, range_end, fee } = newRange;
		// if (!selectedTypeId || !range_start || !range_end || !fee)
		// 	return toast.error("Semua data harus diisi!");

		// const newId = Date.now();
		// ranges = [
		// 	...ranges,
		// 	{ id: newId, type_id: selectedTypeId, range_start: +range_start, range_end: +range_end, fee: +fee }
		// ];
		// newRange.range_start = '';
		// newRange.range_end = '';
		// newRange.fee = '';
		// toast.success("Range fee ditambahkan.");
	}

	async function deleteRange(id: number) {
		// if (!confirm("Hapus range ini?")) return;
		// ranges = ranges.filter(r => r.id !== id);
		// toast.success("Range berhasil dihapus.");
	}

	onMount(async () => {
		await fetchTypes();
	});
</script>
<Navigation/>
<div class="container mt-4">
	<!-- Add New Transaction Type -->
	<div class="card mb-4">
		<div class="card-body">
			<h5 class="card-title">Tambah Jenis Transaksi</h5>
			<div class="input-group">
				<input type="text" class="form-control" placeholder="Nama Tipe Baru" bind:value={newTypeName}/>
				<button class="btn btn-primary" onclick={addType}>Tambah</button>
			</div>
		</div>
	</div>

	<!-- Transaction Type List -->
	<div class="card mb-4">
		<div class="card-body">
			<h5 class="card-title">Daftar Jenis Transaksi</h5>
			<ul class="list-group">
				{#each types as type}
					<li class="list-group-item d-flex justify-content-between align-items-center">
						<span role="button" onclick={() => {selectedTypeId = type.id; fetchRanges(type.id); }}>{type.name}</span>
						<button class="btn btn-sm btn-outline-danger" onclick={() => deleteType(type.id)}>
							Hapus
						</button>
					</li>
				{/each}
			</ul>
		</div>
	</div>

	<!-- Fee Range Table -->
	{#if selectedTypeId}
		<div class="card mb-5">
			<div class="card-body">
				<h5 class="card-title">
					Range Biaya - {types.find(t => t.id === selectedTypeId)?.name}
				</h5>

				<table class="table table-bordered mt-3">
					<thead class="table-light">
						<tr>
							<th>Start</th>
							<th>End</th>
							<th>Fee</th>
							<th>Aksi</th>
						</tr>
					</thead>
					<tbody>
						{#each ranges as range}
							<tr>
								<td>{range.range_start}</td>
								<td>{range.range_end}</td>
								<td>{range.fee}</td>
								<td>
									<button class="btn btn-sm btn-danger" onclick={() => deleteRange(range.id)}>
										Hapus
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>

				<!-- Add New Fee Range -->
				<div class="row mt-4 g-2">
					<div class="col-md-3">
						<input type="number" class="form-control" placeholder="Start" bind:value={newRange.range_start} />
					</div>
					<div class="col-md-3">
						<input type="number" class="form-control" placeholder="End" bind:value={newRange.range_end} />
					</div>
					<div class="col-md-3">
						<input type="number" class="form-control" placeholder="Fee" bind:value={newRange.fee} />
					</div>
					<div class="col-md-3">
						<button class="btn btn-success w-100" onclick={addRange}>Tambah Range</button>
					</div>
				</div>
			</div>
		</div>
	{/if}
</div> -->
