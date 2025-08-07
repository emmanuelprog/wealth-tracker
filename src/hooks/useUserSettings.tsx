import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface UserSettings {
  id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  budget_alerts: boolean;
  goal_reminders: boolean;
  transaction_notifications: boolean;
  weekly_summary: boolean;
  monthly_report: boolean;
  low_balance_threshold: number;
  created_at: string;
  updated_at: string;
}

export const useUserSettings = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchSettings = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        // Create default settings if none exist
        const defaultSettings = {
          user_id: user.id,
          email_notifications: true,
          push_notifications: true,
          budget_alerts: true,
          goal_reminders: true,
          transaction_notifications: false,
          weekly_summary: true,
          monthly_report: true,
          low_balance_threshold: 100.00,
        };

        const { data: newSettings, error: createError } = await supabase
          .from("user_settings")
          .insert([defaultSettings])
          .select()
          .single();

        if (createError) throw createError;
        setSettings(newSettings);
      } else {
        setSettings(data);
      }
    } catch (err: any) {
      setError(err.message);
      console.error("Error fetching user settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<UserSettings>) => {
    if (!user || !settings) return null;

    try {
      const { data, error } = await supabase
        .from("user_settings")
        .update(updates)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      
      setSettings(data);
      toast.success("Settings updated successfully");
      return data;
    } catch (err: any) {
      toast.error("Failed to update settings");
      throw err;
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Set up real-time subscription for settings changes
    const channel = supabase
      .channel("user_settings_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "user_settings",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchSettings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    settings,
    loading,
    error,
    updateSettings,
    refetch: fetchSettings,
  };
};