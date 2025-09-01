// create-project Edge Function
// Verifies signature and inserts a new project with 'pending' status

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.0';
import { ethers } from 'https://esm.sh/ethers@5.7.2';

// Initialize Supabase client with service role key (for admin access)
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const supabase = createClient(supabaseUrl, supabaseServiceKey);

Deno.serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    // Parse request body
    const { payload, signature } = await req.json();
    
    // Validate required fields
    if (!payload || !signature) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Extract project data and metadata
    const { 
      address, 
      timestamp, 
      title, 
      summary, 
      description, 
      category, 
      region, 
      beneficiary_address,
      cover_image_url,
      images = []
    } = payload;
    
    // Validate timestamp (prevent replay attacks)
    const now = Date.now();
    const fiveMinutesAgo = now - 5 * 60 * 1000;
    if (timestamp < fiveMinutesAgo || timestamp > now) {
      return new Response(
        JSON.stringify({ error: 'Invalid timestamp' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Verify signature
    const message = JSON.stringify(payload);
    const recoveredAddress = ethers.utils.verifyMessage(message, signature);
    
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return new Response(
        JSON.stringify({ error: 'Invalid signature' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Get user profile by wallet address
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('wallet_address', address)
      .single();
    
    if (profileError || !profileData) {
      return new Response(
        JSON.stringify({ error: 'User profile not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Generate a slug from the title
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50) + 
      '-' + 
      Math.random().toString(36).substring(2, 8);
    
    // Insert project with 'pending' status
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .insert({
        title,
        slug,
        summary,
        description,
        category,
        region,
        beneficiary_address,
        cover_image_url,
        images: images.length ? images : null,
        status: 'pending',
        owner_id: profileData.id
      })
      .select()
      .single();
    
    if (projectError) {
      console.error('Error creating project:', projectError);
      return new Response(
        JSON.stringify({ error: 'Failed to create project' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Project created and pending approval',
        project: projectData
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in create-project function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
