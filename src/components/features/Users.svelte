<div class="table-responsive">
    <table class="table align-middle table-hover">
        <thead>
            <tr class="fw-bold">
                <th>#</th>
                <th>Nama</th>
                <th>Token</th>
                <th>Aktivitas Terakhir</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
            {#each Array(3) as _,index }
                <tr>
                    <td>{index + 1}</td>
                    <td>User {index + 1}</td>
                    <td>ABCDEF</td>
                    <td>2024-12-12 09:14 WIB</td>
                    <td>
                        <button type="button" class="btn btn-sm btn-primary">Simpan</button>
                    </td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>