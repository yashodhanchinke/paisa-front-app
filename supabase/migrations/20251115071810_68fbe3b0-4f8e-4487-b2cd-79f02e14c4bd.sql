-- Update the default categories function with lower monthly limits (1000-4000 range)
CREATE OR REPLACE FUNCTION public.create_default_categories()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.categories (user_id, name, icon, color, monthly_limit) VALUES
    (NEW.user_id, 'Food', '🍔', '#ef4444', 3000.00),
    (NEW.user_id, 'Transport', '🚗', '#3b82f6', 2000.00),
    (NEW.user_id, 'Entertainment', '🎬', '#8b5cf6', 1500.00),
    (NEW.user_id, 'Shopping', '🛍️', '#ec4899', 2500.00),
    (NEW.user_id, 'Bills', '📱', '#f59e0b', 2000.00),
    (NEW.user_id, 'Income', '💰', '#10b981', NULL);
  RETURN NEW;
END;
$function$;