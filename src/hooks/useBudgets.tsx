import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Budget {
  id: string;
  user_id: string;
  category_id: string;
  amount: number;
  period_start: string;
  period_end: string;
  created_at: string;
  updated_at: string;
  // Joined data
  category?: {
    name: string;
    icon?: string;
    color?: string;
  };
}

export const useBudgets = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchBudgets = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("budgets")
        .select(`
          *,
          category:categories(name, icon, color)
        `)
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setBudgets(data || []);
    } catch (err: any) {
      setError(err.message);
      toast.error("Failed to fetch budgets");
    } finally {
      setLoading(false);
    }
  };

  const createBudget = async (budgetData: Omit<Budget, "id" | "user_id" | "created_at" | "updated_at" | "category">) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("budgets")
        .insert([{ ...budgetData, user_id: user.id }])
        .select(`
          *,
          category:categories(name, icon, color)
        `)
        .single();

      if (error) throw error;
      
      toast.success("Budget created successfully");
      fetchBudgets(); // Refresh the list
      return data;
    } catch (err: any) {
      toast.error("Failed to create budget");
      throw err;
    }
  };

  const updateBudget = async (id: string, updates: Partial<Budget>) => {
    try {
      const { data, error } = await supabase
        .from("budgets")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user?.id)
        .select(`
          *,
          category:categories(name, icon, color)
        `)
        .single();

      if (error) throw error;
      
      toast.success("Budget updated successfully");
      fetchBudgets(); // Refresh the list
      return data;
    } catch (err: any) {
      toast.error("Failed to update budget");
      throw err;
    }
  };

  const deleteBudget = async (id: string) => {
    try {
      const { error } = await supabase
        .from("budgets")
        .delete()
        .eq("id", id)
        .eq("user_id", user?.id);

      if (error) throw error;
      
      toast.success("Budget deleted successfully");
      fetchBudgets(); // Refresh the list
    } catch (err: any) {
      toast.error("Failed to delete budget");
      throw err;
    }
  };

  const getCurrentMonthBudgets = () => {
    const now = new Date();
    const currentMonth = now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, '0');
    
    return budgets.filter(budget => {
      const budgetMonth = budget.period_start.slice(0, 7);
      return budgetMonth === currentMonth;
    });
  };

  const getTotalBudgetAmount = () => {
    return getCurrentMonthBudgets().reduce((total, budget) => total + Number(budget.amount), 0);
  };

  useEffect(() => {
    fetchBudgets();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Set up real-time subscription for budgets
    const channel = supabase
      .channel("budgets_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "budgets",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchBudgets();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    budgets,
    loading,
    error,
    createBudget,
    updateBudget,
    deleteBudget,
    getCurrentMonthBudgets,
    getTotalBudgetAmount,
    refetch: fetchBudgets,
  };
};