export type ComboSelection = {
  selection_group: string;
  menu_item_id: string;
  name: string;
};

export type ComboComponent = {
  selection_group: string;
  quantity: number;
  is_option: boolean;
  is_default: boolean;
  menu_item: {
    id: string;
    name: string;
    selling_price: number;
    image_url?: string | null;
  };
};

export type CustomerMenuItem = {
  id: string;
  name: string;
  category: string;
  item_type: 'regular' | 'combo';
  selling_price: number;
  description?: string | null;
  image_url?: string | null;
  featured?: boolean;
  display_order?: number;
  is_vegetarian?: boolean | null;
  components?: ComboComponent[];
};
