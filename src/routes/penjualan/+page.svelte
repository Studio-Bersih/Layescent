<script lang="ts">
	import Header from "../../components/Header.svelte";
</script>
<div class="container-fluid">
    <div class="card shadow card-dashed mt-3">
        <div class="card-header">
            <div class="card-title">
                <Header/>
            </div>
            <div class="card-toolbar">
                <span class="h2 fw-bolder text-success mt-3">Total Transaksi : Rp. 900.000</span>
            </div>
        </div>
        <div class="card-body">
            
            <div class="row">
                <div class="col">
                    
                    <div class="row">
                        <div class="col-1 text-center">
                            <img src="/icons/search.svg" class="h-40px mt-5" alt="SVG Search" />
                        </div>
                        <div class="col-11">
                            <label for="setToken" class="form-label fw-bold ms-1">[ESC] Scan Barcode atau Nama Item</label>
                            <input type="number" id="setToken" min="0" class="form-control form-control-sm w-50" placeholder="Cari Item" />
                        </div>
                    </div>

                    <div class="separator my-5"></div>

                    <div class="overflow-auto" style="height: 250px;">
                        <div class="table-responsive">
                            <table class="table align-middle gx-1 gy-1 table-hover">
                                <thead>
                                    <tr class="text-center fw-bold">
                                        <th>#</th>
                                        <th>Nama</th>
                                        <th>Stok</th>
                                        <th>Harga</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {#each Array(15) as _,index }
                                        <tr>
                                            <td class="text-center">{index + 1}</td>
                                            <td>A</td>
                                            <td class="text-center">B</td>
                                            <td class="text-center">C</td>
                                        </tr>
                                    {/each}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="separator my-5"></div>

                    <div class="row">
                        <div class="col">
                            <label for="setPembayaran" class="form-label fw-bold">Pembayaran</label>
                            <input type="text" class="form-control form-control-lg" placeholder="Rp. 5.000.000"/>
                        </div>
                        <div class="col">
                            <label for="viewKembalian" class="form-label fw-bold">Kembalian</label>
                            <input type="text" class="form-control form-control-lg form-control-solid" placeholder="Rp. -150.000" readonly/>

                        </div>
                    </div>

                    <div class="form-group my-3">
                        <label for="setKeterangan" class="form-label fw-bold">Keterangan</label>
                        <textarea class="form-control" rows="3" placeholder="Masukkan Keterangan" />
                    </div>

                    <button type="button" class="btn btn-lg btn-primary my-1 w-100">Simpan Transaksi</button>
                    
                </div>
                <div class="col">
                    <div class="table-responsive">
                        <table class="table align-middle table-hover">
                            <thead>
                                <tr class="fw-bold text-center gx-1 gy-1">
                                    <th>#</th>
                                    <th>Nama</th>
                                    <th>Jumlah</th>
                                    <th>Harga</th>
                                    <th>Total Harga</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {#each Array(15) as _,index }
                                    <tr>
                                        <td class="text-center">{index + 1}</td>
                                        <td>X</td>
                                        <td class="text-center">XX</td>
                                        <td class="text-center">XXX</td>
                                        <td class="text-center">XXXX</td>
                                        <td class="text-center">
                                            <button type="button" class="btn btn-sm btn-icon btn-danger">
                                                <img src="/icons/trash.svg" class="h-25px" alt="SVG Trash" />
                                            </button>
                                        </td>
                                    </tr>
                                {/each}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </div>
    </div>
</div>