# EthioAgri

A working demo marketplace connecting Ethiopian farmers and customers.

**Live app:** https://d3fau1t11.github.io/EthioAgri/

## Run locally

Use Node.js 22 or newer and npm.

```sh
cd project
npm ci
npm run dev
```

Open http://localhost:3000. No database or environment variables are needed.

## Demo accounts

| Role | Email | Password |
| --- | --- | --- |
| Farmer | farmer@ethioagri.demo | Demo123! |
| Customer | customer@ethioagri.demo | Demo123! |

Use the one-click demo buttons on the sign-in page, or enter the credentials manually. The farmer can also sign in with `+251900000001`; the customer with `+251900000002`.

- **Farmer:** open My Farm, add/edit/remove your listings, manage stock, and view sample orders and sales.
- **Customer:** search and filter six sample products, view farmer profiles, add items to a basket, and place a demo order.
- **Try the complete flow:** sign in as the farmer and add a product. Sign out, sign in as the customer, and order it. Switch back to the farmer to see the order and updated stock.
- **Signup:** create additional local farmer or customer accounts using sample details and a demo-only password. Duplicate emails and phone numbers are rejected.
- **Reset:** on the sign-in page, expand “Reset demo data” to restore the sample products and accounts.

Sessions, accounts, listings, stock, and order history persist in browser storage. Each browser has its own demo data. The basket is temporary for the current visit. Clearing browser storage or resetting the demo removes local changes.

## GitHub Pages

This is a static Next.js export. GitHub Pages cannot run a server or database, so account access and orders are browser-based demonstrations. They are not production authentication, payment processing, messaging, or delivery services. No money changes hands and no messages are sent. Use sample details only.

`.github/workflows/pages.yml` installs dependencies, checks lint and types, builds the static site, tests desktop and mobile demo flows, and deploys `project/out` on pushes to `main`. Pull requests run checks without deploying. GitHub Pages must be configured to use **GitHub Actions** in the repository’s Settings → Pages. Future pushes to `main` redeploy automatically.

The workflow derives the asset and navigation base path from the repository name. The current public URL is https://d3fau1t11.github.io/EthioAgri/.

To preview the same build locally:

```sh
cd project
npm run build:pages
npm run start:pages
```

Open http://localhost:3000/EthioAgri/. For a site served at the root instead, run `npm run build` followed by `npm start`.

## Verification

```sh
cd project
npm run lint
npm run typecheck
npm run build:pages
npx playwright install chromium
npm run test:e2e
```

The browser tests cover invalid passwords, demo phone login, session persistence, role restrictions, farmer listing edits and removal, customer ordering, stock limits, sales history, product images, filters, profiles, local registration, duplicates, reset, browser errors, and mobile overflow.

## Stack and routes

Next.js 15, React 18, TypeScript, Tailwind CSS, and Radix UI. All sample images are local assets.

| Route | Purpose |
| --- | --- |
| `/` | Landing page |
| `/login/` | Sign-in and one-click demo accounts |
| `/signup/` | Local demo registration |
| `/products/` | Marketplace, basket, and customer order history |
| `/farmers/` | Farmer directory and profiles |
| `/dashboard/` | Farmer listings, inventory, orders, and sales |

A real multi-user marketplace would require a separately hosted backend, database, server-enforced authentication, and payment/order integration.
