-- Update default currency to Naira (NGN)
ALTER TABLE public.accounts 
ALTER COLUMN currency SET DEFAULT 'NGN';

-- Add currency preference to profiles table
ALTER TABLE public.profiles 
ADD COLUMN preferred_currency text DEFAULT 'NGN';