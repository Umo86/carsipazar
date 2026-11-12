"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { TurkeyFlag, UKFlag } from "./Flag";

type Lang = "tr" | "en";

const OPTIONS: { code: Lang; name: string; Flag: () => React.JSX.Element }[] = [
  { code: "tr", name: "Türkçe", Flag: TurkeyFlag },
  { code: "en", name: "English", Flag: UKFlag },
];

const ITEM = "inline-flex min-h-8 items-center gap-1.5 rounded-md px-2.5 whitespace-nowrap";

function Group({ children }: { children: React.ReactNode }) {
  return (
    <div role="group" aria-label="Dil / Language" className="flex items-center gap-0.5">
      {children}
    </div>
  );
}

// Swaps /tr/... for /en/... (and back) and remembers the choice.
function Inner({ lang }: { lang: Lang }) {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  return (
    <Group>
      {OPTIONS.map(({ code, name, Flag }) => {
        if (code === lang) {
          return (
            <span key={code} aria-current="true" className={`${ITEM} bg-paper font-medium text-ink shadow-sm`}>
              <Flag />
              <span lang={code}>{name}</span>
            </span>
          );
        }
        const href = pathname.replace(/^\/(tr|en)(?=\/|$)/, `/${code}`) + (search ? `?${search}` : "");
        return (
          <a
            key={code}
            href={href}
            hrefLang={code}
            onClick={() => {
              document.cookie = `cp_lang=${code}; path=/; max-age=31536000; samesite=lax`;
            }}
            className={`${ITEM} hover:text-cobalt`}
          >
            <Flag />
            <span lang={code}>{name}</span>
          </a>
        );
      })}
    </Group>
  );
}

export default function LangSwitch({ lang }: { lang: Lang }) {
  return (
    <Suspense
      fallback={
        <Group>
          {OPTIONS.map(({ code, name, Flag }) => (
            <span key={code} className={`${ITEM} ${code === lang ? "bg-paper font-medium text-ink shadow-sm" : ""}`}>
              <Flag />
              <span lang={code}>{name}</span>
            </span>
          ))}
        </Group>
      }
    >
      <Inner lang={lang} />
    </Suspense>
  );
}
