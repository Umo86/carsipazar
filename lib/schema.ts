// Database schema. Run through /api/setup; every statement is safe to repeat.
export const SCHEMA_SQL = `
-- CarsiPazar schema. Every statement is safe to run more than once.

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  name text not null,
  role text not null default 'buyer' check (role in ('buyer', 'seller', 'admin')),
  created_at timestamptz not null default now()
);

create table if not exists sessions (
  token_hash text primary key,
  user_id uuid not null references users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists shops (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null unique references users(id) on delete cascade,
  slug text not null unique,
  name text not null,
  seller_type text not null check (seller_type in ('business', 'sole_trader')),
  legal_name text not null,
  company_number text,
  phone text not null,
  address text not null,
  city text not null,
  postcode text not null,
  instagram text,
  bio_tr text not null default '',
  bio_en text not null default '',
  status text not null default 'pending' check (status in ('pending', 'approved', 'suspended')),
  founding boolean not null default false,
  stripe_account_id text,
  created_at timestamptz not null default now()
);

-- Company details shown on the public shop page.
alter table shops add column if not exists vat_number text;
alter table shops add column if not exists website text;
alter table shops add column if not exists public_email text;
alter table shops add column if not exists show_phone boolean not null default true;
alter table shops add column if not exists delivery_tr text not null default '';
alter table shops add column if not exists delivery_en text not null default '';
alter table shops add column if not exists returns_tr text not null default '';
alter table shops add column if not exists returns_en text not null default '';
alter table shops add column if not exists logo_id uuid;
alter table shops add column if not exists cover_id uuid;
-- Opening hours and instructions shown to buyers who collect from the shop.
alter table shops add column if not exists collection_note_tr text not null default '';
alter table shops add column if not exists collection_note_en text not null default '';

create table if not exists shop_images (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops(id) on delete cascade,
  content_type text not null,
  data bytea not null,
  created_at timestamptz not null default now()
);

-- A sample image may live on another server; real uploads are stored here.
alter table shop_images add column if not exists url text;
-- The Pixabay page a sample file came from, kept as the credit.
alter table shop_images add column if not exists source text;

create table if not exists listings (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops(id) on delete cascade,
  category text not null,
  title_tr text not null default '',
  title_en text not null default '',
  description_tr text not null default '',
  description_en text not null default '',
  price_pence integer not null check (price_pence > 0),
  postage_pence integer not null default 0 check (postage_pence >= 0),
  stock integer not null default 1 check (stock >= 0),
  instalments boolean not null default false,
  status text not null default 'active' check (status in ('active', 'paused', 'removed')),
  featured boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists listings_shop_idx on listings(shop_id);
create index if not exists listings_category_idx on listings(category);

-- Who delivers: "seller" (postage typed by the seller) or "platform" (CarsiPazar delivery,
-- postage_pence is then set by the system from the parcel size's price).
alter table listings add column if not exists delivery_method text not null default 'seller'
  check (delivery_method in ('seller', 'platform'));
alter table listings add column if not exists parcel_size text
  check (parcel_size in ('small', 'medium', 'large'));
alter table listings drop constraint if exists listings_platform_needs_size;
alter table listings add constraint listings_platform_needs_size
  check (delivery_method <> 'platform' or parcel_size is not null);

-- Collection from the shop: "no" (delivery only), "optional" (buyer chooses) or "only" (no delivery).
alter table listings add column if not exists collection text not null default 'no';
alter table listings drop constraint if exists listings_collection_valid;
alter table listings add constraint listings_collection_valid check (collection in ('no', 'optional', 'only'));

create table if not exists listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  position integer not null default 0,
  content_type text not null,
  data bytea not null,
  created_at timestamptz not null default now()
);
create index if not exists listing_images_listing_idx on listing_images(listing_id, position);
alter table listing_images add column if not exists url text;
alter table listing_images add column if not exists source text;

-- Site-wide media (the home page video and its poster), served by /media/[key].
create table if not exists site_media (
  key text primary key,
  content_type text not null,
  data bytea not null,
  source text,
  updated_at timestamptz not null default now()
);

create sequence if not exists order_number_seq start 1001;

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  number integer not null default nextval('order_number_seq'),
  buyer_id uuid not null references users(id),
  shop_id uuid not null references shops(id),
  listing_id uuid references listings(id) on delete set null,
  title text not null,
  quantity integer not null check (quantity > 0),
  item_pence integer not null,
  postage_pence integer not null,
  total_pence integer not null,
  payment_method text not null check (payment_method in ('card', 'klarna')),
  commission_pence integer not null,
  payment_cost_pence integer not null,
  seller_payout_pence integer not null,
  status text not null default 'pending'
    check (status in ('pending', 'paid', 'dispatched', 'delivered', 'released', 'refunded', 'cancelled')),
  ship_name text not null,
  ship_line1 text not null,
  ship_line2 text not null default '',
  ship_city text not null,
  ship_postcode text not null,
  ship_phone text not null,
  tracking_carrier text,
  tracking_number text,
  provider text not null default 'demo',
  provider_ref text,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  dispatched_at timestamptz,
  delivered_at timestamptz,
  released_at timestamptz,
  refunded_at timestamptz
);
-- Delivery, fixed at purchase. delivery_cost_pence is the part of the total the platform keeps
-- to pay for delivery (0 when the seller delivers); the seller's payout excludes it.
alter table orders add column if not exists delivery_method text not null default 'seller'
  check (delivery_method in ('seller', 'platform'));
alter table orders add column if not exists parcel_size text
  check (parcel_size in ('small', 'medium', 'large'));
alter table orders add column if not exists delivery_cost_pence integer not null default 0
  check (delivery_cost_pence >= 0);
alter table orders add column if not exists label_ref text;
alter table orders add column if not exists label_created_at timestamptz;
alter table orders drop constraint if exists orders_delivery_consistent;
alter table orders add constraint orders_delivery_consistent
  check (delivery_cost_pence <= postage_pence and (delivery_method <> 'platform' or parcel_size is not null));
-- Collection from the shop. The status names are reused: for a collection order 'dispatched'
-- means ready for collection and 'delivered' means collected. collection_code is the 6-digit
-- handover code the buyer gives the seller; it is never sent to a seller or admin page.
alter table orders add column if not exists fulfilment text not null default 'delivery';
alter table orders drop constraint if exists orders_fulfilment_valid;
alter table orders add column if not exists collection_code text;
alter table orders add column if not exists collection_attempts integer not null default 0;
alter table orders add constraint orders_fulfilment_valid check (
  fulfilment in ('delivery', 'collection') and collection_attempts >= 0
  and (fulfilment = 'delivery' or (coalesce(collection_code ~ '^[0-9]{6}$', false) and postage_pence = 0 and delivery_cost_pence = 0))
);
create index if not exists orders_buyer_idx on orders(buyer_id);
create index if not exists orders_shop_idx on orders(shop_id);

create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null unique references orders(id) on delete cascade,
  shop_id uuid not null references shops(id) on delete cascade,
  buyer_id uuid not null references users(id),
  rating integer not null check (rating between 1 and 5),
  comment text not null default '',
  reply text,
  replied_at timestamptz,
  status text not null default 'published' check (status in ('published', 'hidden')),
  created_at timestamptz not null default now()
);
create index if not exists reviews_shop_idx on reviews(shop_id);

-- Saved delivery address, filled in from the account page or at checkout.
alter table users add column if not exists ship_line1 text not null default '';
alter table users add column if not exists ship_line2 text not null default '';
alter table users add column if not exists ship_city text not null default '';
alter table users add column if not exists ship_postcode text not null default '';
alter table users add column if not exists ship_phone text not null default '';

create table if not exists favourites (
  user_id uuid not null references users(id) on delete cascade,
  listing_id uuid not null references listings(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

-- One-time links the admin creates so a customer can set a new password.
create table if not exists password_resets (
  token_hash text primary key,
  user_id uuid not null references users(id) on delete cascade,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

-- Failed logins, counted to slow down password guessing.
create table if not exists login_attempts (
  email text not null,
  created_at timestamptz not null default now()
);
create index if not exists login_attempts_email_idx on login_attempts(email, created_at);

-- Paid promotion a seller books for one of their items.
create table if not exists promotions (
  id uuid primary key default gen_random_uuid(),
  shop_id uuid not null references shops(id) on delete cascade,
  listing_id uuid not null references listings(id) on delete cascade,
  kind text not null check (kind in ('featured', 'spotlight', 'category_top')),
  category text not null,
  starts_on date not null,
  ends_on date not null,
  weeks integer not null check (weeks between 1 and 4),
  price_pence integer not null check (price_pence >= 0),
  status text not null default 'pending' check (status in ('pending', 'booked', 'cancelled')),
  provider text not null default 'demo',
  provider_ref text,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  cancelled_at timestamptz
);
create index if not exists promotions_dates_idx on promotions(kind, starts_on, ends_on);
create index if not exists promotions_shop_idx on promotions(shop_id);

create table if not exists settings (
  key text primary key,
  value integer not null
);

-- The operator's own legal identity, shown on the legal pages. Text values,
-- filled in by the admin; an empty or missing row means "not provided yet".
create table if not exists site_details (
  key text primary key,
  value text not null
);
-- Blocked accounts: no login, sessions removed. Set and cleared from the admin Users page.
alter table users add column if not exists blocked_at timestamptz;
alter table users add column if not exists blocked_reason text;

-- Reports from the public (no account needed) about an item, a review or a shop.
create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  kind text not null check (kind in ('listing', 'review', 'shop')),
  target_id uuid not null,
  reporter_user_id uuid references users(id) on delete set null,
  reporter_email text,
  reason text not null check (reason in ('illegal', 'counterfeit', 'unsafe', 'misleading', 'offensive', 'fake_review', 'other')),
  details text not null default '',
  status text not null default 'open' check (status in ('open', 'actioned', 'dismissed')),
  resolution_note text,
  resolved_by uuid,
  ip_hash text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);
create index if not exists reports_status_idx on reports(status, created_at);
create index if not exists reports_target_idx on reports(kind, target_id);
create index if not exists reports_ip_idx on reports(ip_hash, created_at);

-- Everything an admin changes, newest first on the Activity page.
create table if not exists admin_log (
  id uuid primary key default gen_random_uuid(),
  admin_user_id uuid references users(id) on delete set null,
  action text not null,
  target_kind text not null default '',
  target_id text not null default '',
  detail text not null default '',
  created_at timestamptz not null default now()
);
create index if not exists admin_log_created_idx on admin_log(created_at desc);
`;
