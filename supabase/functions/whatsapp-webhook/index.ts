
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WhatsAppMessage {
  id: string;
  from: string;
  timestamp: string;
  type: string;
  text?: {
    body: string;
  };
  image?: {
    id: string;
    mime_type: string;
    sha256: string;
    caption?: string;
  };
  button?: {
    text: string;
    payload: string;
  };
  interactive?: {
    type: string;
    button_reply?: {
      id: string;
      title: string;
    };
    list_reply?: {
      id: string;
      title: string;
    };
  };
  context?: {
    id: string;
  };
}

interface WhatsAppWebhookEntry {
  id: string;
  changes: Array<{
    value: {
      messaging_product: string;
      metadata: {
        display_phone_number: string;
        phone_number_id: string;
      };
      contacts?: Array<{
        profile: {
          name: string;
        };
        wa_id: string;
      }>;
      messages?: WhatsAppMessage[];
      statuses?: Array<{
        id: string;
        status: string;
        timestamp: string;
        recipient_id: string;
      }>;
    };
    field: string;
  }>;
}

interface WhatsAppWebhookPayload {
  object: string;
  entry: WhatsAppWebhookEntry[];
}

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

async function verifyWebhookSignature(body: string, signature: string, secret: string): Promise<boolean> {
  const expectedSignature = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  ).then(key => 
    crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body))
  ).then(signature => 
    'sha256=' + Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('')
  );

  return expectedSignature === signature;
}

async function downloadImage(imageId: string, accessToken: string): Promise<string | null> {
  try {
    // First get the image URL
    const imageResponse = await fetch(`https://graph.facebook.com/v23.0/${imageId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    });
    
    if (!imageResponse.ok) {
      console.error('Failed to get image info:', await imageResponse.text());
      return null;
    }
    
    const imageData = await imageResponse.json();
    return imageData.url || null;
  } catch (error) {
    console.error('Error downloading image:', error);
    return null;
  }
}

async function processMessage(message: WhatsAppMessage, contacts: any[], accessToken: string) {
  console.log('Processing message:', message);
  
  const clientName = contacts?.find(c => c.wa_id === message.from)?.profile?.name;
  
  let messageType: string;
  let content: string | null = null;
  let imageUrl: string | null = null;
  let imageCaption: string | null = null;
  let buttonPayload: string | null = null;

  switch (message.type) {
    case 'text':
      messageType = 'text';
      content = message.text?.body || null;
      break;
    
    case 'image':
      messageType = 'image';
      imageCaption = message.image?.caption || null;
      if (message.image?.id) {
        imageUrl = await downloadImage(message.image.id, accessToken);
      }
      break;
    
    case 'button':
      messageType = 'button_reply';
      content = message.button?.text || null;
      buttonPayload = message.button?.payload || null;
      break;
    
    case 'interactive':
      messageType = 'interactive';
      if (message.interactive?.button_reply) {
        content = message.interactive.button_reply.title;
        buttonPayload = message.interactive.button_reply.id;
      } else if (message.interactive?.list_reply) {
        content = message.interactive.list_reply.title;
        buttonPayload = message.interactive.list_reply.id;
      }
      break;
    
    default:
      messageType = message.type;
      content = JSON.stringify(message);
  }

  const { error } = await supabase
    .from('client_responses')
    .insert({
      phone_number: message.from,
      message_type: messageType,
      content,
      image_url: imageUrl,
      image_caption: imageCaption,
      button_payload: buttonPayload,
      wamid: message.id,
      timestamp_received: new Date(parseInt(message.timestamp) * 1000).toISOString(),
      context_wamid: message.context?.id || null,
      client_name: clientName,
      metadata: message
    });

  if (error) {
    console.error('Error inserting message:', error);
    throw error;
  }

  console.log('Message processed successfully');
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    
    // Handle webhook verification (GET request)
    if (req.method === 'GET') {
      const mode = url.searchParams.get('hub.mode');
      const token = url.searchParams.get('hub.verify_token');
      const challenge = url.searchParams.get('hub.challenge');
      
      console.log('Webhook verification request:', { mode, token, challenge });
      
      if (mode === 'subscribe' && token === 'webhook_verify_token') {
        console.log('Webhook verified successfully');
        return new Response(challenge, {
          status: 200,
          headers: corsHeaders
        });
      } else {
        console.log('Webhook verification failed');
        return new Response('Forbidden', {
          status: 403,
          headers: corsHeaders
        });
      }
    }

    // Handle webhook notifications (POST request)
    if (req.method === 'POST') {
      const rawBody = await req.text();
      const signature = req.headers.get('x-hub-signature-256');
      
      // Get webhook secret from database
      const { data: settings } = await supabase
        .from('api_settings')
        .select('webhook_secret, access_token')
        .limit(1)
        .single();
      
      if (!settings?.webhook_secret) {
        console.error('Webhook secret not configured');
        return new Response('Webhook secret not configured', {
          status: 500,
          headers: corsHeaders
        });
      }

      // Verify signature if provided
      if (signature) {
        const isValid = await verifyWebhookSignature(rawBody, signature, settings.webhook_secret);
        if (!isValid) {
          console.error('Invalid webhook signature');
          return new Response('Invalid signature', {
            status: 403,
            headers: corsHeaders
          });
        }
      }

      const payload: WhatsAppWebhookPayload = JSON.parse(rawBody);
      console.log('Webhook payload received:', JSON.stringify(payload, null, 2));

      // Process each entry
      for (const entry of payload.entry) {
        for (const change of entry.changes) {
          if (change.field === 'messages' && change.value.messages) {
            for (const message of change.value.messages) {
              await processMessage(
                message, 
                change.value.contacts || [], 
                settings.access_token
              );
            }
          }
        }
      }

      return new Response('OK', {
        status: 200,
        headers: corsHeaders
      });
    }

    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders
    });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
};

serve(handler);
