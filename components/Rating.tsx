// Five small stars; `value` may be fractional (4.6 fills four and a bit).
export default function Rating({ value, size = 14 }: { value: number; size?: number }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  const star = "M10 1.5l2.6 5.4 5.9.8-4.3 4.1 1 5.9L10 14.9 4.8 17.7l1-5.9L1.5 7.7l5.9-.8z";
  const row = (fill: string) => (
    <svg width={size * 5} height={size} viewBox="0 0 100 20" aria-hidden="true">
      {[0, 20, 40, 60, 80].map((x) => (
        <path key={x} d={star} transform={`translate(${x} 0)`} fill={fill} />
      ))}
    </svg>
  );
  return (
    <span className="relative inline-block align-middle" role="img" aria-label={`${value.toFixed(1)} / 5`}>
      {row("#d9d3c5")}
      <span className="absolute inset-0 overflow-hidden" style={{ width: `${pct}%` }}>
        {row("#96763f")}
      </span>
    </span>
  );
}
