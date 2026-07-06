"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

interface UseRealtimeAdminOptions {
  /** Called whenever an orders row is inserted, updated, or deleted */
  onOrdersChange?: () => void;
  /** Called whenever an uploads row is inserted, updated, or deleted */
  onUploadsChange?: () => void;
  /** Called whenever a products row is inserted, updated, or deleted */
  onProductsChange?: () => void;
}

/**
 * Subscribes to Supabase Realtime changes on the `orders`, `uploads`, and
 * `products` tables so the admin panel reflects new data instantly without
 * a manual refresh.
 *
 * IMPORTANT: Realtime must be enabled in the Supabase Dashboard OR by
 * running supabase-rls-patch.sql (which runs the ALTER PUBLICATION commands).
 */
export function useRealtimeAdmin({
  onOrdersChange,
  onUploadsChange,
  onProductsChange,
}: UseRealtimeAdminOptions) {
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("admin-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => onOrdersChange?.())
      .on("postgres_changes", { event: "*", schema: "public", table: "uploads" }, () => onUploadsChange?.())
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => onProductsChange?.())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/**
 * Public-facing hook: re-fetches products whenever the DB changes.
 * Add this to the products store page to keep the storefront live.
 */
export function useRealtimeProducts(onProductsChange: () => void) {
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("public-products-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "products" }, () => onProductsChange())
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
