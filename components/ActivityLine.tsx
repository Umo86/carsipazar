import Link from "next/link";
import type { LogRow } from "@/lib/admin-queries";
import type { Locale } from "@/lib/config";
import { formatDateTime, targetHref } from "@/lib/admin-format";
import type { Dict } from "@/lib/i18n";

// One line of the admin log: who did what to what, and when.
export default function ActivityLine({ row, lang, t }: { row: LogRow; lang: Locale; t: Dict }) {
  const a = t.adminx.ac;
  const href = targetHref(row.target_kind, row.target_id, lang);
  const kind = a.kinds[row.target_kind] ?? row.target_kind;
  return (
    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
      <time dateTime={new Date(row.created_at).toISOString()} className="text-soft tabular-nums">
        {formatDateTime(row.created_at, lang)}
      </time>
      <span className="font-medium">{row.admin_name ?? a.unknownAdmin}</span>
      <span>{a.actions[row.action] ?? row.action}</span>
      {href ? (
        <Link href={href} className="underline underline-offset-4 hover:text-cobalt">{kind}</Link>
      ) : (
        <span className="text-soft">{kind}</span>
      )}
      {row.detail && <span className="basis-full text-sm text-soft break-words">{row.detail}</span>}
    </div>
  );
}
