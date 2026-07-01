-- Quick fix for missing seller_user_id column
-- Run this immediately

-- Add seller_user_id column (most critical)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS seller_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add total_amount column 
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) NOT NULL DEFAULT 0;

-- Add items_count column
ALTER TABLE orders ADD COLUMN IF NOT EXISTS items_count INTEGER DEFAULT 0;

-- Add buyer_user_id column
ALTER TABLE orders ADD COLUMN IF NOT EXISTS buyer_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Update any existing records
UPDATE orders SET total_amount = COALESCE(total_amount, total) WHERE total_amount IS NULL;
UPDATE orders SET items_count = COALESCE(items_count, 0) WHERE items_count IS NULL;

-- Add seller policy
DROP POLICY IF EXISTS "Sellers can view all orders" ON orders;
CREATE POLICY "Sellers can view all orders" ON orders FOR SELECT USING (true);
