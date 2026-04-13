const fallbackNewsItems = [
  {
    title: "Leading AI labs compete on better reasoning models",
    category: "Models",
    source: "Industry Watch",
    sourceType: "AI Lab",
    date: "Fallback sample",
    summary:
      "Model developers are focusing on systems that reason more reliably, handle complex instructions, and reduce obvious mistakes.",
    impact:
      "This matters because better reasoning makes AI more useful for serious work, not just quick chatbot answers.",
    priority: "High",
    relevanceScore: 92,
    link: "https://openai.com/news/",
  },
  {
    title: "AI features are being added into everyday software faster",
    category: "Products",
    source: "Product Tracker",
    sourceType: "Business News",
    date: "Fallback sample",
    summary:
      "Popular tools for writing, design, customer support, and coding are adding AI assistants directly into their main products.",
    impact:
      "This shows AI is moving from experimentation into normal daily business tools.",
    priority: "High",
    relevanceScore: 85,
    link: "https://news.google.com/home?hl=en-US&gl=US&ceid=US:en",
  },
  {
    title: "Governments continue shaping AI rules and safety expectations",
    category: "Policy",
    source: "Policy Brief",
    sourceType: "Policy",
    date: "Fallback sample",
    summary:
      "Regulators are asking companies to be clearer about how models are trained, tested, and deployed in public-facing products.",
    impact:
      "Policy changes can affect which products launch, how fast they ship, and what compliance businesses need.",
    priority: "High",
    relevanceScore: 89,
    link: "https://www.technologyreview.com/topic/artificial-intelligence/",
  },
];

const FEEDS = [
  {
    name: "OpenAI official news feed",
    url: "https://openai.com/news/rss.xml",
    type: "AI Lab",
    weight: 14,
  },
  {
    name: "Anthropic official news page",
    url: "https://news.google.com/rss/search?q=site:anthropic.com/news+Anthropic+when:30d&hl=en-US&gl=US&ceid=US:en",
    type: "AI Lab",
    weight: 13,
  },
  {
    name: "Google DeepMind official blog coverage",
    url: "https://news.google.com/rss/search?q=site:deepmind.google+DeepMind+when:30d&hl=en-US&gl=US&ceid=US:en",
    type: "AI Lab",
    weight: 12,
  },
  {
    name: "EU AI Act official coverage",
    url: "https://news.google.com/rss/search?q=%22EU+AI+Act%22+when:30d&hl=en-US&gl=US&ceid=US:en",
    type: "Policy",
    weight: 15,
  },
  {
    name: "European Commission AI policy pages",
    url: "https://news.google.com/rss/search?q=site:digital-strategy.ec.europa.eu+artificial+intelligence+when:30d&hl=en-US&gl=US&ceid=US:en",
    type: "Policy",
    weight: 12,
  },
  {
    name: "Digital Omnibus coverage",
    url: "https://news.google.com/rss/search?q=%22Digital+Omnibus%22+AI+when:30d&hl=en-US&gl=US&ceid=US:en",
    type: "Policy",
    weight: 12,
  },
  {
    name: "The Guardian AI coverage",
    url: "https://news.google.com/rss/search?q=site:theguardian.com+artificial+intelligence+when:14d&hl=en-US&gl=US&ceid=US:en",
    type: "News",
    weight: 8,
  },
  {
    name: "MIT Technology Review AI coverage",
    url: "https://news.google.com/rss/search?q=site:technologyreview.com+artificial+intelligence+when:14d&hl=en-US&gl=US&ceid=US:en",
    type: "News",
    weight: 10,
  },
  {
    name: "TechCrunch AI coverage",
    url: "https://news.google.com/rss/search?q=site:techcrunch.com+artificial+intelligence+when:14d&hl=en-US&gl=US&ceid=US:en",
    type: "Business News",
    weight: 9,
  },
  {
    name: "General AI market coverage",
    url: "https://news.google.com/rss/search?q=artificial+intelligence+enterprise+launch+funding+when:7d&hl=en-US&gl=US&ceid=US:en",
    type: "Business News",
    weight: 7,
  },
];

function formatToday() {
  return new Intl.DateTimeFormat("en", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date());
}

function formatArticleDate(dateString) {
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
    normalized.includes("act") ||
    normalized.includes("regulation") ||
    normalized.includes("compliance") ||
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
    normalized.includes("api") ||
    normalized.includes("product") ||
    normalized.includes("platform") ||
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

function scoreBusinessRelevance(text, category, feed) {
  const normalized = text.toLowerCase();
  let score = feed.weight || 0;

  const rules = [
    { terms: ["api", "enterprise", "workflow", "platform", "integration"], score: 14 },
    { terms: ["launch", "released", "rollout", "available"], score: 12 },
    { terms: ["funding", "acquisition", "partnership", "investment"], score: 10 },
    { terms: ["regulation", "compliance", "law", "act", "policy"], score: 15 },
    { terms: ["pricing", "revenue", "customer", "adoption"], score: 10 },
    { terms: ["research", "benchmark", "paper"], score: 7 },
    { terms: ["openai", "anthropic", "deepmind", "google"], score: 8 },
  ];

  rules.forEach((rule) => {
    if (rule.terms.some((term) => normalized.includes(term))) {
      score += rule.score;
    }
  });

  if (category === "Policy") {
    score += 8;
  }

  if (category === "Products") {
    score += 6;
  }

  if (category === "Models") {
    score += 5;
  }

  return Math.min(score, 100);
}

function getPriorityLabel(score) {
  if (score >= 75) {
    return "High";
  }

  if (score >= 50) {
    return "Medium";
  }

  return "Low";
}

function buildImpact(category) {
  const categoryMessages = {
    Models: "This may signal a capability shift that affects what AI tools can do in real work.",
    Products: "This shows how AI is being turned into everyday software people can actually use.",
    Research: "This may point to where AI performance and reliability are improving next.",
    Policy: "This could change how AI products are launched, governed, or trusted.",
    Industry: "This helps track the broader direction of the AI market and ecosystem.",
  };

  return categoryMessages[category] || categoryMessages.Industry;
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

function sortByPriority(items) {
  return [...items].sort((a, b) => {
    if (b.relevanceScore !== a.relevanceScore) {
      return b.relevanceScore - a.relevanceScore;
    }

    const aTime = new Date(a.date).getTime() || 0;
    const bTime = new Date(b.date).getTime() || 0;
    return bTime - aTime;
  });
}

async function fetchFeed(feed) {
  const url = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(feed.url)}`;
  const response = await fetch(url, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    throw new Error(`Could not load ${feed.name}`);
  }

  const data = await response.json();
  const items = Array.isArray(data.items) ? data.items : [];

  return items.slice(0, 6).map((item) => {
    const combinedText = `${item.title || ""} ${item.description || ""}`;
    const category = inferCategory(combinedText);
    const relevanceScore = scoreBusinessRelevance(combinedText, category, feed);

    return {
      title: item.title || "Untitled AI update",
      category,
      source: item.author || data.feed?.title || feed.name,
      sourceType: feed.type,
      date: item.pubDate || "",
      dateLabel: formatArticleDate(item.pubDate),
      summary: summarize(item.description),
      impact: buildImpact(category),
      priority: getPriorityLabel(relevanceScore),
      relevanceScore,
      link: item.link || feed.url,
    };
  });
}

function buildHighlights(newsItems) {
  const categoryCounts = newsItems.reduce((accumulator, item) => {
    accumulator[item.category] = (accumulator[item.category] || 0) + 1;
    return accumulator;
  }, {});

  const topCategory =
    Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "Industry";

  return [
    {
      title: `${topCategory} is leading today`,
      text: `Most of the highest-ranked items are landing in ${topCategory.toLowerCase()}, which helps you see where the current AI conversation is concentrated.`,
    },
    {
      title: "Ranked for business value",
      text: "Stories are now sorted by practical relevance, so launches, regulation, enterprise adoption, and major model updates rise first.",
    },
    {
      title: "Broader source coverage",
      text: "The feed mix now includes AI labs, EU policy coverage, and major media sources so the dashboard is more useful for business monitoring.",
    },
  ];
}

export async function getNewsBundle() {
  let newsItems;
  let status;

  try {
    const results = await Promise.allSettled(FEEDS.map(fetchFeed));
    const successfulItems = results
      .filter((result) => result.status === "fulfilled")
      .flatMap((result) => result.value);

    if (successfulItems.length === 0) {
      throw new Error("No stories loaded");
    }

    newsItems = sortByPriority(uniqueByLink(successfulItems)).slice(0, 15);
    status = "Live feeds connected on the server.";
  } catch (error) {
    newsItems = fallbackNewsItems.map((item) => ({
      ...item,
      dateLabel: "Recent",
    }));
    status = "Live feeds were unavailable, so fallback stories are shown.";
  }

  return {
    updatedAt: formatToday(),
    status,
    newsItems,
    highlights: buildHighlights(newsItems),
    sources: FEEDS.map((feed) => `${feed.name} (${feed.type})`),
  };
}
