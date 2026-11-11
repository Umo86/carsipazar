"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";

// Swaps /tr/... for /en/... (and back) and remembers the choice.
function Inner({ lang, label }: { lang: "tr" | "en"; label: string }) {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const other = lang === "tr" ? "en" : "tr";
  const href = pathname.replace(/^\/(tr|en)(?=\/|$)/, `/${other}`) + (search ? `?${search}` : "");
  return (
    <a
      href={href}
      hrefLang={other}
      lang={other}
      onClick={() => {
        document.cookie = `cp_lang=${other}; path=/; max-age=31536000; samesite=lax`;
      }}
      className="underline-offset-4 hover:underline hover:text-cobalt"
    >
      {label}
    </a>
  );
}

export default function LangSwitch(props: { lang: "tr" | "en"; label: string }) {
  return (
    <Suspense fallback={<span>{props.label}</span>}>
      <Inner {...props} />
    </Suspense>
  );
}
