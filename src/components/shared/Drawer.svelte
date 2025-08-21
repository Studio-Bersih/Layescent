<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { browser } from '$app/environment'; // <--- SvelteKit helper

    export let isOpen: boolean = false;
    export let position: 'left' | 'right' | 'top' | 'bottom' = 'left';
    export let width: string = '300px';
    export let height: string = '100%';
    export let onClose: () => void;

    let drawerRef: HTMLDivElement;
    let drawerStyles: string = '';
    let focusableElements: HTMLElement[] = [];
    let lastActiveElement: HTMLElement | null = null;

    const updateStyles = () => {
        drawerStyles = `width: ${width}; height: ${height};`;
    };

    const handleClickOutside = (event: MouseEvent) => {
        if (isOpen && drawerRef && !drawerRef.contains(event.target as Node)) {
            onClose();
        }
    };

    const lockScroll = () => {
        if (browser) document.body.style.overflow = 'hidden';
    };

    const unlockScroll = () => {
        if (browser) document.body.style.overflow = '';
    };

    onMount(() => {
        updateStyles();

        if (browser) {
            document.addEventListener('mousedown', handleClickOutside);
        }
    });

    onDestroy(() => {
        if (browser) {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        unlockScroll();
    });

    $: if (browser) {
        if (isOpen) {
            lockScroll();
            lastActiveElement = document.activeElement as HTMLElement;
            setTimeout(() => {
                focusableElements[0]?.focus();
            }, 50);
        } else {
            unlockScroll();
            lastActiveElement?.focus();
        }
        updateStyles();
    }

    async function handleKeyNavigation(event: KeyboardEvent) {
        if (event.key === 'Escape' && isOpen) {
            if (browser) {
                window.scrollTo({ top: 0, behavior: 'smooth' });
            }
            onClose();
        }
    }
</script>

{#if isOpen}
    <div class="modal-backdrop visible" onclick={onClose} role="presentation"></div>
{/if}

<div bind:this={drawerRef} class="drawer {position} {isOpen ? 'open' : ''}" style={drawerStyles} role="dialog" aria-modal="true">
    <slot></slot>
</div>

<svelte:window on:keydown={handleKeyNavigation} />
<!-- 
<Drawer isOpen={isDrawer} position="left" width="300px" onClose={() => isDrawer = !isDrawer}>
    <div class="p-4">
        Lorem ipsum
    </div>
</Drawer> -->