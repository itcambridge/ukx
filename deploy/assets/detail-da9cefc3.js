import{c as p,f as d}from"./projects-bfa8d1ae.js";import{g as l}from"./index-bd2e99c0.js";const a={project:null,loading:!0,error:null};function b(n){return`
    <div class="project-detail">
      <div class="back-link">
        <a href="/projects" class="chip">&larr; Back to Projects</a>
      </div>
      
      <div id="project-container" class="project-container">
        <div class="loading-indicator">Loading project...</div>
      </div>
    </div>
  `}async function f(n){if(!n.slug){o("Project not found");return}await v(n.slug)}async function v(n){if(document.getElementById("project-container")){a.loading=!0,m();try{a.project=await p(n),a.error=null}catch(e){console.error(`Error loading project ${n}:`,e),a.error="Failed to load project. Please try again later.",a.project=null}finally{a.loading=!1,m()}}}function m(){const n=document.getElementById("project-container");if(!n)return;if(a.loading){n.innerHTML=`
      <div class="loading-indicator">Loading project...</div>
    `;return}if(a.error){o(a.error);return}if(!a.project){o("Project not found");return}const t=a.project;n.innerHTML=`
    <div class="project-hero">
      <div class="project-hero__image">
        <img src="${t.cover_image_url||"/assets/ujc-black.png"}" alt="${t.title}">
      </div>
      <div class="project-hero__content">
        <h1 class="project-hero__title">${t.title}</h1>
        <div class="project-hero__meta">
          <div class="project-hero__chips">
            <span class="chip">${t.category}</span>
            <span class="chip">${t.region}</span>
          </div>
          <div class="project-hero__owner">
            By ${t.ownerAddress}
          </div>
          <div class="project-hero__date">
            Created on ${t.createdAt}
          </div>
        </div>
      </div>
    </div>
    
    <div class="project-content">
      <div class="project-main">
        <div class="project-section">
          <h2 class="project-section__title">Summary</h2>
          <p class="project-section__content">${t.summary}</p>
        </div>
        
        <div class="project-section">
          <h2 class="project-section__title">Description</h2>
          <div class="project-section__content">
            ${t.description.split(`
`).map(e=>e?`<p>${e}</p>`:"").join("")}
          </div>
        </div>
        
        ${t.images&&t.images.length>0?`
          <div class="project-section">
            <h2 class="project-section__title">Images</h2>
            <div class="project-images">
              ${t.images.map(e=>`
                <div class="project-image">
                  <img src="${e}" alt="${t.title}">
                </div>
              `).join("")}
            </div>
          </div>
        `:""}
        
        <div class="project-section">
          <h2 class="project-section__title">Comments (${t.comments.length})</h2>
          <div class="project-comments">
            ${t.comments.length>0?t.comments.map(e=>`
              <div class="comment">
                <div class="comment__header">
                  <span class="comment__author">${e.authorAddress}</span>
                  <span class="comment__date">${e.createdAt}</span>
                </div>
                <div class="comment__content">${e.content}</div>
              </div>
            `).join(""):`
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
              <span class="stat-item__value">${d(t.totalDonations)}</span>
            </div>
            <div class="stat-item">
              <span class="stat-item__label">Comments</span>
              <span class="stat-item__value">${t.comments.length}</span>
            </div>
            <div class="stat-item">
              <span class="stat-item__label">Beneficiary</span>
              <span class="stat-item__value beneficiary-address">${t.beneficiary_address}</span>
            </div>
          </div>
        </div>
        
        ${t.recentDonations&&t.recentDonations.length>0?`
          <div class="sidebar-card">
            <h3 class="sidebar-card__title">Recent Donations</h3>
            <div class="sidebar-card__content">
              <div class="recent-donations">
                ${t.recentDonations.map(e=>`
                  <div class="donation-item">
                    <div class="donation-item__header">
                      <span class="donation-item__amount">${d(e.amount)}</span>
                      <span class="donation-item__date">${e.createdAt}</span>
                    </div>
                    <div class="donation-item__donor">
                      From ${e.donorAddress}
                    </div>
                  </div>
                `).join("")}
              </div>
            </div>
          </div>
        `:""}
      </div>
    </div>
  `,u()}function u(){const n=document.getElementById("comment-input"),t=document.getElementById("comment-submit");n&&t&&t.addEventListener("click",()=>{if(!n.value.trim()){alert("Please enter a comment");return}if(!l()){alert("Please connect your wallet to comment");return}alert("Comment submission will be implemented in Phase 4")});const e=document.getElementById("donation-amount"),i=document.getElementById("donation-tx-hash"),c=document.getElementById("donation-submit");e&&i&&c&&c.addEventListener("click",()=>{const s=e.value.trim(),r=i.value.trim();if(!s||isNaN(s)||parseFloat(s)<=0){alert("Please enter a valid donation amount");return}if(!r){alert("Please enter a transaction hash");return}if(!l()){alert("Please connect your wallet to donate");return}alert("Donation submission will be implemented in Phase 5")})}function o(n){const t=document.getElementById("project-container");t&&(t.innerHTML=`
    <div class="error-message">
      <p>${n}</p>
      <a href="/projects" class="btn btn--primary">Back to Projects</a>
    </div>
  `)}export{b as default,f as init};
//# sourceMappingURL=detail-da9cefc3.js.map
