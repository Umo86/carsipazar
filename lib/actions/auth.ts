"use server";

import { redirect } from "next/navigation";
import { one } from "../db";
import { createSession, destroySession, hashPassword, verifyPassword } from "../auth";
import { langOf, safeNext, str } from "./util";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function login(fd: FormData) {
  const lang = langOf(fd);
  const email = str(fd, "email").toLowerCase();
  const password = String(fd.get("password") ?? "");
  const next = safeNext(str(fd, "next"), `/${lang}`);

  const user = await one<{ id: string; password_hash: string }>(
    "select id, password_hash from users where email = $1",
    [email],
  );
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    redirect(`/${lang}/login?error=invalid&next=${encodeURIComponent(next)}`);
  }
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

  if (!EMAIL.test(email) || name.length < 2 || password.length < 8) back("fields");
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
