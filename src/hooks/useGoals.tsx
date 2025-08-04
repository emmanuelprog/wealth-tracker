import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  goal_type: "savings" | "investment" | "other" | "debt_reduction" | "emergency_fund";
  target_amount: number;
  current_amount: number;
  target_date?: string;
  priority: "low" | "medium" | "high";
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface GoalTransaction {
  id: string;
  goal_id: string;
  transaction_id?: string;
  amount: number;
  description?: string;
  created_at: string;
}

export const useGoals = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchGoals = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setGoals(data || []);
    } catch (err: any) {
      setError(err.message);
      toast.error("Failed to fetch goals");
    } finally {
      setLoading(false);
    }
  };

  const createGoal = async (goalData: Omit<Goal, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("goals")
        .insert([{ ...goalData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Goal created successfully");
      fetchGoals(); // Refresh the list
      return data;
    } catch (err: any) {
      toast.error("Failed to create goal");
      throw err;
    }
  };

  const updateGoal = async (id: string, updates: Partial<Goal>) => {
    try {
      const { data, error } = await supabase
        .from("goals")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user?.id)
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Goal updated successfully");
      fetchGoals(); // Refresh the list
      return data;
    } catch (err: any) {
      toast.error("Failed to update goal");
      throw err;
    }
  };

  const deleteGoal = async (id: string) => {
    try {
      const { error } = await supabase
        .from("goals")
        .delete()
        .eq("id", id)
        .eq("user_id", user?.id);

      if (error) throw error;
      
      toast.success("Goal deleted successfully");
      fetchGoals(); // Refresh the list
    } catch (err: any) {
      toast.error("Failed to delete goal");
      throw err;
    }
  };

  const addGoalTransaction = async (goalId: string, amount: number, description?: string) => {
    try {
      const { data, error } = await supabase
        .from("goal_transactions")
        .insert([{
          goal_id: goalId,
          amount,
          description
        }])
        .select()
        .single();

      if (error) throw error;

      // Update the goal's current amount
      const goal = goals.find(g => g.id === goalId);
      if (goal) {
        await updateGoal(goalId, {
          current_amount: Number(goal.current_amount) + amount
        });
      }
      
      toast.success("Goal transaction added successfully");
      return data;
    } catch (err: any) {
      toast.error("Failed to add goal transaction");
      throw err;
    }
  };

  const getSavingsGoals = () => {
    return goals.filter(goal => goal.goal_type === 'savings');
  };

  const getDebtGoals = () => {
    return goals.filter(goal => goal.goal_type === 'debt_reduction');
  };

  const getTotalSavingsTarget = () => {
    return getSavingsGoals().reduce((total, goal) => total + Number(goal.target_amount), 0);
  };

  const getTotalSavingsProgress = () => {
    return getSavingsGoals().reduce((total, goal) => total + Number(goal.current_amount), 0);
  };

  const getTotalDebtRemaining = () => {
    return getDebtGoals().reduce((total, goal) => total + (Number(goal.target_amount) - Number(goal.current_amount)), 0);
  };

  useEffect(() => {
    fetchGoals();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Set up real-time subscription for goals
    const channel = supabase
      .channel("goals_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "goals",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchGoals();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    goals,
    loading,
    error,
    createGoal,
    updateGoal,
    deleteGoal,
    addGoalTransaction,
    getSavingsGoals,
    getDebtGoals,
    getTotalSavingsTarget,
    getTotalSavingsProgress,
    getTotalDebtRemaining,
    refetch: fetchGoals,
  };
};