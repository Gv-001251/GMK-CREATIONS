-- ============================================================
-- GMK-CREATIONS: Product weight migration
-- Run this in Supabase Dashboard -> SQL Editor -> New Query -> Run
--
-- Adds a `weight` column (in grams) to the products table. This value drives
-- the weight-based delivery charge at checkout. Existing rows default to 0;
-- re-import your product CSV (which has a "Baseline Weight (g)" column) or set
-- weights via the admin product form to populate real values.
-- ============================================================

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS weight INTEGER DEFAULT 0;

-- ------------------------------------------------------------
-- Populate weights (grams) from the GMK Product Master CSV.
-- This UPDATE only affects products that already exist in the table;
-- any GMK id you haven't added yet is simply skipped.
-- ------------------------------------------------------------
UPDATE public.products AS p
SET weight = v.weight
FROM (VALUES
  ('GMK-00001', 13),
  ('GMK-00002', 20),
  ('GMK-00003', 80),
  ('GMK-00004', 150),
  ('GMK-00005', 120),
  ('GMK-00006', 80),
  ('GMK-00007', 95),
  ('GMK-00008', 75),
  ('GMK-00009', 50),
  ('GMK-00010', 120),
  ('GMK-00011', 40),
  ('GMK-00012', 20),
  ('GMK-00013', 80),
  ('GMK-00014', 163),
  ('GMK-00015', 380),
  ('GMK-00016', 15),
  ('GMK-00017', 100),
  ('GMK-00018', 30),
  ('GMK-00019', 340),
  ('GMK-00020', 115),
  ('GMK-00021', 30),
  ('GMK-00022', 70),
  ('GMK-00023', 120),
  ('GMK-00024', 120),
  ('GMK-00025', 40),
  ('GMK-00026', 32),
  ('GMK-00027', 98),
  ('GMK-00028', 90),
  ('GMK-00029', 230),
  ('GMK-00030', 90),
  ('GMK-00031', 40),
  ('GMK-00032', 30),
  ('GMK-00033', 60),
  ('GMK-00034', 85),
  ('GMK-00035', 65),
  ('GMK-00036', 40),
  ('GMK-00037', 180),
  ('GMK-00038', 150),
  ('GMK-00039', 100),
  ('GMK-00040', 55),
  ('GMK-00041', 90),
  ('GMK-00042', 12),
  ('GMK-00043', 31),
  ('GMK-00044', 170),
  ('GMK-00045', 368),
  ('GMK-00046', 130),
  ('GMK-00047', 263),
  ('GMK-00048', 255),
  ('GMK-00049', 172),
  ('GMK-00050', 30),
  ('GMK-00051', 161),
  ('GMK-00052', 109),
  ('GMK-00053', 107),
  ('GMK-00054', 140),
  ('GMK-00055', 71),
  ('GMK-00056', 89),
  ('GMK-00057', 89),
  ('GMK-00058', 70),
  ('GMK-00059', 74),
  ('GMK-00060', 118),
  ('GMK-00061', 85),
  ('GMK-00062', 116),
  ('GMK-00063', 125),
  ('GMK-00064', 200),
  ('GMK-00065', 217),
  ('GMK-00066', 281),
  ('GMK-00067', 279),
  ('GMK-00068', 78),
  ('GMK-00069', 34),
  ('GMK-00070', 83)
) AS v(id, weight)
WHERE p.id = v.id;
