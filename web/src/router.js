/**
 * Simple router for the UJC platform
 * Handles navigation between pages without a full page reload
 */

// Import page modules
const pages = {
  home: () => import('./pages/home.js'),
  projects: {
    index: () => import('./pages/projects/index.js'),
    detail: () => import('./pages/projects/detail.js')
  },
  governance: () => import('./pages/governance.js')
};

// Main content container
let mainContent;

/**
 * Initialize the router
 */
export function initRouter() {
  // Set up the main content container
  mainContent = document.querySelector('.main-content');
  if (!mainContent) {
    console.error('Main content container not found');
    return;
  }
  
  // Handle initial route
  handleRoute(window.location.pathname);
  
  // Set up navigation event listeners
  document.addEventListener('click', (event) => {
    // Check if the click was on an internal link
    const link = event.target.closest('a');
    if (link && link.href && link.href.startsWith(window.location.origin) && !link.hasAttribute('target')) {
      event.preventDefault();
      
      // Get the path from the link
      const path = link.pathname;
      
      // Navigate to the new path
      navigateTo(path);
    }
  });
  
  // Handle browser back/forward buttons
  window.addEventListener('popstate', () => {
    handleRoute(window.location.pathname);
  });
}

/**
 * Navigate to a new path
 * @param {string} path - The path to navigate to
 */
export function navigateTo(path) {
  // Update the URL
  window.history.pushState({}, '', path);
  
  // Handle the new route
  handleRoute(path);
}

/**
 * Handle a route change
 * @param {string} path - The current path
 */
async function handleRoute(path) {
  try {
    // Default to home page
    if (path === '/') {
      renderPage('home');
      return;
    }
    
    // Handle projects routes
    if (path === '/projects') {
      renderPage('projects.index');
      return;
    }
    
    if (path.startsWith('/projects/')) {
      const slug = path.split('/projects/')[1];
      renderPage('projects.detail', { slug });
      return;
    }
    
    // Handle governance route
    if (path === '/governance') {
      renderPage('governance');
      return;
    }
    
    // If no route matches, show a 404 page
    renderNotFound();
  } catch (error) {
    console.error('Error handling route:', error);
    renderError();
  }
}

/**
 * Render a page
 * @param {string} pageName - The name of the page to render (dot notation for nested pages)
 * @param {Object} params - Parameters to pass to the page
 */
async function renderPage(pageName, params = {}) {
  try {
    // Get the page module
    let pageModule;
    
    if (pageName.includes('.')) {
      // Handle nested pages (e.g., 'projects.detail')
      const [parent, child] = pageName.split('.');
      pageModule = await pages[parent][child]();
    } else {
      pageModule = await pages[pageName]();
    }
    
    // Render the page
    const pageContent = pageModule.default(params);
    mainContent.innerHTML = pageContent;
    
    // Run any initialization code
    if (pageModule.init) {
      pageModule.init(params);
    }
    
    // Update active navigation links
    updateActiveNavLinks(pageName);
    
    // Scroll to top
    window.scrollTo(0, 0);
  } catch (error) {
    console.error(`Error rendering page ${pageName}:`, error);
    renderError();
  }
}

/**
 * Update active navigation links
 * @param {string} pageName - The name of the active page
 */
function updateActiveNavLinks(pageName) {
  // Remove active class from all links
  document.querySelectorAll('.nav__links a').forEach(link => {
    link.classList.remove('active');
  });
  
  // Add active class to the current page link
  let selector;
  
  if (pageName === 'home') {
    selector = 'a[href="/"]';
  } else if (pageName.startsWith('projects')) {
    selector = 'a[href="/projects"]';
  } else if (pageName === 'governance') {
    selector = 'a[href="/governance"]';
  }
  
  if (selector) {
    const activeLink = document.querySelector(selector);
    if (activeLink) {
      activeLink.classList.add('active');
    }
  }
}

/**
 * Render a 404 Not Found page
 */
function renderNotFound() {
  mainContent.innerHTML = `
    <h1 class="section-title">Page Not Found</h1>
    <div class="card">
      <h2 class="card-title">404 Error</h2>
      <div class="card-content">
        <p>The page you're looking for doesn't exist.</p>
        <a href="/" class="chip">Go Home</a>
      </div>
    </div>
  `;
}

/**
 * Render an error page
 */
function renderError() {
  mainContent.innerHTML = `
    <h1 class="section-title">Error</h1>
    <div class="card">
      <h2 class="card-title">Something went wrong</h2>
      <div class="card-content">
        <p>An error occurred while loading the page. Please try again later.</p>
        <a href="/" class="chip">Go Home</a>
      </div>
    </div>
  `;
}
