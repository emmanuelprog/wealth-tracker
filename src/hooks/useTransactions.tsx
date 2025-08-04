import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id?: string;
  merchant?: string;
  description?: string;
  amount: number;
  transaction_type: "expense" | "income" | "transfer";
  transaction_date: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  category?: {
    name: string;
    icon?: string;
    color?: string;
  };
  account?: {
    name: string;
    account_type: string;
  };
}

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchTransactions = async (limit?: number) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from("transactions")
        .select(`
          *,
          category:categories(name, icon, color),
          account:accounts(name, account_type)
        `)
        .eq("user_id", user.id)
        .order("transaction_date", { ascending: false })
        .order("created_at", { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      setTransactions(data || []);
    } catch (err: any) {
      setError(err.message);
      toast.error("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  const createTransaction = async (transactionData: Omit<Transaction, "id" | "user_id" | "created_at" | "updated_at" | "category" | "account">) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("transactions")
        .insert([{ ...transactionData, user_id: user.id }])
        .select(`
          *,
          category:categories(name, icon, color),
          account:accounts(name, account_type)
        `)
        .single();

      if (error) throw error;
      
      toast.success("Transaction created successfully");
      fetchTransactions(); // Refresh the list
      return data;
    } catch (err: any) {
      toast.error("Failed to create transaction");
      throw err;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user?.id)
        .select(`
          *,
          category:categories(name, icon, color),
          account:accounts(name, account_type)
        `)
        .single();

      if (error) throw error;
      
      toast.success("Transaction updated successfully");
      fetchTransactions(); // Refresh the list
      return data;
    } catch (err: any) {
      toast.error("Failed to update transaction");
      throw err;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id)
        .eq("user_id", user?.id);

      if (error) throw error;
      
      toast.success("Transaction deleted successfully");
      fetchTransactions(); // Refresh the list
    } catch (err: any) {
      toast.error("Failed to delete transaction");
      throw err;
    }
  };

  const getRecentTransactions = (count: number = 5) => {
    return transactions.slice(0, count);
  };

  const getTotalSpending = (startDate?: string, endDate?: string) => {
    let filtered = transactions.filter(t => t.transaction_type === 'expense');
    
    if (startDate) {
      filtered = filtered.filter(t => t.transaction_date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(t => t.transaction_date <= endDate);
    }
    
    return filtered.reduce((total, transaction) => total + Number(transaction.amount), 0);
  };

  const getTotalIncome = (startDate?: string, endDate?: string) => {
    let filtered = transactions.filter(t => t.transaction_type === 'income');
    
    if (startDate) {
      filtered = filtered.filter(t => t.transaction_date >= startDate);
    }
    if (endDate) {
      filtered = filtered.filter(t => t.transaction_date <= endDate);
    }
    
    return filtered.reduce((total, transaction) => total + Number(transaction.amount), 0);
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Set up real-time subscription for transactions
    const channel = supabase
      .channel("transactions_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    transactions,
    loading,
    error,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    getRecentTransactions,
    getTotalSpending,
    getTotalIncome,
    refetch: fetchTransactions,
  };
};