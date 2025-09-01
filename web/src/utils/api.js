import { supabase } from '../main.js';
import { getSigner } from '../auth/auth.js';

/**
 * Call a Supabase Edge Function with authentication
 * @param {string} functionName - Name of the Edge Function to call
 * @param {Object} payload - Data to send to the function
 * @returns {Promise<Object>} Response from the Edge Function
 */
export async function callEdgeFunction(functionName, payload = {}) {
  try {
    // Get the current signer
    const signer = getSigner();
    if (!signer) {
      throw new Error('Not authenticated. Please connect your wallet.');
    }
    
    // Get the address
    const address = await signer.getAddress();
    
    // Sign the payload
    const timestamp = Date.now();
    const message = JSON.stringify({
      ...payload,
      address,
      timestamp,
    });
    
    const signature = await signer.signMessage(message);
    
    // Call the Edge Function
    const { data, error } = await supabase.functions.invoke(functionName, {
      body: {
        payload: JSON.parse(message),
        signature,
      },
    });
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`Error calling Edge Function ${functionName}:`, error);
    throw error;
  }
}

/**
 * Format an address for display
 * @param {string} address - Ethereum address
 * @returns {string} Formatted address (e.g., 0x1234...5678)
 */
export function formatAddress(address) {
  if (!address) return '';
  return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

/**
 * Format a date for display
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date
 */
export function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Format an amount with currency symbol
 * @param {number} amount - Amount to format
 * @param {string} symbol - Currency symbol (default: 'UJC')
 * @returns {string} Formatted amount
 */
export function formatAmount(amount, symbol = 'UJC') {
  if (amount === undefined || amount === null) return '';
  return `${Number(amount).toLocaleString('en-GB')} ${symbol}`;
}
