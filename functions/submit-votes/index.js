// submit-votes Edge Function
// Verifies vote signature and upserts vote record

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
    
    // Extract vote data
    const { 
      address, 
      timestamp, 
      proposalId, 
      choice,
      chainId,
      loginNonce
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
    
    // Check if proposal exists and is active
    const { data: proposalData, error: proposalError } = await supabase
      .from('proposals')
      .select('id, status, starts_at, ends_at')
      .eq('id', proposalId)
      .single();
    
    if (proposalError || !proposalData) {
      return new Response(
        JSON.stringify({ error: 'Proposal not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if proposal is active
    if (proposalData.status !== 'active') {
      return new Response(
        JSON.stringify({ error: 'Proposal is not active' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Check if voting window is open
    const startsAt = new Date(proposalData.starts_at).getTime();
    const endsAt = new Date(proposalData.ends_at).getTime();
    
    if (now < startsAt || now > endsAt) {
      return new Response(
        JSON.stringify({ error: 'Voting window is closed' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    // Upsert vote record
    const { data: voteData, error: voteError } = await supabase
      .from('votes')
      .upsert({
        proposal_id: proposalId,
        voter_id: profileData.id,
        choice,
        signature,
        payload: payload
      })
      .select()
      .single();
    
    if (voteError) {
      console.error('Error recording vote:', voteError);
      return new Response(
        JSON.stringify({ error: 'Failed to record vote' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Vote recorded successfully',
        vote: voteData
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error in submit-votes function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
