<script lang="ts">
    let { value = $bindable(), useClass, id, disabled = false }: { value: string | number; useClass: string, id: string; disabled?: boolean } = $props();
    function formatCurrency(): string {
        let formattedValue: string = value.toString();
        if (typeof(value) == "string") {
            formattedValue = formattedValue.replace(/[^0-9]/g, '');
        }
        formattedValue = Number(formattedValue).toLocaleString('id-ID');
        value = 'Rp ' + formattedValue;
        return value;
    }
</script>

<input type="text" id={id} bind:value={value} class={useClass} oninput={formatCurrency} disabled={disabled} placeholder="Rp. 0"/>