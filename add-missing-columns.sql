-- Add missing columns to existing orders table
-- Run this if the orders table already exists but is missing columns

-- Add missing columns if they don't exist
DO $$
BEGIN
    -- Add seller_user_id column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'seller_user_id') THEN
        ALTER TABLE orders ADD COLUMN seller_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
    
    -- Add total_amount column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'total_amount') THEN
        ALTER TABLE orders ADD COLUMN total_amount DECIMAL(10,2) NOT NULL DEFAULT 0;
    END IF;
    
    -- Add items_count column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'items_count') THEN
        ALTER TABLE orders ADD COLUMN items_count INTEGER DEFAULT 0;
    END IF;
    
    -- Add buyer_user_id column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'orders' AND column_name = 'buyer_user_id') THEN
        ALTER TABLE orders ADD COLUMN buyer_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Update existing records to populate missing columns
UPDATE orders 
SET 
    total_amount = COALESCE(total_amount, total),
    items_count = COALESCE(items_count, 0)
WHERE total_amount IS NULL OR items_count IS NULL;

-- Add/update policies for sellers
DO $$
BEGIN
    -- Drop existing seller policy if it exists
    DROP POLICY IF EXISTS "Sellers can view all orders" ON orders;
    
    -- Create seller policy
    CREATE POLICY "Sellers can view all orders" ON orders
      FOR SELECT USING (true);
END $$;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_orders_seller_user_id ON orders(seller_user_id);
CREATE INDEX IF NOT EXISTS idx_orders_buyer_user_id ON orders(buyer_user_id);
