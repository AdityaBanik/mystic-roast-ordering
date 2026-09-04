<script lang="ts">
  import { untrack } from 'svelte';
  import ArrowLeft from '@lucide/svelte/icons/arrow-left';
  import Check from '@lucide/svelte/icons/check';
  import Minus from '@lucide/svelte/icons/minus';
  import Plus from '@lucide/svelte/icons/plus';
  import ShoppingBag from '@lucide/svelte/icons/shopping-bag';
  import Trash2 from '@lucide/svelte/icons/trash-2';
  import X from '@lucide/svelte/icons/x';
  import { Control, Field, FieldErrors, Fieldset, Legend } from 'formsnap';
  import { superForm, type SuperValidated } from 'sveltekit-superforms';
  import { zod4Client } from 'sveltekit-superforms/adapters';
  import { cart } from '$lib/cart/cart.svelte';
  import { checkoutSchema, type CheckoutData } from '$lib/forms/checkout';
  import { Button } from '$lib/components/ui/button';
  import { Input } from '$lib/components/ui/input';
  import { Label } from '$lib/components/ui/label';
  import * as RadioGroup from '$lib/components/ui/radio-group';
  import { Separator } from '$lib/components/ui/separator';
  import * as Sheet from '$lib/components/ui/sheet';

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

<Sheet.Root {open} onOpenChange={handleOpenChange}>
  <Sheet.Content
    side="bottom"
    showCloseButton={false}
    class="mr-sheet mx-auto max-h-[92dvh] w-full max-w-2xl rounded-t-[1.75rem] border-x border-t border-foreground/10 bg-popover p-0"
  >
    <div class="mx-auto mt-2.5 h-1 w-10 shrink-0 rounded-full bg-foreground/15 sm:hidden"></div>

    <Sheet.Header class="flex-row items-start justify-between gap-4 border-b border-foreground/10 px-5 pb-4 pt-5 text-left sm:px-7 sm:pt-7">
      <div class="flex min-w-0 items-start gap-2.5">
        {#if step === 'checkout' && !checkoutComplete}
          <Button
            variant="outline"
            size="icon-sm"
            onclick={() => (step = 'cart')}
            class="mt-0.5 shrink-0 border-primary/20 text-primary"
            aria-label="Back to cart"
          >
            <ArrowLeft />
          </Button>
        {/if}
        <div class="min-w-0">
          <p class="mr-kicker mb-1">{step === 'cart' ? 'Your order' : 'Checkout'}</p>
          <Sheet.Title class="font-heading text-[1.85rem] font-semibold normal-case leading-none tracking-[-0.035em]">
            {#if step === 'cart'}
              Your cart
            {:else if checkoutComplete}
              Details confirmed
            {:else}
              Almost there
            {/if}
          </Sheet.Title>
          <Sheet.Description class="mt-1.5">
            {#if step === 'cart'}
              {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'} ready to order.
            {:else if checkoutComplete}
              Your checkout details are valid. No order has been submitted.
            {:else}
              Tell us who to call when your order is ready.
            {/if}
          </Sheet.Description>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        onclick={closeSheet}
        class="shrink-0 bg-secondary/70 text-muted-foreground hover:text-foreground"
        aria-label="Close cart"
      >
        <X />
      </Button>
    </Sheet.Header>

    {#if step === 'cart'}
      <div class="flex-1 overflow-y-auto px-5 sm:px-7">
        {#if cart.lines.length > 0}
          <div class="divide-y divide-foreground/10">
            {#each cart.lines as line (line.key)}
              <article class="py-5">
                <div class="flex items-start justify-between gap-5">
                  <div class="min-w-0">
                    <p class="mb-1 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-primary/70">
                      {line.itemType === 'combo' ? 'Custom combo' : 'From the menu'}
                    </p>
                    <h3 class="font-heading text-xl font-semibold tracking-[-0.025em]">{line.name}</h3>
                    {#if line.selections.length > 0}
                      <p class="mt-1.5 text-sm leading-5 text-muted-foreground">
                        {line.selections.map((selection) => selection.name).join(' · ')}
                      </p>
                    {/if}
                  </div>
                  <strong class="shrink-0 font-heading text-lg">₹{line.unitPrice * line.quantity}</strong>
                </div>

                <div class="mt-4 flex items-center justify-between gap-3">
                  <div class="flex items-center rounded-full border border-primary/15 bg-secondary/55 p-0.5">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onclick={() => cart.setQuantity(line.key, line.quantity - 1)}
                      class="size-8 text-primary hover:bg-background"
                      aria-label={`Decrease ${line.name} quantity`}
                    >
                      <Minus />
                    </Button>
                    <span class="w-8 text-center text-sm font-semibold" aria-label={`${line.quantity} in cart`}>
                      {line.quantity}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onclick={() => cart.setQuantity(line.key, line.quantity + 1)}
                      class="size-8 text-primary hover:bg-background"
                      aria-label={`Increase ${line.name} quantity`}
                    >
                      <Plus />
                    </Button>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onclick={() => removeLine(line.key)}
                    class="px-2 text-muted-foreground hover:bg-destructive/8 hover:text-destructive"
                    aria-label={`Remove ${line.name} from cart`}
                  >
                    <Trash2 /> Remove
                  </Button>
                </div>
              </article>
            {/each}
          </div>
        {:else}
          <div class="flex h-full min-h-64 flex-col items-center justify-center text-center">
            <span class="grid size-14 place-items-center rounded-full bg-primary/8 text-primary">
              <ShoppingBag class="size-5" />
            </span>
            <h3 class="mt-4 font-heading text-2xl">Your cart is empty</h3>
            <p class="mt-1 max-w-64 text-sm leading-6 text-muted-foreground">Close this sheet and add something worth staying for.</p>
          </div>
        {/if}
      </div>

      {#if cart.lines.length > 0}
        <Sheet.Footer class="border-t border-foreground/10 bg-background/75 px-5 pb-[max(1.1rem,env(safe-area-inset-bottom))] pt-3.5 backdrop-blur-xl sm:px-7">
          <div class="flex w-full items-center justify-between">
            <span class="text-sm text-muted-foreground">Subtotal · {cart.itemCount} {cart.itemCount === 1 ? 'item' : 'items'}</span>
            <strong class="font-heading text-xl">₹{cart.subtotal}</strong>
          </div>
          <Button size="lg" onclick={() => (step = 'checkout')} class="mt-3 w-full justify-between px-5">
            <span>Continue to checkout</span>
            <span aria-hidden="true">→</span>
          </Button>
        </Sheet.Footer>
      {/if}
    {:else if checkoutComplete}
      <div class="flex flex-1 flex-col items-center justify-center px-7 text-center">
        <span class="grid size-16 place-items-center rounded-full bg-primary text-primary-foreground">
          <Check class="size-7" strokeWidth={2.5} />
        </span>
        <p class="mr-kicker mt-5">Ready for the next step</p>
        <h3 class="mt-2 font-heading text-3xl tracking-[-0.035em]">Thanks, {$formData.name}.</h3>
        <p class="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
          Your details and {cart.itemCount}-item cart are valid. Final order submission and payment are intentionally not connected yet.
        </p>
        <Button variant="outline" onclick={() => (checkoutComplete = false)} class="mt-6 border-primary/20 text-primary">
          Edit details
        </Button>
      </div>
    {:else}
      <form method="POST" use:enhance class="flex flex-1 flex-col overflow-hidden">
        <div class="flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-7">
          <Field form={checkoutForm} name="name">
            <div class="space-y-1.5">
              <Control>
                {#snippet children({ props })}
                  <Label for={props.id}>Customer name</Label>
                  <Input
                    {...props}
                    bind:value={$formData.name}
                    autocomplete="name"
                    placeholder="Your name"
                    class="h-11 border-b-primary/25 focus-visible:border-b-primary"
                  />
                {/snippet}
              </Control>
              <FieldErrors class="text-sm text-destructive" />
            </div>
          </Field>

          <Field form={checkoutForm} name="phone">
            <div class="space-y-1.5">
              <Control>
                {#snippet children({ props })}
                  <Label for={props.id}>Mobile number</Label>
                  <Input
                    {...props}
                    bind:value={$formData.phone}
                    type="tel"
                    inputmode="numeric"
                    autocomplete="tel"
                    maxlength={10}
                    placeholder="10-digit mobile number"
                    class="h-11 border-b-primary/25 focus-visible:border-b-primary"
                  />
                {/snippet}
              </Control>
              <FieldErrors class="text-sm text-destructive" />
            </div>
          </Field>

          <Fieldset form={checkoutForm} name="paymentMethod" class="space-y-3">
            <Legend class="text-xs font-semibold uppercase tracking-[0.13em]">Payment method</Legend>
            <RadioGroup.Root name="paymentMethod" bind:value={$formData.paymentMethod} class="gap-2.5">
              <Control id="payment-counter">
                {#snippet children({ props })}
                  <Label
                    for={props.id}
                    class="flex cursor-pointer items-center gap-3 rounded-xl border bg-background/40 p-3.5 normal-case tracking-normal {$formData.paymentMethod === 'counter'
                      ? 'border-primary/35 bg-primary/7'
                      : 'border-foreground/10'}"
                  >
                    <RadioGroup.Item {...props} value="counter" class="border-primary/45 data-checked:border-primary" />
                    <span>
                      <span class="block text-sm font-semibold">Pay at counter</span>
                      <span class="block text-xs font-normal text-muted-foreground">Default · pay when you collect</span>
                    </span>
                  </Label>
                {/snippet}
              </Control>
              <Control id="payment-online">
                {#snippet children({ props })}
                  <Label
                    for={props.id}
                    class="flex cursor-pointer items-center gap-3 rounded-xl border bg-background/40 p-3.5 normal-case tracking-normal {$formData.paymentMethod === 'online'
                      ? 'border-primary/35 bg-primary/7'
                      : 'border-foreground/10'}"
                  >
                    <RadioGroup.Item {...props} value="online" class="border-primary/45 data-checked:border-primary" />
                    <span>
                      <span class="block text-sm font-semibold">Online payment</span>
                      <span class="block text-xs font-normal text-muted-foreground">Payment connection coming next</span>
                    </span>
                  </Label>
                {/snippet}
              </Control>
            </RadioGroup.Root>
            <FieldErrors class="text-sm text-destructive" />
          </Fieldset>

          <Separator class="bg-foreground/10" />
          <p class="text-xs leading-5 text-muted-foreground">
            This step validates your details only. It will not create an order or charge you.
          </p>
        </div>

        <Sheet.Footer class="border-t border-foreground/10 bg-background/75 px-5 pb-[max(1.1rem,env(safe-area-inset-bottom))] pt-3.5 backdrop-blur-xl sm:px-7">
          <div class="flex w-full items-center justify-between text-sm">
            <span class="text-muted-foreground">Order subtotal</span>
            <strong class="font-heading text-lg">₹{cart.subtotal}</strong>
          </div>
          <Button type="submit" size="lg" class="mt-3 w-full">Validate checkout details</Button>
        </Sheet.Footer>
      </form>
    {/if}
  </Sheet.Content>
</Sheet.Root>
