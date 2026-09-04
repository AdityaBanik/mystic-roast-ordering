import type { PageServerLoad } from './$types';
import { getServerSupabase } from '$lib/server/supabase';
import type { CustomerMenuItem } from '$lib/domain/menu';
import { superValidate } from 'sveltekit-superforms';
import { zod4 } from 'sveltekit-superforms/adapters';
import { checkoutSchema } from '$lib/forms/checkout';

export const load: PageServerLoad = async () => {
  const checkoutForm = await superValidate(zod4(checkoutSchema));
  const supabase = getServerSupabase();
  const { data, error } = await supabase.rpc('get_customer_menu');

  if (error) {
    console.error('Failed to load customer menu', error);
    return { menu: [] as CustomerMenuItem[], checkoutForm };
  }

  const menu = Array.isArray(data) ? data : data?.menu ?? [];
  return { menu: menu as CustomerMenuItem[], checkoutForm };
};
