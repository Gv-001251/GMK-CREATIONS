"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export function Preloader() {
  const pathname = usePathname();
  // Only show the preloader when the landing page ("/") is loaded/reloaded.
  const [loading, setLoading] = useState(() => pathname === "/");
  const videoRef = useRef<HTMLVideoElement>(null);
  // "Never started" failsafe — fires only if the video fails to begin playing
  // (autoplay blocked, load error, offline). Cancelled once playback starts.
  const startFailsafeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Absolute cap so a stalled video can never trap the user on the intro.
  const maxFailsafeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleComplete = () => {
    setLoading(false);
    document.body.style.overflow = "unset";
  };

  useEffect(() => {
    if (!loading) return;

    // Prevent scrolling while preloading
    document.body.style.overflow = "hidden";

    // Try to auto-play the video. Autoplay may be blocked; the failsafe below
    // handles that case.
    videoRef.current?.play().catch(() => {});

    // Failsafe: if the video never starts within a reasonable window (blocked
    // autoplay / load error / offline), dismiss so the user isn't stuck.
    startFailsafeRef.current = setTimeout(() => {
      handleComplete();
    }, 6000);

    // Absolute upper bound in case neither `onEnded` nor a duration-based timer
    // ever fires. Generous enough to let the clip download and play on a slow
    // first-load (before it is cached).
    maxFailsafeRef.current = setTimeout(() => {
      handleComplete();
    }, 20000);

    return () => {
      if (startFailsafeRef.current) clearTimeout(startFailsafeRef.current);
      if (maxFailsafeRef.current) clearTimeout(maxFailsafeRef.current);
      document.body.style.overflow = "unset";
    };
  }, [loading]);

  // When the video actually begins playing, cancel the "never started"
  // failsafe and re-arm the upper bound to exactly the remaining clip length.
  // This guarantees the clip plays fully on the first (uncached) load instead
  // of being cut off by a fixed timer, while still never hanging.
  const handlePlaying = () => {
    if (startFailsafeRef.current) {
      clearTimeout(startFailsafeRef.current);
      startFailsafeRef.current = null;
    }
    const video = videoRef.current;
    if (video && Number.isFinite(video.duration) && video.duration > 0) {
      const remainingMs = (video.duration - video.currentTime) * 1000 + 1500;
      if (maxFailsafeRef.current) clearTimeout(maxFailsafeRef.current);
      maxFailsafeRef.current = setTimeout(handleComplete, remainingMs);
    }
  };

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            opacity: 0,
            scale: 1.05,
            filter: "blur(10px)"
          }}
          transition={{ duration: 0.8, ease: [0.85, 0, 0.15, 1] }}
          className="fixed inset-0 z-[9999] bg-[#000000] flex items-center justify-center overflow-hidden"
        >
          {/* Centered responsive video container with locked aspect ratio */}
          <div 
            className="relative w-full aspect-video overflow-hidden mx-4"
            style={{
              width: "calc(100vw - 2rem)",
              maxWidth: "min(1024px, calc((100vh - 2rem) * 16 / 9))",
              height: "auto",
            }}
          >
            {/* The video is scaled to 112% height and aligned to the top to crop the bottom watermark */}
            <video
              ref={videoRef}
              src="/images/loader/loader.mp4"
              autoPlay
              muted
              playsInline
              preload="auto"
              onPlaying={handlePlaying}
              onEnded={handleComplete}
              onError={handleComplete}
              className="absolute inset-0 w-full h-[112%] object-cover object-top select-none pointer-events-none"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
