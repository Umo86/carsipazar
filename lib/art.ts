// Placeholder artwork for the demo listings: pattern studies in the site's
// palette, drawn as SVG. They stand in for product photos until real sellers
// upload their own, and are only used by the seed script.

const W = 800;
const H = 1000;

type Palette = { ground: string; a: string; b: string; c: string };

export const PALETTES: Record<string, Palette> = {
  cobalt: { ground: "#F6F3EC", a: "#1B3B8B", b: "#2AA7A1", c: "#C8102E" },
  night: { ground: "#14285F", a: "#F6F3EC", b: "#B08D57", c: "#2AA7A1" },
  madder: { ground: "#8C1C2B", a: "#F1E6D0", b: "#14285F", c: "#B08D57" },
  brass: { ground: "#F6F3EC", a: "#B08D57", b: "#14285F", c: "#8C1C2B" },
  sea: { ground: "#E9F1EF", a: "#1F7F7A", b: "#1B3B8B", c: "#B08D57" },
  emerald: { ground: "#0F4A3C", a: "#F1E6D0", b: "#B08D57", c: "#C8102E" },
};

const wrap = (p: Palette, body: string) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><rect width="${W}" height="${H}" fill="${p.ground}"/>${body}</svg>`;

const diamond = (cx: number, cy: number, rx: number, ry: number, fill: string) =>
  `<polygon points="${cx},${cy - ry} ${cx + rx},${cy} ${cx},${cy + ry} ${cx - rx},${cy}" fill="${fill}"/>`;

// Kilim: bands of nested diamonds between zigzag borders.
export function kilim(p: Palette) {
  let s = "";
  const zig = (y: number, color: string) => {
    let d = `M0 ${y}`;
    for (let x = 0; x <= W; x += 40) d += ` L${x + 20} ${y - 22} L${x + 40} ${y}`;
    return `<path d="${d}" fill="none" stroke="${color}" stroke-width="9"/>`;
  };
  for (let row = 0; row < 4; row++) {
    const cy = 135 + row * 245;
    for (let i = 0; i < 4; i++) {
      const cx = 100 + i * 200;
      s += diamond(cx, cy, 92, 96, row % 2 ? p.b : p.a);
      s += diamond(cx, cy, 60, 63, p.ground);
      s += diamond(cx, cy, 34, 36, p.c);
      s += diamond(cx, cy, 12, 13, p.ground);
    }
    s += zig(cy + 132, row % 2 ? p.a : p.b);
  }
  return wrap(p, s);
}

// Peştemal: a plain ground with groups of woven stripes and a fringe.
export function stripes(p: Palette) {
  let s = "";
  const band = (y: number) =>
    [0, 26, 44, 58, 96, 110, 128]
      .map((dy, i) => {
        const h = [14, 6, 4, 26, 4, 6, 14][i];
        const color = [p.a, p.b, p.a, p.a, p.a, p.b, p.a][i];
        return `<rect x="0" y="${y + dy}" width="${W}" height="${h}" fill="${color}"/>`;
      })
      .join("");
  s += band(110) + band(430) + band(750);
  for (let x = 10; x < W; x += 16) {
    s += `<line x1="${x}" y1="${H - 46}" x2="${x}" y2="${H}" stroke="${p.a}" stroke-width="3"/>`;
  }
  s += `<rect x="0" y="${H - 52}" width="${W}" height="6" fill="${p.c}"/>`;
  return wrap(p, s);
}

// Star lattice: eight-point stars, the geometry of carved doors and inlay.
export function stars(p: Palette) {
  let s = "";
  const star = (cx: number, cy: number, r: number) => {
    const sq = (rot: number) =>
      `<rect x="${cx - r}" y="${cy - r}" width="${2 * r}" height="${2 * r}" transform="rotate(${rot} ${cx} ${cy})" fill="none" stroke="${p.a}" stroke-width="7"/>`;
    return sq(0) + sq(45) + `<circle cx="${cx}" cy="${cy}" r="${r * 0.3}" fill="${p.c}"/>`;
  };
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 4; col++) {
      const cx = 100 + col * 200;
      const cy = 100 + row * 200;
      s += star(cx, cy, 58);
      s += `<circle cx="${cx + 100}" cy="${cy + 100}" r="15" fill="${p.b}"/>`;
    }
  }
  return wrap(p, s);
}

// Tulips: the Iznik tile flower, in a half-drop repeat.
export function tulips(p: Palette) {
  let s = "";
  const petal = "M0 -78 C26 -44 34 -6 0 46 C-34 -6 -26 -44 0 -78 Z";
  const tulip = (cx: number, cy: number, color: string) =>
    `<g transform="translate(${cx} ${cy})">
       <path d="M0 46 C-6 96 10 132 0 176" fill="none" stroke="${p.b}" stroke-width="7"/>
       <path d="M0 132 C-42 122 -58 92 -54 62 C-30 76 -10 100 0 132 Z" fill="${p.b}"/>
       <path d="${petal}" transform="rotate(-24)" fill="${color}"/>
       <path d="${petal}" transform="rotate(24)" fill="${color}"/>
       <path d="${petal}" fill="${p.a}"/>
     </g>`;
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 3; col++) {
      const cx = 135 + col * 265 + (row % 2 ? 132 : 0);
      const cy = 120 + row * 255;
      s += tulip(cx, cy, row % 2 ? p.c : p.a);
    }
  }
  return wrap(p, s);
}

// Arches: nested pointed arches, as in the bazaar's vaulted lanes.
export function arches(p: Palette) {
  let s = "";
  const arch = (inset: number, color: string, width: number) => {
    const l = inset;
    const r = W - inset;
    const top = 90 + inset * 0.9;
    const spring = 420 + inset * 0.35;
    return `<path d="M${l} ${H} L${l} ${spring} C${l} ${spring - 190} ${W / 2 - 110} ${top + 60} ${W / 2} ${top} C${W / 2 + 110} ${top + 60} ${r} ${spring - 190} ${r} ${spring} L${r} ${H}" fill="none" stroke="${color}" stroke-width="${width}"/>`;
  };
  s += arch(70, p.a, 16) + arch(130, p.b, 8) + arch(180, p.a, 5) + arch(240, p.c, 12);
  s += diamond(W / 2, 700, 46, 62, p.a) + diamond(W / 2, 700, 20, 27, p.ground);
  return wrap(p, s);
}

// Beads: draped strands, for jewellery.
export function beads(p: Palette) {
  let s = "";
  for (let row = 0; row < 4; row++) {
    const y = 90 + row * 230;
    const depth = 150;
    s += `<path d="M40 ${y} Q${W / 2} ${y + depth * 2} ${W - 40} ${y}" fill="none" stroke="${p.a}" stroke-width="4"/>`;
    for (let i = 1; i < 12; i++) {
      const t = i / 12;
      const x = 40 + (W - 80) * t;
      const by = y + depth * 2 * 2 * t * (1 - t);
      const big = i === 6;
      s += `<circle cx="${x}" cy="${by}" r="${big ? 26 : 11}" fill="${big ? p.c : i % 2 ? p.b : p.a}"/>`;
      if (big) s += `<circle cx="${x}" cy="${by}" r="10" fill="${p.ground}"/>`;
    }
  }
  return wrap(p, s);
}

export const ART = { kilim, stripes, stars, tulips, arches, beads };
