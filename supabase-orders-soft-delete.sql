-- ============================================================
-- GMK-CREATIONS: Orders soft-delete migration
-- Run this in Supabase Dashboard -> SQL Editor -> New Query -> Run
--
-- Adds a `deleted_at` column to the orders table. When an admin "deletes" an
-- order, we set this timestamp instead of removing the row, so the order data
-- is retained in the database and cannot be lost to an accidental deletion.
-- ============================================================

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Speeds up the "hide soft-deleted orders" filter used by the admin list.
CREATE INDEX IF NOT EXISTS orders_deleted_at_idx
  ON public.orders (deleted_at);
