# Mystic Roast Ordering — Agent Instructions

## Product
Customer-facing QR ordering web app for Mystic Roast.

## Stack
- SvelteKit + TypeScript
- Tailwind CSS
- shadcn-svelte primitives
- Formsnap + SvelteKit Superforms + Zod for forms
- Supabase, accessed from trusted SvelteKit server code for privileged operations

## Security rules
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to browser code.
- Browser code must not write directly to operational Supabase tables.
- Treat client cart prices as display-only; revalidate menu items, combo selections, prices, and availability on the server before order creation.
- Keep RLS closed unless a public-access requirement is explicitly approved.
- Do not add service-role secrets to git, logs, client bundles, or PUBLIC_ environment variables.

## UX rules
- Preserve Mystic Roast's warm cream / olive editorial visual language.
- Use shadcn-svelte for accessible primitives, not default visual identity.
- Menu browsing and cart editing must work without login or validation.
- Validate customer identity only when placing an order.
- Pay at counter is the default; online payment is optional.
- Combo UI is schema-driven via `selection_group`; do not hard-code specific combo names.

## Cart rules
- Cart is local-first and persists in localStorage.
- Regular items with the same menu item id can merge.
- Combos merge only when their normalized selection signature is identical.
- Submit only ids, quantities, and selections to the server; never trust client prices.
