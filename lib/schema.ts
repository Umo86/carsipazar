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

create table if not exists listing_images (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references listings(id) on delete cascade,
  position integer not null default 0,
  content_type text not null,
  data bytea not null,
  created_at timestamptz not null default now()
);
create index if not exists listing_images_listing_idx on listing_images(listing_id, position);

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

create table if not exists settings (
  key text primary key,
  value integer not null
);
`;
