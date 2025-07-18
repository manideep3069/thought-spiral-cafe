-- Enable RLS on posts table
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to posts
CREATE POLICY "Allow public read access to posts"
ON public.posts
FOR SELECT
USING (true);

-- Create policy for users to insert their own posts
CREATE POLICY "Users can insert their own posts"
ON public.posts
FOR INSERT
WITH CHECK (true);

-- Create policy for users to update their own posts
CREATE POLICY "Users can update their own posts"
ON public.posts
FOR UPDATE
USING (true);

-- Enable RLS on discussions table
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to discussions
CREATE POLICY "Allow public read access to discussions"
ON public.discussions
FOR SELECT
USING (true);

-- Create policy for users to insert discussions
CREATE POLICY "Users can insert discussions"
ON public.discussions
FOR INSERT
WITH CHECK (true);

-- Enable RLS on profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for public read access to profiles
CREATE POLICY "Allow public read access to profiles"
ON public.profiles
FOR SELECT
USING (true);

-- Create policy for users to insert profiles
CREATE POLICY "Users can insert profiles"
ON public.profiles
FOR INSERT
WITH CHECK (true);

-- Create policy for users to update profiles
CREATE POLICY "Users can update profiles"
ON public.profiles
FOR UPDATE
USING (true);