import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface DataValidationStatus {
  hasProfile: boolean;
  hasCategories: boolean;
  hasSettings: boolean;
  isComplete: boolean;
  isValidating: boolean;
}

export const useDataValidation = () => {
  const [status, setStatus] = useState<DataValidationStatus>({
    hasProfile: false,
    hasCategories: false,
    hasSettings: false,
    isComplete: false,
    isValidating: true,
  });
  const { user } = useAuth();

  const validateUserData = async () => {
    if (!user) return;

    setStatus(prev => ({ ...prev, isValidating: true }));

    try {
      // Check for complete user setup
      const { data: setupComplete } = await supabase
        .rpc('ensure_user_setup_complete', { user_uuid: user.id });

      if (setupComplete) {
        // Validate each component
        const [profileResult, categoriesResult, settingsResult] = await Promise.all([
          supabase.from("profiles").select("id").eq("user_id", user.id).single(),
          supabase.from("categories").select("id").eq("user_id", user.id).limit(1),
          supabase.from("user_settings").select("id").eq("user_id", user.id).single(),
        ]);

        const hasProfile = !profileResult.error;
        const hasCategories = !categoriesResult.error && categoriesResult.data.length > 0;
        const hasSettings = !settingsResult.error;

        setStatus({
          hasProfile,
          hasCategories,
          hasSettings,
          isComplete: hasProfile && hasCategories && hasSettings,
          isValidating: false,
        });

        // Show success message if everything is set up
        if (hasProfile && hasCategories && hasSettings) {
          console.log("✅ User data validation complete - all systems ready");
        }
      }
    } catch (error) {
      console.error("Error validating user data:", error);
      toast.error("There was an issue validating your account setup");
      setStatus(prev => ({ ...prev, isValidating: false }));
    }
  };

  const repairUserData = async () => {
    if (!user) return false;

    try {
      toast.loading("Repairing account data...");
      
      const { data: repaired } = await supabase
        .rpc('ensure_user_setup_complete', { user_uuid: user.id });

      if (repaired) {
        await validateUserData();
        toast.success("Account data has been restored successfully!");
        return true;
      }
    } catch (error) {
      console.error("Error repairing user data:", error);
      toast.error("Failed to repair account data");
    }

    return false;
  };

  useEffect(() => {
    validateUserData();
  }, [user]);

  // Set up real-time validation for critical tables
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('user_data_validation')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${user.id}`,
        },
        () => validateUserData()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'categories',
          filter: `user_id=eq.${user.id}`,
        },
        () => validateUserData()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_settings',
          filter: `user_id=eq.${user.id}`,
        },
        () => validateUserData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    status,
    validateUserData,
    repairUserData,
  };
};