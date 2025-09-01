// submit-donation Edge Function
// Handles manual donation submission with tx hash capture

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
    
    // Extract donation data
    const { 
      address, 
      timestamp, 
      projectId, 
      amount,
      txHash
    } = payload;
    
    // Validate required donation fields
    if (!projectId || !amount || !txHash) {
      return new Response(
        JSON.stringify({ error: 'Missing required donation fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
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
    
    // Check if project exists
    const { data: projectData, error: projectError } = await supabase
      .from('projects')
      .select('id, status')
      .eq('id', projectId)
      .single();
    
    if (projectError || !projectData) {
      return new Response(
        JSON.stringify({ error: 'Project not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if project is live
    if (projectData.status !== 'live') {
      return new Response(
        JSON.stringify({ error: 'Project is not live' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if tx_hash already exists
    const { data: existingDonation, error: existingDonationError } = await supabase
      .from('donations')
      .select('id')
      .eq('tx_hash', txHash)
      .maybeSingle();
    
    if (existingDonation) {
      return new Response(
        JSON.stringify({ error: 'Transaction hash already recorded' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Insert donation record (confirmed=false by default)
    const { data: donationData, error: donationError } = await supabase
      .from('donations')
      .insert({
        project_id: projectId,
        donor_id: profileData.id,
        amount,
        tx_hash: txHash,
        confirmed: false
      })
      .select()
      .single();
    
    if (donationError) {
      console.error('Error recording donation:', donationError);
      return new Response(
        JSON.stringify({ error: 'Failed to record donation' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Donation recorded successfully and pending confirmation',
        donation: donationData
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in submit-donation function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
