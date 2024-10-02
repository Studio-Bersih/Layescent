<script lang="ts">
    export let value: string = '';

    function formatCurrency(){
        let formattedValue = value.replace(/[^0-9]/g, '');
        formattedValue = Number(formattedValue).toLocaleString('id-ID');
        value = 'Rp ' + formattedValue;
    }
</script>
<input type="text" bind:value class="form-control form-control-sm" on:input={formatCurrency} placeholder="Rp. 0"/>