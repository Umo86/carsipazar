"use client";

import { useEffect, useRef, useState } from "react";
import Icon from "./Icon";

// Decorative looping video for the home banner. It never autoplays for people
// who ask for reduced motion, and anyone can stop it with the button.
export default function HeroVideo({
  src,
  poster,
  pauseLabel,
  playLabel,
}: {
  src: string;
  poster?: string;
  pauseLabel: string;
  playLabel: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    video.play().catch(() => {
      // The browser refused (data saver, low power); the poster stays.
    });
  }, []);

  function toggle() {
    const video = ref.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => {});
    else video.pause();
  }

  return (
    <>
      <video
        ref={ref}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
        tabIndex={-1}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? pauseLabel : playLabel}
        className="round-btn absolute right-4 bottom-4 h-10 w-10"
      >
        <Icon name={playing ? "pause" : "play"} size={20} />
      </button>
    </>
  );
}
