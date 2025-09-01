# UJC MVP – Roadmap

**Scope:** Build a minimal, shippable MVP on top of the existing landing page. Wallet auth, projects, comments, voting (off‑chain), manual donations logging, and manual staffing controlled by project owners. Supabase for data + Edge Functions for verification.

---

## Guiding Principles

* **Keep it simple**: manual off‑chain staffing, owner decisions, minimal moderation.
* **Wallet‑first**: SIWE‑style message signing, no passwords.
* **Trust through clarity**: signed payloads, visible audit trails, simple RLS.
* **Iterate**: ship read paths before write paths; add features behind small flags.

---

## High‑Level Phases

1. **Foundation** – Supabase schema + auth + Edge scaffolding
2. **Projects (Read)** – list/detail with basic stats
3. **Projects (Write)** – create/approve pipeline
4. **Community** – comments + off‑chain voting
5. **Donations (Manual)** – UI + tx hash capture + totals
6. **Staffing (Manual)** – roles JSON + applications + owner decisions
7. **Polish & QA** – empty states, RLS, rate limits, instrumentation

---

## Phase 0 – Prep (0.5 day)

* ✅ Confirm environments: Supabase project, service role key, anon key, Edge Functions enabled
* ✅ Choose environment variables strategy (local `.env`, prod secrets)
* ✅ Repo structure: `/web` (frontend), `/supabase` (migrations), `/functions` (edge)
* ✅ Define fixed taxonomies: Categories (Environment, Education, Community, Health, Arts), Regions (UK‑wide, England, Scotland, Wales, Northern Ireland)

**Deliverables**: Project skeleton with env scaffolding, README with run commands.

---

## Phase 1 – Foundation (1–2 days)

### 1.1 Database & RLS

* Create tables: `profiles`, `projects`, `comments`, `proposals`, `votes`, `donations`, `staff_applications`
* Minimal RLS:

  * `projects`: public select where status = 'live'; owner can insert/update own drafts/pending; admin can set status
  * `comments`: public select where status = 'visible'; author insert; admin sets status
  * `votes`: insert via Edge only; public select
  * `donations`: insert via Edge only (or restricted RPC); public select
  * `staff_applications`: author insert; project owner update status

**Acceptance**: SQL migration runs clean; RLS tested with anon vs service role.

### 1.2 Auth & Session

* Wallet connect (ethers v5)
* SIWE‑style login: sign message → Edge function verifies → returns JWT (Supabase Auth) or store minimal session locally
* Profile bootstrap on first login (create `profiles` row)

**Acceptance**: Can connect wallet, sign in, and see profile row created.

### 1.3 Edge Function Scaffolding

* `create-project` (verify signature, insert as `pending`)
* `submit-votes` (verify vote signature, upsert)
* `submit-donation` (manual submission with tx hash; mark `confirmed=false`)
* (Optional) `apply-role` / `decide-role`

**Acceptance**: Functions deploy and respond with 200 for valid payloads.

---

## Phase 2 – Projects (Read) (1–2 days)

### 2.1 Projects Index

* Route `/projects`
* List cards: cover, title, summary, chips (region/cause), status
* Filters: Category, Region, Status; Search by title/summary

### 2.2 Project Detail

* Route `/projects/:slug`
* Sections: hero (title, owner, chips), description, images
* Sidebar: placeholder Donate panel, placeholder Vote panel, Stats (computed)

**Acceptance**: Index renders with filters; detail renders existing seeded project.

---

## Phase 3 – Projects (Write) (1–2 days)

### 3.1 Create Project Wizard

* Step 1: Basics (title, summary, category, region)
* Step 2: Details (description, beneficiary address, cover image upload)
* Step 3: Review → **Sign & Submit** (`PROJECT_CREATE_V1`)

### 3.2 Moderation

* `/admin/moderation` (guarded by simple admin flag): list pending projects
* Actions: Approve (→ `live`), Reject

**Acceptance**: Creator can submit; admin can approve; project appears publicly.

---

## Phase 4 – Community (1–2 days)

### 4.1 Comments (Pending → Visible)

* Comment form (rate‑limited client side)
* Edge validates minimal length; insert as `pending` for first‑time commenters
* Admin toggle status in moderation view

### 4.2 Off‑Chain Voting (Project‑linked optional)

* `/governance` page listing proposals
* Vote: sign message; Edge verifies; upsert `votes`
* Detail page shows proposal result bars (for closed) or selection (for user)

**Acceptance**: Can post comment (pending), admin approves; can vote on a demo proposal.

---

## Phase 5 – Donations (Manual) (1 day)

### 5.1 Donate UI

* Sidebar panel: amount input (UJC), external transfer instructions (contract address)
* Field to paste `tx_hash`; submit to `submit-donation`

### 5.2 Totals & Activity

* Project detail shows total UJC donated, last 5 donations (address, amount, time, confirmed badge)
* Admin option to mark `confirmed=true` (until indexer exists)

**Acceptance**: Donation entries appear and totals update; confirmation toggle works.

---

## Phase 6 – Staffing (Manual) (1–2 days)

### 6.1 Roles (Project Owner)

* On project edit, owner toggles **Staffing enabled** and manages `roles` (JSON): `{id,title,skill,comp_ujc,status}`
* Visible as list on project detail with "Apply" buttons

### 6.2 Applications

* Apply modal: bid amount + pitch → sign simple message → submit to Edge → insert `staff_applications`
* Owner view: list applicants per role; set `accepted/rejected`
* (Manual payment note; store optional `payment_tx_hash` later)

**Acceptance**: Users can apply; owner can accept; status is visible.

---

## Phase 7 – Polish & QA (1–2 days)

* Empty states and loading skeletons
* Basic analytics logging (page views, actions)
* Edge rate‑limits: comments (1/min), projects (max 2 live/creator), applications (10/day)
* Input validation & sanitization (lengths, profanity filter on comments)
* Accessibility pass: labels, focus order, contrast
* Content QA: taxonomy chips, 404s, error toasts

**Acceptance**: Manual QA checklist passes; smoke test across Chrome/Firefox/Safari + mobile.

---

## Milestones & Checkpoints

* **M1 (End Phase 2)**: Public projects browsing working
* **M2 (End Phase 3)**: Create → approve → live flow
* **M3 (End Phase 4)**: Comments + Voting live
* **M4 (End Phase 5)**: Donations UI & totals
* **M5 (End Phase 6)**: Manual staffing end‑to‑end

---

## Non‑Goals (for MVP)

* On‑chain escrow for staffing or donations
* Reputation/points system
* Real‑time sockets for live updates
* Full email/password auth
* Complex moderation queues

---

## Risks & Mitigations

* **Bot spam** → Signed messages, rate‑limits, first‑comment moderation
* **Low liquidity** → Clear disclaimers; focus on contribution over speculation
* **Manual confirmation load** → Keep donations volume manageable; plan for indexer later
* **User confusion** → Simple tooltips, short help modals on key flows

---

## Definition of Done (MVP)

* Users can: sign in, create projects, see them approved and live, comment (after approval), vote on at least one proposal, donate UJC with tx hash capture, apply for roles; owners can accept applications. All persisted in Supabase with RLS.

---

## Post‑MVP Backlog (next iteration)

* Donation Router + event indexer to auto‑confirm donations
* Reputation badges (completions, helpful comments, donors)
* Snapshot‑compatible typed data voting (EIP‑712)
* Advanced filters (trending, most donated, near goal)
* Admin metrics dashboard (projects in funnel, approvals, donations/week)
