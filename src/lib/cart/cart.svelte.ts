import type { ComboSelection, CustomerMenuItem } from '$lib/domain/menu';

export type CartLine = {
  key: string;
  menuItemId: string;
  name: string;
  itemType: 'regular' | 'combo';
  unitPrice: number;
  quantity: number;
  selections: ComboSelection[];
};

const STORAGE_KEY = 'mystic-roast-cart-v1';

function signature(menuItemId: string, selections: ComboSelection[]) {
  return `${menuItemId}:${[...selections]
    .sort((a, b) => a.selection_group.localeCompare(b.selection_group))
    .map((s) => `${s.selection_group}=${s.menu_item_id}`)
    .join('|')}`;
}

function normalizeSelections(selections: ComboSelection[]) {
  return [...selections].sort((a, b) => {
    const groupComparison = a.selection_group.localeCompare(b.selection_group);
    return groupComparison || a.menu_item_id.localeCompare(b.menu_item_id);
  });
}

class CartStore {
  lines = $state<CartLine[]>([]);
  hydrated = $state(false);

  get itemCount() {
    return this.lines.reduce((sum, line) => sum + line.quantity, 0);
  }

  get subtotal() {
    return this.lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  }

  hydrate() {
    if (this.hydrated || typeof localStorage === 'undefined') return;
    try {
      this.lines = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    } catch {
      this.lines = [];
    }
    this.hydrated = true;
  }

  persist() {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.lines));
    }
  }

  add(item: CustomerMenuItem, selections: ComboSelection[] = []) {
    const normalizedSelections = normalizeSelections(selections);
    const key = signature(item.id, normalizedSelections);
    const existing = this.lines.find((line) => line.key === key);
    if (existing) existing.quantity += 1;
    else {
      this.lines.push({
        key,
        menuItemId: item.id,
        name: item.name,
        itemType: item.item_type,
        unitPrice: item.selling_price,
        quantity: 1,
        selections: normalizedSelections
      });
    }
    this.persist();
  }

  setQuantity(key: string, quantity: number) {
    if (quantity <= 0) this.lines = this.lines.filter((line) => line.key !== key);
    else {
      const line = this.lines.find((item) => item.key === key);
      if (line) line.quantity = quantity;
    }
    this.persist();
  }

  clear() {
    this.lines = [];
    this.persist();
  }

  toOrderPayload() {
    return this.lines.map((line) => ({
      menu_item_id: line.menuItemId,
      quantity: line.quantity,
      selections: line.selections.map((selection) => ({
        selection_group: selection.selection_group,
        menu_item_id: selection.menu_item_id
      }))
    }));
  }
}

export const cart = new CartStore();
