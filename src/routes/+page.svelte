<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageData } from './$types';
  import { cart } from '$lib/cart/cart.svelte';
  import type { CustomerMenuItem } from '$lib/domain/menu';
  import ComboCustomizer from '$lib/components/ComboCustomizer.svelte';
  import OrderFlowSheet from '$lib/components/OrderFlowSheet.svelte';

  let { data }: { data: PageData } = $props();
  let cartOpen = $state(false);
  let comboOpen = $state(false);
  let activeCombo = $state<CustomerMenuItem | null>(null);

  onMount(() => cart.hydrate());

  function customise(item: CustomerMenuItem) {
    activeCombo = item;
    comboOpen = true;
  }
</script>

<svelte:head>
  <title>Mystic Roast — Order</title>
  <meta name="description" content="Order directly from Mystic Roast." />
</svelte:head>

<header class="border-b border-black/10 bg-[var(--mr-paper)]">
  <div class="mr-shell flex items-center justify-between py-5">
    <div>
      <p class="text-xs uppercase tracking-[0.28em] text-[var(--mr-muted)]">Mystic Roast</p>
      <h1 class="mr-display text-3xl">Stay a Little Longer.</h1>
    </div>
    <button class="rounded-full border border-black/10 px-4 py-2 text-sm">Menu</button>
  </div>
</header>

<main class="pb-28">
  <section class="mr-shell py-10 sm:py-16">
    <div class="max-w-2xl">
      <p class="mb-3 text-xs uppercase tracking-[0.25em] text-[var(--mr-olive)]">Coffee · Food · Magic</p>
      <h2 class="mr-display text-5xl leading-[0.95] sm:text-7xl">Order what you feel like staying for.</h2>
      <p class="mt-5 max-w-xl text-[var(--mr-muted)]">Browse freely, build your cart, and confirm your details only when you're ready to place the order.</p>
    </div>
  </section>

  <section class="mr-shell">
    <div class="mb-5 flex items-end justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.25em] text-[var(--mr-olive)]">Menu</p>
        <h3 class="mr-display text-4xl">Today at Mystic Roast</h3>
      </div>
      <span class="text-sm text-[var(--mr-muted)]">{data.menu.length} items</span>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {#each data.menu as item}
        <article class="mr-card flex min-h-56 flex-col justify-between p-5">
          <div>
            <div class="mb-8 flex items-start justify-between gap-4">
              <span class="rounded-full bg-[var(--mr-olive)]/10 px-3 py-1 text-xs uppercase tracking-wider text-[var(--mr-olive-dark)]">{item.category}</span>
              {#if item.is_vegetarian === true}<span aria-label="Vegetarian">●</span>{/if}
            </div>
            <h4 class="mr-display text-3xl">{item.name}</h4>
            {#if item.description}<p class="mt-2 text-sm leading-6 text-[var(--mr-muted)]">{item.description}</p>{/if}
          </div>
          <div class="mt-7 flex items-center justify-between">
            <strong class="text-lg">₹{item.selling_price}</strong>
            {#if item.item_type === 'regular'}
              <button onclick={() => cart.add(item)} class="rounded-full bg-[var(--mr-olive-dark)] px-5 py-2.5 text-sm font-medium text-white">Add</button>
            {:else}
              <button onclick={() => customise(item)} class="rounded-full bg-[var(--mr-olive-dark)] px-5 py-2.5 text-sm font-medium text-white">Customise</button>
            {/if}
          </div>
        </article>
      {:else}
        <div class="mr-card col-span-full p-8 text-center text-[var(--mr-muted)]">The customer menu is empty right now.</div>
      {/each}
    </div>
  </section>
</main>

{#if cart.itemCount > 0}
  <div class="fixed inset-x-0 bottom-4 z-50 px-4">
    <button onclick={() => (cartOpen = true)} class="mx-auto flex w-full max-w-xl items-center justify-between rounded-full bg-[var(--mr-olive-dark)] px-6 py-4 text-white shadow-xl">
      <span>{cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'} · ₹{cart.subtotal}</span>
      <strong>View cart →</strong>
    </button>
  </div>
{/if}

<ComboCustomizer
  item={activeCombo}
  bind:open={comboOpen}
  onAdd={(item, selections) => cart.add(item, selections)}
/>

<OrderFlowSheet bind:open={cartOpen} initialForm={data.checkoutForm} />
