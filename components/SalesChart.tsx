import type { DaySales } from "@/lib/admin-queries";
import type { Locale } from "@/lib/config";
import { formatShortDay } from "@/lib/admin-format";
import { fmt, type Dict } from "@/lib/i18n";
import { formatGBP } from "@/lib/money";

// Thirty bars drawn by hand: one colour, a bar (or a thin stub) for every day.
// The data is also in a visually hidden table, so nothing depends on seeing the picture.
export default function SalesChart({ days, lang, t }: { days: DaySales[]; lang: Locale; t: Dict }) {
  const o = t.adminx.ov;
  const W = 720;
  const H = 200;
  const top = 18;
  const bottom = 26;
  const plot = H - top - bottom;
  const max = Math.max(...days.map((d) => d.pence), 1);
  const slot = W / days.length;
  const bar = slot * 0.64;
  const labelAt = new Set([0, 14, days.length - 1]);

  return (
    <section aria-labelledby="chart-h">
      <h2 id="chart-h" className="text-3xl">{o.chartTitle}</h2>
      <div className="mt-4 overflow-x-auto">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          role="img"
          aria-labelledby="chart-title chart-desc"
          className="h-auto w-full min-w-[34rem] max-w-4xl text-cobalt"
        >
          <title id="chart-title">{o.chartTitle}</title>
          <desc id="chart-desc">{o.chartDesc}</desc>
          <text x="0" y="11" fontSize="12" fill="var(--color-soft)">{formatGBP(max)}</text>
          <line x1="0" x2={W} y1={top + plot + 0.5} y2={top + plot + 0.5} stroke="var(--color-line)" />
          {days.map((d, i) => {
            const h = d.pence > 0 ? Math.max(3, Math.round((d.pence / max) * plot)) : 1.5;
            const x = i * slot + (slot - bar) / 2;
            return (
              <g key={d.day}>
                <rect
                  x={x}
                  y={top + plot - h}
                  width={bar}
                  height={h}
                  rx="2"
                  fill={d.pence > 0 ? "currentColor" : "var(--color-line)"}
                  data-day={d.day}
                  data-pence={d.pence}
                >
                  <title>{fmt(o.bar, { day: formatShortDay(d.day, lang), amount: formatGBP(d.pence), n: d.orders })}</title>
                </rect>
                {labelAt.has(i) && (
                  <text
                    x={x + bar / 2}
                    y={H - 7}
                    fontSize="12"
                    textAnchor={i === 0 ? "start" : i === days.length - 1 ? "end" : "middle"}
                    fill="var(--color-soft)"
                  >
                    {formatShortDay(d.day, lang)}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
      <table className="sr-only">
        <caption>{o.chartTable}</caption>
        <thead>
          <tr>
            <th scope="col">{o.day}</th>
            <th scope="col">{o.sales}</th>
            <th scope="col">{o.orders}</th>
          </tr>
        </thead>
        <tbody>
          {days.map((d) => (
            <tr key={d.day}>
              <th scope="row">{formatShortDay(d.day, lang)}</th>
              <td>{formatGBP(d.pence)}</td>
              <td>{d.orders}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
