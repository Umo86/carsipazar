// Inline SVG flags (emoji flags do not render on Windows).
const cls = "block rounded-[2px] ring-1 ring-black/10";

export function TurkeyFlag() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1200 800"
      width={20}
      height={14}
      preserveAspectRatio="xMidYMid slice"
      className={cls}
      aria-hidden="true"
      focusable="false"
    >
      <rect width="1200" height="800" fill="#E30A17" />
      <circle cx="425" cy="400" r="200" fill="#fff" />
      <circle cx="475" cy="400" r="160" fill="#E30A17" />
      <polygon
        fill="#fff"
        points="583.334,400 764.235,458.779 652.431,304.894 652.431,495.106 764.235,341.221"
      />
    </svg>
  );
}

export function UKFlag() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 60 30"
      width={20}
      height={14}
      preserveAspectRatio="xMidYMid slice"
      className={cls}
      aria-hidden="true"
      focusable="false"
    >
      <clipPath id="uk-t">
        <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
      </clipPath>
      <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
      <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
      <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#uk-t)" stroke="#C8102E" strokeWidth="4" />
      <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
      <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  );
}
