"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function Preloader() {
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
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
  }, []);

  const handleComplete = () => {
    setLoading(false);
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
          className="fixed inset-0 z-[9999] bg-[#030712] overflow-hidden"
        >
          {/* Full-screen container offset to crop the bottom watermark and top symmetrically */}
          <div className="absolute top-[-2%] bottom-[-10%] left-0 right-0 overflow-hidden">
            <video
              ref={videoRef}
              src="/images/loader/loader.mp4"
              autoPlay
              muted
              playsInline
              onEnded={handleComplete}
              className="w-full h-full object-cover select-none pointer-events-none"
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
