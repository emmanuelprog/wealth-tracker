-- Add trigger to create default user settings when a user signs up
CREATE OR REPLACE FUNCTION public.create_default_user_settings()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  INSERT INTO public.user_settings (user_id) 
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$;

-- Trigger to create default settings when profile is created
CREATE TRIGGER create_user_settings_on_profile_creation
  AFTER INSERT ON public.profiles
  FOR EACH ROW 
  EXECUTE FUNCTION public.create_default_user_settings();

-- Function to update account balance when transactions are modified
CREATE OR REPLACE FUNCTION public.update_account_balance()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  old_amount NUMERIC := 0;
  new_amount NUMERIC := 0;
BEGIN
  -- Handle INSERT
  IF TG_OP = 'INSERT' THEN
    IF NEW.transaction_type = 'income' THEN
      UPDATE accounts 
      SET balance = balance + NEW.amount 
      WHERE id = NEW.account_id;
    ELSE
      UPDATE accounts 
      SET balance = balance - NEW.amount 
      WHERE id = NEW.account_id;
    END IF;
    RETURN NEW;
  END IF;

  -- Handle UPDATE
  IF TG_OP = 'UPDATE' THEN
    -- Reverse old transaction
    IF OLD.transaction_type = 'income' THEN
      old_amount := -OLD.amount;
    ELSE
      old_amount := OLD.amount;
    END IF;
    
    -- Apply new transaction
    IF NEW.transaction_type = 'income' THEN
      new_amount := NEW.amount;
    ELSE
      new_amount := -NEW.amount;
    END IF;
    
    -- Update account balance if account changed
    IF OLD.account_id != NEW.account_id THEN
      UPDATE accounts SET balance = balance + old_amount WHERE id = OLD.account_id;
      UPDATE accounts SET balance = balance + new_amount WHERE id = NEW.account_id;
    ELSE
      UPDATE accounts SET balance = balance + old_amount + new_amount WHERE id = NEW.account_id;
    END IF;
    
    RETURN NEW;
  END IF;

  -- Handle DELETE
  IF TG_OP = 'DELETE' THEN
    IF OLD.transaction_type = 'income' THEN
      UPDATE accounts 
      SET balance = balance - OLD.amount 
      WHERE id = OLD.account_id;
    ELSE
      UPDATE accounts 
      SET balance = balance + OLD.amount 
      WHERE id = OLD.account_id;
    END IF;
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

-- Create triggers for account balance updates
CREATE TRIGGER update_account_balance_on_transaction_insert
  AFTER INSERT ON public.transactions
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_account_balance();

CREATE TRIGGER update_account_balance_on_transaction_update
  AFTER UPDATE ON public.transactions
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_account_balance();

CREATE TRIGGER update_account_balance_on_transaction_delete
  AFTER DELETE ON public.transactions
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_account_balance();

-- Function to update goal progress when goal transactions are added
CREATE OR REPLACE FUNCTION public.update_goal_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  goal_record RECORD;
  new_current_amount NUMERIC;
BEGIN
  -- Get the goal details
  SELECT * INTO goal_record FROM goals WHERE id = COALESCE(NEW.goal_id, OLD.goal_id);
  
  IF TG_OP = 'INSERT' THEN
    -- Calculate new current amount
    SELECT COALESCE(SUM(amount), 0) INTO new_current_amount 
    FROM goal_transactions 
    WHERE goal_id = NEW.goal_id;
    
    -- Update goal current amount and completion status
    UPDATE goals 
    SET 
      current_amount = new_current_amount,
      is_completed = (new_current_amount >= target_amount),
      updated_at = now()
    WHERE id = NEW.goal_id;
    
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    -- Calculate new current amount
    SELECT COALESCE(SUM(amount), 0) INTO new_current_amount 
    FROM goal_transactions 
    WHERE goal_id = NEW.goal_id;
    
    -- Update goal current amount and completion status
    UPDATE goals 
    SET 
      current_amount = new_current_amount,
      is_completed = (new_current_amount >= target_amount),
      updated_at = now()
    WHERE id = NEW.goal_id;
    
    RETURN NEW;
  END IF;

  IF TG_OP = 'DELETE' THEN
    -- Calculate new current amount
    SELECT COALESCE(SUM(amount), 0) INTO new_current_amount 
    FROM goal_transactions 
    WHERE goal_id = OLD.goal_id;
    
    -- Update goal current amount and completion status
    UPDATE goals 
    SET 
      current_amount = new_current_amount,
      is_completed = (new_current_amount >= target_amount),
      updated_at = now()
    WHERE id = OLD.goal_id;
    
    RETURN OLD;
  END IF;

  RETURN NULL;
END;
$$;

-- Create triggers for goal progress updates
CREATE TRIGGER update_goal_progress_on_transaction_insert
  AFTER INSERT ON public.goal_transactions
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_goal_progress();

CREATE TRIGGER update_goal_progress_on_transaction_update
  AFTER UPDATE ON public.goal_transactions
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_goal_progress();

CREATE TRIGGER update_goal_progress_on_transaction_delete
  AFTER DELETE ON public.goal_transactions
  FOR EACH ROW 
  EXECUTE FUNCTION public.update_goal_progress();

-- Function to create budget alerts and notifications
CREATE OR REPLACE FUNCTION public.check_budget_alerts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  budget_record RECORD;
  total_spent NUMERIC;
  alert_threshold NUMERIC := 0.8; -- 80% of budget
BEGIN
  -- Find budgets for this category in the current period
  FOR budget_record IN 
    SELECT b.*, c.name as category_name 
    FROM budgets b 
    JOIN categories c ON b.category_id = c.id
    WHERE b.category_id = NEW.category_id 
    AND b.user_id = NEW.user_id
    AND NEW.transaction_date BETWEEN b.period_start AND b.period_end
  LOOP
    -- Calculate total spending for this category in the budget period
    SELECT COALESCE(SUM(amount), 0) INTO total_spent
    FROM transactions 
    WHERE category_id = budget_record.category_id 
    AND user_id = NEW.user_id
    AND transaction_type = 'expense'
    AND transaction_date BETWEEN budget_record.period_start AND budget_record.period_end;
    
    -- Check if spending exceeds alert threshold (80% of budget)
    IF total_spent >= (budget_record.amount * alert_threshold) AND total_spent < budget_record.amount THEN
      INSERT INTO notifications (user_id, type, priority, title, message)
      VALUES (
        NEW.user_id,
        'budget_alert',
        'medium',
        'Budget Alert: ' || budget_record.category_name,
        'You have spent ' || ROUND((total_spent / budget_record.amount * 100), 0) || '% of your ' || budget_record.category_name || ' budget this period.'
      );
    END IF;
    
    -- Check if spending exceeds budget
    IF total_spent > budget_record.amount THEN
      INSERT INTO notifications (user_id, type, priority, title, message)
      VALUES (
        NEW.user_id,
        'budget_exceeded',
        'high',
        'Budget Exceeded: ' || budget_record.category_name,
        'You have exceeded your ' || budget_record.category_name || ' budget by ' || ROUND((total_spent - budget_record.amount), 2) || '.'
      );
    END IF;
  END LOOP;
  
  RETURN NEW;
END;
$$;

-- Create trigger for budget alerts
CREATE TRIGGER check_budget_alerts_on_expense
  AFTER INSERT ON public.transactions
  FOR EACH ROW 
  WHEN (NEW.transaction_type = 'expense' AND NEW.category_id IS NOT NULL)
  EXECUTE FUNCTION public.check_budget_alerts();

-- Function to check low balance alerts
CREATE OR REPLACE FUNCTION public.check_low_balance_alerts()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  user_threshold NUMERIC;
  account_name TEXT;
BEGIN
  -- Get user's low balance threshold
  SELECT low_balance_threshold INTO user_threshold
  FROM user_settings 
  WHERE user_id = NEW.user_id;
  
  -- Get account name
  SELECT name INTO account_name
  FROM accounts
  WHERE id = NEW.account_id;
  
  -- Check if new balance is below threshold
  IF NEW.balance <= COALESCE(user_threshold, 100) AND NEW.balance > 0 THEN
    INSERT INTO notifications (user_id, type, priority, title, message)
    VALUES (
      NEW.user_id,
      'low_balance',
      'medium',
      'Low Balance Alert: ' || account_name,
      'Your ' || account_name || ' account balance is low: ' || NEW.balance || '. Consider adding funds.'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for low balance alerts
CREATE TRIGGER check_low_balance_on_account_update
  AFTER UPDATE OF balance ON public.accounts
  FOR EACH ROW 
  WHEN (NEW.balance < OLD.balance)
  EXECUTE FUNCTION public.check_low_balance_alerts();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_transactions_user_date ON transactions(user_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_category_date ON transactions(category_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_transactions_account_date ON transactions(account_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_budgets_user_period ON budgets(user_id, period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_goals_user_completed ON goals(user_id, is_completed);