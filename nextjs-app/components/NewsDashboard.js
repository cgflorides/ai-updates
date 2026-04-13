"use client";

import { useDeferredValue, useState } from "react";

function priorityValue(priorityBand) {
  const ranking = {
    Critical: 4,
    "High Value": 3,
    Useful: 2,
    "Low Priority": 1,
  };

  return ranking[priorityBand] || 0;
}

function computePriorityScore(item, weights) {
  return Math.round(
    item.scoreFactors.consultingRelevance * (weights.consultingRelevance / 100) +
      item.scoreFactors.clientImpact * (weights.clientImpact / 100) +
      item.scoreFactors.topicImportance * (weights.topicImportance / 100) +
      item.scoreFactors.recency * (weights.recency / 100)
  );
}

function getPriorityBand(score) {
  if (score >= 85) {
    return "Critical";
  }
  if (score >= 70) {
    return "High Value";
  }
  if (score >= 50) {
    return "Useful";
  }
  return "Low Priority";
}

function buildWhyItMatters(item) {
  const strongestFactor = Object.entries(item.scoreFactors).sort((a, b) => b[1] - a[1])[0]?.[0];
  const factorExplanations = {
    consultingRelevance:
      "it strongly affects consulting conversations around delivery, tooling, or implementation choices",
    clientImpact:
      "it could materially affect clients through compliance, cost, adoption, or operating decisions",
    topicImportance: `it sits in a high-priority topic lane for this product`,
    recency: "it is current enough to shape planning and client conversations right now",
  };

  return `Why this matters: ${
    factorExplanations[strongestFactor] || "it combines business relevance and recency"
  }.`;
}

function buildClusterDraft(cluster, items) {
  const sources = new Set(items.map((item) => item.source));

  return [
    `One AI trend I think technical project managers and consultants should watch: ${cluster.clusterTitle}`,
    "",
    `${cluster.clusterSummary}`,
    "",
    `${cluster.whyItMatters}`,
    "",
    `This signal is supported by ${items.length} related articles across ${sources.size} sources.`,
  ].join("\n");
}

function SourceList({ sources }) {
  return (
    <ul className="sources-list">
      {sources.map((source) => (
        <li key={source.id}>
          <a href={source.url} target="_blank" rel="noreferrer">
            {source.name}
          </a>{" "}
          <span className="source-type">({source.type})</span>
        </li>
      ))}
    </ul>
  );
}

export default function NewsDashboard({ initialData }) {
  const [selectedTopic, setSelectedTopic] = useState("all");
  const [sortMode, setSortMode] = useState("priority");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedView, setSelectedView] = useState("stories");
  const [selectedItemId, setSelectedItemId] = useState(initialData.newsItems[0]?.id || null);
  const [selectedClusterId, setSelectedClusterId] = useState(initialData.clusters[0]?.id || null);
  const [weights, setWeights] = useState(initialData.defaultScoringWeights);
  const [topicSettings, setTopicSettings] = useState(initialData.defaultTopicSettings);

  const deferredSearch = useDeferredValue(searchQuery.trim().toLowerCase());

  const rescoredItems = initialData.newsItems
    .map((item) => {
      const priorityScore = computePriorityScore(item, weights);

      return {
        ...item,
        priorityScore,
        priorityBand: getPriorityBand(priorityScore),
        whyItMatters: buildWhyItMatters(item),
      };
    })
    .filter((item) => topicSettings[item.topicKey] !== false);

  const filteredItems = rescoredItems
    .filter((item) => selectedTopic === "all" || item.topicKey === selectedTopic)
    .filter((item) => {
      if (!deferredSearch) {
        return true;
      }

      const haystack = `${item.title} ${item.summary} ${item.source} ${item.topicLabel}`.toLowerCase();
      return haystack.includes(deferredSearch);
    })
    .sort((a, b) => {
      if (sortMode === "recency") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }

      if (b.priorityScore !== a.priorityScore) {
        return b.priorityScore - a.priorityScore;
      }

      return priorityValue(b.priorityBand) - priorityValue(a.priorityBand);
    });

  const filteredClusters = initialData.clusters
    .map((cluster) => {
      const items = rescoredItems.filter((item) => cluster.itemIds.includes(item.id));
      const clusterPriorityScore =
        items.length > 0
          ? Math.round(items.reduce((total, item) => total + item.priorityScore, 0) / items.length)
          : cluster.clusterPriorityScore;

      return {
        ...cluster,
        clusterPriorityScore,
        priorityBand: getPriorityBand(clusterPriorityScore),
        items,
        shortSummary: items[0]?.shortSummary || cluster.shortSummary,
        linkedInDraft: buildClusterDraft(cluster, items),
      };
    })
    .filter((cluster) => cluster.items.length > 0)
    .filter((cluster) => selectedTopic === "all" || cluster.topicKey === selectedTopic)
    .filter((cluster) => {
      if (!deferredSearch) {
        return true;
      }

      const haystack = `${cluster.clusterTitle} ${cluster.clusterSummary} ${cluster.whyItMatters}`.toLowerCase();
      return haystack.includes(deferredSearch);
    })
    .sort((a, b) => {
      if (sortMode === "recency") {
        const aDate = new Date(a.items[0]?.date || 0).getTime();
        const bDate = new Date(b.items[0]?.date || 0).getTime();
        return bDate - aDate;
      }

      return b.clusterPriorityScore - a.clusterPriorityScore;
    });

  const selectedItem =
    filteredItems.find((item) => item.id === selectedItemId) || filteredItems[0] || null;
  const selectedCluster =
    filteredClusters.find((cluster) => cluster.id === selectedClusterId) ||
    filteredClusters[0] ||
    null;

  const topicOptions = [["all", "All Topics"], ...Object.entries(initialData.topicDefinitions)];

  return (
    <div className="page-shell">
      <header className="hero">
        <p className="eyebrow">AI News Prioritization</p>
        <h1>Pulse AI Daily</h1>
        <p className="hero-copy">
          An AI signal dashboard for project managers, consultants, and leadership users who need less noise,
          stronger summaries, and clearer consulting relevance.
        </p>

        <div className="hero-meta">
          <div className="meta-card">
            <span className="meta-label">Updated</span>
            <strong>{initialData.updatedAt}</strong>
          </div>
          <div className="meta-card">
            <span className="meta-label">Stories</span>
            <strong>{filteredItems.length}</strong>
          </div>
          <div className="meta-card">
            <span className="meta-label">Clusters</span>
            <strong>{filteredClusters.length}</strong>
          </div>
          <div className="meta-card">
            <span className="meta-label">Top Band</span>
            <strong>{filteredItems[0]?.priorityBand || "No stories"}</strong>
          </div>
        </div>
      </header>

      <main className="dashboard dashboard-wide">
        <section className="panel main-panel">
          <div className="panel-header">
            <div>
              <p className="section-label">Dashboard</p>
              <h2>Priority Signals</h2>
            </div>
            <div className="header-actions">
              <button
                className={`toggle-button ${selectedView === "stories" ? "is-active" : ""}`}
                onClick={() => setSelectedView("stories")}
                type="button"
              >
                Stories
              </button>
              <button
                className={`toggle-button ${selectedView === "clusters" ? "is-active" : ""}`}
                onClick={() => setSelectedView("clusters")}
                type="button"
              >
                Clusters
              </button>
            </div>
          </div>

          <div className="toolbar toolbar-grid">
            <label className="filter filter-search">
              <span>Search</span>
              <input
                className="search-input"
                placeholder="Search companies, topics, tools..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
              />
            </label>

            <label className="filter">
              <span>Topic</span>
              <select
                value={selectedTopic}
                onChange={(event) => setSelectedTopic(event.target.value)}
              >
                {topicOptions.map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="filter">
              <span>Sort</span>
              <select value={sortMode} onChange={(event) => setSortMode(event.target.value)}>
                <option value="priority">Priority</option>
                <option value="recency">Recency</option>
              </select>
            </label>
          </div>

          <p className="feed-status">{initialData.status}</p>

          {selectedView === "stories" ? (
            <div className="news-grid">
              {filteredItems.length === 0 ? (
                <div className="empty-state">No stories match the current filters.</div>
              ) : (
                filteredItems.map((item) => (
                  <article
                    className={`news-card clickable-card ${
                      selectedItem?.id === item.id ? "is-selected" : ""
                    }`}
                    key={item.id}
                    onClick={() => setSelectedItemId(item.id)}
                  >
                    <div className="news-card-top">
                      <div className="card-badges">
                        <span className="category-badge">{item.topicLabel}</span>
                        <span className={`priority-badge priority-${item.priorityBand.toLowerCase().replace(/\s+/g, "-")}`}>
                          {item.priorityBand}
                        </span>
                      </div>
                      <span className="source-name">
                        {item.source} • {item.dateLabel}
                      </span>
                    </div>
                    <h3 className="news-title">{item.title}</h3>
                    <p className="news-summary">{item.summary}</p>
                    <p className="news-score">
                      Priority score: <strong>{item.priorityScore}</strong>
                    </p>
                    <p className="news-impact">{item.whyItMatters}</p>
                  </article>
                ))
              )}
            </div>
          ) : (
            <div className="cluster-grid">
              {filteredClusters.length === 0 ? (
                <div className="empty-state">No clusters match the current filters.</div>
              ) : (
                filteredClusters.map((cluster) => (
                  <article
                    className={`news-card clickable-card ${
                      selectedCluster?.id === cluster.id ? "is-selected" : ""
                    }`}
                    key={cluster.id}
                    onClick={() => setSelectedClusterId(cluster.id)}
                  >
                    <div className="news-card-top">
                      <div className="card-badges">
                        <span className="category-badge">{cluster.topicLabel}</span>
                        <span
                          className={`priority-badge priority-${cluster.priorityBand
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                        >
                          {cluster.priorityBand}
                        </span>
                      </div>
                      <span className="source-name">
                        {cluster.itemCount} articles • {cluster.sourceCount} sources
                      </span>
                    </div>
                    <h3 className="news-title">{cluster.clusterTitle}</h3>
                    <p className="news-summary">{cluster.clusterSummary}</p>
                    <p className="news-score">
                      Cluster score: <strong>{cluster.clusterPriorityScore}</strong>
                    </p>
                    <p className="news-impact">{cluster.whyItMatters}</p>
                  </article>
                ))
              )}
            </div>
          )}
        </section>

        <section className="side-column">
          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="section-label">Detail</p>
                <h2>{selectedView === "stories" ? "Item Detail" : "Cluster Detail"}</h2>
              </div>
            </div>

            {selectedView === "stories" && selectedItem ? (
              <div className="detail-stack">
                <div>
                  <div className="card-badges">
                    <span className="category-badge">{selectedItem.topicLabel}</span>
                    <span
                      className={`priority-badge priority-${selectedItem.priorityBand
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {selectedItem.priorityBand}
                    </span>
                  </div>
                  <h3 className="detail-title">{selectedItem.title}</h3>
                  <p className="source-name">
                    {selectedItem.source} • {selectedItem.dateLabel}
                  </p>
                </div>

                <div className="detail-card">
                  <p className="section-label">Summary</p>
                  <p>{selectedItem.summary}</p>
                </div>

                <div className="detail-card">
                  <p className="section-label">Why This Matters</p>
                  <p>{selectedItem.whyItMatters}</p>
                </div>

                <div className="detail-card">
                  <p className="section-label">Score Breakdown</p>
                  <ul className="score-list">
                    <li>Consulting relevance: {selectedItem.scoreFactors.consultingRelevance}</li>
                    <li>Client impact: {selectedItem.scoreFactors.clientImpact}</li>
                    <li>Topic importance: {selectedItem.scoreFactors.topicImportance}</li>
                    <li>Recency: {selectedItem.scoreFactors.recency}</li>
                  </ul>
                </div>

                <div className="detail-card">
                  <p className="section-label">Reusable Summary</p>
                  <textarea className="draft-box" defaultValue={selectedItem.shortSummary} />
                </div>

                <div className="detail-card">
                  <p className="section-label">LinkedIn Draft</p>
                  <textarea className="draft-box draft-box-large" defaultValue={selectedItem.linkedInDraft} />
                </div>

                <a className="news-link" href={selectedItem.link} target="_blank" rel="noreferrer">
                  Open source article
                </a>
              </div>
            ) : selectedView === "clusters" && selectedCluster ? (
              <div className="detail-stack">
                <div>
                  <div className="card-badges">
                    <span className="category-badge">{selectedCluster.topicLabel}</span>
                    <span
                      className={`priority-badge priority-${selectedCluster.priorityBand
                        .toLowerCase()
                        .replace(/\s+/g, "-")}`}
                    >
                      {selectedCluster.priorityBand}
                    </span>
                  </div>
                  <h3 className="detail-title">{selectedCluster.clusterTitle}</h3>
                  <p className="source-name">
                    {selectedCluster.itemCount} related stories • {selectedCluster.sourceCount} sources
                  </p>
                </div>

                <div className="detail-card">
                  <p className="section-label">Cluster Summary</p>
                  <p>{selectedCluster.clusterSummary}</p>
                </div>

                <div className="detail-card">
                  <p className="section-label">Why This Trend Matters</p>
                  <p>{selectedCluster.whyItMatters}</p>
                </div>

                <div className="detail-card">
                  <p className="section-label">Reusable Summary</p>
                  <textarea className="draft-box" defaultValue={selectedCluster.shortSummary} />
                </div>

                <div className="detail-card">
                  <p className="section-label">LinkedIn Draft</p>
                  <textarea className="draft-box draft-box-large" defaultValue={selectedCluster.linkedInDraft} />
                </div>

                <div className="detail-card">
                  <p className="section-label">Related Articles</p>
                  <ul className="related-list">
                    {selectedCluster.items.map((item) => (
                      <li key={item.id}>
                        <a href={item.link} target="_blank" rel="noreferrer">
                          {item.title}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="empty-state">Select a story or cluster to inspect it.</div>
            )}
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="section-label">Tuning</p>
                <h2>Priority Weights</h2>
              </div>
            </div>

            <div className="tuning-grid">
              {Object.entries(weights).map(([key, value]) => (
                <label className="slider-field" key={key}>
                  <span>{key}</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={value}
                    onChange={(event) =>
                      setWeights((current) => ({
                        ...current,
                        [key]: Number(event.target.value),
                      }))
                    }
                  />
                  <strong>{value}%</strong>
                </label>
              ))}
            </div>

            <div className="topic-toggle-grid">
              {Object.entries(initialData.topicDefinitions).map(([key, label]) => (
                <label className="topic-toggle" key={key}>
                  <input
                    checked={topicSettings[key]}
                    onChange={(event) =>
                      setTopicSettings((current) => ({
                        ...current,
                        [key]: event.target.checked,
                      }))
                    }
                    type="checkbox"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="section-label">Signal</p>
                <h2>Highlights</h2>
              </div>
            </div>

            <div className="highlights">
              {initialData.highlights.map((item) => (
                <article className="highlight-card" key={item.title}>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="section-label">Sources</p>
                <h2>Configured Inputs</h2>
              </div>
            </div>
            <SourceList sources={initialData.sources} />
          </section>
        </section>
      </main>
    </div>
  );
}
