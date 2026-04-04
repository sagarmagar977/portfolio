# Fullstack Performance Plan

Use this file as a reusable optimization roadmap for any web app. Check items off as work completes.

## Goal

Make the app fast by default:

- load only what is needed
- fetch only what is needed
- cache only what is safe
- invalidate only what changed
- stop background work that does not help the user
- keep database queries narrow, indexed, and predictable

## Operating Rules

- [ ] Measure before large rewrites.
- [ ] Prioritize biggest bottlenecks first.
- [ ] Keep critical path small.
- [ ] Optimize current user path before edge cases.
- [ ] Avoid premature complexity.
- [ ] Do not cache private user data in shared caches.
- [ ] Clear session-scoped caches on logout.
- [ ] Cancel stale requests on navigation or input changes.
- [ ] Avoid polling unless there is a strict product need.
- [ ] Verify impact after each major change.

## Phase 1: Baseline and Profiling

- [ ] Identify slow routes, slow interactions, and heavy bundles.
- [ ] Measure initial page load, route transitions, API latency, DB latency, and payload size.
- [ ] List top pages by traffic and optimize those first.
- [ ] Find duplicate fetches, duplicate renders, and repeated API calls.
- [ ] Find components mounting before they are visible.
- [ ] Find APIs triggered on every keystroke or every render.

## Phase 2: Frontend Loading Strategy

- [ ] Split heavy client components with dynamic imports.
- [ ] Lazy load below-the-fold sections.
- [ ] Lazy load media: images, audio, video, embeds.
- [ ] Mount modals, editors, charts, carousels, and previews only when opened or visible.
- [ ] Avoid hydrating components that can stay server-rendered.
- [ ] Use skeletons or lightweight fallbacks for deferred UI.
- [ ] Use virtualization for large lists/tables.
- [ ] Prefetch only likely-next routes, not every route.

## Phase 3: Data Fetch Optimization

- [ ] Fetch only current-user data, current-route data, and visible-section data.
- [ ] Avoid loading all dashboard data at once if sections are independent.
- [ ] Add pagination, cursor loading, or infinite scroll for large datasets.
- [ ] Add filtering and sorting on the server, not only in the client.
- [ ] Request only needed fields from APIs and database queries.
- [ ] Remove unused nested relations and oversized response shapes.
- [ ] Prevent N+1 query patterns.
- [ ] Defer secondary or optional data until interaction.

## Phase 4: API Efficiency

- [ ] Debounce search/typeahead/filter API calls.
- [ ] Cancel stale in-flight requests with AbortController or framework-native cancellation.
- [ ] Dedupe identical requests.
- [ ] Remove background API calls that do not improve UX.
- [ ] Replace polling with event-driven updates or manual refresh when possible.
- [ ] Return minimal response payloads.
- [ ] Add cursor/filter params to list endpoints.
- [ ] Add compression and caching headers where safe.

## Phase 5: Client Caching

- [ ] Add React Query or equivalent client caching where it improves UX.
- [ ] Cache stable read data by query key.
- [ ] Set sensible `staleTime` and `gcTime`.
- [ ] Clear user-scoped caches on logout.
- [ ] Avoid refetch-on-focus/refetch-on-mount when unnecessary.
- [ ] Use optimistic updates only when safe.
- [ ] Invalidate only affected query keys after writes.
- [ ] Patch only changed records in cache when possible.

## Phase 6: Server and Edge Caching

- [ ] Cache public, non-personalized data at the CDN/edge.
- [ ] Keep private or personalized data out of shared caches.
- [ ] Use route/data caching for stable content.
- [ ] Use revalidation or tags for targeted invalidation.
- [ ] Prefer stale-while-revalidate only for data that can briefly be stale.
- [ ] Move cacheable public data closer to users where supported.

## Phase 7: Database Query Tuning

- [ ] Identify hottest queries by frequency and latency.
- [ ] Add indexes for frequent `WHERE`, `JOIN`, `ORDER BY`, and cursor columns.
- [ ] Avoid full scans on large tables.
- [ ] Use `select` / projection to load only required columns.
- [ ] Avoid loading large relations by default.
- [ ] Normalize duplicated entities when it reduces update cost or repeated data.
- [ ] Denormalize only when proven helpful and maintained safely.
- [ ] Review query plans for slow endpoints.
- [ ] Keep pagination index-friendly.

## Phase 8: Background Work Control

- [ ] Stop hidden-tab or off-screen work that does not matter.
- [ ] Pause media, timers, animations, and background fetches when inactive.
- [ ] Avoid automatic refresh loops on low-value screens.
- [ ] Trigger work from user intent, visibility, or route relevance.

## Phase 9: Search and Typing Performance

- [ ] Debounce user input before network calls.
- [ ] Cancel previous requests when a new input arrives.
- [ ] Return small suggestion payloads.
- [ ] Cache recent searches when useful.
- [ ] Avoid querying until minimum input length is reached.

## Phase 10: Write Path Optimization

- [ ] Update only changed fields in mutations.
- [ ] Avoid rewriting whole records when only one field changed.
- [ ] Revalidate only affected pages, queries, and cache tags.
- [ ] Keep mutation responses small but enough to update UI.

## Implementation Order

- [ ] Quick wins: lazy loading, code splitting, media deferral, remove duplicate fetches.
- [ ] Mid wins: pagination, API filtering, query narrowing, request cancellation.
- [ ] High-value backend wins: cache strategy, invalidation, indexes, hot-query tuning.
- [ ] Advanced wins: virtualization, edge caching, prefetch heuristics, data model cleanup.

## Definition of Done

- [ ] Initial route loads less code than before.
- [ ] Below-the-fold UI is not fetched/mounted eagerly.
- [ ] Large lists do not load everything at once.
- [ ] APIs return only required fields.
- [ ] Stale or duplicate requests are cancelled or deduped.
- [ ] Background work is reduced or removed.
- [ ] Public cacheable data is cached safely.
- [ ] User-scoped data is isolated and cleared on logout.
- [ ] Hot DB queries are indexed and narrowed.
- [ ] Lint/tests/build or targeted checks pass.
- [ ] Remaining bottlenecks are documented.

## Agent Task Template

Use this task block for AI agents:

```md
# Performance Task

## Objective
Improve app speed across frontend, backend, API, and database without breaking behavior.

## Constraints
- Keep behavior the same unless a change is clearly beneficial and safe.
- Prefer high-impact, low-risk changes first.
- Verify each change.

## Required actions
- [ ] inspect the codebase and identify the biggest bottlenecks
- [ ] implement lazy loading and code splitting for non-critical UI
- [ ] reduce overfetching and load only needed data
- [ ] add caching and targeted invalidation
- [ ] optimize APIs, request cancellation, and deduping
- [ ] improve DB queries and indexes
- [ ] verify and summarize results
```

## Notes

- Normalization is helpful when repeated data causes duplication, expensive updates, or inconsistent writes.
- Denormalization is helpful only when measured read performance needs it and update complexity stays controlled.
- Infinite scroll is useful for large feeds, logs, galleries, and tables, but cursor pagination is usually better than offset pagination at scale.
