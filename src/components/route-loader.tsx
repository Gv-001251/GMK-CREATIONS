"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

import { PrinterLoaderSvg } from "./printer-loader-svg";

export function RouteLoader() {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Reset navigation loader when pathname or searchParams change (navigation completes)
  useEffect(() => {
    setIsNavigating(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      // Ignore clicks with modifier keys
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) {
        return;
      }

      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Ignore external links, mailto, tel, javascript anchors
      const isExternal = anchor.target === "_blank" || href.startsWith("http://") || href.startsWith("https://");
      if (isExternal) return;

      if (href.startsWith("mailto:") || href.startsWith("tel:") || href.startsWith("javascript:")) {
        return;
      }

      // Ignore hash links pointing to same page
      if (href.startsWith("#") || href.startsWith("/#") || href.includes("#")) {
        const currentPath = window.location.pathname;
        const targetPath = href.split("#")[0];
        if (targetPath === "" || targetPath === currentPath) {
          return;
        }
      }

      // Check if it matches current page URL exactly
      try {
        const targetUrl = new URL(href, window.location.href);
        if (
          targetUrl.pathname === window.location.pathname &&
          targetUrl.search === window.location.search
        ) {
          return;
        }
      } catch (err) {
        return;
      }

      // Trigger the route transition loader
      setIsNavigating(true);
    };

    const handlePopState = () => {
      // Handles browser back and forward button clicks
      setIsNavigating(true);
    };

    document.addEventListener("click", handleAnchorClick);
    window.addEventListener("popstate", handlePopState);

    return () => {
      document.removeEventListener("click", handleAnchorClick);
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return (
    <AnimatePresence>
      {isNavigating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[9999] bg-[#000000]/85 backdrop-blur-md flex flex-col items-center justify-center pointer-events-auto"
        >
          <div className="w-[300px] h-[150px] flex items-center justify-center">
            <PrinterLoaderSvg />
          </div>
          <p className="text-white/60 text-xs tracking-widest font-heading uppercase animate-pulse mt-2">
            Printing next page...
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
