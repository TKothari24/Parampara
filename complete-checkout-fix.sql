-- Complete checkout database fix
-- Run this in Supabase SQL Editor to fix all missing tables and columns

-- 1. Add missing columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS buyer_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS seller_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS total_amount DECIMAL(10,2) NOT NULL DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS items_count INTEGER DEFAULT 0;

-- Update existing records
UPDATE orders SET
    buyer_user_id = COALESCE(buyer_user_id, user_id),
    total_amount = COALESCE(total_amount, total, 0),
    items_count = COALESCE(items_count, 0)
WHERE buyer_user_id IS NULL OR total_amount IS NULL OR items_count IS NULL;

-- 2. Add missing columns to order_items table
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS product_id UUID;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS qty INTEGER;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS image_url TEXT;

-- Update existing records to populate new columns
UPDATE order_items SET
    qty = COALESCE(qty, quantity),
    image_url = COALESCE(image_url, image)
WHERE qty IS NULL OR image_url IS NULL;

-- 3. Add missing columns to cart_items table
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS seller_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS product_id UUID;

-- 4. Create order_shipping table
CREATE TABLE IF NOT EXISTS order_shipping (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  buyer_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create seller_notifications table
CREATE TABLE IF NOT EXISTS seller_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  buyer_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  items_count INTEGER NOT NULL,
  total_amount DECIMAL(10,2) NOT NULL,
  type TEXT DEFAULT 'new_order',
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Create seller_products table (if not exists)
CREATE TABLE IF NOT EXISTS seller_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  seller_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  image_url TEXT,
  festival_id UUID,
  state_id UUID,
  state_name TEXT,
  category TEXT,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Create sellers table (if not exists)
CREATE TABLE IF NOT EXISTS sellers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_name TEXT NOT NULL,
  description TEXT,
  phone TEXT,
  address JSONB,
  approved BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE order_shipping ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE seller_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sellers ENABLE ROW LEVEL SECURITY;

-- Policies for order_shipping
DROP POLICY IF EXISTS "Users can view their own order shipping" ON order_shipping;
CREATE POLICY "Users can view their own order shipping" ON order_shipping
  FOR SELECT USING (auth.uid() = buyer_user_id);

DROP POLICY IF EXISTS "Users can insert their own order shipping" ON order_shipping;
CREATE POLICY "Users can insert their own order shipping" ON order_shipping
  FOR INSERT WITH CHECK (auth.uid() = buyer_user_id);

-- Policies for seller_notifications
DROP POLICY IF EXISTS "Sellers can view their own notifications" ON seller_notifications;
CREATE POLICY "Sellers can view their own notifications" ON seller_notifications
  FOR SELECT USING (auth.uid() = seller_user_id);

DROP POLICY IF EXISTS "System can insert notifications" ON seller_notifications;
CREATE POLICY "System can insert notifications" ON seller_notifications
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Sellers can update their own notifications" ON seller_notifications;
CREATE POLICY "Sellers can update their own notifications" ON seller_notifications
  FOR UPDATE USING (auth.uid() = seller_user_id);

-- Policies for seller_products
DROP POLICY IF EXISTS "Everyone can view seller products" ON seller_products;
CREATE POLICY "Everyone can view seller products" ON seller_products
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Sellers can insert their own products" ON seller_products;
CREATE POLICY "Sellers can insert their own products" ON seller_products
  FOR INSERT WITH CHECK (auth.uid() = seller_user_id);

DROP POLICY IF EXISTS "Sellers can update their own products" ON seller_products;
CREATE POLICY "Sellers can update their own products" ON seller_products
  FOR UPDATE USING (auth.uid() = seller_user_id);

DROP POLICY IF EXISTS "Sellers can delete their own products" ON seller_products;
CREATE POLICY "Sellers can delete their own products" ON seller_products
  FOR DELETE USING (auth.uid() = seller_user_id);

-- Policies for sellers
DROP POLICY IF EXISTS "Users can view sellers" ON sellers;
CREATE POLICY "Users can view sellers" ON sellers
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own seller profile" ON sellers;
CREATE POLICY "Users can insert their own seller profile" ON sellers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own seller profile" ON sellers;
CREATE POLICY "Users can update their own seller profile" ON sellers
  FOR UPDATE USING (auth.uid() = user_id);

-- Update orders policy for sellers
DROP POLICY IF EXISTS "Sellers can view all orders" ON orders;
CREATE POLICY "Sellers can view all orders" ON orders FOR SELECT USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_order_shipping_order_id ON order_shipping(order_id);
CREATE INDEX IF NOT EXISTS idx_order_shipping_buyer_user_id ON order_shipping(buyer_user_id);
CREATE INDEX IF NOT EXISTS idx_seller_notifications_seller_user_id ON seller_notifications(seller_user_id);
CREATE INDEX IF NOT EXISTS idx_seller_notifications_order_id ON seller_notifications(order_id);
CREATE INDEX IF NOT EXISTS idx_seller_products_seller_user_id ON seller_products(seller_user_id);
CREATE INDEX IF NOT EXISTS idx_sellers_user_id ON sellers(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_seller_products_updated_at ON seller_products;
CREATE TRIGGER update_seller_products_updated_at BEFORE UPDATE ON seller_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();