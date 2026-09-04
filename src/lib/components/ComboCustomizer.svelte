<script lang="ts">
  import { Dialog } from 'bits-ui';
  import { Check, X } from 'lucide-svelte';
  import type { ComboComponent, ComboSelection, CustomerMenuItem } from '$lib/domain/menu';

  let {
    item,
    open = $bindable(false),
    onAdd
  }: {
    item: CustomerMenuItem | null;
    open: boolean;
    onAdd: (item: CustomerMenuItem, selections: ComboSelection[]) => void;
  } = $props();

  type SelectionGroup = {
    name: string;
    options: ComboComponent[];
  };

  let selected = $state<Record<string, string>>({});
  let showErrors = $state(false);

  const groups = $derived.by(() => {
    const grouped = new Map<string, ComboComponent[]>();
    for (const component of item?.components ?? []) {
      const options = grouped.get(component.selection_group) ?? [];
      options.push(component);
      grouped.set(component.selection_group, options);
    }
    return [...grouped.entries()].map(([name, options]): SelectionGroup => ({ name, options }));
  });

  const allGroupsSelected = $derived(
    groups.length > 0 && groups.every((group) => Boolean(selected[group.name]))
  );

  $effect(() => {
    if (!open || !item) return;
    const initial: Record<string, string> = {};
    for (const group of groups) {
      const defaultOption = group.options.find((option) => option.is_default);
      if (defaultOption) initial[group.name] = defaultOption.menu_item.id;
      else if (group.options.length === 1) initial[group.name] = group.options[0].menu_item.id;
    }
    selected = initial;
    showErrors = false;
  });

  function groupLabel(value: string) {
    return value.replace(/[_-]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function addCombo() {
    if (!item || !allGroupsSelected) {
      showErrors = true;
      return;
    }

    const selections = groups.map((group) => {
      const option = group.options.find((candidate) => candidate.menu_item.id === selected[group.name]);
      return {
        selection_group: group.name,
        menu_item_id: selected[group.name],
        name: option?.menu_item.name ?? 'Selected option'
      };
    });

    onAdd(item, selections);
    open = false;
  }
</script>

<Dialog.Root bind:open>
  <Dialog.Portal>
    <Dialog.Overlay class="fixed inset-0 z-50 bg-black/45 backdrop-blur-[2px]" />
    <Dialog.Content
      class="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[90dvh] w-full max-w-2xl flex-col rounded-t-[2rem] border border-black/10 bg-[var(--mr-paper)] shadow-2xl outline-none"
    >
      <div class="mx-auto mt-3 h-1.5 w-12 rounded-full bg-black/15"></div>
      <div class="flex items-start justify-between gap-4 border-b border-black/10 px-5 pb-5 pt-4 sm:px-7">
        <div>
          <p class="text-xs uppercase tracking-[0.22em] text-[var(--mr-olive)]">Build your combo</p>
          <Dialog.Title class="mr-display mt-1 text-3xl">{item?.name ?? 'Customise'}</Dialog.Title>
          <Dialog.Description class="mt-1 text-sm text-[var(--mr-muted)]">
            Choose one option from every group.
          </Dialog.Description>
        </div>
        <Dialog.Close
          class="grid size-10 shrink-0 place-items-center rounded-full border border-black/10 bg-white/40"
          aria-label="Close combo customisation"
        >
          <X size={19} />
        </Dialog.Close>
      </div>

      <div class="overflow-y-auto px-5 py-5 sm:px-7">
        {#if groups.length > 0}
          <div class="space-y-7">
            {#each groups as group}
              <fieldset>
                <legend class="mb-3 flex w-full items-center justify-between gap-3">
                  <span class="font-semibold">{groupLabel(group.name)}</span>
                  <span class="text-xs uppercase tracking-wider text-[var(--mr-muted)]">Required · choose 1</span>
                </legend>
                <div class="grid gap-2">
                  {#each group.options as option}
                    <label
                      class="flex cursor-pointer items-center gap-3 rounded-2xl border p-4 transition-colors {selected[group.name] === option.menu_item.id
                        ? 'border-[var(--mr-olive)] bg-[var(--mr-olive)]/10'
                        : 'border-black/10 bg-white/35 hover:border-black/25'}"
                    >
                      <input
                        class="sr-only"
                        type="radio"
                        name={`combo-${item?.id}-${group.name}`}
                        value={option.menu_item.id}
                        bind:group={selected[group.name]}
                      />
                      <span
                        class="grid size-5 shrink-0 place-items-center rounded-full border {selected[group.name] === option.menu_item.id
                          ? 'border-[var(--mr-olive-dark)] bg-[var(--mr-olive-dark)] text-white'
                          : 'border-black/25'}"
                      >
                        {#if selected[group.name] === option.menu_item.id}<Check size={13} strokeWidth={3} />{/if}
                      </span>
                      <span class="flex-1">
                        <span class="font-medium">{option.menu_item.name}</span>
                        {#if option.quantity > 1}
                          <span class="ml-1 text-sm text-[var(--mr-muted)]">× {option.quantity}</span>
                        {/if}
                      </span>
                    </label>
                  {/each}
                </div>
                {#if showErrors && !selected[group.name]}
                  <p class="mt-2 text-sm text-red-700" role="alert">Choose an option for {groupLabel(group.name)}.</p>
                {/if}
              </fieldset>
            {/each}
          </div>
        {:else}
          <p class="rounded-2xl border border-amber-900/15 bg-amber-100/50 p-4 text-sm text-amber-950">
            This combo has no selection groups available right now.
          </p>
        {/if}
      </div>

      <div class="border-t border-black/10 bg-[var(--mr-paper)] px-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-4 sm:px-7">
        <button
          type="button"
          onclick={addCombo}
          disabled={groups.length === 0}
          class="flex w-full items-center justify-between rounded-full bg-[var(--mr-olive-dark)] px-6 py-4 font-medium text-white disabled:cursor-not-allowed disabled:opacity-45"
        >
          <span>Add combo</span>
          <span>₹{item?.selling_price ?? 0}</span>
        </button>
      </div>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
