/**
 * Project detail page
 * Shows detailed information about a specific project
 */

import { getProjectBySlug } from '../../utils/projects.js';
import { formatAmount } from '../../utils/api.js';
import { getCurrentUser } from '../../auth/auth.js';

// Store for the current state
const state = {
  project: null,
  loading: true,
  error: null
};

/**
 * Render the project detail page
 * @param {Object} params - Route parameters
 * @param {string} params.slug - Project slug
 * @returns {string} HTML content for the project detail page
 */
export default function (params) {
  return `
    <div class="project-detail">
      <div class="back-link">
        <a href="/projects" class="chip">&larr; Back to Projects</a>
      </div>
      
      <div id="project-container" class="project-container">
        <div class="loading-indicator">Loading project...</div>
      </div>
    </div>
  `;
}

/**
 * Initialize the project detail page
 * @param {Object} params - Route parameters
 * @param {string} params.slug - Project slug
 */
export async function init(params) {
  if (!params.slug) {
    renderError('Project not found');
    return;
  }
  
  // Load project data
  await loadProject(params.slug);
}

/**
 * Load project data from the API
 * @param {string} slug - Project slug
 */
async function loadProject(slug) {
  const projectContainer = document.getElementById('project-container');
  if (!projectContainer) return;
  
  // Show loading state
  state.loading = true;
  renderProject();
  
  try {
    // Fetch project data
    state.project = await getProjectBySlug(slug);
    state.error = null;
  } catch (error) {
    console.error(`Error loading project ${slug}:`, error);
    state.error = 'Failed to load project. Please try again later.';
    state.project = null;
  } finally {
    state.loading = false;
    renderProject();
  }
}

/**
 * Render the project detail
 */
function renderProject() {
  const projectContainer = document.getElementById('project-container');
  if (!projectContainer) return;
  
  // Handle loading state
  if (state.loading) {
    projectContainer.innerHTML = `
      <div class="loading-indicator">Loading project...</div>
    `;
    return;
  }
  
  // Handle error state
  if (state.error) {
    renderError(state.error);
    return;
  }
  
  // Handle project not found
  if (!state.project) {
    renderError('Project not found');
    return;
  }
  
  // Render project detail
  const project = state.project;
  
  projectContainer.innerHTML = `
    <div class="project-hero">
      <div class="project-hero__image">
        <img src="${project.cover_image_url || '/assets/ujc-black.png'}" alt="${project.title}">
      </div>
      <div class="project-hero__content">
        <h1 class="project-hero__title">${project.title}</h1>
        <div class="project-hero__meta">
          <div class="project-hero__chips">
            <span class="chip">${project.category}</span>
            <span class="chip">${project.region}</span>
          </div>
          <div class="project-hero__owner">
            By ${project.ownerAddress}
          </div>
          <div class="project-hero__date">
            Created on ${project.createdAt}
          </div>
        </div>
      </div>
    </div>
    
    <div class="project-content">
      <div class="project-main">
        <div class="project-section">
          <h2 class="project-section__title">Summary</h2>
          <p class="project-section__content">${project.summary}</p>
        </div>
        
        <div class="project-section">
          <h2 class="project-section__title">Description</h2>
          <div class="project-section__content">
            ${project.description.split('\n').map(paragraph => 
              paragraph ? `<p>${paragraph}</p>` : ''
            ).join('')}
          </div>
        </div>
        
        ${project.images && project.images.length > 0 ? `
          <div class="project-section">
            <h2 class="project-section__title">Images</h2>
            <div class="project-images">
              ${project.images.map(image => `
                <div class="project-image">
                  <img src="${image}" alt="${project.title}">
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        <div class="project-section">
          <h2 class="project-section__title">Comments (${project.comments.length})</h2>
          <div class="project-comments">
            ${project.comments.length > 0 ? project.comments.map(comment => `
              <div class="comment">
                <div class="comment__header">
                  <span class="comment__author">${comment.authorAddress}</span>
                  <span class="comment__date">${comment.createdAt}</span>
                </div>
                <div class="comment__content">${comment.content}</div>
              </div>
            `).join('') : `
              <div class="empty-state">
                <p>No comments yet. Be the first to comment!</p>
              </div>
            `}
          </div>
          
          <div class="comment-form">
            <h3 class="comment-form__title">Add a Comment</h3>
            <textarea id="comment-input" class="comment-input" placeholder="Write your comment here..."></textarea>
            <button id="comment-submit" class="btn btn--primary">Submit Comment</button>
          </div>
        </div>
      </div>
      
      <div class="project-sidebar">
        <div class="sidebar-card">
          <h3 class="sidebar-card__title">Donate</h3>
          <div class="sidebar-card__content">
            <p>Support this project by donating UJC tokens.</p>
            <div class="donation-form">
              <div class="donation-form__field">
                <label for="donation-amount">Amount (UJC)</label>
                <input type="number" id="donation-amount" class="donation-input" placeholder="0.00" min="0" step="0.01">
              </div>
              <div class="donation-form__field">
                <label for="donation-tx-hash">Transaction Hash</label>
                <input type="text" id="donation-tx-hash" class="donation-input" placeholder="0x...">
              </div>
              <button id="donation-submit" class="btn btn--primary">Submit Donation</button>
            </div>
          </div>
        </div>
        
        <div class="sidebar-card">
          <h3 class="sidebar-card__title">Project Stats</h3>
          <div class="sidebar-card__content">
            <div class="stat-item">
              <span class="stat-item__label">Total Donations</span>
              <span class="stat-item__value">${formatAmount(project.totalDonations)}</span>
            </div>
            <div class="stat-item">
              <span class="stat-item__label">Comments</span>
              <span class="stat-item__value">${project.comments.length}</span>
            </div>
            <div class="stat-item">
              <span class="stat-item__label">Beneficiary</span>
              <span class="stat-item__value beneficiary-address">${project.beneficiary_address}</span>
            </div>
          </div>
        </div>
        
        ${project.recentDonations && project.recentDonations.length > 0 ? `
          <div class="sidebar-card">
            <h3 class="sidebar-card__title">Recent Donations</h3>
            <div class="sidebar-card__content">
              <div class="recent-donations">
                ${project.recentDonations.map(donation => `
                  <div class="donation-item">
                    <div class="donation-item__header">
                      <span class="donation-item__amount">${formatAmount(donation.amount)}</span>
                      <span class="donation-item__date">${donation.createdAt}</span>
                    </div>
                    <div class="donation-item__donor">
                      From ${donation.donorAddress}
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        ` : ''}
      </div>
    </div>
  `;
  
  // Set up event listeners
  setupEventListeners();
}

/**
 * Set up event listeners for the project detail page
 */
function setupEventListeners() {
  // Comment submission
  const commentInput = document.getElementById('comment-input');
  const commentSubmit = document.getElementById('comment-submit');
  
  if (commentInput && commentSubmit) {
    commentSubmit.addEventListener('click', () => {
      const content = commentInput.value.trim();
      if (!content) {
        alert('Please enter a comment');
        return;
      }
      
      const user = getCurrentUser();
      if (!user) {
        alert('Please connect your wallet to comment');
        return;
      }
      
      // In a future phase, we'll implement comment submission
      alert('Comment submission will be implemented in Phase 4');
    });
  }
  
  // Donation submission
  const donationAmount = document.getElementById('donation-amount');
  const donationTxHash = document.getElementById('donation-tx-hash');
  const donationSubmit = document.getElementById('donation-submit');
  
  if (donationAmount && donationTxHash && donationSubmit) {
    donationSubmit.addEventListener('click', () => {
      const amount = donationAmount.value.trim();
      const txHash = donationTxHash.value.trim();
      
      if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
        alert('Please enter a valid donation amount');
        return;
      }
      
      if (!txHash) {
        alert('Please enter a transaction hash');
        return;
      }
      
      const user = getCurrentUser();
      if (!user) {
        alert('Please connect your wallet to donate');
        return;
      }
      
      // In a future phase, we'll implement donation submission
      alert('Donation submission will be implemented in Phase 5');
    });
  }
}

/**
 * Render an error message
 * @param {string} message - Error message to display
 */
function renderError(message) {
  const projectContainer = document.getElementById('project-container');
  if (!projectContainer) return;
  
  projectContainer.innerHTML = `
    <div class="error-message">
      <p>${message}</p>
      <a href="/projects" class="btn btn--primary">Back to Projects</a>
    </div>
  `;
}
