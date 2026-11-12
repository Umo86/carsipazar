import { NextResponse } from "next/server";
import { runSetup } from "@/lib/seed";

// Setup downloads the sample photos and video, which can take a while.
export const maxDuration = 60;

// One-off setup: creates tables, the admin login and the demo shops.
// Guarded by SETUP_TOKEN; remove that variable once the site is set up.
export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token");
  const expected = process.env.SETUP_TOKEN;
  if (!expected || token !== expected) {
    return NextResponse.json({ error: "not allowed" }, { status: 403 });
  }
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const demoPassword = process.env.DEMO_PASSWORD;
  if (!adminEmail || !adminPassword || !demoPassword) {
    return NextResponse.json({ error: "ADMIN_EMAIL, ADMIN_PASSWORD and DEMO_PASSWORD must be set" }, { status: 500 });
  }
  const log = await runSetup({ adminEmail, adminPassword, demoPassword });
  return NextResponse.json({ ok: true, log });
}
