<script lang="ts">
  import { Dialog } from 'bits-ui';
  import { untrack } from 'svelte';
  import { ArrowLeft, Check, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-svelte';
  import { Control, Field, FieldErrors, Fieldset, Label, Legend } from 'formsnap';
  import { superForm, type SuperValidated } from 'sveltekit-superforms';
  import { zod4Client } from 'sveltekit-superforms/adapters';
  import { cart } from '$lib/cart/cart.svelte';
  import { checkoutSchema, type CheckoutData } from '$lib/forms/checkout';

  let {
    open = $bindable(false),
    initialForm
  }: {
    open: boolean;
    initialForm: SuperValidated<CheckoutData>;
  } = $props();

  let step = $state<'cart' | 'checkout'>('cart');
  let checkoutComplete = $state(false);

  const checkoutForm = superForm(untrack(() => initialForm), {
    validators: zod4Client(checkoutSchema),
    SPA: true,
    resetForm: false,
    validationMethod: 'oninput',
    onUpdated({ form }) {
      if (form.valid) checkoutComplete = true;
    }
  });
  const { form: formData, enhance } = checkoutForm;

  function closeSheet() {
    open = false;
  }

  function handleOpenChange(nextOpen: boolean) {
    open = nextOpen;
    if (!nextOpen) {
      step = 'cart';
      checkoutComplete = false;
    }
  }

  function removeLine(key: string) {
    cart.setQuantity(key, 0);
  }
</script>

<Dialog.Root {open} onOpenChange={handleOpenChange}>
  <Dialog.Portal>
    <Dialog.Overlay class="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px]" />
    <Dialog.Content
      class="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col border-l border-black/10 bg-[var(--mr-paper)] shadow-2xl outline-none"
    >
      <div class="flex items-start justify-between gap-4 border-b border-black/10 px-5 py-5 sm:px-7">
        <div class="flex items-start gap-3">
          {#if step === 'checkout' && !checkoutComplete}
            <button
              type="button"
              onclick={() => (step = 'cart')}
              class="mt-0.5 grid size-9 place-items-center rounded-full border border-black/10"
              aria-label="Back to cart"
            >
              <ArrowLeft size={18} />
            </button>
          {/if}
          <div>
            <p class="text-xs uppercase tracking-[0.22em] text-[var(--mr-olive)]">
              {step === 'cart' ? 'Your order' : 'Checkout'}
            </p>
            <Dialog.Title class="mr-display mt-1 text-3xl">
              {#if step === 'cart'}
                Cart
              {:else if checkoutComplete}
                Details confirmed
              {:else}
                Almost there
              {/if}
            </Dialog.Title>
            <Dialog.Description class="mt-1 text-sm text-[var(--mr-muted)]">
              {#if step === 'cart'}
                {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'} ready to order.
              {:else if checkoutComplete}
                Your checkout details are valid. No order has been submitted.
              {:else}
                Tell us who to call when your order is ready.
              {/if}
            </Dialog.Description>
          </div>
        </div>
        <button
          type="button"
          onclick={closeSheet}
          class="grid size-10 shrink-0 place-items-center rounded-full border border-black/10 bg-white/40"
          aria-label="Close cart"
        >
          <X size={19} />
        </button>
      </div>

      {#if step === 'cart'}
        <div class="flex-1 overflow-y-auto px-5 py-5 sm:px-7">
          {#if cart.lines.length > 0}
            <div class="space-y-3">
              {#each cart.lines as line (line.key)}
                <article class="rounded-2xl border border-black/10 bg-white/35 p-4">
                  <div class="flex items-start justify-between gap-4">
                    <div class="min-w-0">
                      <h3 class="font-semibold">{line.name}</h3>
                      {#if line.selections.length > 0}
                        <ul class="mt-1 space-y-0.5 text-sm text-[var(--mr-muted)]">
                          {#each line.selections as selection}
                            <li>{selection.name}</li>
                          {/each}
                        </ul>
                      {/if}
                    </div>
                    <strong class="shrink-0">₹{line.unitPrice * line.quantity}</strong>
                  </div>
                  <div class="mt-4 flex items-center justify-between">
                    <div class="flex items-center rounded-full border border-black/10 bg-[var(--mr-paper)] p-1">
                      <button
                        type="button"
                        onclick={() => cart.setQuantity(line.key, line.quantity - 1)}
                        class="grid size-9 place-items-center rounded-full hover:bg-black/5"
                        aria-label={`Decrease ${line.name} quantity`}
                      >
                        <Minus size={16} />
                      </button>
                      <span class="w-8 text-center text-sm font-semibold" aria-label={`${line.quantity} in cart`}>
                        {line.quantity}
                      </span>
                      <button
                        type="button"
                        onclick={() => cart.setQuantity(line.key, line.quantity + 1)}
                        class="grid size-9 place-items-center rounded-full hover:bg-black/5"
                        aria-label={`Increase ${line.name} quantity`}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                    <button
                      type="button"
                      onclick={() => removeLine(line.key)}
                      class="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm text-[var(--mr-muted)] hover:bg-black/5 hover:text-red-800"
                      aria-label={`Remove ${line.name} from cart`}
                    >
                      <Trash2 size={15} /> Remove
                    </button>
                  </div>
                </article>
              {/each}
            </div>
          {:else}
            <div class="flex h-full min-h-72 flex-col items-center justify-center text-center">
              <span class="grid size-14 place-items-center rounded-full bg-[var(--mr-olive)]/10 text-[var(--mr-olive-dark)]">
                <ShoppingBag size={24} />
              </span>
              <h3 class="mr-display mt-4 text-2xl">Your cart is empty</h3>
              <p class="mt-1 max-w-64 text-sm text-[var(--mr-muted)]">Close this drawer and add something worth staying for.</p>
            </div>
          {/if}
        </div>

        {#if cart.lines.length > 0}
          <div class="border-t border-black/10 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 sm:px-7">
            <div class="mb-4 flex items-center justify-between">
              <span class="text-sm text-[var(--mr-muted)]">Subtotal · {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'}</span>
              <strong class="text-xl">₹{cart.subtotal}</strong>
            </div>
            <button
              type="button"
              onclick={() => (step = 'checkout')}
              class="flex w-full items-center justify-between rounded-full bg-[var(--mr-olive-dark)] px-6 py-4 font-medium text-white"
            >
              <span>Continue to checkout</span>
              <span>→</span>
            </button>
          </div>
        {/if}
      {:else if checkoutComplete}
        <div class="flex flex-1 flex-col items-center justify-center px-7 text-center">
          <span class="grid size-16 place-items-center rounded-full bg-[var(--mr-olive)] text-white">
            <Check size={28} strokeWidth={2.5} />
          </span>
          <p class="mt-5 text-sm uppercase tracking-[0.18em] text-[var(--mr-olive)]">Ready for the next step</p>
          <h3 class="mr-display mt-2 text-3xl">Thanks, {$formData.name}.</h3>
          <p class="mt-3 max-w-sm text-[var(--mr-muted)]">
            Your details and {cart.itemCount}-item cart are valid. Final order submission and payment are intentionally not connected yet.
          </p>
          <button
            type="button"
            onclick={() => (checkoutComplete = false)}
            class="mt-6 rounded-full border border-black/15 px-5 py-2.5 text-sm font-medium"
          >
            Edit details
          </button>
        </div>
      {:else}
        <form method="POST" use:enhance class="flex flex-1 flex-col overflow-hidden">
          <div class="flex-1 space-y-5 overflow-y-auto px-5 py-5 sm:px-7">
            <Field form={checkoutForm} name="name">
              <div class="space-y-2">
                <Control>
                  {#snippet children({ props })}
                    <Label class="text-sm font-medium">Customer name</Label>
                    <input
                      {...props}
                      bind:value={$formData.name}
                      autocomplete="name"
                      placeholder="Your name"
                      class="w-full rounded-2xl border border-black/15 bg-white/45 px-4 py-3.5 outline-none focus:border-[var(--mr-olive)] focus:ring-2 focus:ring-[var(--mr-olive)]/15"
                    />
                  {/snippet}
                </Control>
                <FieldErrors class="text-sm text-red-700" />
              </div>
            </Field>

            <Field form={checkoutForm} name="phone">
              <div class="space-y-2">
                <Control>
                  {#snippet children({ props })}
                    <Label class="text-sm font-medium">Mobile number</Label>
                    <input
                      {...props}
                      bind:value={$formData.phone}
                      type="tel"
                      inputmode="numeric"
                      autocomplete="tel"
                      maxlength="10"
                      placeholder="10-digit mobile number"
                      class="w-full rounded-2xl border border-black/15 bg-white/45 px-4 py-3.5 outline-none focus:border-[var(--mr-olive)] focus:ring-2 focus:ring-[var(--mr-olive)]/15"
                    />
                  {/snippet}
                </Control>
                <FieldErrors class="text-sm text-red-700" />
              </div>
            </Field>

            <Fieldset form={checkoutForm} name="paymentMethod" class="space-y-3">
              <Legend class="text-sm font-medium">Payment method</Legend>
              <div class="grid gap-2">
                <Control>
                  {#snippet children({ props })}
                    <label class="flex cursor-pointer items-center gap-3 rounded-2xl border border-black/10 bg-white/35 p-4">
                      <input {...props} type="radio" bind:group={$formData.paymentMethod} value="counter" />
                      <span>
                        <span class="block font-medium">Pay at counter</span>
                        <span class="block text-sm text-[var(--mr-muted)]">Default · pay when you collect</span>
                      </span>
                    </label>
                  {/snippet}
                </Control>
                <Control>
                  {#snippet children({ props })}
                    <label class="flex cursor-pointer items-center gap-3 rounded-2xl border border-black/10 bg-white/35 p-4">
                      <input {...props} type="radio" bind:group={$formData.paymentMethod} value="online" />
                      <span>
                        <span class="block font-medium">Online payment</span>
                        <span class="block text-sm text-[var(--mr-muted)]">Payment connection coming next</span>
                      </span>
                    </label>
                  {/snippet}
                </Control>
              </div>
              <FieldErrors class="text-sm text-red-700" />
            </Fieldset>

            <p class="rounded-2xl border border-[var(--mr-olive)]/20 bg-[var(--mr-olive)]/8 p-4 text-sm leading-6 text-[var(--mr-muted)]">
              This step validates your details only. It will not create an order or charge you.
            </p>
          </div>

          <div class="border-t border-black/10 px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 sm:px-7">
            <div class="mb-4 flex items-center justify-between text-sm">
              <span class="text-[var(--mr-muted)]">Order subtotal</span>
              <strong>₹{cart.subtotal}</strong>
            </div>
            <button
              type="submit"
              class="w-full rounded-full bg-[var(--mr-olive-dark)] px-6 py-4 font-medium text-white"
            >
              Validate checkout details
            </button>
          </div>
        </form>
      {/if}
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
