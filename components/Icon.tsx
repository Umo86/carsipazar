// A small set of line icons, drawn on a 24-unit grid.
const PATHS = {
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm9 16-4.2-4.2",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7.5 8a7.5 7.5 0 0 1 15 0",
  bag: "M6 8h12l1 12H5L6 8zm3 0V7a3 3 0 0 1 6 0v1",
  shop: "M4 10v10h16V10M3 10l1.6-6h14.8L21 10a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0zm7 10v-5h4v5",
  left: "M14.5 5.5 8 12l6.5 6.5",
  right: "M9.5 5.5 16 12l-6.5 6.5",
  shield: "M12 3 5 6v5.5c0 4.3 2.9 7.6 7 9.5 4.1-1.9 7-5.2 7-9.5V6l-7-3zm-3 9 2.2 2.2L15.5 10",
  split: "M4 6h16v12H4V6zm0 4h16M9.3 10v8m5.4-8v8",
  check: "M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zM8.3 12.2l2.5 2.5 5-5.2",
  heart: "M12 20.5S3.5 15.4 3.5 9.3A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 8.5 1.7c0 6.1-8.5 11.2-8.5 11.2z",
  pause: "M9 5v14m6-14v14",
  play: "M8 5.5v13l10.5-6.5L8 5.5z",
  logout: "M10 4H5v16h5m4-12 4 4-4 4m4-4H9",
} as const;

export default function Icon({
  name,
  size = 20,
  className,
}: {
  name: keyof typeof PATHS;
  size?: number;
  className?: string;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
