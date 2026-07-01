-- Fix trigger function to handle tables without updated_at column
-- Run this to fix the trigger error

-- Drop existing triggers
DROP TRIGGER IF EXISTS update_orders_updated_at ON orders;
DROP TRIGGER IF EXISTS update_cart_items_updated_at ON cart_items;

-- Create improved trigger function that checks if column exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if the table has updated_at column
  IF TG_TABLE_NAME = 'orders' THEN
    NEW.updated_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Recreate trigger only for orders table (which has updated_at column)
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
