"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Icon, { type IconName } from "./Icon";

export type PanelItem = { href: string; label: string; icon: IconName; badge?: number };
export type PanelGroup = { label?: string; items: PanelItem[] };

// The layout shared by the admin panel and the seller panel (and later the buyer area).
// Wide screens: a sticky sidebar on the left, the page on the right. Narrow screens: the
// same <nav> becomes one row of links that scrolls sideways. It is real links in both, so
// nothing depends on JavaScript to be reachable.
export default function PanelShell({
  title,
  subtitle,
  groups,
  notice,
  children,
}: {
  title: string;
  subtitle?: string;
  groups: PanelGroup[];
  notice?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const all = groups.flatMap((g) => g.items);
  // The first link is the panel's home and matches exactly; the others match their sub-pages too.
  const isActive = (it: PanelItem) =>
    it.href === all[0].href ? pathname === it.href : pathname === it.href || pathname.startsWith(`${it.href}/`);
  const current = all.find(isActive);

  return (
    <div className="wrap grid grid-cols-[minmax(0,1fr)] gap-6 pt-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12 lg:pt-10">
      <aside className="min-w-0 lg:sticky lg:top-24 lg:self-start">
        <p className="font-display text-2xl leading-tight break-words">{title}</p>
        {subtitle && <p className="mt-1 text-sm text-soft">{subtitle}</p>}
        <nav
          aria-label={title}
          className="no-scrollbar -mx-5 mt-4 flex gap-1 overflow-x-auto px-5 pb-1 md:-mx-10 md:px-10 lg:mx-0 lg:mt-6 lg:flex-col lg:gap-0 lg:overflow-visible lg:px-0 lg:pb-0"
        >
          {groups.map((g, gi) => (
            <div key={gi} className="flex shrink-0 gap-1 lg:mb-5 lg:flex-col lg:gap-0.5">
              {g.label && (
                <p className="mb-1 hidden px-3 text-sm text-soft lg:block">{g.label}</p>
              )}
              {g.items.map((it) => {
                const active = it === current;
                return (
                  <Link
                    key={it.href}
                    href={it.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-2.5 rounded-full px-3.5 py-2 text-[0.9375rem] whitespace-nowrap transition-colors lg:rounded-xl ${
                      active ? "bg-ink font-medium text-paper" : "text-ink hover:bg-mist"
                    }`}
                  >
                    <Icon name={it.icon} size={18} className="shrink-0" />
                    <span className="flex-1">{it.label}</span>
                    {it.badge ? (
                      <span
                        className={`min-w-5 rounded-full px-1.5 text-center text-xs tabular-nums ${
                          active ? "bg-paper text-ink" : "bg-tulip text-paper"
                        }`}
                      >
                        {it.badge}
                      </span>
                    ) : null}
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
      <div className="min-w-0 pb-4">
        {notice}
        {current && <h1 className="text-4xl md:text-5xl">{current.label}</h1>}
        <div className={current ? "pt-8" : ""}>{children}</div>
      </div>
    </div>
  );
}
