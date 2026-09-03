import type { PageServerLoad } from './$types';
import { getServerSupabase } from '$lib/server/supabase';
import type { CustomerMenuItem } from '$lib/domain/menu';

export const load: PageServerLoad = async () => {
  const supabase = getServerSupabase();
  const { data, error } = await supabase.rpc('get_customer_menu');

  if (error) {
    console.error('Failed to load customer menu', error);
    return { menu: [] as CustomerMenuItem[] };
  }

  const menu = Array.isArray(data) ? data : data?.menu ?? [];
  return { menu: menu as CustomerMenuItem[] };
};
