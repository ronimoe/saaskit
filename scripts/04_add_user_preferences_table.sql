-- Migration: Add user_preferences table for storing individual user UI and accessibility settings
-- This table stores preferences that are specific to each user's experience with the application

-- Create user_preferences table
CREATE TABLE public.user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Display Preferences
  theme_mode text DEFAULT 'system' CHECK (theme_mode IN ('system', 'light', 'dark')),
  compact_mode boolean DEFAULT false,
  reduce_motion boolean DEFAULT false,
  
  -- Accessibility Preferences  
  high_contrast boolean DEFAULT false,
  large_text boolean DEFAULT false,
  screen_reader_optimized boolean DEFAULT false,
  
  -- Notification Preferences (UI-specific)
  browser_notifications boolean DEFAULT false,
  sound_effects boolean DEFAULT false,
  
  -- Developer Options
  debug_mode boolean DEFAULT false,
  show_layout_guides boolean DEFAULT false,
  console_logging boolean DEFAULT true,
  
  -- Additional UI preferences (extensible)
  enable_animations boolean DEFAULT true,
  enable_glassmorphism boolean DEFAULT true,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- Constraints
  CONSTRAINT unique_user_preferences UNIQUE(user_id)
);

-- Create indexes for performance
CREATE INDEX idx_user_preferences_user_id ON public.user_preferences(user_id);

-- Enable RLS
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own preferences
CREATE POLICY "Users can view own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- Service role can access all preferences for admin operations
CREATE POLICY "Service role full access" ON public.user_preferences
  FOR ALL USING (current_setting('role') = 'service_role');

-- Create trigger for updating updated_at timestamp
CREATE TRIGGER update_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to get or create user preferences with defaults
CREATE OR REPLACE FUNCTION public.get_or_create_user_preferences(p_user_id uuid)
RETURNS public.user_preferences
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  prefs public.user_preferences;
BEGIN
  -- Try to get existing preferences
  SELECT * INTO prefs
  FROM public.user_preferences
  WHERE user_id = p_user_id;
  
  -- If not found, create with defaults
  IF NOT FOUND THEN
    INSERT INTO public.user_preferences (user_id)
    VALUES (p_user_id)
    RETURNING * INTO prefs;
  END IF;
  
  RETURN prefs;
END;
$$;

-- Grant appropriate permissions
GRANT SELECT, INSERT, UPDATE ON public.user_preferences TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_or_create_user_preferences(uuid) TO authenticated; 