
-- Create a table for sent messages
CREATE TABLE public.sent_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'SENT',
  parameters JSONB DEFAULT '[]'::jsonb,
  wamid TEXT,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.sent_messages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since this is for API logs)
CREATE POLICY "Allow all operations on sent_messages" 
  ON public.sent_messages 
  FOR ALL 
  USING (true);

-- Create trigger to update updated_at
CREATE TRIGGER update_sent_messages_updated_at
  BEFORE UPDATE ON public.sent_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
