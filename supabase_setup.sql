-- Supabase Setup for Archive Items (Display/Viewing)
-- This is separate from the 'archives' table used for submissions
-- Run this in your Supabase SQL Editor

-- Step 1: Create the archive_items table (for displaying the archive page)
-- Note: This is different from the 'archives' table which stores user submissions
CREATE TABLE IF NOT EXISTS public.archive_items (
  id text PRIMARY KEY,
  inheritedtrait text NOT NULL,
  dateofsample text NOT NULL,
  location_source text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Step 2: Enable Row Level Security and allow public read access
ALTER TABLE public.archive_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow public read access" ON public.archive_items;

-- Create policy for public read access
CREATE POLICY "Allow public read access" ON public.archive_items
  FOR SELECT
  USING (true);

-- Step 3: Insert all 31 archive items
INSERT INTO public.archive_items (id, inheritedtrait, dateofsample, location_source) VALUES
  ('item001', 'hormonal imbalances / anxiety', '5/11/2025', 'ITP'),
  ('item002', 'my mom''s skin. I get sunburnt so easily <3 ', '5/11/2025', 'SCALP -370 JAY ST'),
  ('item003', 'moves countries', '5/11/2025', '2607:7690:5525:9086'),
  ('item004', 'good outlook on #life', '5/11/2025', 'Finnley''s head'),
  ('item005', 'Make Sense of Everything', '5/11/2025', 'My back'),
  ('item006', 'Serene Stillness', '5/11/2025', 'My head'),
  ('item007', 'ALL THESE FEELINGS', '5/11/2025', 'SCALP!'),
  ('item008', 'EYES & ATTITUDE', '5/11/2025', 'SCALP'),
  ('item009', 'AGGRESSIVENESS', '5/11/2025', 'GOT PLUCKED ON THE SPOT'),
  ('item010', 'SKIN; EYES; TENDERNESS', '5/10/2025', 'MY HEAD'),
  ('item011', 'BPD', '5/11/2025', 'MY FAV ITP FLOOR'),
  ('item012', 'ABILITY TO FIX MY VAPE', '5/12/2025', 'BANGS'),
  ('item013', 'Nervous System ', '5/11/2025', 'BANGS'),
  ('item014', 'Being adventurous; Detail-oriented', '5/12/2025', 'My Jacket'),
  ('item015', 'COURAGE', '5/12/2025', 'Spring Show '),
  ('item016', 'POSITIVITY/RESILIENCE', '5/12/2025', 'NEW YORK'),
  ('item017', 'My Disassociated mind And Body', '5/12/2025', 'Out of Nowhere.'),
  ('item018', 'My generosity', '5/12/2025', 'Head'),
  ('item019', 'MY EYES', '5/12/2025', 'DEAD ENDS'),
  ('item020', '4 paws, eternal hunger, cataracts, other cat stuft', '5/12/2025', 'human servant''s shirt'),
  ('item021', 'Plantass + Male pattern baldness', '5/12/2025', 'scalp'),
  ('item022', 'Assure+Loving', '5/12/2025', 'Behind-head'),
  ('item023', 'my interests & body shape', '5/12/2025', 'Room 426'),
  ('item024', '- Breast Cancer / - Hoarding Habits / Humor Senses', '5/11/2025', ''),
  ('item025', 'strength & perseverance', '5/11/2025', 'COMB'),
  ('item026', 'SAME CUP SIZE', '5/12/2025', 'My SCALP'),
  ('item027', 'my give-no-fuckness', '5/12/2025', 'skull'),
  ('item028', 'Happy Birthday ;( <3', '5/12/2025', 'ITP - 4th FL'),
  ('item029', 'Addiction Problem', '5/11/2025', 'SCALP!'),
  ('item030', 'Feisty', '5/12/2025', 'NYC'),
  ('item031', 'Docile', '5/12/2025', 'NY')
ON CONFLICT (id) DO UPDATE SET
  inheritedtrait = EXCLUDED.inheritedtrait,
  dateofsample = EXCLUDED.dateofsample,
  location_source = EXCLUDED.location_source;

-- Verify the data was inserted
SELECT COUNT(*) as total_items FROM public.archive_items;

