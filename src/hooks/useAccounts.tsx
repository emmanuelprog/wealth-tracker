import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Account {
  id: string;
  name: string;
  account_type: "checking" | "savings" | "credit_card" | "investment" | "loan" | "other";
  balance: number;
  currency: string;
  institution_name?: string;
  account_number_last_four?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const useAccounts = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchAccounts = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("accounts")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setAccounts(data || []);
    } catch (err: any) {
      setError(err.message);
      toast.error("Failed to fetch accounts");
    } finally {
      setLoading(false);
    }
  };

  const createAccount = async (accountData: Omit<Account, "id" | "created_at" | "updated_at">) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("accounts")
        .insert([{ ...accountData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Account created successfully");
      fetchAccounts(); // Refresh the list
      return data;
    } catch (err: any) {
      toast.error("Failed to create account");
      throw err;
    }
  };

  const updateAccount = async (id: string, updates: Partial<Account>) => {
    try {
      const { data, error } = await supabase
        .from("accounts")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user?.id)
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Account updated successfully");
      fetchAccounts(); // Refresh the list
      return data;
    } catch (err: any) {
      toast.error("Failed to update account");
      throw err;
    }
  };

  const deleteAccount = async (id: string) => {
    try {
      const { error } = await supabase
        .from("accounts")
        .update({ is_active: false })
        .eq("id", id)
        .eq("user_id", user?.id);

      if (error) throw error;
      
      toast.success("Account deleted successfully");
      fetchAccounts(); // Refresh the list
    } catch (err: any) {
      toast.error("Failed to delete account");
      throw err;
    }
  };

  const getTotalBalance = () => {
    return accounts.reduce((total, account) => total + Number(account.balance), 0);
  };

  useEffect(() => {
    fetchAccounts();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Set up real-time subscription for accounts
    const channel = supabase
      .channel("accounts_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "accounts",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchAccounts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    accounts,
    loading,
    error,
    createAccount,
    updateAccount,
    deleteAccount,
    getTotalBalance,
    refetch: fetchAccounts,
  };
};