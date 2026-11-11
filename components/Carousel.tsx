"use client";

import { useRef, type ReactNode } from "react";
import Icon from "./Icon";

// A row that scrolls sideways: by touch on phones, by the two round buttons
// on larger screens. Each child is one cell.
export default function Carousel({
  children,
  prevLabel,
  nextLabel,
}: {
  children: ReactNode;
  prevLabel: string;
  nextLabel: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: reduce ? "auto" : "smooth" });
  };
  return (
    <div className="relative">
      <div
        ref={ref}
        className="panel no-scrollbar flex snap-x snap-mandatory overflow-x-auto [&>*]:shrink-0 [&>*]:snap-start [&>*]:border-r [&>*]:border-line [&>*:last-child]:border-r-0"
      >
        {children}
      </div>
      <button
        type="button"
        onClick={() => move(-1)}
        aria-label={prevLabel}
        className="round-btn absolute top-[38%] -left-5 hidden lg:inline-flex"
      >
        <Icon name="left" />
      </button>
      <button
        type="button"
        onClick={() => move(1)}
        aria-label={nextLabel}
        className="round-btn absolute top-[38%] -right-5 hidden lg:inline-flex"
      >
        <Icon name="right" />
      </button>
    </div>
  );
}
