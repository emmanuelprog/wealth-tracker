-- Fix function search path for security
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

-- Fix function search path for user categories creation
CREATE OR REPLACE FUNCTION public.create_default_categories_for_user()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.categories (user_id, name, icon, color) VALUES
    (NEW.id, 'Food & Dining', '🍽️', '#10B981'),
    (NEW.id, 'Transportation', '🚗', '#3B82F6'),
    (NEW.id, 'Shopping', '🛒', '#8B5CF6'),
    (NEW.id, 'Entertainment', '🎬', '#F59E0B'),
    (NEW.id, 'Bills & Utilities', '⚡', '#EF4444'),
    (NEW.id, 'Healthcare', '🏥', '#06B6D4'),
    (NEW.id, 'Income', '💰', '#22C55E'),
    (NEW.id, 'Savings', '🏦', '#6366F1');
  
  RETURN NEW;
END;
$$;