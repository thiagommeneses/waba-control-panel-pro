-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'user',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create profiles table for user management
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check user roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

-- Create function to get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = auth.uid() 
  LIMIT 1;
$$;

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  
  -- Assign default user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Update RLS policies to be secure

-- Remove existing permissive policies
DROP POLICY IF EXISTS "Allow full access to api_settings" ON public.api_settings;
DROP POLICY IF EXISTS "Allow full access to api_logs" ON public.api_logs;
DROP POLICY IF EXISTS "Allow all operations on sent_messages" ON public.sent_messages;
DROP POLICY IF EXISTS "Allow all operations on client_responses" ON public.client_responses;

-- Create secure RLS policies for api_settings (admin only)
CREATE POLICY "Admin can manage api_settings" ON public.api_settings
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create secure RLS policies for api_logs (admin only)
CREATE POLICY "Admin can view api_logs" ON public.api_logs
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "System can insert api_logs" ON public.api_logs
  FOR INSERT WITH CHECK (true);

-- Create secure RLS policies for sent_messages (authenticated users)
CREATE POLICY "Authenticated users can view sent_messages" ON public.sent_messages
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can insert sent_messages" ON public.sent_messages
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Create secure RLS policies for client_responses (authenticated users)
CREATE POLICY "Authenticated users can view client_responses" ON public.client_responses
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "System can insert client_responses" ON public.client_responses
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Authenticated users can update client_responses" ON public.client_responses
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admin can delete client_responses" ON public.client_responses
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Create RLS policies for user_roles (users can view their own, admins can manage all)
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admin can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admin can view all profiles" ON public.profiles
  FOR SELECT USING (public.has_role(auth.uid(), 'admin'));