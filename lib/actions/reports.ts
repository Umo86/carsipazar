"use server";

import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getUser } from "../auth";
import { one, q, tx } from "../db";
import {
  isUuidStrict,
  logAdmin,
  REPORT_KINDS,
  REPORT_REASONS_BY_KIND,
  type ReportKind,
  type ReportReason,
} from "../admin-queries";
import { adminOnly, langOf, str } from "./util";

const REPORT_LIMIT_PER_HOUR = 5;
const REPORT_DETAILS_MAX = 1000;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// The IP address is never stored: only a salted hash, used to count reports per hour.
// Which header to trust matters, because the hash is the rate-limit key and a caller can send any
// header they like: x-real-ip and x-vercel-forwarded-for are set by the platform in front of us
// (they overwrite anything the client sent). In x-forwarded-for each proxy appends the address it
// saw, so the FIRST entry is whatever the client claimed and only the LAST one was added by us.
async function ipHash() {
  const h = await headers();
  const last = h.get("x-forwarded-for")?.split(",").pop();
  const ip = (h.get("x-real-ip") ?? h.get("x-vercel-forwarded-for") ?? last ?? "unknown").trim().slice(0, 100) || "unknown";
  const salt = `report-ip:${process.env.SETUP_TOKEN ?? "carsipazar"}`;
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

// Anyone can report, logged in or not.
export async function submitReport(fd: FormData) {
  const lang = langOf(fd);
  const kind = str(fd, "kind");
  const id = str(fd, "id");
  const here = `/${lang}/report?kind=${encodeURIComponent(kind)}&id=${encodeURIComponent(id)}`;
  if (!(REPORT_KINDS as readonly string[]).includes(kind) || !isUuidStrict(id)) redirect(`/${lang}/report`);
  // The target must exist and be something the public can see.
  const visible = await one(
    kind === "listing"
      ? "select 1 from listings l join shops s on s.id = l.shop_id where l.id = $1 and l.status = 'active' and s.status = 'approved'"
      : kind === "review"
        ? "select 1 from reviews r join shops s on s.id = r.shop_id where r.id = $1 and r.status = 'published' and s.status = 'approved'"
        : "select 1 from shops where id = $1 and status = 'approved'",
    [id],
  );
  if (!visible) redirect(`/${lang}/report`);

  const reason = str(fd, "reason");
  if (!(REPORT_REASONS_BY_KIND[kind as ReportKind] as readonly string[]).includes(reason)) redirect(`${here}&error=reason`);
  const details = str(fd, "details");
  if (details.length > REPORT_DETAILS_MAX) redirect(`${here}&error=long`);
  if (reason === "other" && details.length < 3) redirect(`${here}&error=details`);

  const user = await getUser();
  let email: string | null = null;
  if (!user) {
    const e = str(fd, "email");
    if (e) {
      if (!EMAIL.test(e) || e.length > 200) redirect(`${here}&error=email`);
      email = e;
    }
  }
  const hash = await ipHash();

  // The same person reporting the same thing twice while the first is open: nothing new is created.
  const dup = await one(
    `select 1 from reports where kind = $1 and target_id = $2 and status = 'open'
        and (case when $3::uuid is not null then reporter_user_id = $3 else (reporter_user_id is null and ip_hash = $4) end)`,
    [kind, id, user?.id ?? null, hash],
  );
  if (dup) redirect(`${here}&done=1`);

  // The limit check and the insert are one statement, so two fast requests cannot both slip under it.
  const made = await q(
    `insert into reports (kind, target_id, reporter_user_id, reporter_email, reason, details, ip_hash)
     select $1::text, $2::uuid, $3::uuid, $4::text, $5::text, $6::text, $7::text
      where (select count(*) from reports
              where created_at > now() - interval '1 hour'
                and (case when $3::uuid is not null then reporter_user_id = $3 else ip_hash = $7::text end)) < ${REPORT_LIMIT_PER_HOUR}
     returning id`,
    [kind as ReportKind, id, user?.id ?? null, email, reason as ReportReason, details, hash],
  );
  if (made.length === 0) redirect(`${here}&error=limit`);
  redirect(`${here}&done=1`);
}

// Admin only. A note is required. "remove" hides a reported item, "hide" a reported review,
// "dismiss" closes the report with no change to the content.
export async function resolveReport(fd: FormData) {
  const lang = langOf(fd);
  const me = await adminOnly(lang);
  const id = str(fd, "id");
  const act = str(fd, "act");
  const note = str(fd, "note").slice(0, 1000);
  const list = `/${lang}/admin/reports`;
  if (!isUuidStrict(id) || !["remove", "hide", "dismiss"].includes(act)) redirect(list);
  if (!note) redirect(`${list}?error=note`);

  const out = await tx<"ok" | "gone" | "mismatch">(async (c) => {
    const r = (
      await c.query<{ kind: ReportKind; target_id: string }>(
        "select kind, target_id from reports where id = $1 and status = 'open' for update",
        [id],
      )
    ).rows[0];
    if (!r) return "gone";
    if (act === "dismiss") {
      await c.query(
        "update reports set status = 'dismissed', resolution_note = $2, resolved_by = $3, resolved_at = now() where id = $1",
        [id, note, me.id],
      );
      await logAdmin(me.id, "report.dismiss", r.kind, r.target_id, note, c);
      return "ok";
    }
    if (act === "remove" && r.kind === "listing") {
      await c.query("update listings set status = 'removed' where id = $1", [r.target_id]);
    } else if (act === "hide" && r.kind === "review") {
      await c.query("update reviews set status = 'hidden' where id = $1", [r.target_id]);
    } else {
      return "mismatch"; // that action does not fit this kind of report
    }
    // Every open report about the same thing is settled by the same action.
    await c.query(
      `update reports set status = 'actioned', resolution_note = $4, resolved_by = $3, resolved_at = now()
        where status = 'open' and kind = $1 and target_id = $2`,
      [r.kind, r.target_id, me.id, note],
    );
    await logAdmin(me.id, `report.${act}`, r.kind, r.target_id, note, c);
    return "ok";
  });
  redirect(`${list}?${out === "ok" ? "done=1" : `error=${out}`}`);
}
