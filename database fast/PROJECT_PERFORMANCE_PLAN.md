# Dynamic Portfolio App Performance Plan

This plan is tailored to the current `Next.js + Prisma + Postgres + Supabase` portfolio app in this repo.

## Current Architecture Summary

- Public landing page: [`app/app/page.tsx`](x:\side projects\dyanmic-portfolio\app\app\page.tsx)
- Public portfolio page: [`app/app/u/[slug]/page.tsx`](x:\side projects\dyanmic-portfolio\app\app\u\[slug]\page.tsx)
- Main portfolio renderer: [`app/app/portfolio-page.tsx`](x:\side projects\dyanmic-portfolio\app\app\portfolio-page.tsx)
- Admin dashboard route: [`app/app/admin/page.tsx`](x:\side projects\dyanmic-portfolio\app\app\admin\page.tsx)
- Admin client shell: [`app/app/admin/admin-panel-client.tsx`](x:\side projects\dyanmic-portfolio\app\app\admin\admin-panel-client.tsx)
- Portfolio data access: [`app/lib/portfolio.ts`](x:\side projects\dyanmic-portfolio\app\lib\portfolio.ts)
- Admin mutations: [`app/app/admin/actions.ts`](x:\side projects\dyanmic-portfolio\app\app\admin\actions.ts)
- Contact action: [`app/app/actions.ts`](x:\side projects\dyanmic-portfolio\app\app\actions.ts)
- Prisma schema: [`app/prisma/schema.prisma`](x:\side projects\dyanmic-portfolio\app\prisma\schema.prisma)

## Current Status

- [x] Lazy-load heavy admin manager components.
- [x] Lazy-load carousel, contact form, and beat player.
- [x] Defer image/audio/video loading on the public portfolio page.
- [x] Remove current lint errors introduced by recent performance changes.
- [x] Split admin data fetching by section instead of loading the full portfolio record at once.
- [x] Add database indexes for per-profile ordered collections.
- [ ] Add pagination / cursor loading for public portfolio discovery.
- [ ] Add smarter caching and invalidation for public data.
- [ ] Reduce `publishedSnapshot` overuse for public list views.
- [ ] Add request cancellation / debouncing for typing-driven features.

## Biggest Real Bottlenecks In This App

### 1. Admin Overfetching

[`app/app/admin/page.tsx`](x:\side projects\dyanmic-portfolio\app\app\admin\page.tsx) loads the entire portfolio graph through [`getPortfolioDataByAdminUserId`](x:\side projects\dyanmic-portfolio\app\lib\portfolio.ts) before rendering the dashboard.

That means:

- every admin visit loads services, projects, beats, businesses, photo projects, motion projects, artworks, educations, experiences, social links, and contact info
- even hidden sections still get fetched
- the route gets slower as the portfolio grows

### 2. Missing Compound Indexes

In [`app/prisma/schema.prisma`](x:\side projects\dyanmic-portfolio\app\prisma\schema.prisma), the child tables use `profileId` and `sortOrder` heavily, but there are no compound indexes for the common query pattern:

- `where: { profileId }`
- `orderBy: { sortOrder: "asc" }`

This affects:

- `Service`
- `Project`
- `Beat`
- `Business`
- `PhotoProject`
- `MotionProject`
- `Artwork`
- `Education`
- `Experience`
- `SocialLink`

### 3. Public Portfolio Feed Does Extra In-Memory Work

[`getPublicPortfolioList`](x:\side projects\dyanmic-portfolio\app\lib\portfolio.ts) fetches `publishedSnapshot` JSON and then parses large snapshot objects in memory just to build a lightweight card list.

That means:

- more data than needed is loaded from the database
- more server CPU is used than needed
- list scaling will get worse as more published profiles appear

### 4. Revalidation Is Broad

[`refreshPortfolio`](x:\side projects\dyanmic-portfolio\app\app\admin\actions.ts) revalidates `/`, `/admin`, and all known public slugs after many actions.

This is safe, but broad. It can be made more surgical with:

- cache tags
- section-specific invalidation
- changed-record-only invalidation

### 5. Public Portfolio Still Loads Full Snapshot At Once

[`getPublishedPortfolioDataBySlug`](x:\side projects\dyanmic-portfolio\app\lib\portfolio.ts) loads the full published snapshot for the route, which is fine for small portfolios, but can get heavy for users with large media-heavy content sets.

## Implementation Plan

## Phase 1: Database and Query Foundations

- [ ] Add `@@index([profileId, sortOrder])` to all ordered child models in [`schema.prisma`](x:\side projects\dyanmic-portfolio\app\prisma\schema.prisma).
- [ ] Add `@@index([isPublished, publishedAt])` on `Profile` for the public feed query.
- [ ] Review whether `publishedSlug` lookup needs any additional supporting index beyond `@unique`.
- [ ] Run a migration for these indexes.
- [ ] Verify common `findMany({ where: { profileId }, orderBy: { sortOrder: "asc" } })` queries benefit from the indexes.

## Phase 2: Admin Data Loading Refactor

- [x] Replace single giant `getPortfolioDataByAdminUserId` usage on the admin page with a smaller “admin shell” query.
- [ ] Create separate loaders for:
  - [ ] profile basics
  - [ ] contact info
  - [ ] services
  - [ ] projects
  - [ ] beats
  - [ ] businesses
  - [ ] photo projects
  - [ ] motion projects
  - [ ] artworks
  - [ ] education
  - [ ] experience
  - [ ] social links
- [ ] Fetch admin sections only when their UI becomes visible or relevant to selected roles.
- [ ] Keep role-based sections unloaded until needed.
- [ ] Consider route-level subpages or tabbed sections for large portfolios.

## Phase 3: Public Data Shape Optimization

- [ ] Create a lightweight public profile card projection instead of reading full `publishedSnapshot` for landing cards.
- [ ] Save a compact publish-time summary alongside the full snapshot, or move summary fields back onto `Profile`.
- [ ] Change public feed queries to request only:
  - [ ] `id`
  - [ ] `publishedSlug`
  - [ ] `publishedAt`
  - [ ] `fullName`
  - [ ] `heroDescription`
  - [ ] `location`
  - [ ] `profileImageUrl`
  - [ ] `roles`
  - [ ] counts needed for the card
- [ ] Avoid parsing the entire snapshot for every landing page card.

## Phase 4: Public Portfolio Loading Strategy

- [ ] Split public portfolio data into “critical above-the-fold” and “secondary sections”.
- [ ] Keep hero, nav, and contact essentials in the first payload.
- [ ] Load work groups on demand or by visibility:
  - [ ] projects
  - [ ] beats
  - [ ] ventures
  - [ ] photography
  - [ ] motion
  - [ ] artworks
- [ ] If full server splitting is too invasive, start with section-level API loading for below-the-fold blocks.
- [ ] Add paginated loading for very large work collections.

## Phase 5: Cache Strategy

- [ ] Keep public landing data cacheable.
- [ ] Cache public portfolio pages by slug when safe.
- [ ] Use tag-based invalidation for:
  - [ ] public feed
  - [ ] individual portfolio slug
  - [ ] admin profile shell
  - [ ] admin section datasets
- [ ] Replace broad `revalidatePath` usage where possible with more targeted invalidation.
- [ ] Ensure admin/session/private data is never cached in shared layers.
- [ ] Clear client-side caches on logout if React Query or another client cache is introduced.

## Phase 6: API and Mutation Efficiency

- [ ] Audit all fetch calls in client components and confirm they are user-triggered only.
- [ ] Debounce typing-based requests such as slug validation and AI assistant prompts if they become frequent.
- [ ] Add cancellation for long-running client requests where applicable.
- [ ] Ensure mutation responses do not force unrelated section refreshes.
- [ ] Update only changed fields in Prisma updates where realistic.
- [ ] Keep mutation-triggered revalidation scoped to changed content.

## Phase 7: UX Scaling Features

- [ ] Add paginated or infinite-scroll loading for the landing portfolio feed.
- [ ] Add server-side filtering for public portfolio browsing if feed growth continues.
- [ ] Add admin-side section virtualization if collections become very large.
- [ ] Add optimistic UI only for clearly safe operations like reorder or simple metadata edits.

## Concrete Next Tasks For Agents

Use this exact execution order.

### Sprint 1

- [x] Add Prisma indexes for `profileId + sortOrder` and `isPublished + publishedAt`.
- [x] Create a small admin shell query with only profile basics and contact info.
- [x] Stop loading all admin collections on initial dashboard render.
- [x] Introduce one section-level loader pattern and apply it to `projects` first.

### Sprint 2

- [ ] Create a lightweight published portfolio list query that avoids full snapshot parsing.
- [ ] Add pagination or cursor support to the public portfolio feed.
- [ ] Add smarter public-feed caching and slug-level invalidation.

### Sprint 3

- [ ] Split public portfolio sections into critical and deferred groups.
- [ ] Load lower sections only when visible.
- [ ] Add paginated loading for media-heavy sections if portfolio size grows.

## Agent Prompt For This Specific Repo

```md
You are optimizing a Next.js 16 + Prisma + Postgres portfolio platform.

Focus on the real bottlenecks in this repo:

1. admin dashboard overfetching from getPortfolioDataByAdminUserId
2. missing compound indexes on child collections ordered by sortOrder
3. public portfolio feed parsing full publishedSnapshot JSON for lightweight cards
4. broad path revalidation instead of more targeted cache invalidation
5. public portfolio route loading the full snapshot when only critical content is needed first

Execution rules:

- inspect current code before editing
- implement the highest-impact low-risk changes first
- prefer loading only visible or currently-needed sections
- request only needed DB fields
- add indexes for hot query patterns
- keep public caching aggressive but safe
- keep admin/private data uncached in shared layers
- verify with lint/tests/build when possible

Deliver:

- [ ] query/index improvements
- [ ] data-loading refactors
- [ ] cache/invalidation improvements
- [ ] verification results
- [ ] remaining bottlenecks
```

## Definition Of Done For This Repo

- [x] Admin page no longer fetches every collection on first load.
- [ ] Public landing list no longer depends on full snapshot parsing for cards.
- [x] Hot ordered child-table queries have compound indexes.
- [ ] Public cache invalidation is targeted.
- [ ] Public portfolio route prioritizes critical content first.
- [ ] Large lists can scale without full eager loading.
- [x] Lint passes.
- [ ] Any new migrations are applied cleanly.
