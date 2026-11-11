"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Tab row shared by the seller panel and the admin panel.
export default function PanelNav({ items }: { items: { href: string; label: string }[] }) {
  const pathname = usePathname();
  const root = items[0].href;
  return (
    <nav className="mt-6 flex gap-6 overflow-x-auto border-b border-line whitespace-nowrap">
      {items.map((it) => {
        const active = it.href === root ? pathname === root : pathname.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            aria-current={active ? "page" : undefined}
            className={`-mb-px border-b-2 pb-3 ${active ? "border-ink font-medium" : "border-transparent text-soft hover:text-ink"}`}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
