"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSession, getMyShop, getUser, hashPassword } from "../auth";
import { isCategory, MAX_IMAGES } from "../config";
import { one, q, tx } from "../db";
import { parsePounds } from "../money";
import { markDispatched } from "../orders";
import { paymentsMode } from "../payments";
import * as stripe from "../payments/stripe";
import { isUuid } from "../queries";
import { langOf, origin, slugify, str } from "./util";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// "myshop.co.uk" -> "https://myshop.co.uk". Anything that is not a web
// address (for example a javascript: link) is dropped.
function cleanWebsite(input: string): string | null {
  if (!input) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(input) ? input : `https://${input}`);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (!url.hostname.includes(".")) return null;
    return url.toString().slice(0, 200);
  } catch {
    return null;
  }
}

// Seller application. A visitor without an account creates one in the same form.
export async function applyToSell(fd: FormData) {
  const lang = langOf(fd);
  const back = (code: string) => redirect(`/${lang}/sell?error=${code}`);

  let user = await getUser();
  if (user && (await getMyShop(user.id))) redirect(`/${lang}/dashboard`);

  const shopName = str(fd, "shop_name");
  const sellerType = str(fd, "seller_type") === "business" ? "business" : "sole_trader";
  const f = {
    legal: str(fd, "legal_name"),
    company: str(fd, "company_number"),
    phone: str(fd, "phone"),
    address: str(fd, "address"),
    city: str(fd, "city"),
    postcode: str(fd, "postcode").toUpperCase(),
    instagram: str(fd, "instagram").replace(/^@/, ""),
    vat: str(fd, "vat_number").slice(0, 20),
    website: cleanWebsite(str(fd, "website")),
    bioTr: str(fd, "bio_tr").slice(0, 600),
    bioEn: str(fd, "bio_en").slice(0, 600),
  };
  const slug = slugify(shopName);
  if (slug.length < 3 || !f.legal || !f.phone || !f.address || !f.city || !f.postcode) back("fields");
  if (await one("select 1 from shops where slug = $1", [slug])) back("name");

  if (!user) {
    const email = str(fd, "email").toLowerCase();
    const name = str(fd, "name");
    const password = String(fd.get("password") ?? "");
    if (!EMAIL.test(email) || name.length < 2 || password.length < 8) back("fields");
    if (await one("select 1 from users where email = $1", [email])) back("exists");
    const created = await one<{ id: string }>(
      "insert into users (email, password_hash, name) values ($1, $2, $3) returning id",
      [email, await hashPassword(password), name],
    );
    await createSession(created!.id);
    user = { id: created!.id, email, name, role: "buyer" };
  }

  await tx(async (c) => {
    await c.query(
      `insert into shops (owner_id, slug, name, seller_type, legal_name, company_number, phone,
                          address, city, postcode, instagram, bio_tr, bio_en, vat_number, website)
       values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
      [user!.id, slug, shopName, sellerType, f.legal, f.company || null, f.phone, f.address,
       f.city, f.postcode, f.instagram || null, f.bioTr, f.bioEn, f.vat || null, f.website],
    );
    await c.query("update users set role = 'seller' where id = $1 and role = 'buyer'", [user!.id]);
  });
  redirect(`/${lang}/dashboard`);
}

async function myShop(lang: string) {
  const user = await getUser();
  if (!user) redirect(`/${lang}/login`);
  const shop = await getMyShop(user.id);
  if (!shop) redirect(`/${lang}/sell`);
  return { user, shop };
}

// The seller edits everything shown on their public shop page. Legal name,
// company number and address are fixed here: they were checked at approval.
export async function updateShop(fd: FormData) {
  const lang = langOf(fd);
  const { shop } = await myShop(lang);
  const email = str(fd, "public_email").toLowerCase();

  await tx(async (c) => {
    await c.query(
      `update shops set bio_tr=$2, bio_en=$3, instagram=$4, phone=$5, website=$6, public_email=$7,
              show_phone=$8, delivery_tr=$9, delivery_en=$10, returns_tr=$11, returns_en=$12
        where id = $1`,
      [
        shop.id,
        str(fd, "bio_tr").slice(0, 600),
        str(fd, "bio_en").slice(0, 600),
        str(fd, "instagram").replace(/^@/, "") || null,
        str(fd, "phone") || shop.phone,
        cleanWebsite(str(fd, "website")),
        EMAIL.test(email) ? email : null,
        fd.get("show_phone") === "on",
        str(fd, "delivery_tr").slice(0, 800),
        str(fd, "delivery_en").slice(0, 800),
        str(fd, "returns_tr").slice(0, 800),
        str(fd, "returns_en").slice(0, 800),
      ],
    );
    // A new logo or cover replaces the old one.
    for (const kind of ["logo", "cover"] as const) {
      const file = fd.get(kind);
      if (!(file instanceof File) || file.size === 0 || file.size > 1_500_000) continue;
      const data = Buffer.from(await file.arrayBuffer());
      const type = sniffImage(data);
      if (!type) continue;
      const old = kind === "logo" ? shop.logo_id : shop.cover_id;
      const ins = await c.query(
        "insert into shop_images (shop_id, content_type, data) values ($1, $2, $3) returning id",
        [shop.id, type, data],
      );
      await c.query(`update shops set ${kind}_id = $2 where id = $1`, [shop.id, ins.rows[0].id]);
      if (old) await c.query("delete from shop_images where id = $1", [old]);
    }
  });
  revalidatePath(`/${lang}/s/${shop.slug}`);
  redirect(`/${lang}/dashboard/shop?saved=1`);
}

// Accept only real JPEG, PNG or WebP files, whatever the browser claims.
function sniffImage(buf: Buffer): string | null {
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf.length > 8 && buf.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return "image/png";
  if (buf.length > 12 && buf.toString("ascii", 0, 4) === "RIFF" && buf.toString("ascii", 8, 12) === "WEBP")
    return "image/webp";
  return null;
}

export async function saveListing(fd: FormData) {
  const lang = langOf(fd);
  const { shop } = await myShop(lang);
  const id = str(fd, "id");
  const editing = isUuid(id);
  const back = () =>
    redirect(`/${lang}/dashboard/listings/${editing ? id : "new"}?error=fields`);

  const titleTr = str(fd, "title_tr").slice(0, 120);
  const titleEn = str(fd, "title_en").slice(0, 120);
  const price = parsePounds(str(fd, "price"));
  const postage = parsePounds(str(fd, "postage") || "0");
  const stock = parseInt(str(fd, "stock") || "1", 10);
  const category = str(fd, "category");
  if ((!titleTr && !titleEn) || !price || postage === null || !isCategory(category)) back();
  if (!Number.isInteger(stock) || stock < 0 || stock > 9999) back();

  const images: { type: string; data: Buffer }[] = [];
  for (const file of fd.getAll("photos")) {
    if (!(file instanceof File) || file.size === 0) continue;
    if (file.size > 1_500_000 || images.length >= MAX_IMAGES) continue;
    const data = Buffer.from(await file.arrayBuffer());
    const type = sniffImage(data);
    if (type) images.push({ type, data });
  }
  if (!editing && images.length === 0) back();

  const values = [
    category, titleTr, titleEn, str(fd, "description_tr").slice(0, 4000),
    str(fd, "description_en").slice(0, 4000), price, postage, stock, fd.get("instalments") === "on",
  ];

  await tx(async (c) => {
    let listingId = id;
    if (editing) {
      const res = await c.query(
        `update listings set category=$3, title_tr=$4, title_en=$5, description_tr=$6,
                description_en=$7, price_pence=$8, postage_pence=$9, stock=$10, instalments=$11
          where id = $1 and shop_id = $2 and status <> 'removed'`,
        [id, shop.id, ...values],
      );
      if (res.rowCount === 0) return;
    } else {
      const res = await c.query(
        `insert into listings (shop_id, category, title_tr, title_en, description_tr, description_en,
                               price_pence, postage_pence, stock, instalments)
         values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) returning id`,
        [shop.id, ...values],
      );
      listingId = res.rows[0].id;
    }
    if (images.length > 0) {
      await c.query("delete from listing_images where listing_id = $1", [listingId]);
      for (const [i, img] of images.entries()) {
        await c.query(
          "insert into listing_images (listing_id, position, content_type, data) values ($1,$2,$3,$4)",
          [listingId, i, img.type, img.data],
        );
      }
    }
  });
  redirect(`/${lang}/dashboard/listings`);
}

export async function setListingStatus(fd: FormData) {
  const lang = langOf(fd);
  const { shop } = await myShop(lang);
  const id = str(fd, "id");
  const to = str(fd, "to");
  if (isUuid(id) && ["active", "paused", "removed"].includes(to)) {
    await q("update listings set status = $3 where id = $1 and shop_id = $2 and status <> 'removed'", [
      id,
      shop.id,
      to,
    ]);
  }
  redirect(`/${lang}/dashboard/listings`);
}

export async function dispatchOrder(fd: FormData) {
  const lang = langOf(fd);
  const { shop } = await myShop(lang);
  const orderId = str(fd, "order");
  const tracking = str(fd, "tracking").slice(0, 60);
  const carrier = str(fd, "carrier").slice(0, 40);
  if (!isUuid(orderId)) redirect(`/${lang}/dashboard/orders`);

  // Instalment orders must be tracked: the lender's dispute cover depends on it.
  const order = await one<{ payment_method: string }>(
    "select payment_method from orders where id = $1 and shop_id = $2",
    [orderId, shop.id],
  );
  if (order?.payment_method === "klarna" && !tracking) {
    redirect(`/${lang}/dashboard/orders?error=tracking#o-${orderId}`);
  }
  await markDispatched({ orderId, shopId: shop.id, carrier, tracking });
  redirect(`/${lang}/dashboard/orders`);
}

export async function replyToReview(fd: FormData) {
  const lang = langOf(fd);
  const { shop } = await myShop(lang);
  const id = str(fd, "id");
  const reply = str(fd, "reply").slice(0, 600);
  if (isUuid(id) && reply) {
    await q(
      "update reviews set reply = $3, replied_at = now() where id = $1 and shop_id = $2 and reply is null",
      [id, shop.id, reply],
    );
    revalidatePath(`/${lang}/s/${shop.slug}`);
  }
  redirect(`/${lang}/dashboard/reviews`);
}

// Live mode only: sends the seller to Stripe to add ID and bank details.
export async function connectPayouts(fd: FormData) {
  const lang = langOf(fd);
  const { user, shop } = await myShop(lang);
  if (paymentsMode() !== "stripe") redirect(`/${lang}/dashboard/shop`);
  let account = shop.stripe_account_id;
  if (!account) {
    account = await stripe.createSellerAccount({
      email: user.email,
      business: shop.seller_type === "business",
    });
    await q("update shops set stripe_account_id = $2 where id = $1", [shop.id, account]);
  }
  redirect(await stripe.sellerOnboardingLink(account, `${await origin()}/${lang}/dashboard/shop`));
}
