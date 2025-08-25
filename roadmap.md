Cline-ready task list (bite-sized issues)



Use these as separate Cline tasks; each has a file path and acceptance criteria.



✅ Web content \& structure



Add Whitepaper CTA + page link



File: /var/www/ukx/index.html



Change: Ensure hero CTA links to /whitepaper.html.



Done when: Button opens that page; nav includes a “Whitepaper” link.



Publish Whitepaper PDF



Files: /var/www/ukx/whitepaper.html → generate /assets/Whitepaper.pdf via wkhtmltopdf.



Done when: https://union-jack.uk/assets/Whitepaper.pdf returns a full-sized PDF (not 5.4KB).



Submit a Cause page



File: /var/www/ukx/submit.html



Content: A simple description + an embedded Google Form (or Formspree) collecting: name, email (optional), project title, location, budget, milestones, impact.



Done when: Link from nav works; form submits successfully.



Add SEO essentials



Files: /var/www/ukx/robots.txt, /var/www/ukx/sitemap.xml



robots: allow all; Sitemap: https://union-jack.uk/sitemap.xml



sitemap: include /, /whitepaper.html, /submit.html



Done when: Both URLs return 200.



Open Graph + social preview



File: /var/www/ukx/index.html <head>



Add: og:title, og:description, og:image (pick one hero still), twitter:card=summary\_large\_image.



Done when: https://metatags.io/ (or similar) shows correct preview.



Analytics



File: /var/www/ukx/index.html



Add: Plausible or GA4 snippet.



Done when: Pageview shows in dashboard.



✅ Nginx/server



Static caching for media



File: /etc/nginx/sites-enabled/ukx



Add inside HTTPS server block:



location ~\* \\.(?:png|jpg|jpeg|gif|webp|svg|mp4)$ {

&nbsp; add\_header Cache-Control "public, max-age=2592000, immutable";

}





Done when: curl -I shows Cache-Control.



Remove .git from web root



Cmd: sudo rm -rf /var/www/ukx/.git



Done when: ls -a /var/www/ukx shows no .git.



Renewal test



Cmd: sudo certbot renew --dry-run



Done when: Success message; no Nginx reload errors.



✅ Smart contract \& governance (prep)



Repo folder for contracts \& docs



Files: contracts/UKXToken.sol, contracts/README.md



Content: Final ERC20Burnable Ownable implementation notes, deployment checklist, constructor args.



Done when: Sol compiles in Remix/Hardhat; README explains supply \& distribution.



Addresses JSON for the site



File: /var/www/ukx/addresses.json



Content: { "token":"", "treasury":"", "lp":"", "snapshot":"", "pair":"", "chain":"bsc" }



Site: Small JS reads it to populate CTAs/links.



Done when: After deployment, just update JSON and site reflects new links.



“How to buy” section polish



File: /var/www/ukx/index.html



Content: Steps + post-deploy contract address placeholder.



Done when: Text is clear; contract button auto-reveals from addresses.json.





Go-live checklist (day-of)



&nbsp;Whitepaper page renders + PDF downloads.



&nbsp;Contract deployed \& verified on BscScan.



&nbsp;Site shows contract, treasury Safe, DEX pair links.



&nbsp;Liquidity seeded; pair tradable.



&nbsp;Snapshot “space” live (even with placeholder).



&nbsp;Submit form working.



&nbsp;Domain canonical redirects working (we fixed most; OK to circle back on www.unionjackcoins.co.uk).



&nbsp;Analytics receiving traffic.



&nbsp;~/deploy.sh works.



&nbsp;Socials linked; pinned tweet/post with contract address.

