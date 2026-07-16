-- ============================================================
-- GMK-CREATIONS: RLS Security Patch
-- Run this in Supabase Dashboard → SQL Editor → New Query → Run
-- This fixes overly-permissive product policies and adds a
-- utility to promote users to admin.
-- ============================================================

-- ──────────────────────────────────────────────────────────────
-- 0. SCHEMA UPDATES (Adding shipping_phone field)
-- ──────────────────────────────────────────────────────────────
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_phone TEXT;

-- ──────────────────────────────────────────────────────────────
-- 1. PRODUCTS TABLE — restrict writes to admin role only
-- ──────────────────────────────────────────────────────────────

DROP POLICY IF EXISTS "Authenticated users can insert products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON public.products;
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;

CREATE POLICY "Admins can insert products"
  ON public.products FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update products"
  ON public.products FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete products"
  ON public.products FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- ──────────────────────────────────────────────────────────────
-- 2. ADMIN PROMOTION UTILITY
-- Usage: SELECT promote_to_admin('user@example.com');
-- ──────────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.promote_to_admin(target_email TEXT)
RETURNS TEXT AS $$
DECLARE
  target_id UUID;
BEGIN
  SELECT id INTO target_id FROM auth.users WHERE email = target_email;

  IF target_id IS NULL THEN
    RETURN 'Error: No user found with email ' || target_email;
  END IF;

  UPDATE public.profiles SET role = 'admin' WHERE id = target_id;
  RETURN 'Success: ' || target_email || ' is now an admin.';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ──────────────────────────────────────────────────────────────
-- 3. Enable Realtime for orders and uploads tables
-- (Required for the useRealtimeAdmin hook to work)
-- ──────────────────────────────────────────────────────────────

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr 
    JOIN pg_class c ON pr.prrelid = c.oid 
    JOIN pg_publication p ON pr.prpubid = p.oid 
    WHERE c.relname = 'orders' AND p.pubname = 'supabase_realtime'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr 
    JOIN pg_class c ON pr.prrelid = c.oid 
    JOIN pg_publication p ON pr.prpubid = p.oid 
    WHERE c.relname = 'uploads' AND p.pubname = 'supabase_realtime'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.uploads;
  END IF;

  -- Required for the useRealtimeProducts hook (live storefront + admin catalog)
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_rel pr 
    JOIN pg_class c ON pr.prrelid = c.oid 
    JOIN pg_publication p ON pr.prpubid = p.oid 
    WHERE c.relname = 'products' AND p.pubname = 'supabase_realtime'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
  END IF;
END $$;

-- ──────────────────────────────────────────────────────────────
-- 4. Pending orders cleanup (runs every 2 hours via pg_cron)
-- Requires pg_cron extension enabled in Supabase Dashboard.
-- Enable: Extensions → pg_cron → Enable
-- ──────────────────────────────────────────────────────────────

-- DELETE stale pending order_items first
-- Then delete the stale orders themselves
-- (Alternatively use the /api/admin/cleanup endpoint with Vercel Cron)

