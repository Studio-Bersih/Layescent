<script lang="ts">
    let year: number = new Date().getFullYear();
</script>
<div class="log-centered">
    <div class="card shadow">
        <div class="card-header">
            <h3 class="card-title fw-bold">User Login</h3>
            <div class="card-toolbar">
                <button type="button" class="btn btn-sm btn-primary">
                    <img src="/icons/key.svg" class="h-20px me-1" alt=""/>
                    Lupa Token?
                </button>
            </div>
        </div>
        <div class="card-body">

            <div class="row">
                <div class="col-1">
                    <img src="/icons/person.svg" class="h-40px mt-9" alt="SVG Login" />
                </div>
                <div class="col-11">
                    <label for="setToken" class="form-label fw-bold">Masukkan Token</label>
                    <input type="number" id="setToken" min="0" class="form-control" placeholder="Token" />
                </div>
            </div>

        </div>
        <div class="card-footer fw-semibold">
            © {year} - Gilby Dhilega Yodiaz
        </div>
    </div>
</div>
