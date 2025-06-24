
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: 'imageUrl is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    console.log('Downloading image from URL:', imageUrl);

    // Get access token from api_settings
    const { data: settings, error: settingsError } = await supabase
      .from('api_settings')
      .select('access_token')
      .limit(1)
      .single();

    if (settingsError || !settings?.access_token) {
      console.error('Error getting access token:', settingsError);
      return new Response(JSON.stringify({ error: 'Access token not found' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Download the image using the access token
    const imageResponse = await fetch(imageUrl, {
      headers: {
        'Authorization': `Bearer ${settings.access_token}`
      }
    });

    if (!imageResponse.ok) {
      console.error('Failed to download image:', imageResponse.status, await imageResponse.text());
      return new Response(JSON.stringify({ 
        error: 'Failed to download image',
        status: imageResponse.status 
      }), {
        status: imageResponse.status,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Convert to base64
    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBase64 = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
    const contentType = imageResponse.headers.get('content-type') || 'image/jpeg';

    console.log('Image downloaded successfully, size:', imageBuffer.byteLength, 'bytes');

    return new Response(JSON.stringify({
      success: true,
      imageData: imageBase64,
      contentType: contentType,
      size: imageBuffer.byteLength
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error: any) {
    console.error('Error downloading image:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
};

serve(handler);
