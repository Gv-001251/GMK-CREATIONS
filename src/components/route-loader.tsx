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

  // Safety net: some clicks flip the loader on without ever changing the route
  // (same-URL navigation, cancelled/aborted navigation, a link resolved as a
  // no-op, or a failed load). In those cases the pathname/searchParams effect
  // above never fires, leaving the loader stuck on screen until a manual
  // reload. This timeout guarantees the loader always clears itself.
  useEffect(() => {
    if (!isNavigating) return;
    const timer = setTimeout(() => setIsNavigating(false), 8000);
    return () => clearTimeout(timer);
  }, [isNavigating]);

  // Clear the loader when the page is restored from the browser's back/forward
  // cache (bfcache) or regains visibility — navigation is already complete by
  // then, so a lingering loader would just be stuck.
  useEffect(() => {
    const clear = () => setIsNavigating(false);
    const handlePageShow = () => clear();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") clear();
    };
    window.addEventListener("pageshow", handlePageShow);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("pageshow", handlePageShow);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      // Ignore clicks with modifier keys
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button === 1) {
        return;
      }

      const target = e.target as HTMLElement;
      const anchor = target.closest("a");
      if (!anchor) return;

      // Ignore download links and anchors explicitly opting out of the loader
      if (anchor.hasAttribute("download") || anchor.dataset.noLoader !== undefined) {
        return;
      }

      // Ignore anchors that were already default-prevented by other handlers
      if (e.defaultPrevented) return;

      const href = anchor.getAttribute("href");
      if (!href) return;

      // Ignore external links, mailto, tel, javascript anchors
      const isExternal =
        anchor.target === "_blank" ||
        href.startsWith("http://") ||
        href.startsWith("https://") ||
        (anchor as HTMLAnchorElement).origin !== window.location.origin;
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

    // NOTE: we intentionally do NOT show the loader on `popstate` (browser
    // back/forward). Those navigations are near-instant in the SPA (often
    // restored from cache), and triggering the overlay there caused it to get
    // stuck on the destination page. Back/forward now navigate with no overlay.
    document.addEventListener("click", handleAnchorClick);

    return () => {
      document.removeEventListener("click", handleAnchorClick);
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
