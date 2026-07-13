"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Preloader() {
  const [loading, setLoading] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        return !localStorage.getItem("gmk_preloader_shown");
      } catch (e) {
        console.error("Failed to access localStorage", e);
        return true;
      }
    }
    return true;
  });
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!loading) return;

    // Prevent scrolling while preloading
    document.body.style.overflow = "hidden";

    // Try to auto-play video
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.log("Autoplay was blocked or video failed to load", err);
      });
    }

    // Fallback timer of 4.5 seconds to fade out automatically in case video is blocked/fails
    const timer = setTimeout(() => {
      handleComplete();
    }, 4500);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "unset";
    };
  }, [loading]);

  const handleComplete = () => {
    setLoading(false);
    try {
      localStorage.setItem("gmk_preloader_shown", "true");
    } catch (e) {
      console.error("Failed to set localStorage", e);
    }
    document.body.style.overflow = "unset";
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
          <div className="relative w-full max-w-5xl aspect-video overflow-hidden mx-4">
            {/* The video is scaled to 112% height and aligned to the top to crop the bottom watermark */}
            <video
              ref={videoRef}
              src="/images/loader/loader.mp4"
              autoPlay
              muted
              playsInline
              onEnded={handleComplete}
              className="absolute inset-0 w-full h-[112%] object-cover object-top select-none pointer-events-none"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
