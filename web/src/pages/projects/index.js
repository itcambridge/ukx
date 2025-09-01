/**
 * Projects index page
 * Lists all projects with filtering capabilities
 */

import { getProjects, getCategories, getRegions } from '../../utils/projects.js';
import { formatAmount } from '../../utils/api.js';

// Store for the current state
const state = {
  projects: [],
  loading: true,
  error: null,
  filters: {
    category: '',
    region: '',
    search: ''
  }
};

/**
 * Render the projects index page
 * @returns {string} HTML content for the projects index page
 */
export default function () {
  return `
    <h1 class="section-title">Projects</h1>
    
    <div class="filters-container">
      <div class="search-box">
        <input type="text" id="search-input" placeholder="Search projects..." class="search-input">
        <button id="search-button" class="btn btn--primary">Search</button>
      </div>
      
      <div class="filter-selects">
        <div class="filter-group">
          <label for="category-filter">Category</label>
          <select id="category-filter" class="filter-select">
            <option value="">All Categories</option>
            ${getCategories().map(category => `
              <option value="${category}">${category}</option>
            `).join('')}
          </select>
        </div>
        
        <div class="filter-group">
          <label for="region-filter">Region</label>
          <select id="region-filter" class="filter-select">
            <option value="">All Regions</option>
            ${getRegions().map(region => `
              <option value="${region}">${region}</option>
            `).join('')}
          </select>
        </div>
      </div>
    </div>
    
    <div id="projects-container" class="projects-grid">
      <div class="loading-indicator">Loading projects...</div>
    </div>
  `;
}

/**
 * Initialize the projects index page
 */
export async function init() {
  // Set up event listeners for filters
  setupFilters();
  
  // Load projects
  await loadProjects();
}

/**
 * Set up event listeners for filters
 */
function setupFilters() {
  // Search input
  const searchInput = document.getElementById('search-input');
  const searchButton = document.getElementById('search-button');
  
  if (searchInput && searchButton) {
    // Search on button click
    searchButton.addEventListener('click', () => {
      state.filters.search = searchInput.value.trim();
      loadProjects();
    });
    
    // Search on Enter key
    searchInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        state.filters.search = searchInput.value.trim();
        loadProjects();
      }
    });
  }
  
  // Category filter
  const categoryFilter = document.getElementById('category-filter');
  if (categoryFilter) {
    categoryFilter.addEventListener('change', () => {
      state.filters.category = categoryFilter.value;
      loadProjects();
    });
  }
  
  // Region filter
  const regionFilter = document.getElementById('region-filter');
  if (regionFilter) {
    regionFilter.addEventListener('change', () => {
      state.filters.region = regionFilter.value;
      loadProjects();
    });
  }
}

/**
 * Load projects from the API
 */
async function loadProjects() {
  const projectsContainer = document.getElementById('projects-container');
  if (!projectsContainer) return;
  
  // Show loading state
  state.loading = true;
  renderProjects();
  
  try {
    // Fetch projects with current filters
    state.projects = await getProjects(state.filters);
    state.error = null;
  } catch (error) {
    console.error('Error loading projects:', error);
    state.error = 'Failed to load projects. Please try again later.';
    state.projects = [];
  } finally {
    state.loading = false;
    renderProjects();
  }
}

/**
 * Render the projects list
 */
function renderProjects() {
  const projectsContainer = document.getElementById('projects-container');
  if (!projectsContainer) return;
  
  // Handle loading state
  if (state.loading) {
    projectsContainer.innerHTML = `
      <div class="loading-indicator">Loading projects...</div>
    `;
    return;
  }
  
  // Handle error state
  if (state.error) {
    projectsContainer.innerHTML = `
      <div class="error-message">
        <p>${state.error}</p>
        <button id="retry-button" class="btn btn--primary">Retry</button>
      </div>
    `;
    
    // Add retry button event listener
    const retryButton = document.getElementById('retry-button');
    if (retryButton) {
      retryButton.addEventListener('click', loadProjects);
    }
    
    return;
  }
  
  // Handle empty state
  if (state.projects.length === 0) {
    projectsContainer.innerHTML = `
      <div class="empty-state">
        <p>No projects found matching your criteria.</p>
        <button id="clear-filters-button" class="btn btn--primary">Clear Filters</button>
      </div>
    `;
    
    // Add clear filters button event listener
    const clearFiltersButton = document.getElementById('clear-filters-button');
    if (clearFiltersButton) {
      clearFiltersButton.addEventListener('click', () => {
        // Reset filters
        state.filters.category = '';
        state.filters.region = '';
        state.filters.search = '';
        
        // Reset filter UI
        const categoryFilter = document.getElementById('category-filter');
        const regionFilter = document.getElementById('region-filter');
        const searchInput = document.getElementById('search-input');
        
        if (categoryFilter) categoryFilter.value = '';
        if (regionFilter) regionFilter.value = '';
        if (searchInput) searchInput.value = '';
        
        // Reload projects
        loadProjects();
      });
    }
    
    return;
  }
  
  // Render projects
  projectsContainer.innerHTML = state.projects.map(project => `
    <div class="project-card">
      <div class="project-card__image">
        <img src="${project.cover_image_url || '/assets/ujc-black.png'}" alt="${project.title}">
      </div>
      <div class="project-card__content">
        <h3 class="project-card__title">
          <a href="/projects/${project.slug}">${project.title}</a>
        </h3>
        <p class="project-card__summary">${project.summary}</p>
        <div class="project-card__meta">
          <div class="project-card__chips">
            <span class="chip">${project.category}</span>
            <span class="chip">${project.region}</span>
          </div>
          <div class="project-card__stats">
            <div class="project-card__stat">
              <span class="project-card__stat-label">Donations</span>
              <span class="project-card__stat-value">${formatAmount(project.totalDonations)}</span>
            </div>
            <div class="project-card__stat">
              <span class="project-card__stat-label">Comments</span>
              <span class="project-card__stat-value">${project.visibleComments}</span>
            </div>
          </div>
        </div>
        <div class="project-card__footer">
          <span class="project-card__owner">By ${project.ownerAddress}</span>
          <span class="project-card__date">${project.createdAt}</span>
        </div>
      </div>
    </div>
  `).join('');
}
