import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { OnboardingWelcome } from "./OnboardingWelcome";
import { FirstAccountSetup } from "./FirstAccountSetup";

interface OnboardingFlowProps {
  onComplete: () => void;
}

export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [userProfile, setUserProfile] = useState<any>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        try {
          // Ensure user has complete setup before proceeding
          await supabase.rpc('ensure_user_setup_complete', { 
            user_uuid: user.id 
          });
          
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("user_id", user.id)
            .single();
          
          setUserProfile(data);
        } catch (error) {
          console.error('Error setting up user profile:', error);
          // Fallback to basic profile data
          setUserProfile({
            user_id: user.id,
            first_name: 'User',
            display_name: 'User',
            preferred_currency: 'NGN'
          });
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Setting up your profile...</p>
        </div>
      </div>
    );
  }

  const handleWelcomeNext = () => {
    setCurrentStep(2);
  };

  const handleAccountSetupComplete = () => {
    onComplete();
  };

  if (currentStep === 1) {
    return (
      <OnboardingWelcome
        userName={userProfile.first_name || "there"}
        preferredCurrency={userProfile.preferred_currency || "NGN"}
        onNext={handleWelcomeNext}
      />
    );
  }

  if (currentStep === 2) {
    return (
      <FirstAccountSetup
        preferredCurrency={userProfile.preferred_currency || "NGN"}
        onComplete={handleAccountSetupComplete}
      />
    );
  }

  return null;
};