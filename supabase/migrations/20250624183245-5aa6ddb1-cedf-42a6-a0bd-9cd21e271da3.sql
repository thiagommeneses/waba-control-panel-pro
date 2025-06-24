
-- Create a table for client responses
CREATE TABLE public.client_responses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  message_type TEXT NOT NULL, -- 'text', 'image', 'button_reply', 'interactive'
  content TEXT, -- Text content or button text
  image_url TEXT, -- For image responses
  image_caption TEXT, -- Caption for images
  button_payload TEXT, -- For button/quick reply responses
  wamid TEXT, -- WhatsApp message ID
  timestamp_received TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  context_wamid TEXT, -- Reference to original message this is replying to
  client_name TEXT,
  metadata JSONB DEFAULT '{}'::jsonb, -- Additional metadata
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS)
ALTER TABLE public.client_responses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (since this is for client response logs)
CREATE POLICY "Allow all operations on client_responses" 
  ON public.client_responses 
  FOR ALL 
  USING (true);

-- Create trigger to update updated_at
CREATE TRIGGER update_client_responses_updated_at
  BEFORE UPDATE ON public.client_responses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_client_responses_phone_number ON public.client_responses(phone_number);
CREATE INDEX idx_client_responses_timestamp ON public.client_responses(timestamp_received DESC);
CREATE INDEX idx_client_responses_message_type ON public.client_responses(message_type);
