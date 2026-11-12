import { NextResponse, type NextRequest } from "next/server";

const LOCALES = ["tr", "en"];

// Every page lives under /tr or /en. A visit without a language is sent to
// the one the browser asks for, Turkish by default. /s/shop-name is the
// short link sellers put in their Instagram profile.
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (LOCALES.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`))) return;

  const saved = request.cookies.get("cp_lang")?.value;
  const accept = request.headers.get("accept-language") ?? "";
  const first = accept.split(",")[0]?.trim().toLowerCase() ?? "";
  const lang = saved && LOCALES.includes(saved) ? saved : first.startsWith("en") ? "en" : "tr";

  const url = request.nextUrl.clone();
  url.pathname = `/${lang}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/((?!api|img|media|_next/static|_next/image|favicon.ico|.*\\.[a-z0-9]+$).*)"],
};
