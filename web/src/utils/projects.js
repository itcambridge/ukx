import { supabase } from '../main.js';
import { formatAddress, formatDate } from './api.js';

/**
 * Fetch all live projects with optional filters
 * @param {Object} filters - Optional filters
 * @param {string} filters.category - Filter by category
 * @param {string} filters.region - Filter by region
 * @param {string} filters.search - Search in title and summary
 * @returns {Promise<Array>} Array of projects
 */
export async function getProjects(filters = {}) {
  try {
    let query = supabase
      .from('projects')
      .select(`
        *,
        owner:profiles(id, wallet_address, display_name),
        donations(amount, confirmed),
        comments(id, status)
      `)
      .eq('status', 'live')
      .order('created_at', { ascending: false });
    
    // Apply filters if provided
    if (filters.category) {
      query = query.eq('category', filters.category);
    }
    
    if (filters.region) {
      query = query.eq('region', filters.region);
    }
    
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,summary.ilike.%${filters.search}%`);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Process the data to add computed fields
    return data.map(project => {
      // Calculate total donations (only confirmed ones)
      const totalDonations = project.donations
        .filter(d => d.confirmed)
        .reduce((sum, d) => sum + Number(d.amount), 0);
      
      // Count visible comments
      const visibleComments = project.comments
        .filter(c => c.status === 'visible')
        .length;
      
      // Format owner address
      const ownerAddress = project.owner?.wallet_address 
        ? formatAddress(project.owner.wallet_address)
        : 'Unknown';
      
      // Format dates
      const createdAt = formatDate(project.created_at);
      
      return {
        ...project,
        totalDonations,
        visibleComments,
        ownerAddress,
        createdAt,
        // Remove nested data to avoid duplicating it
        donations: undefined,
        comments: undefined
      };
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    throw error;
  }
}

/**
 * Fetch a single project by slug
 * @param {string} slug - Project slug
 * @returns {Promise<Object>} Project data
 */
export async function getProjectBySlug(slug) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        owner:profiles(id, wallet_address, display_name),
        donations(id, amount, tx_hash, confirmed, created_at, donor:profiles(wallet_address)),
        comments(id, content, created_at, author:profiles(wallet_address, display_name), status)
      `)
      .eq('slug', slug)
      .eq('status', 'live')
      .single();
    
    if (error) throw error;
    if (!data) throw new Error('Project not found');
    
    // Calculate total donations (only confirmed ones)
    const totalDonations = data.donations
      .filter(d => d.confirmed)
      .reduce((sum, d) => sum + Number(d.amount), 0);
    
    // Filter visible comments and format them
    const comments = data.comments
      .filter(c => c.status === 'visible')
      .map(c => ({
        ...c,
        authorAddress: formatAddress(c.author.wallet_address),
        createdAt: formatDate(c.created_at)
      }));
    
    // Format recent donations
    const recentDonations = data.donations
      .filter(d => d.confirmed)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
      .map(d => ({
        id: d.id,
        amount: d.amount,
        txHash: d.tx_hash,
        donorAddress: formatAddress(d.donor.wallet_address),
        createdAt: formatDate(d.created_at)
      }));
    
    // Format owner address
    const ownerAddress = data.owner?.wallet_address 
      ? formatAddress(data.owner.wallet_address)
      : 'Unknown';
    
    // Format dates
    const createdAt = formatDate(data.created_at);
    
    return {
      ...data,
      totalDonations,
      comments,
      recentDonations,
      ownerAddress,
      createdAt,
      // Remove nested data to avoid duplicating it
      donations: undefined
    };
  } catch (error) {
    console.error(`Error fetching project with slug ${slug}:`, error);
    throw error;
  }
}

/**
 * Get all available categories
 * @returns {Array<string>} Array of category names
 */
export function getCategories() {
  return ['Environment', 'Education', 'Community', 'Health', 'Arts'];
}

/**
 * Get all available regions
 * @returns {Array<string>} Array of region names
 */
export function getRegions() {
  return ['UK-wide', 'England', 'Scotland', 'Wales', 'Northern Ireland'];
}
