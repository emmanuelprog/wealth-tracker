-- Add missing DELETE policies for user data tables to ensure privacy compliance

-- Add DELETE policy for profiles table
CREATE POLICY "Users can delete their own profile" 
ON public.profiles 
FOR DELETE 
USING (auth.uid() = user_id);

-- Add DELETE policy for user_settings table  
CREATE POLICY "Users can delete their own settings"
ON public.user_settings 
FOR DELETE 
USING (auth.uid() = user_id);