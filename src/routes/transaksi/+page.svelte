<script lang="ts">
    import Modal from "../../components/Modal.svelte";
	import Header from "../../components/Header.svelte";
	import Users from "../../components/features/Users.svelte";
	import Report from "../../components/features/Report.svelte";

    let isModal: boolean = false;
    let userContents: string = 'report';

    function viewModal(id: string) {
        userContents = id;
        openModal();
    }

    const openModal = () => {
        isModal = true
    };

    const closeModal = () => {
        isModal = false
    };
</script>
<div class="container-fluid">
    <div class="card card-dashed shadow mt-3">
        <div class="card-header">
            <div class="card-title">
                <Header/>
            </div>
            <div class="card-toolbar">
                <button type="button" on:click={() => viewModal('report')}  class="btn btn-sm btn-success me-2">
                    <img src="/icons/excel.svg" class="h-20px me-2" alt="SVG Excel" /> Unduh Laporan
                </button>
                <button type="button" on:click={() => viewModal('users')} class="btn btn-sm btn-warning me-2">
                    <img src="/icons/users.svg" class="h-20px me-2" alt="SVG Excel" /> Pengguna
                </button>
                <button type="button" on:click={() => viewModal('logOff')} class="btn btn-sm btn-dark me-2">
                    <img src="/icons/power.svg" class="h-20px me-2" alt="SVG Log Off" /> Akhiri Sesi
                </button>
            </div>
        </div>
        <div class="card-body">
            
            <div class="table-responsive">
                <table class="table align-middle table-hover gx-1 gy-1">
                    <thead>
                        <tr class="text-center fw-bold">
                            <th>#</th>
                            <th>Nama</th>
                            <th>Terjual</th>
                            <th>Sisa Stok</th>
                            <th>Harga Beli</th>
                            <th>Harga Jual</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each Array(100) as _,index }
                            <tr class="text-center">
                                <td>{index + 1}</td>
                                <td class="text-start">A</td>
                                <td>B</td>
                                <td>C</td>
                                <td>D</td>
                                <td>E</td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>

        </div>
    </div>
</div>

<!-- Modal -->
{#if isModal}
    <Modal open={isModal} onClose={closeModal}>
        {#if userContents === 'users'}
            <Users/>
        {:else if userContents === 'report'}
            <Report/>
        {:else if userContents === 'logOff'}
            <p class="text-center">Anda akan mengakhiri sesi dan keluar dari sistem!</p>
            <button type="button" class="btn btn-sm btn-danger my-5 w-100">Akhiri sesi saya!</button>
        {/if}
    </Modal>
{/if}