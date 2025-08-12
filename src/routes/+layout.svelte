<script lang="ts">
	import { onMount } from "svelte";
	import { Toaster } from "svelte-sonner";
	import { loadToken } from "../library/validator/useAuth";

    onMount(() => loadToken());
</script>
<svelte:head>
	<title>Point of Sale</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
</svelte:head>
<Toaster closeButton />
<slot/>