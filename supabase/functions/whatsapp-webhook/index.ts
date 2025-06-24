
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
  try {
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

    console.log('Expected signature:', expectedSignature);
    console.log('Received signature:', signature);
    
    return expectedSignature === signature;
  } catch (error) {
    console.error('Error verifying signature:', error);
    return false;
  }
}

async function downloadImage(imageId: string, accessToken: string): Promise<string | null> {
  try {
    console.log('Downloading image with ID:', imageId);
    
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
    console.log('Image data received:', imageData);
    return imageData.url || null;
  } catch (error) {
    console.error('Error downloading image:', error);
    return null;
  }
}

async function processMessage(message: WhatsAppMessage, contacts: any[], accessToken: string) {
  console.log('Processing message:', JSON.stringify(message, null, 2));
  
  const clientName = contacts?.find(c => c.wa_id === message.from)?.profile?.name;
  console.log('Client name found:', clientName);
  
  let messageType: string;
  let content: string | null = null;
  let imageUrl: string | null = null;
  let imageCaption: string | null = null;
  let buttonPayload: string | null = null;

  switch (message.type) {
    case 'text':
      messageType = 'text';
      content = message.text?.body || null;
      console.log('Processing text message:', content);
      break;
    
    case 'image':
      messageType = 'image';
      imageCaption = message.image?.caption || null;
      if (message.image?.id && accessToken) {
        imageUrl = await downloadImage(message.image.id, accessToken);
      }
      console.log('Processing image message - caption:', imageCaption, 'url:', imageUrl);
      break;
    
    case 'button':
      messageType = 'button_reply';
      content = message.button?.text || null;
      buttonPayload = message.button?.payload || null;
      console.log('Processing button message - text:', content, 'payload:', buttonPayload);
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
      console.log('Processing interactive message - content:', content, 'payload:', buttonPayload);
      break;
    
    default:
      messageType = message.type;
      content = JSON.stringify(message);
      console.log('Processing unknown message type:', messageType);
  }

  const insertData = {
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
  };

  console.log('Inserting data into client_responses:', JSON.stringify(insertData, null, 2));

  const { data, error } = await supabase
    .from('client_responses')
    .insert(insertData)
    .select();

  if (error) {
    console.error('Error inserting message:', error);
    throw error;
  }

  console.log('Message inserted successfully:', data);
  return data;
}

const handler = async (req: Request): Promise<Response> => {
  console.log('Webhook request received:', req.method, req.url);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight');
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
        console.log('Webhook verification failed - invalid token or mode');
        return new Response('Forbidden', {
          status: 403,
          headers: corsHeaders
        });
      }
    }

    // Handle webhook notifications (POST request)
    if (req.method === 'POST') {
      console.log('Processing POST webhook notification');
      
      const rawBody = await req.text();
      console.log('Raw body received:', rawBody);
      
      const signature = req.headers.get('x-hub-signature-256');
      console.log('Signature header:', signature);
      
      // Get webhook secret from database
      const { data: settings, error: settingsError } = await supabase
        .from('api_settings')
        .select('webhook_secret, access_token')
        .limit(1)
        .single();
      
      if (settingsError) {
        console.error('Error fetching settings:', settingsError);
        return new Response('Settings not found', {
          status: 500,
          headers: corsHeaders
        });
      }

      console.log('Settings loaded - has webhook_secret:', !!settings?.webhook_secret, 'has access_token:', !!settings?.access_token);

      // If webhook secret is configured, verify signature
      if (settings?.webhook_secret && signature) {
        const isValid = await verifyWebhookSignature(rawBody, signature, settings.webhook_secret);
        if (!isValid) {
          console.error('Invalid webhook signature');
          return new Response('Invalid signature', {
            status: 403,
            headers: corsHeaders
          });
        }
        console.log('Signature verified successfully');
      } else if (signature) {
        console.log('Signature provided but no webhook secret configured - skipping verification');
      } else {
        console.log('No signature verification required');
      }

      let payload: WhatsAppWebhookPayload;
      try {
        payload = JSON.parse(rawBody);
        console.log('Webhook payload parsed:', JSON.stringify(payload, null, 2));
      } catch (parseError) {
        console.error('Error parsing webhook payload:', parseError);
        return new Response('Invalid JSON payload', {
          status: 400,
          headers: corsHeaders
        });
      }

      // Process each entry
      let processedMessages = 0;
      for (const entry of payload.entry) {
        console.log('Processing entry:', entry.id);
        
        for (const change of entry.changes) {
          console.log('Processing change - field:', change.field);
          
          if (change.field === 'messages' && change.value.messages) {
            console.log('Found messages to process:', change.value.messages.length);
            
            for (const message of change.value.messages) {
              try {
                await processMessage(
                  message, 
                  change.value.contacts || [], 
                  settings?.access_token || ''
                );
                processedMessages++;
                console.log(`Message ${message.id} processed successfully`);
              } catch (messageError) {
                console.error(`Error processing message ${message.id}:`, messageError);
              }
            }
          } else {
            console.log('Skipping change - not a message or no messages present');
          }
        }
      }

      console.log(`Webhook processing completed. Total messages processed: ${processedMessages}`);

      return new Response(JSON.stringify({ 
        success: true, 
        processed_messages: processedMessages 
      }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }

    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders
    });

  } catch (error: any) {
    console.error('Webhook error:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack 
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
};

serve(handler);
