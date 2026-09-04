<script lang="ts">
  import Check from '@lucide/svelte/icons/check';
  import Sparkles from '@lucide/svelte/icons/sparkles';
  import type { ComboComponent, ComboSelection, CustomerMenuItem } from '$lib/domain/menu';
  import { Button } from '$lib/components/ui/button';
  import { Label } from '$lib/components/ui/label';
  import * as RadioGroup from '$lib/components/ui/radio-group';
  import { Separator } from '$lib/components/ui/separator';
  import * as Sheet from '$lib/components/ui/sheet';

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

  function optionId(groupName: string, optionId: string) {
    return `combo-${groupName}-${optionId}`.replace(/[^a-zA-Z0-9-_]/g, '-');
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

<Sheet.Root bind:open>
  <Sheet.Content
    side="bottom"
    showCloseButton={true}
    class="mr-sheet mx-auto max-h-[92dvh] w-full max-w-2xl rounded-t-[1.75rem] border-x border-t border-foreground/10 bg-popover p-0"
  >
    <div class="mx-auto mt-2.5 h-1 w-10 rounded-full bg-foreground/15 sm:hidden"></div>
    <Sheet.Header class="border-b border-foreground/10 px-5 pb-4 pt-5 text-left sm:px-7 sm:pt-7">
      <div class="mb-1 flex items-center gap-2 text-primary">
        <Sparkles class="size-3.5" />
        <p class="mr-kicker">Build your combo</p>
      </div>
      <Sheet.Title class="font-heading text-[1.85rem] font-semibold normal-case leading-tight tracking-[-0.035em]">
        {item?.name ?? 'Customise'}
      </Sheet.Title>
      <Sheet.Description>Choose one option from each part of your combo.</Sheet.Description>
    </Sheet.Header>

    <div class="overflow-y-auto px-5 py-2 sm:px-7">
      {#if groups.length > 0}
        {#each groups as group, groupIndex}
          <fieldset class="py-5">
            <legend class="mb-3 flex w-full items-baseline justify-between gap-3">
              <span class="font-heading text-xl font-semibold tracking-[-0.025em]">{groupLabel(group.name)}</span>
              <span class="text-[0.63rem] font-semibold uppercase tracking-[0.15em] text-primary/65">Required · choose 1</span>
            </legend>

            <RadioGroup.Root
              value={selected[group.name] ?? ''}
              onValueChange={(value) => (selected[group.name] = value)}
              class="gap-2.5"
            >
              {#each group.options as option}
                {@const id = optionId(group.name, option.menu_item.id)}
                <Label
                  for={id}
                  class="group flex cursor-pointer items-center gap-3 rounded-xl border px-3.5 py-3 normal-case tracking-normal transition-colors {selected[group.name] === option.menu_item.id
                    ? 'border-primary/45 bg-primary/8'
                    : 'border-foreground/10 bg-background/35 hover:border-primary/25'}"
                >
                  <RadioGroup.Item id={id} value={option.menu_item.id} class="border-primary/45 data-checked:border-primary" />
                  <span class="min-w-0 flex-1 text-sm font-medium">{option.menu_item.name}</span>
                  {#if option.quantity > 1}
                    <span class="text-xs font-normal text-muted-foreground">× {option.quantity}</span>
                  {/if}
                  {#if selected[group.name] === option.menu_item.id}
                    <Check class="size-4 text-primary" />
                  {/if}
                </Label>
              {/each}
            </RadioGroup.Root>

            {#if showErrors && !selected[group.name]}
              <p class="mt-2 text-sm text-destructive" role="alert">Choose an option for {groupLabel(group.name)}.</p>
            {/if}
          </fieldset>
          {#if groupIndex < groups.length - 1}<Separator class="bg-foreground/10" />{/if}
        {/each}
      {:else}
        <p class="my-5 rounded-xl border border-primary/15 bg-primary/6 p-4 text-sm leading-6 text-muted-foreground">
          This combo has no selection groups available right now.
        </p>
      {/if}
    </div>

    <Sheet.Footer class="border-t border-foreground/10 bg-background/75 px-5 pb-[max(1.1rem,env(safe-area-inset-bottom))] pt-3.5 backdrop-blur-xl sm:px-7">
      <Button
        size="lg"
        onclick={addCombo}
        disabled={groups.length === 0}
        class="w-full justify-between px-5"
      >
        <span>Add combo</span>
        <span class="font-heading text-base">₹{item?.selling_price ?? 0}</span>
      </Button>
    </Sheet.Footer>
  </Sheet.Content>
</Sheet.Root>
