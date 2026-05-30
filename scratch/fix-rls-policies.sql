-- ==========================================
-- GMK-CREATIONS: RLS Policy Fixes
-- Run this in the Supabase SQL Editor
-- ==========================================

-- ─── 1. Fix Products RLS: Only admins can write ───

-- Drop overly-permissive policies
DROP POLICY IF EXISTS "Anyone can insert products" ON products;
DROP POLICY IF EXISTS "Anyone can update products" ON products;
DROP POLICY IF EXISTS "Anyone can delete products" ON products;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON products;
DROP POLICY IF EXISTS "Allow update for authenticated" ON products;
DROP POLICY IF EXISTS "Allow delete for authenticated" ON products;

-- Create admin-only write policies
DROP POLICY IF EXISTS "Admins can insert products" ON products;
CREATE POLICY "Admins can insert products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can update products" ON products;
CREATE POLICY "Admins can update products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Admins can delete products" ON products;
CREATE POLICY "Admins can delete products"
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Ensure public read access exists
DROP POLICY IF EXISTS "Anyone can read products" ON products;
CREATE POLICY "Anyone can read products"
  ON products FOR SELECT
  TO anon, authenticated
  USING (true);


-- ─── 2. Fix Order Items RLS: Users can only insert into their own orders ───

DROP POLICY IF EXISTS "Users can insert order items" ON order_items;
DROP POLICY IF EXISTS "Allow insert for authenticated" ON order_items;
DROP POLICY IF EXISTS "Anyone can insert order_items" ON order_items;
DROP POLICY IF EXISTS "Users can insert own order items" ON order_items;

CREATE POLICY "Users can insert own order items"
  ON order_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
        AND orders.user_id = auth.uid()
    )
  );


-- ─── 3. Add Performance Indexes ───

CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);


-- ─── 4. Add updated_at column to orders ───

ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS orders_updated_at ON orders;
CREATE TRIGGER orders_updated_at
  BEFORE UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION update_modified_column();


-- ─── 5. Verify RLS is enabled on all tables ───

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
