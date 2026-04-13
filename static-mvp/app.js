const fallbackNewsItems = [
  {
    title: "Leading AI labs compete on better reasoning models",
    category: "Models",
    source: "Industry Watch",
    date: "Fallback sample",
    summary:
      "Model developers are focusing on systems that reason more reliably, handle complex instructions, and reduce obvious mistakes.",
    impact:
      "This matters because better reasoning makes AI more useful for serious work, not just quick chatbot answers.",
    link: "https://openai.com/news/",
  },
  {
    title: "AI features are being added into everyday software faster",
    category: "Products",
    source: "Product Tracker",
    date: "Fallback sample",
    summary:
      "Popular tools for writing, design, customer support, and coding are adding AI assistants directly into their main products.",
    impact:
      "This shows AI is moving from experimentation into normal daily business tools.",
    link: "https://www.theverge.com/ai-artificial-intelligence",
  },
  {
    title: "Governments continue shaping AI rules and safety expectations",
    category: "Policy",
    source: "Policy Brief",
    date: "Fallback sample",
    summary:
      "Regulators are asking companies to be clearer about how models are trained, tested, and deployed in public-facing products.",
    impact:
      "Policy changes can affect which products launch, how fast they ship, and what compliance businesses need.",
    link: "https://www.technologyreview.com/topic/artificial-intelligence/",
  },
  {
    title: "New research focuses on agents that can complete longer tasks",
    category: "Research",
    source: "Research Digest",
    date: "Fallback sample",
    summary:
      "Researchers are testing AI systems that can plan, use tools, and complete multi-step work instead of answering only one prompt at a time.",
    impact:
      "This could unlock more powerful assistants for research, operations, and automation.",
    link: "https://deepmind.google/discover/blog/",
  },
];

const FEEDS = [
  {
    name: "OpenAI",
    url: "https://openai.com/news/rss.xml",
  },
  {
    name: "Google News: AI",
    url: "https://news.google.com/rss/search?q=artificial+intelligence+when:7d&hl=en-US&gl=US&ceid=US:en",
  },
  {
    name: "Google News: OpenAI",
    url: "https://news.google.com/rss/search?q=OpenAI+when:7d&hl=en-US&gl=US&ceid=US:en",
  },
  {
    name: "Google News: Anthropic",
    url: "https://news.google.com/rss/search?q=Anthropic+when:7d&hl=en-US&gl=US&ceid=US:en",
  },
  {
    name: "Google News: DeepMind",
    url: "https://news.google.com/rss/search?q=Google+DeepMind+when:7d&hl=en-US&gl=US&ceid=US:en",
  },
];

let newsItems = [];

const newsGrid = document.querySelector("#news-grid");
const highlightsContainer = document.querySelector("#highlights");
const categoryFilter = document.querySelector("#category-filter");
const updateDate = document.querySelector("#update-date");
const topStoryTag = document.querySelector("#top-story-tag");
const storyCount = document.querySelector("#story-count");
const feedStatus = document.querySelector("#feed-status");
const refreshButton = document.querySelector("#refresh-button");
const newsCardTemplate = document.querySelector("#news-card-template");
const highlightTemplate = document.querySelector("#highlight-template");

function formatToday() {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
}

function formatArticleDate(dateString) {
  if (!dateString) {
    return "Recent";
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return "Recent";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);
}

function inferCategory(text) {
  const normalized = text.toLowerCase();

  if (
    normalized.includes("policy") ||
    normalized.includes("regulation") ||
    normalized.includes("government") ||
    normalized.includes("safety")
  ) {
    return "Policy";
  }

  if (
    normalized.includes("research") ||
    normalized.includes("paper") ||
    normalized.includes("study") ||
    normalized.includes("benchmark")
  ) {
    return "Research";
  }

  if (
    normalized.includes("launch") ||
    normalized.includes("product") ||
    normalized.includes("assistant") ||
    normalized.includes("app")
  ) {
    return "Products";
  }

  if (
    normalized.includes("model") ||
    normalized.includes("gpt") ||
    normalized.includes("claude") ||
    normalized.includes("gemini")
  ) {
    return "Models";
  }

  return "Industry";
}

function summarize(description) {
  if (!description) {
    return "A fresh AI-related update from one of the tracked sources.";
  }

  const stripped = description.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  if (!stripped) {
    return "A fresh AI-related update from one of the tracked sources.";
  }

  return stripped.length > 180 ? `${stripped.slice(0, 177)}...` : stripped;
}

function buildImpact(item) {
  const categoryMessages = {
    Models: "This may signal a capability shift that affects what AI tools can do in real work.",
    Products: "This shows how AI is being turned into everyday software people can actually use.",
    Research: "This may point to where AI performance and reliability are improving next.",
    Policy: "This could change how AI products are launched, governed, or trusted.",
    Industry: "This helps track the broader direction of the AI market and ecosystem.",
  };

  return categoryMessages[item.category] || categoryMessages.Industry;
}

function uniqueByLink(items) {
  const seen = new Set();

  return items.filter((item) => {
    if (!item.link || seen.has(item.link)) {
      return false;
    }

    seen.add(item.link);
    return true;
  });
}

function sortByDate(items) {
  return [...items].sort((a, b) => {
    const aTime = new Date(a.date).getTime() || 0;
    const bTime = new Date(b.date).getTime() || 0;
    return bTime - aTime;
  });
}

function renderCategories() {
  const categories = [...new Set(newsItems.map((item) => item.category))];

  categoryFilter.innerHTML = '<option value="all">All</option>';

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

function renderNews(selectedCategory = "all") {
  newsGrid.innerHTML = "";

  const visibleItems =
    selectedCategory === "all"
      ? newsItems
      : newsItems.filter((item) => item.category === selectedCategory);

  if (visibleItems.length === 0) {
    newsGrid.innerHTML =
      '<div class="empty-state">No stories match this category yet. Try a different filter or refresh the feed.</div>';
    return;
  }

  visibleItems.forEach((item) => {
    const card = newsCardTemplate.content.cloneNode(true);
    card.querySelector(".category-badge").textContent = item.category;
    card.querySelector(".source-name").textContent = `${item.source} • ${formatArticleDate(
      item.date
    )}`;
    card.querySelector(".news-title").textContent = item.title;
    card.querySelector(".news-summary").textContent = item.summary;
    card.querySelector(".news-impact").textContent = item.impact;

    const link = card.querySelector(".news-link");
    link.href = item.link;

    newsGrid.appendChild(card);
  });
}

function renderHighlights() {
  const categoryCounts = newsItems.reduce((accumulator, item) => {
    accumulator[item.category] = (accumulator[item.category] || 0) + 1;
    return accumulator;
  }, {});

  const topCategory =
    Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Industry";

  const highlights = [
    {
      title: `${topCategory} is leading today`,
      text: `Most of the latest items are landing in ${topCategory.toLowerCase()}, which is a useful clue about where the current AI conversation is concentrated.`,
    },
    {
      title: "Daily signal over noise",
      text: `You currently have ${newsItems.length} live stories collected into one page, so you do not need to check each source manually.`,
    },
    {
      title: "Built to grow later",
      text: "This version uses real feed data now, and we can later add better summaries, saved items, or scheduled daily delivery.",
    },
  ];

  highlightsContainer.innerHTML = "";

  highlights.forEach((item) => {
    const card = highlightTemplate.content.cloneNode(true);
    card.querySelector("h3").textContent = item.title;
    card.querySelector("p").textContent = item.text;
    highlightsContainer.appendChild(card);
  });
}

async function fetchFeed(feed) {
  const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Could not load ${feed.name}`);
  }

  const data = await response.json();
  const items = Array.isArray(data.items) ? data.items : [];

  return items.slice(0, 6).map((item) => {
    const combinedText = `${item.title || ""} ${item.description || ""}`;
    const category = inferCategory(combinedText);

    return {
      title: item.title || "Untitled AI update",
      category,
      source: item.author || data.feed?.title || feed.name,
      date: item.pubDate || "",
      summary: summarize(item.description),
      impact: buildImpact({ category }),
      link: item.link || feed.url,
    };
  });
}

async function loadLiveNews() {
  feedStatus.textContent = "Loading live AI headlines...";
  refreshButton.disabled = true;

  try {
    const results = await Promise.allSettled(FEEDS.map(fetchFeed));
    const successfulItems = results
      .filter((result) => result.status === "fulfilled")
      .flatMap((result) => result.value);

    if (successfulItems.length === 0) {
      throw new Error("No live stories could be loaded.");
    }

    newsItems = sortByDate(uniqueByLink(successfulItems)).slice(0, 12);
    feedStatus.textContent = "Live feeds connected.";
  } catch (error) {
    newsItems = fallbackNewsItems;
    feedStatus.textContent =
      "Live feeds were unavailable, so sample stories are shown for now.";
  } finally {
    updateDashboard();
    refreshButton.disabled = false;
  }
}

function updateDashboard() {
  updateDate.textContent = formatToday();
  topStoryTag.textContent = newsItems[0]?.category || "No stories";
  storyCount.textContent = String(newsItems.length);

  renderCategories();
  renderNews();
  renderHighlights();
}

function init() {
  refreshButton.addEventListener("click", () => {
    loadLiveNews();
  });

  categoryFilter.addEventListener("change", (event) => {
    renderNews(event.target.value);
  });

  loadLiveNews();
}

init();
