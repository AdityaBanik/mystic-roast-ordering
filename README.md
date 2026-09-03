# Mystic Roast Ordering

Customer-facing QR ordering web app for Mystic Roast.

Built with SvelteKit, TypeScript, Tailwind CSS, shadcn-svelte, Formsnap, SvelteKit Superforms, Zod, and Supabase.

## Architecture

- Public menu and cart UI run in the browser.
- Cart state is local and persists in `localStorage`.
- Supabase service-role credentials are server-only.
- Browser code never writes directly to operational Supabase tables.
- Checkout is validated on the SvelteKit server before any order is created.
- Menu prices, combo membership, and final transaction values are authoritative on the server/database.

## Local development

1. Copy `.env.example` to `.env`.
2. Fill in the server-only Supabase values.
3. Install dependencies with `pnpm install`.
4. Run `pnpm dev`.

> Never expose `SUPABASE_SERVICE_ROLE_KEY` through a `PUBLIC_` environment variable.
