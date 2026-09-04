<script lang="ts">
  import { onMount } from 'svelte';
  import ArrowRight from '@lucide/svelte/icons/arrow-right';
  import Coffee from '@lucide/svelte/icons/coffee';
  import Leaf from '@lucide/svelte/icons/leaf';
  import MapPin from '@lucide/svelte/icons/map-pin';
  import ShoppingBag from '@lucide/svelte/icons/shopping-bag';
  import type { PageData } from './$types';
  import { cart } from '$lib/cart/cart.svelte';
  import type { CustomerMenuItem } from '$lib/domain/menu';
  import ComboCustomizer from '$lib/components/ComboCustomizer.svelte';
  import OrderFlowSheet from '$lib/components/OrderFlowSheet.svelte';
  import { Button } from '$lib/components/ui/button';
  import { Separator } from '$lib/components/ui/separator';

  let { data }: { data: PageData } = $props();
  let cartOpen = $state(false);
  let comboOpen = $state(false);
  let activeCombo = $state<CustomerMenuItem | null>(null);

  type MenuSection = {
    category: string;
    id: string;
    title: string;
    note: string;
    rank: number;
    items: CustomerMenuItem[];
  };

  const menuSections = $derived.by(() => {
    const categories = new Map<string, CustomerMenuItem[]>();
    for (const item of data.menu) {
      const items = categories.get(item.category) ?? [];
      items.push(item);
      categories.set(item.category, items);
    }

    return [...categories.entries()]
      .map(([category, items]): MenuSection => {
        const normalized = category.toLowerCase();
        const slug = category.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

        if (normalized.includes('combo')) {
          return { category, id: slug, title: 'Combos', note: 'Made to share, or not', rank: 40, items };
        }
        if (normalized.includes('pizza')) {
          return { category, id: slug, title: 'Bestselling Pizzas', note: 'Hot from the oven', rank: 20, items };
        }
        if (normalized.includes('momo') || normalized.includes('snack')) {
          return { category, id: slug, title: 'Momos & Snacks', note: 'Little plates, big comfort', rank: 30, items };
        }
        if (['coffee', 'drink', 'beverage', 'tea'].some((word) => normalized.includes(word))) {
          return { category, id: slug, title: 'Signature Drinks', note: 'Brewed for slow afternoons', rank: 10, items };
        }
        return { category, id: slug, title: category, note: 'From the Mystic Roast kitchen', rank: 50, items };
      })
      .sort((a, b) => a.rank - b.rank);
  });

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

<header class="border-b border-foreground/10 bg-background">
  <div class="mr-shell flex items-center justify-between gap-4 py-3.5 sm:py-4">
    <a href="#top" class="min-w-0" aria-label="Mystic Roast menu home">
      <p class="mr-kicker">Mystic Roast</p>
      <p class="font-heading text-[1.7rem] leading-none tracking-[-0.035em]">Stay a Little Longer.</p>
    </a>
    <div class="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
      <MapPin class="size-3.5 text-primary" />
      <span>Order at your table</span>
    </div>
    <span class="grid size-9 place-items-center rounded-full border border-primary/20 text-primary sm:hidden" aria-hidden="true">
      <Coffee class="size-4" />
    </span>
  </div>
</header>

<main id="top" class="pb-32">
  <section class="mr-shell py-5 sm:py-9">
    <div class="grid items-end gap-5 border-b border-foreground/10 pb-5 sm:grid-cols-[1fr_auto] sm:pb-8">
      <div class="max-w-2xl">
        <p class="mr-kicker mb-2">Coffee · Food · Magic</p>
        <h1 class="font-heading text-[2.55rem] leading-[0.98] tracking-[-0.045em] sm:text-6xl">
          What are you staying for?
        </h1>
      </div>
      <p class="max-w-xs text-sm leading-6 text-muted-foreground sm:text-right">
        Pick a favourite, settle in, and pay at the counter when it’s ready.
      </p>
    </div>
  </section>

  {#if menuSections.length > 0}
    <nav
      class="sticky top-0 z-30 border-y border-foreground/10 bg-background/92 shadow-[0_8px_24px_rgba(45,48,35,0.04)] backdrop-blur-xl"
      aria-label="Menu categories"
    >
      <div class="mr-shell no-scrollbar flex gap-1 overflow-x-auto py-2">
        {#each menuSections as section}
          <Button
            href={`#${section.id}`}
            variant="ghost"
            size="sm"
            class="shrink-0 px-3.5 text-[0.7rem] text-muted-foreground hover:bg-primary/8 hover:text-primary"
          >
            {section.title}
          </Button>
        {/each}
      </div>
    </nav>
  {/if}

  <div class="mr-shell">
    {#each menuSections as section, sectionIndex}
      <section id={section.id} class="scroll-mt-16 py-8 sm:py-12">
        <div class="mb-4 flex items-end justify-between gap-5 sm:mb-6">
          <div>
            <p class="mr-kicker mb-1.5">{section.note}</p>
            <h2 class="font-heading text-[2rem] leading-none tracking-[-0.035em] sm:text-4xl">{section.title}</h2>
          </div>
          <span class="font-heading text-2xl italic text-primary/45">{String(sectionIndex + 1).padStart(2, '0')}</span>
        </div>

        <div class="grid border-b border-foreground/10 md:grid-cols-2 md:gap-x-10">
          {#each section.items as item}
            <article class="group grid grid-cols-[6.75rem_minmax(0,1fr)] gap-4 border-t border-foreground/10 py-4 sm:grid-cols-[8rem_minmax(0,1fr)] sm:py-5">
              <div class="mr-product-image relative aspect-square overflow-hidden rounded-[1.1rem] bg-secondary">
                {#if item.image_url}
                  <img
                    src={item.image_url}
                    alt={item.name}
                    loading="lazy"
                    class="absolute inset-0 size-full object-cover transition duration-500 group-hover:scale-[1.03]"
                  />
                {:else}
                  <div class="absolute inset-0 grid place-items-center">
                    <span class="font-heading text-4xl italic text-primary/55">{item.name.slice(0, 1)}</span>
                  </div>
                  <Coffee class="absolute bottom-3 right-3 size-4 text-primary/40" />
                {/if}
                {#if item.is_vegetarian === true}
                  <span class="absolute left-2.5 top-2.5 grid size-6 place-items-center rounded-full bg-background/90 text-primary shadow-sm" aria-label="Vegetarian">
                    <Leaf class="size-3.5" />
                  </span>
                {/if}
              </div>

              <div class="flex min-w-0 flex-col py-0.5">
                <div class="flex-1">
                  <p class="mb-1 text-[0.65rem] font-semibold uppercase tracking-[0.16em] text-primary/75">{section.category}</p>
                  <h3 class="font-heading text-[1.35rem] leading-tight tracking-[-0.025em] sm:text-2xl">{item.name}</h3>
                  {#if item.description}
                    <p class="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground sm:text-sm">{item.description}</p>
                  {/if}
                </div>

                <div class="mt-3 flex items-center justify-between gap-3">
                  <strong class="font-heading text-lg font-semibold">₹{item.selling_price}</strong>
                  {#if item.item_type === 'regular'}
                    <Button size="sm" onclick={() => cart.add(item)} class="min-w-20">Add</Button>
                  {:else}
                    <Button size="sm" onclick={() => customise(item)} class="gap-1.5">
                      Customise <ArrowRight class="size-3.5" />
                    </Button>
                  {/if}
                </div>
              </div>
            </article>
          {/each}
        </div>
      </section>
    {:else}
      <section class="py-16 text-center">
        <Coffee class="mx-auto size-7 text-primary/55" />
        <h2 class="mt-4 font-heading text-3xl">The menu is resting.</h2>
        <p class="mt-2 text-sm text-muted-foreground">Please ask the café team what’s brewing today.</p>
      </section>
    {/each}
  </div>

  <div class="mr-shell mt-2">
    <Separator class="bg-foreground/10" />
    <footer class="flex items-center justify-between gap-4 py-6 text-xs text-muted-foreground">
      <span>Mystic Roast · Made for unhurried moments</span>
      <Coffee class="size-4 text-primary/55" />
    </footer>
  </div>
</main>

{#if cart.itemCount > 0}
  <div class="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-primary/96 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2.5 text-primary-foreground shadow-[0_-12px_35px_rgba(34,39,24,0.18)] backdrop-blur-xl sm:bottom-4 sm:mx-auto sm:max-w-lg sm:rounded-full sm:border sm:p-1.5">
    <Button
      onclick={() => (cartOpen = true)}
      class="h-12 w-full justify-between bg-transparent px-3 text-primary-foreground shadow-none hover:bg-white/8 sm:px-5"
    >
      <span class="flex items-center gap-2.5">
        <span class="grid size-7 place-items-center rounded-full bg-background/15"><ShoppingBag class="size-3.5" /></span>
        <span>{cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'} · ₹{cart.subtotal}</span>
      </span>
      <span class="flex items-center gap-1.5">View cart <ArrowRight class="size-3.5" /></span>
    </Button>
  </div>
{/if}

<ComboCustomizer
  item={activeCombo}
  bind:open={comboOpen}
  onAdd={(item, selections) => cart.add(item, selections)}
/>

<OrderFlowSheet bind:open={cartOpen} initialForm={data.checkoutForm} />
