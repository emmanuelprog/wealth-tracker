-- Phase 1: Fix Database Triggers & Data Creation

-- First, let's ensure all tables have proper realtime enabled
ALTER TABLE public.profiles REPLICA IDENTITY FULL;
ALTER TABLE public.categories REPLICA IDENTITY FULL;
ALTER TABLE public.accounts REPLICA IDENTITY FULL;
ALTER TABLE public.transactions REPLICA IDENTITY FULL;
ALTER TABLE public.budgets REPLICA IDENTITY FULL;
ALTER TABLE public.goals REPLICA IDENTITY FULL;
ALTER TABLE public.goal_transactions REPLICA IDENTITY FULL;
ALTER TABLE public.user_settings REPLICA IDENTITY FULL;
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.categories; 
ALTER PUBLICATION supabase_realtime ADD TABLE public.accounts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.budgets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.goals;
ALTER PUBLICATION supabase_realtime ADD TABLE public.goal_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.user_settings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Phase 2: Data Recovery - Create missing categories for existing users
INSERT INTO public.categories (user_id, name, icon, color)
SELECT 
  u.id as user_id,
  category.name,
  category.icon,
  category.color
FROM auth.users u
CROSS JOIN (
  VALUES 
    ('Food & Dining', '🍽️', '#10B981'),
    ('Transportation', '🚗', '#3B82F6'),
    ('Shopping', '🛒', '#8B5CF6'),
    ('Entertainment', '🎬', '#F59E0B'),
    ('Bills & Utilities', '⚡', '#EF4444'),
    ('Healthcare', '🏥', '#06B6D4'),
    ('Income', '💰', '#22C55E'),
    ('Savings', '🏦', '#6366F1')
) AS category(name, icon, color)
WHERE NOT EXISTS (
  SELECT 1 FROM public.categories c 
  WHERE c.user_id = u.id AND c.name = category.name
);

-- Create missing user settings for existing users
INSERT INTO public.user_settings (user_id)
SELECT u.id
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_settings us 
  WHERE us.user_id = u.id
);

-- Create missing profiles for existing users (if any)
INSERT INTO public.profiles (user_id, first_name, last_name, display_name, preferred_currency)
SELECT 
  u.id,
  COALESCE(u.raw_user_meta_data ->> 'first_name', 'User'),
  COALESCE(u.raw_user_meta_data ->> 'last_name', ''),
  COALESCE(
    CASE 
      WHEN u.raw_user_meta_data ->> 'first_name' IS NOT NULL 
      THEN (u.raw_user_meta_data ->> 'first_name') || ' ' || COALESCE(u.raw_user_meta_data ->> 'last_name', '')
      ELSE 'User'
    END,
    'User'
  ),
  COALESCE(u.raw_user_meta_data ->> 'preferred_currency', 'NGN')
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM public.profiles p 
  WHERE p.user_id = u.id
);

-- Phase 3: Improve trigger system
-- Drop existing trigger and recreate it with better logic
DROP TRIGGER IF EXISTS create_default_categories_on_signup ON auth.users;

-- Create improved trigger function for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_complete_setup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = 'public'
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (user_id, first_name, last_name, display_name, preferred_currency)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'first_name', 'User'),
    COALESCE(NEW.raw_user_meta_data ->> 'last_name', ''),
    COALESCE(
      CASE 
        WHEN NEW.raw_user_meta_data ->> 'first_name' IS NOT NULL 
        THEN (NEW.raw_user_meta_data ->> 'first_name') || ' ' || COALESCE(NEW.raw_user_meta_data ->> 'last_name', '')
        ELSE 'User'
      END,
      'User'
    ),
    COALESCE(NEW.raw_user_meta_data ->> 'preferred_currency', 'NGN')
  );

  -- Create default categories
  INSERT INTO public.categories (user_id, name, icon, color) VALUES
    (NEW.id, 'Food & Dining', '🍽️', '#10B981'),
    (NEW.id, 'Transportation', '🚗', '#3B82F6'),
    (NEW.id, 'Shopping', '🛒', '#8B5CF6'),
    (NEW.id, 'Entertainment', '🎬', '#F59E0B'),
    (NEW.id, 'Bills & Utilities', '⚡', '#EF4444'),
    (NEW.id, 'Healthcare', '🏥', '#06B6D4'),
    (NEW.id, 'Income', '💰', '#22C55E'),
    (NEW.id, 'Savings', '🏦', '#6366F1');

  -- Create user settings
  INSERT INTO public.user_settings (user_id) VALUES (NEW.id);
  
  RETURN NEW;
END;
$$;

-- Create new comprehensive trigger
CREATE TRIGGER on_auth_user_created_complete
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_complete_setup();

-- Phase 4: Add data validation functions
CREATE OR REPLACE FUNCTION public.ensure_user_has_categories(user_uuid UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  category_count INTEGER;
BEGIN
  -- Check if user has categories
  SELECT COUNT(*) INTO category_count
  FROM public.categories 
  WHERE user_id = user_uuid;
  
  -- If no categories, create them
  IF category_count = 0 THEN
    INSERT INTO public.categories (user_id, name, icon, color) VALUES
      (user_uuid, 'Food & Dining', '🍽️', '#10B981'),
      (user_uuid, 'Transportation', '🚗', '#3B82F6'),
      (user_uuid, 'Shopping', '🛒', '#8B5CF6'),
      (user_uuid, 'Entertainment', '🎬', '#F59E0B'),
      (user_uuid, 'Bills & Utilities', '⚡', '#EF4444'),
      (user_uuid, 'Healthcare', '🏥', '#06B6D4'),
      (user_uuid, 'Income', '💰', '#22C55E'),
      (user_uuid, 'Savings', '🏦', '#6366F1');
      
    category_count = 8;
  END IF;
  
  RETURN category_count;
END;
$$;

-- Add function to ensure complete user setup
CREATE OR REPLACE FUNCTION public.ensure_user_setup_complete(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  has_profile BOOLEAN := FALSE;
  has_settings BOOLEAN := FALSE;
  category_count INTEGER := 0;
BEGIN
  -- Check profile exists
  SELECT EXISTS(SELECT 1 FROM public.profiles WHERE user_id = user_uuid) INTO has_profile;
  
  -- Check settings exist
  SELECT EXISTS(SELECT 1 FROM public.user_settings WHERE user_id = user_uuid) INTO has_settings;
  
  -- Ensure categories exist
  SELECT public.ensure_user_has_categories(user_uuid) INTO category_count;
  
  -- Create missing profile if needed
  IF NOT has_profile THEN
    INSERT INTO public.profiles (user_id, first_name, display_name, preferred_currency)
    VALUES (user_uuid, 'User', 'User', 'NGN');
    has_profile = TRUE;
  END IF;
  
  -- Create missing settings if needed
  IF NOT has_settings THEN
    INSERT INTO public.user_settings (user_id) VALUES (user_uuid);
    has_settings = TRUE;
  END IF;
  
  RETURN has_profile AND has_settings AND (category_count > 0);
END;
$$;

-- Phase 5: Add welcome notification for new users
CREATE OR REPLACE FUNCTION public.create_welcome_notification()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Create welcome notification
  INSERT INTO public.notifications (user_id, type, priority, title, message)
  VALUES (
    NEW.user_id,
    'welcome',
    'low',
    'Welcome to Your Finance Tracker! 🎉',
    'Your account has been set up successfully. Start by adding your first account to begin tracking your finances.'
  );
  
  RETURN NEW;
END;
$$;

-- Add trigger for welcome notification
CREATE TRIGGER create_welcome_notification_on_profile_creation
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_welcome_notification();