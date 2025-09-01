import { ethers } from 'ethers';
import { SiweMessage } from 'siwe';

// Auth state
let currentUser = null;
let provider = null;
let signer = null;

/**
 * Initialize the authentication module
 * @param {Object} supabase - Supabase client instance
 */
export function initAuth(supabase) {
  const authContainer = document.getElementById('auth-container');
  if (!authContainer) return;

  // Check for existing session
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      // User is already logged in
      handleAuthSuccess(session.user, supabase);
    } else {
      // User needs to log in
      renderLoginButton(authContainer, supabase);
    }
  });

  // Listen for auth state changes
  supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_IN' && session) {
      handleAuthSuccess(session.user, supabase);
    } else if (event === 'SIGNED_OUT') {
      currentUser = null;
      renderLoginButton(authContainer, supabase);
    }
  });
}

/**
 * Handle successful authentication
 * @param {Object} user - User object from Supabase
 * @param {Object} supabase - Supabase client instance
 */
function handleAuthSuccess(user, supabase) {
  currentUser = user;
  
  // Fetch user profile
  supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
    .then(({ data, error }) => {
      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }
      
      // Render user profile
      const authContainer = document.getElementById('auth-container');
      if (authContainer) {
        renderUserProfile(authContainer, data, supabase);
      }
    });
}

/**
 * Render the login button
 * @param {HTMLElement} container - Container element
 * @param {Object} supabase - Supabase client instance
 */
function renderLoginButton(container, supabase) {
  container.innerHTML = `
    <button id="connect-wallet" class="auth-btn">Connect Wallet</button>
  `;
  
  const connectButton = document.getElementById('connect-wallet');
  connectButton.addEventListener('click', async () => {
    try {
      connectButton.disabled = true;
      connectButton.textContent = 'Connecting...';
      
      await connectWallet();
      await signInWithEthereum(supabase);
      
    } catch (error) {
      console.error('Authentication error:', error);
      connectButton.textContent = 'Connect Wallet';
      connectButton.disabled = false;
      
      alert(`Authentication failed: ${error.message}`);
    }
  });
}

/**
 * Render the user profile
 * @param {HTMLElement} container - Container element
 * @param {Object} profile - User profile data
 * @param {Object} supabase - Supabase client instance
 */
function renderUserProfile(container, profile, supabase) {
  const address = profile.wallet_address;
  const displayAddress = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  
  container.innerHTML = `
    <div class="profile-chip">
      <span class="profile-address">${displayAddress}</span>
      <button id="logout-button" class="auth-btn">Logout</button>
    </div>
  `;
  
  const logoutButton = document.getElementById('logout-button');
  logoutButton.addEventListener('click', async () => {
    await supabase.auth.signOut();
  });
}

/**
 * Connect to the user's Ethereum wallet
 * @returns {Promise<string>} The connected wallet address
 */
async function connectWallet() {
  if (!window.ethereum) {
    throw new Error('No Ethereum wallet found. Please install MetaMask.');
  }
  
  try {
    // Request account access
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const address = accounts[0];
    
    // Create ethers provider and signer
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    
    // Check if we're on the correct chain
    const chainId = import.meta.env.VITE_CHAIN_ID || '56'; // Default to BNB Chain
    const currentChainId = await provider.getNetwork().then(network => network.chainId.toString());
    
    if (currentChainId !== chainId) {
      // Request chain switch
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${parseInt(chainId).toString(16)}` }],
        });
      } catch (switchError) {
        // Chain doesn't exist - suggest adding it
        if (switchError.code === 4902) {
          throw new Error('Please add BNB Chain to your wallet and try again.');
        }
        throw switchError;
      }
    }
    
    return address;
  } catch (error) {
    console.error('Error connecting wallet:', error);
    throw new Error('Failed to connect wallet. Please try again.');
  }
}

/**
 * Sign in with Ethereum using SIWE
 * @param {Object} supabase - Supabase client instance
 * @returns {Promise<Object>} The authenticated user
 */
async function signInWithEthereum(supabase) {
  if (!provider || !signer) {
    throw new Error('Wallet not connected. Please connect your wallet first.');
  }
  
  try {
    const address = await signer.getAddress();
    const chainId = await provider.getNetwork().then(network => network.chainId);
    
    // Create SIWE message
    const domain = window.location.host;
    const origin = window.location.origin;
    const statement = 'Sign in with Ethereum to UJC Platform';
    
    const message = new SiweMessage({
      domain,
      address,
      statement,
      uri: origin,
      version: '1',
      chainId,
      nonce: Math.floor(Math.random() * 1000000).toString(),
    });
    
    const messageToSign = message.prepareMessage();
    
    // Sign the message
    const signature = await signer.signMessage(messageToSign);
    
    // Verify with Supabase Edge Function (to be implemented)
    // For now, we'll use a custom JWT approach
    
    // Sign in with custom token
    const { data, error } = await supabase.auth.signInWithPassword({
      email: `${address.toLowerCase()}@ethereum.org`, // Virtual email
      password: signature.substring(0, 20), // Use part of signature as password
    });
    
    if (error) {
      // If user doesn't exist, sign up
      if (error.status === 400) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: `${address.toLowerCase()}@ethereum.org`,
          password: signature.substring(0, 20),
          options: {
            data: {
              wallet_address: address,
            }
          }
        });
        
        if (signUpError) throw signUpError;
        return signUpData.user;
      }
      
      throw error;
    }
    
    return data.user;
  } catch (error) {
    console.error('SIWE error:', error);
    throw new Error('Authentication failed. Please try again.');
  }
}

/**
 * Get the current authenticated user
 * @returns {Object|null} The current user or null if not authenticated
 */
export function getCurrentUser() {
  return currentUser;
}

/**
 * Get the current wallet provider
 * @returns {Object|null} The ethers provider or null if not connected
 */
export function getProvider() {
  return provider;
}

/**
 * Get the current wallet signer
 * @returns {Object|null} The ethers signer or null if not connected
 */
export function getSigner() {
  return signer;
}
