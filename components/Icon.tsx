// A small set of line icons, drawn on a 24-unit grid.
const PATHS = {
  search: "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zm9 16-4.2-4.2",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zm-7.5 8a7.5 7.5 0 0 1 15 0",
  bag: "M6 8h12l1 12H5L6 8zm3 0V7a3 3 0 0 1 6 0v1",
  shop: "M4 10v10h16V10M3 10l1.6-6h14.8L21 10a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0zm7 10v-5h4v5",
  left: "M14.5 5.5 8 12l6.5 6.5",
  right: "M9.5 5.5 16 12l-6.5 6.5",
  shield: "M12 3 5 6v5.5c0 4.3 2.9 7.6 7 9.5 4.1-1.9 7-5.2 7-9.5V6l-7-3zm-3 9 2.2 2.2L15.5 10",
  check: "M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zM8.3 12.2l2.5 2.5 5-5.2",
  heart: "M12 20.5S3.5 15.4 3.5 9.3A4.3 4.3 0 0 1 12 7.6a4.3 4.3 0 0 1 8.5 1.7c0 6.1-8.5 11.2-8.5 11.2z",
  pause: "M9 5v14m6-14v14",
  play: "M8 5.5v13l10.5-6.5L8 5.5z",
  logout: "M10 4H5v16h5m4-12 4 4-4 4m4-4H9",
  home: "M4 11.5 12 4l8 7.5M6 10v10h12V10M10 20v-5h4v5",
  users: "M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm-6.5 9a6.5 6.5 0 0 1 13 0M16 4.3a3.5 3.5 0 0 1 0 6.4M18 14.2a6.5 6.5 0 0 1 3.5 5.8",
  box: "M3.5 7.5 12 3.5l8.5 4v9l-8.5 4-8.5-4v-9zM3.5 7.5 12 11.5l8.5-4M12 11.5v9",
  star: "m12 3.8 2.5 5.2 5.7.8-4.1 4 1 5.7-5.1-2.7-5.1 2.7 1-5.7-4.1-4 5.7-.8L12 3.8z",
  flag: "M5.5 21V4m0 1h12l-2.5 4 2.5 4h-12",
  receipt: "M6 3.5h12V21l-3-2-3 2-3-2-3 2V3.5zM9 8h6M9 12h6",
  wallet: "M4 7.5h14.5a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18V6.5A2.5 2.5 0 0 1 6.5 4H17M15.5 13.5h.01",
  tag: "M3.5 12.2V4.5h7.7l9 9a1.5 1.5 0 0 1 0 2.1l-5.6 5.6a1.5 1.5 0 0 1-2.1 0l-9-9zM8 8.5h.01",
  share: "M8.5 11l7-4m-7 6 7 4M7 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zm11-6a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5zm0 12a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z",
  building: "M5 20.5V4h9v16.5M14 9h5v11.5M3 20.5h18M8.5 8h2m-2 3.5h2m-2 3.5h2",
  sliders: "M4 7h9m4 0h3M4 17h3m4 0h9M13 4.5v5m-6 5v5",
  clock: "M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zM12 7.5V12l3 2",
  download: "M12 4v11m-4.5-4.5L12 15l4.5-4.5M5 19.5h14",
  edit: "M4 20h4L19 9l-4-4L4 16v4zM13 7l4 4",
} as const;

export type IconName = keyof typeof PATHS;

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
