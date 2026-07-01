-- Fix cart_items table to include seller_user_id and product_id
-- Run this to add missing columns to cart_items table

-- Add seller_user_id column to cart_items
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS seller_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add product_id column to cart_items  
ALTER TABLE cart_items ADD COLUMN IF NOT EXISTS product_id UUID;

-- Update existing cart items to populate missing columns
UPDATE cart_items 
SET seller_user_id = (
  SELECT sp.seller_user_id 
  FROM seller_products sp 
  WHERE sp.name = cart_items.product_name 
  LIMIT 1
)
WHERE seller_user_id IS NULL;

UPDATE cart_items 
SET product_id = (
  SELECT sp.id 
  FROM seller_products sp 
  WHERE sp.name = cart_items.product_name 
  LIMIT 1
)
WHERE product_id IS NULL;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_cart_items_seller_user_id ON cart_items(seller_user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON cart_items(product_id);
