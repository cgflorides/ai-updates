# AI News Prioritization Implementation Package

This document follows the source-of-truth build specification in `build-spec.pdf` and the product prompt provided in the workspace thread.

## 1. Implementation Architecture

### Product architecture

- `Source ingestion layer`
  Pulls configured RSS/search feeds and normalizes source metadata, URLs, dates, and snippets.
- `Content processing layer`
  Classifies stories into the four primary topics, deduplicates canonical URLs, computes weighted scores, and generates reusable output fields.
- `Clustering layer`
  Groups related stories by topic plus entity/event heuristics so the dashboard can surface trends instead of repeated headlines.
- `Presentation layer`
  Renders a scan-first dashboard with search, topic filters, score bands, cluster browsing, detail panels, and editable output areas.
- `Configuration layer`
  Stores scoring weights and active topic categories in a configurable structure so ranking rules can evolve without major code changes.

### Current implementation choice

- Framework: `Next.js App Router`
- Hosting: `Vercel`
- Data retrieval: server-side fetches via `rss2json`
- Ranking: local deterministic scoring model
- Generated outputs: template-driven summaries and LinkedIn drafts

### Target evolution path

- Phase 1 keeps ingestion and ranking in the app server layer.
- Phase 2 should move normalization and clustering into a dedicated processing service or scheduled pipeline.
- Phase 3 should introduce persistent storage plus admin configuration and optional output-quality improvements via an LLM service.

## 2. Technical Task Breakdown

### MVP foundation

- Build source registry for configured feeds
- Normalize incoming articles into a shared item shape
- Classify each article into supported priority topics
- Compute weighted priority score and score band
- Render ranked dashboard cards
- Add detail view for single items
- Add source traceability links

### Signal quality upgrade

- Add canonical-link deduplication
- Add related-story clustering logic
- Add cluster cards and cluster detail views
- Add explicit “why this matters” explanations
- Improve summary quality and short-summary output
- Add score breakdown visibility

### Reusable output and tuning

- Generate LinkedIn post drafts
- Add editable reusable summary boxes
- Add keyword search
- Add topic filters
- Add sorting by priority and recency
- Add scoring-weight tuning controls
- Add topic enable/disable controls

### Deployment and operations

- Verify production build
- Redeploy to Vercel
- Push changes to GitHub

## 3. Proposed Data Model

### `NewsItem`

- `id`
- `title`
- `source`
- `sourceType`
- `link`
- `date`
- `dateLabel`
- `topicKey`
- `topicLabel`
- `scoreFactors`
- `priorityScore`
- `priorityBand`
- `summary`
- `whyItMatters`
- `shortSummary`
- `linkedInDraft`
- `clusterKey`

### `TopicCluster`

- `id`
- `clusterTitle`
- `clusterSummary`
- `whyItMatters`
- `itemIds`
- `itemCount`
- `sourceCount`
- `topicKey`
- `topicLabel`
- `clusterPriorityScore`
- `priorityBand`
- `shortSummary`
- `linkedInDraft`

### `Source`

- `id`
- `name`
- `type`
- `url`
- `weight`

### `ScoringConfig`

- `consultingRelevance`
- `clientImpact`
- `topicImportance`
- `recency`

### `TopicSettings`

- `regulation`
- `enterprise_ai_tools`
- `ai_use_cases`
- `model_updates`

## 4. API / Service Design

### Current service shape

- `getNewsBundle()`
  Returns the complete server-side view model for the dashboard.

### Recommended next API endpoints

- `GET /api/news`
  Returns normalized news items with filters, search, topic, and sort support.
- `GET /api/clusters`
  Returns grouped cluster records plus related story references.
- `GET /api/items/:id`
  Returns one item with summary, relevance explanation, and reusable outputs.
- `GET /api/clusters/:id`
  Returns one cluster with related articles and generated outputs.
- `POST /api/generate/summary`
  Regenerates a concise summary for an item or cluster.
- `POST /api/generate/linkedin`
  Generates a LinkedIn draft for an item or cluster.
- `GET /api/config`
  Returns ranking weights and topic settings.
- `PUT /api/config`
  Updates ranking weights and topic activation for future runs.

### Internal services

- `feed-ingestion-service`
- `content-normalization-service`
- `topic-classification-service`
- `priority-scoring-service`
- `cluster-service`
- `output-generation-service`

## 5. Frontend Component Structure

### Current top-level structure

- `app/layout.js`
- `app/page.js`
- `components/NewsDashboard.js`
- `lib/news.js`

### Recommended component breakdown

- `NewsDashboard`
  Top-level orchestration, filters, detail selection, and tuning state.
- `DashboardToolbar`
  Search, sort, and topic filter controls.
- `SignalList`
  Ranked story cards.
- `ClusterList`
  Cluster cards.
- `SignalCard`
  Single item summary card.
- `ClusterCard`
  Single cluster summary card.
- `ItemDetailPanel`
  Summary, why-this-matters, score breakdown, reusable summary, LinkedIn draft.
- `ClusterDetailPanel`
  Cluster summary, trend relevance, related stories, reusable outputs.
- `ScoringTuningPanel`
  Weight sliders and topic toggles.
- `SourceList`
  Source registry display.

## 6. Phased Implementation Plan

### Phase 1: MVP foundation

- Complete source ingestion and normalization
- Lock topic taxonomy to the four priority topics
- Score every item with configurable weights
- Render ranked dashboard and single-item detail
- Keep Vercel deployment stable

### Phase 2: Signal quality upgrade

- Improve duplicate detection
- Ship stronger clustering confidence logic
- Improve “why this matters” generation
- Strengthen summary quality and detail view readability
- Add cluster-first browsing

### Phase 3: Reusable output and tuning

- Add editable LinkedIn drafts and reusable summaries
- Add admin configuration persistence
- Add saved state for weights and topic settings
- Add higher-quality generation via LLM-backed services if approved
- Add stronger observability around ingestion/scoring runs

## 7. Gaps / Ambiguities To Resolve

- Exact initial source list approval:
  The spec asks to confirm this explicitly. The current implementation uses a pragmatic first-pass source set, but the final approved source inventory still needs confirmation.
- Login requirement:
  The spec lists this as an open question and the current app does not implement authentication.
- Save, dismiss, and feedback actions:
  These are mentioned as open questions and are not implemented.
- Article volume target:
  No exact daily throughput target is defined yet, which affects storage and processing design.
- Output quality approach:
  The current release uses deterministic/template generation. If you want richer summaries and LinkedIn drafts, we should confirm whether to add an LLM-backed service next.
- Persistence model:
  The current deployed version computes live server-side output on request and does not persist processed items or admin configuration yet.
