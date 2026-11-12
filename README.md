# CarsiPazar

A bilingual (Turkish/English) marketplace where verified Turkish-community traders
sell furniture, clothing and jewellery, buyers pay by card, and the payment is
held until the item arrives. Where the seller allows it, a buyer can instead choose
to pay in three instalments at checkout. Instalments are a payment choice at checkout
only: the site does not advertise them anywhere else.

This is the first, deliberately small version: website only, traders only,
buyer-to-seller reviews. Payments run in **demo mode** until Stripe keys are added.

## What is in it

| Area | What it does |
| --- | --- |
| Storefront | Home, three category "streets" (furniture, clothing, jewellery), item pages, in `/tr` and `/en` |
| Search | `/search`: by item or shop name, ignoring Turkish letters ("gumus" finds "gümüş"), with a category filter |
| Shop page | `/s/shop-name`: one per company, with logo, cover, about text, company details (legal name, company and VAT numbers, address, phone, email, website, Instagram), delivery and returns information, items and reviews. Also the seller's link for Instagram and WhatsApp |
| Shops directory | `/shops`: every approved company |
| Checkout | One item per order, card (or 3 instalments where the seller allows it), delivery address |
| Protected payment | Money is held; released to the seller 2 days after delivery |
| Reviews | One per completed order; seller can reply; admin can hide |
| Seller panel | Apply, add items with photos, choose who delivers each item, print delivery labels, dispatch orders, see payouts |
| Promotion | Sellers book paid promotion for an item from the seller panel: Featured on the home page, Piece of the week, or Top of its street. One to four weeks from a chosen date, a fixed number of slots per package, full refund if cancelled before the start. Promoted items carry a "Sponsored" label |
| Customer account | `/account`: name, saved delivery address (pre-fills checkout), change password. `/favourites`: saved items |
| Admin | Approve sellers, moderate items and reviews, release or refund, set fees and promotion prices, see and cancel promotions, list customers and create one-time password reset links |
| Sign-in safety | Passwords are hashed; eight wrong passwords lock that email for 15 minutes |

## Fees (changeable in Admin > Fees)

- 9% commission when the buyer pays by card, 13% when they pay in instalments.
- Founding sellers: 2% + 20p on card, 5% + 35p on instalments.
- Instalments are offered on orders from £30 to £2,000 where the seller allows them.
  They appear only as a choice on the checkout page, plus the seller's listing form and
  the admin fee settings. No page before checkout, image or caption mentions them.
- CarsiPazar delivery prices (what the buyer pays): £3.95 small, £6.95 medium, £14.95 large; items above £75 cannot use it (all placeholders, see Delivery below).
- The whole fee model is one function: `computeFees` in `lib/money.ts`.

## Delivery

Each item has one of two delivery methods, chosen by the seller on the item form:

- **I deliver it myself** (the default): the seller sets the postage, posts the parcel
  and types in the carrier and tracking number.
- **CarsiPazar delivery**: the seller picks a parcel size (small: up to 2 kg and
  45 x 35 x 16 cm; medium: up to 10 kg and 60 x 45 x 45 cm; large: up to 25 kg and
  120 x 60 x 60 cm; defined in `PARCEL_SIZES` in `lib/config.ts`). The postage is
  not typed: it is the current delivery price for that size. Bigger things (sofas,
  tables) use seller delivery. Items priced above `delivery_max_item_price` cannot
  use it (0 means no limit).

**Money.** On a CarsiPazar delivery order the buyer pays item + delivery price as
usual, but the delivery price belongs to the platform and is stored on the order as
`delivery_cost_pence`. Commission is charged on the item amount only (total less
delivery), the seller's payout is item less commission, and the payment provider's
cost is still computed on the full total. Delivery money is tracked separately and is
not profit: the admin overview shows it as "Delivery money collected" (paid, dispatched,
delivered and released orders). Refunds return the full total. See `computeFees` in
`lib/money.ts`. The delivery method, parcel size and delivery cost are fixed on the
order at purchase.

**Prices.** Changing a delivery price in Admin > Fees moves every CarsiPazar delivery
item of that size to the new postage in the same save; existing orders keep their price.

**Labels.** For a paid CarsiPazar delivery order the seller presses "Create delivery
label" (a second press creates nothing new), prints it from
`/<lang>/dashboard/orders/<id>/label` (A6, only the owning seller can open it) and
presses "I have handed it over", which marks the order dispatched. Tracking is filled
in from the label. Such an order cannot be dispatched before its label exists.

**Test mode.** There is no courier account yet, so `deliveryMode()` in
`lib/delivery/index.ts` always returns "demo": the site makes the label itself
(carrier "CarsiPazar Delivery (test)", tracking "CP" and 12 digits, reference
`TEST-<order number>-<4 hex>`) and prints a "TEST LABEL: not valid for posting" banner.

**Plugging in a real provider.** Everything goes through `createLabel(order)` in
`lib/delivery/`, which returns `{ carrier, trackingNumber, labelRef }`. Implement it
for the provider (and make `deliveryMode()` return "live" when its credentials are set);
the order, label page and dispatch code need no change. `createLabel` runs inside the
database transaction that stores its result, so it must not use the database itself.

New settings (Admin > Fees): `delivery_small_price`, `delivery_medium_price`,
`delivery_large_price` (what the buyer pays) and `delivery_max_item_price`.

## Run it locally

```bash
npm install
npm run db      # terminal 1: local Postgres-compatible database on port 5433
npm run dev     # terminal 2: the site on http://localhost:3000
```

Copy `.env.example` to `.env.local` first. Then open
`http://localhost:3000/api/setup?token=<SETUP_TOKEN>` once to create the tables,
the admin login and four sample shops.

## Sample photos and video

The sample photos come from Pixabay and Unsplash (both free licences; paid
Unsplash+ images are not used). The home page video comes from Pixabay.
Pixabay does not allow its files to be hot-linked, so the site downloads each
one once and stores the bytes in its own server (the database), for Unsplash
photos too. Visitors never load anything from Pixabay or Unsplash.

- `lib/sample-media-data.ts` lists which file each item uses (the file on
  `cdn.pixabay.com` or `images.unsplash.com` and its page, kept as the credit).
  An empty address means "no photo chosen" and the drawn pattern stays.
- A new database is seeded with drawn patterns. Then `/api/setup` downloads
  the photos and swaps them in. The video and its poster go in the
  `site_media` table and are served from `/media/hero-video` and
  `/media/hero-poster` (with byte ranges, which Safari needs for video).
- Running `/api/setup` again on an existing site is safe. It downloads only
  what is new or changed in the data file, so changing an address and running
  setup upgrades the site. A photo uploaded by a seller is never replaced.
- Setup downloads four files at a time. If the first three fail it stops and
  says so in the log, because the network is probably unreachable. Fix that
  and run setup again. A failed download leaves the old picture in place.
- Only `https://cdn.pixabay.com/...` and `https://images.unsplash.com/...` addresses are fetched, and only files
  that really are JPEG, PNG, WebP or MP4 (photos up to 4 MB, video up to 14 MB).
- The footer credits Pixabay and Unsplash while payments are in demo mode. Add a proper
  credit page before launching with real sellers.
- Real sellers upload their own photos, which are stored in the database.
  Delete the sample shops in Admin before launch.

## Environment variables

| Name | Purpose |
| --- | --- |
| `DATABASE_URL` | Postgres connection string (Neon pooled URL in production) |
| `SETUP_TOKEN` | Guards `/api/setup`. Remove it once the site is set up |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | The admin login created by setup |
| `DEMO_PASSWORD` | Password for the sample buyer and seller logins |
| `DEMO_IMAGES` | Set to `art` to keep the drawn patterns and skip the sample photo downloads (for working offline) |
| `MEDIA_TEST_ORIGIN` | Testing only, for example `http://127.0.0.1:4010`. Sends the Pixabay and Unsplash downloads to that server instead (same path and query), so tests run without internet. Leave empty in production |
| `STRIPE_SECRET_KEY` | Switches payments from demo to Stripe |
| `STRIPE_WEBHOOK_SECRET` | Verifies Stripe's calls to `/api/stripe/webhook` |

## Where things are

- `lib/config.ts`: site name, languages, categories, default fees.
- `lib/i18n/tr.ts`, `lib/i18n/en.ts`: every piece of interface text.
- `lib/schema.ts`: the database tables.
- `lib/orders.ts`: the order lifecycle (paid, dispatched, delivered, released, refunded).
- `lib/payments/`: demo mode and the Stripe Connect integration.
- `lib/actions/`: everything a form can do, with the permission checks.
- `app/[lang]/`: the pages. `app/globals.css`: the design system.

## Before taking real money

1. **Stripe.** The Stripe code (`lib/payments/stripe.ts`) follows Stripe's documented
   API but has not been run with real keys. Test card and Klarna payments, the
   webhook, seller onboarding, payout and refund in Stripe test mode.
2. **Klarna wording.** The instalment option and its hint on the checkout page are
   placeholder copy. In the UK only Klarna-approved wording may be used; swap that
   text for Stripe's Payment Method Messaging Element. Nothing else on the site
   advertises instalments.
3. **Photos.** Item photos are stored in the database, which suits a pilot of a few
   hundred items. Move them to file storage (for example Vercel Blob) before growing.
4. **Email.** There is no email yet: no order confirmations and no password reset.
5. **Login protection.** Add rate limiting on login and sign-up.
6. **Legal.** Terms, privacy notice, cookie notice, review policy and the HMRC
   seller-reporting fields are not built. See the project plan.
7. **Sample data.** Remove the four sample shops and their sample reviews.
