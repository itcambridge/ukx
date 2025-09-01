Phase 1 — Lock the website “launch-ready”



Goal: Clean, credible one-pager + whitepaper + basic governance links.



Whitepaper (live \& downloadable)



✅ Publish /whitepaper.html (you did).



Replace stub with full /assets/Whitepaper.pdf (generate from HTML or Markdown).



Add a visible nav link and hero CTA to the whitepaper.



Tokenomics, Roadmap, FAQ polish



Ensure the sections read well, match your allocation, and remove any “placeholder” text.



Add a tiny pie chart or simple cards (already in your updated index—just keep consistent wording).



Governance basics (off-chain MVP)



Create a Snapshot space (when you’re ready) and add a “Vote” link (can be “Coming soon” now).



Create a “Submit a Cause” form (Google Form to start) and add /submit.html.



Socials + contact



Add Discord/Telegram/Twitter (or a simple email sign-up if you’re not ready for chat).



SEO/meta



Title/description tags, Open Graph image, robots.txt, sitemap.xml, and canonical domain.



Analytics



Add Plausible or GA4 snippet.



Performance \& caching



Small Nginx Cache-Control for images/mp4; optional gzip.



DevOps niceties



✅ ~/deploy.sh (done).



Make sure .git was removed from /var/www/ukx (security).



Test certbot renew --dry-run.



Phase 2 — Smart contract \& treasury



Goal: Ship a simple, safe token first; add fee model in v2.



Finalize token spec



Fixed supply (e.g., 100,000,000 UKX), burnable.



Stage 1 (safer): no transaction fee; add fee model in audited v2.



Ownable; ownership transferred to multi-sig post-deploy.



Treasury \& team wallets



Create a Gnosis Safe (3/5) for treasury.



Decide wallets for team, marketing, reserve.



Prepare initial distribution spreadsheet (addresses + amounts).



Security sanity



Peer-review + linter + unit tests.



Verify contract on BscScan, publish source + README.



Phase 3 — Launch mechanics



Goal: Make it tradable + transparent from day 1.



Deploy UKX on BNB mainnet



Mint to deployer → immediately distribute to treasury/team/marketing/reserve as per tokenomics.



Transfer owner to the treasury Safe.



Liquidity



Seed liquidity on PancakeSwap (BNB/UKX), publish the pair address.



(Optional) Lock LP tokens (e.g., Team.Finance/Unicrypt) for credibility.



Site updates



Add contract address (auto-reveal button).



Link treasury Safe and pair on PancakeSwap.



Add a “How to buy” guide (already scaffolded).



Governance MVP



Announce first Snapshot vote schedule.



Open Submit a Cause.



Phase 4 — Post-launch operations



Goal: Sustain momentum and trust.



Transparency page



Treasury balance widget (link to Safe \& BscScan).



List funded projects + links to proofs.



First grants round



Shortlist proposals → Snapshot vote → milestone-based disbursement.



Comms



Blog/Updates page for announcements and monthly treasury reports.



Security \& compliance



Consider a lightweight legal page (disclaimer, privacy, cookies).



Phase a code audit before adding “transaction fee / treasury refill” mechanism.

