/**
 * Home page for the UJC platform
 */

/**
 * Render the home page
 * @returns {string} HTML content for the home page
 */
export default function () {
  return `
    <h1 class="section-title">Welcome to UJC Platform</h1>
    
    <div class="card">
      <h2 class="card-title">Projects</h2>
      <div class="card-content">
        <p>Discover and support projects across Britain. Connect your wallet to create your own project or donate to existing ones.</p>
        <a href="/projects" class="chip">Browse Projects</a>
      </div>
    </div>
    
    <div class="card">
      <h2 class="card-title">Governance</h2>
      <div class="card-content">
        <p>Participate in community decisions through our governance system. Vote on proposals and help shape the future of UJC.</p>
        <a href="/governance" class="chip">View Proposals</a>
      </div>
    </div>
    
    <div class="card">
      <h2 class="card-title">About UJC</h2>
      <div class="card-content">
        <p>UJC gives people a voice and a stake in Britain's future. Through governance and collective funding, holders decide which causes and projects get supported — from local initiatives to national campaigns.</p>
        <a href="/" class="chip">Learn More</a>
      </div>
    </div>
  `;
}

/**
 * Initialize the home page
 */
export function init() {
  console.log('Home page initialized');
}
