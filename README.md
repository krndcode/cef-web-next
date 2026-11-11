This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Store setup

The bookstore uses PostgreSQL for customer accounts, inventory, orders, and
payments. Configure the following server-side environment variables in
`.env.local` for development or in the hosting provider for production:

- `DATABASE_URL` — PostgreSQL connection string. Keep it private.
- `APP_URL` — canonical origin used for Paystack callbacks (for example,
  `http://localhost:3000` in development).
- `ADMIN_EMAIL` — email address of the account to promote to store admin.
- `PAYSTACK_SECRET_KEY` — Paystack test or live secret key. Never expose it to
  browser code.
- `NEON_AUTH_BASE_URL` — Managed Neon Auth URL for the selected branch.
- `NEON_AUTH_COOKIE_SECRET` — private random secret used to protect Next.js
  auth session cookies.
- `NEON_AUTH_JWKS_URL` — branch JWKS endpoint, available for server-side JWT
  verification when needed.

Create `cef-web-next/.env.local` from `.env.example` and replace its placeholder
values with your private PostgreSQL and Paystack configuration. Do not commit
`.env.local` or paste credentials into chat. For a local PostgreSQL instance,
the connection string generally has this form:

```text
postgresql://<user>:<password>@localhost:5432/<database>
```

For a hosted database, use the provider's connection URL and required SSL
options. For Neon, create a project and database in the Neon console, then
copy its PostgreSQL connection string into `DATABASE_URL`. Prefer the pooled
connection string for the Next.js application, and keep the direct connection
in `DATABASE_URL_UNPOOLED` for migrations if your provider supplies both. Use
the connection strings exactly as generated, including their SSL query
parameters. Keep the branch's Managed Auth URL and JWKS URL in the matching
environment variables. Generate `NEON_AUTH_COOKIE_SECRET` privately (for
example, with `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"`).
Then run these commands from `cef-web-next`:

```bash
npm install
npm run db:migrate
npm run dev
```

The migration and admin promotion scripts read `cef-web-next/.env.local`
automatically.

Create and verify a Neon Auth account at `/store` using the email configured as
`ADMIN_EMAIL`, stop the development server, then promote that active account:

```bash
npm run store:promote-admin
```

Sign back in and open `/admin/store` to add product images, set actual stock,
manage orders, and enable or suspend customer accounts. The three sample
products are seeded with zero stock until an admin enters the available
inventory. Product images should be placed under `public/` and entered as
local paths such as `/products/book-cover.jpg`.

Configure the Paystack webhook URL as
`https://<your-domain>/api/payments/paystack`. Test the full checkout using
Paystack test credentials before switching to live credentials. Customers
place orders first; an admin confirms the delivery charge, after which the
customer can pay online. Neon Auth manages sign-in sessions and email verification. Existing store
password hashes cannot be transferred, so customers need to create and verify a
Neon Auth account; verified accounts are linked to existing store profiles by
email to preserve order history and admin roles.

## Production media library

The `/production` page is backed by PostgreSQL tables described in
`prisma/schema.prisma`. The app uses its existing `pg` connection pool and SQL
migration runner. Run `npm run db:migrate` to create the production media
tables and seed the five broadcast categories. Public broadcasts can be
filtered with `GET /api/videos?categorySlug=<slug>`.

Administrators can manage videos, feature a single broadcast, and publish or
unpublish content at `/admin/production` (also linked from `/admin/store`).
Video URLs are validated as YouTube links, and thumbnails are generated from
the video ID. Optional study notes can be linked with an HTTPS URL or a path
under `public/`.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
