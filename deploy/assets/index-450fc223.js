import{g as o,a as l,b as d,f as p}from"./projects-bfa8d1ae.js";import"./index-bd2e99c0.js";const t={projects:[],loading:!0,error:null,filters:{category:"",region:"",search:""}};function f(){return`
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
            ${o().map(r=>`
              <option value="${r}">${r}</option>
            `).join("")}
          </select>
        </div>
        
        <div class="filter-group">
          <label for="region-filter">Region</label>
          <select id="region-filter" class="filter-select">
            <option value="">All Regions</option>
            ${l().map(r=>`
              <option value="${r}">${r}</option>
            `).join("")}
          </select>
        </div>
      </div>
    </div>
    
    <div id="projects-container" class="projects-grid">
      <div class="loading-indicator">Loading projects...</div>
    </div>
  `}async function m(){u(),await s()}function u(){const r=document.getElementById("search-input"),e=document.getElementById("search-button");r&&e&&(e.addEventListener("click",()=>{t.filters.search=r.value.trim(),s()}),r.addEventListener("keypress",n=>{n.key==="Enter"&&(t.filters.search=r.value.trim(),s())}));const a=document.getElementById("category-filter");a&&a.addEventListener("change",()=>{t.filters.category=a.value,s()});const i=document.getElementById("region-filter");i&&i.addEventListener("change",()=>{t.filters.region=i.value,s()})}async function s(){if(document.getElementById("projects-container")){t.loading=!0,c();try{t.projects=await d(t.filters),t.error=null}catch(e){console.error("Error loading projects:",e),t.error="Failed to load projects. Please try again later.",t.projects=[]}finally{t.loading=!1,c()}}}function c(){const r=document.getElementById("projects-container");if(r){if(t.loading){r.innerHTML=`
      <div class="loading-indicator">Loading projects...</div>
    `;return}if(t.error){r.innerHTML=`
      <div class="error-message">
        <p>${t.error}</p>
        <button id="retry-button" class="btn btn--primary">Retry</button>
      </div>
    `;const e=document.getElementById("retry-button");e&&e.addEventListener("click",s);return}if(t.projects.length===0){r.innerHTML=`
      <div class="empty-state">
        <p>No projects found matching your criteria.</p>
        <button id="clear-filters-button" class="btn btn--primary">Clear Filters</button>
      </div>
    `;const e=document.getElementById("clear-filters-button");e&&e.addEventListener("click",()=>{t.filters.category="",t.filters.region="",t.filters.search="";const a=document.getElementById("category-filter"),i=document.getElementById("region-filter"),n=document.getElementById("search-input");a&&(a.value=""),i&&(i.value=""),n&&(n.value=""),s()});return}r.innerHTML=t.projects.map(e=>`
    <div class="project-card">
      <div class="project-card__image">
        <img src="${e.cover_image_url||"/assets/ujc-black.png"}" alt="${e.title}">
      </div>
      <div class="project-card__content">
        <h3 class="project-card__title">
          <a href="/projects/${e.slug}">${e.title}</a>
        </h3>
        <p class="project-card__summary">${e.summary}</p>
        <div class="project-card__meta">
          <div class="project-card__chips">
            <span class="chip">${e.category}</span>
            <span class="chip">${e.region}</span>
          </div>
          <div class="project-card__stats">
            <div class="project-card__stat">
              <span class="project-card__stat-label">Donations</span>
              <span class="project-card__stat-value">${p(e.totalDonations)}</span>
            </div>
            <div class="project-card__stat">
              <span class="project-card__stat-label">Comments</span>
              <span class="project-card__stat-value">${e.visibleComments}</span>
            </div>
          </div>
        </div>
        <div class="project-card__footer">
          <span class="project-card__owner">By ${e.ownerAddress}</span>
          <span class="project-card__date">${e.createdAt}</span>
        </div>
      </div>
    </div>
  `).join("")}}export{f as default,m as init};
//# sourceMappingURL=index-450fc223.js.map
