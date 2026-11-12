"use server";

import { redirect } from "next/navigation";
import { one, q } from "../db";
import { createSession, destroySession, hashPassword, verifyPassword } from "../auth";
import { langOf, safeNext, str } from "./util";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_ATTEMPTS = 8;

export async function login(fd: FormData) {
  const lang = langOf(fd);
  const email = str(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");
  const next = safeNext(str(fd, "next"), `/${lang}`);

  // Slow down password guessing: after 8 wrong tries, wait 15 minutes.
  const recent = await one<{ n: string }>(
    "select count(*) as n from login_attempts where email = $1 and created_at > now() - interval '15 minutes'",
    [email],
  );
  if (Number(recent?.n ?? 0) >= MAX_ATTEMPTS) {
    redirect(`/${lang}/login?error=locked&next=${encodeURIComponent(next)}`);
  }

  const user = await one<{ id: string; password_hash: string; blocked_at: Date | null }>(
    "select id, password_hash, blocked_at from users where email = $1",
    [email],
  );
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    await q("insert into login_attempts (email) values ($1)", [email.slice(0, 200)]);
    redirect(`/${lang}/login?error=invalid&next=${encodeURIComponent(next)}`);
  }
  await q("delete from login_attempts where email = $1 or created_at < now() - interval '1 day'", [email]);
  // Housekeeping on each successful log-in: expired sessions, and password reset links that have expired or been used.
  await q("delete from sessions where expires_at < now()");
  await q("delete from password_resets where expires_at < now() or used_at is not null");
  // Only someone who knows the password is told the account is blocked.
  if (user.blocked_at) redirect(`/${lang}/login?error=blocked&next=${encodeURIComponent(next)}`);
  await createSession(user.id);
  redirect(next);
}

export async function register(fd: FormData) {
  const lang = langOf(fd);
  const email = str(fd, "email").toLowerCase();
  const name = str(fd, "name");
  const password = String(fd.get("password") ?? "");
  const next = safeNext(str(fd, "next"), `/${lang}`);
  const back = (code: string) =>
    redirect(`/${lang}/register?error=${code}&next=${encodeURIComponent(next)}`);

  if (!EMAIL.test(email) || email.length > 200 || name.length < 2 || name.length > 80) back("fields");
  if (password.length < 8 || password.length > 200) back("fields");
  if (await one("select 1 from users where email = $1", [email])) back("exists");

  const user = await one<{ id: string }>(
    "insert into users (email, password_hash, name) values ($1, $2, $3) returning id",
    [email, await hashPassword(password), name],
  );
  await createSession(user!.id);
  redirect(next);
}

export async function logout(fd: FormData) {
  const lang = langOf(fd);
  await destroySession();
  redirect(`/${lang}`);
}
