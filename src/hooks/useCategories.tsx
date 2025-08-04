import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchCategories = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("user_id", user.id)
        .order("name", { ascending: true });

      if (error) throw error;
      setCategories(data || []);
    } catch (err: any) {
      setError(err.message);
      toast.error("Failed to fetch categories");
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (categoryData: Omit<Category, "id" | "user_id" | "created_at" | "updated_at">) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("categories")
        .insert([{ ...categoryData, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Category created successfully");
      fetchCategories(); // Refresh the list
      return data;
    } catch (err: any) {
      toast.error("Failed to create category");
      throw err;
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      const { data, error } = await supabase
        .from("categories")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user?.id)
        .select()
        .single();

      if (error) throw error;
      
      toast.success("Category updated successfully");
      fetchCategories(); // Refresh the list
      return data;
    } catch (err: any) {
      toast.error("Failed to update category");
      throw err;
    }
  };

  const deleteCategory = async (id: string) => {
    try {
      const { error } = await supabase
        .from("categories")
        .delete()
        .eq("id", id)
        .eq("user_id", user?.id);

      if (error) throw error;
      
      toast.success("Category deleted successfully");
      fetchCategories(); // Refresh the list
    } catch (err: any) {
      toast.error("Failed to delete category");
      throw err;
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    // Set up real-time subscription for categories
    const channel = supabase
      .channel("categories_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "categories",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          fetchCategories();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    refetch: fetchCategories,
  };
};