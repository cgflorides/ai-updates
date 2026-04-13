"use client";

import { useState } from "react";

export default function NewsDashboard({ initialData }) {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const newsItems = initialData.newsItems || [];
  const highlights = initialData.highlights || [];
  const categories = ["all", ...new Set(newsItems.map((item) => item.category))];

  const visibleItems =
    selectedCategory === "all"
      ? newsItems
      : newsItems.filter((item) => item.category === selectedCategory);

  return (
    <div className="page-shell">
      <header className="hero">
        <p className="eyebrow">Daily AI Intelligence</p>
        <h1>Pulse AI Daily</h1>
        <p className="hero-copy">
          A more structured Next.js version of your AI updates app, designed to
          grow into a real product.
        </p>

        <div className="hero-meta">
          <div className="meta-card">
            <span className="meta-label">Update Time</span>
            <strong>{initialData.updatedAt}</strong>
          </div>
          <div className="meta-card">
            <span className="meta-label">Top Story</span>
            <strong>{newsItems[0]?.category || "No stories"}</strong>
          </div>
          <div className="meta-card">
            <span className="meta-label">Stories Loaded</span>
            <strong>{newsItems.length}</strong>
          </div>
        </div>
      </header>

      <main className="dashboard">
        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="section-label">Today</p>
              <h2>Key Updates</h2>
            </div>
            <label className="filter">
              <span>Category</span>
              <select
                value={selectedCategory}
                onChange={(event) => setSelectedCategory(event.target.value)}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category === "all" ? "All" : category}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="toolbar">
            <p className="feed-status">{initialData.status}</p>
            <button className="refresh-button" type="button" disabled>
              Server-loaded
            </button>
          </div>

          <div className="news-grid">
            {visibleItems.length === 0 ? (
              <div className="empty-state">
                No stories match this category right now.
              </div>
            ) : (
              visibleItems.map((item) => (
                <article className="news-card" key={item.link}>
                  <div className="news-card-top">
                    <div className="card-badges">
                      <span className="category-badge">{item.category}</span>
                      <span className={`priority-badge priority-${item.priority.toLowerCase()}`}>
                        {item.priority} Priority
                      </span>
                    </div>
                    <span className="source-name">
                      {item.source} • {item.dateLabel}
                    </span>
                  </div>
                  <h3 className="news-title">{item.title}</h3>
                  <p className="news-summary">{item.summary}</p>
                  <p className="news-score">
                    Business relevance score: <strong>{item.relevanceScore}</strong>
                  </p>
                  <p className="news-impact">{item.impact}</p>
                  <a
                    className="news-link"
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Read source
                  </a>
                </article>
              ))
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <div>
              <p className="section-label">Signal</p>
              <h2>Why It Matters</h2>
            </div>
          </div>

          <div className="highlights">
            {highlights.map((item) => (
              <article className="highlight-card" key={item.title}>
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </article>
            ))}
          </div>

          <div className="panel" style={{ marginTop: 18, padding: 20 }}>
            <p className="section-label">Sources</p>
            <h2>Tracked Feeds</h2>
            <ul className="sources-list">
              {initialData.sources.map((source) => (
                <li key={source}>{source}</li>
              ))}
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
