const TOPIC_DEFINITIONS = {
  regulation: {
    label: "Regulation",
    importance: 95,
    keywords: [
      "regulation",
      "compliance",
      "law",
      "act",
      "government",
      "policy",
      "ai office",
      "oversight",
      "risk",
    ],
  },
  enterprise_ai_tools: {
    label: "Enterprise AI Tools",
    importance: 88,
    keywords: [
      "enterprise",
      "workspace",
      "copilot",
      "platform",
      "api",
      "workflow",
      "integration",
      "agent",
      "assistant",
      "customer",
      "productivity",
    ],
  },
  ai_use_cases: {
    label: "AI Use Cases",
    importance: 78,
    keywords: [
      "use case",
      "deployment",
      "implementation",
      "adoption",
      "operations",
      "marketing",
      "sales",
      "healthcare",
      "finance",
      "support",
      "automation",
    ],
  },
  model_updates: {
    label: "Model Updates",
    importance: 84,
    keywords: [
      "model",
      "gpt",
      "claude",
      "gemini",
      "release",
      "reasoning",
      "benchmark",
      "multimodal",
      "foundation model",
      "inference",
    ],
  },
};

const DEFAULT_SCORING_WEIGHTS = {
  consultingRelevance: 35,
  clientImpact: 30,
  topicImportance: 20,
  recency: 15,
};

const DEFAULT_TOPIC_SETTINGS = {
  regulation: true,
  enterprise_ai_tools: true,
  ai_use_cases: true,
  model_updates: true,
};

const FEEDS = [
  {
    id: "openai-news",
    name: "OpenAI official news",
    url: "https://openai.com/news/rss.xml",
    type: "AI Lab",
    weight: 14,
  },
  {
    id: "anthropic-news",
    name: "Anthropic official news",
    url: "https://news.google.com/rss/search?q=site:anthropic.com/news+Anthropic+when:30d&hl=en-US&gl=US&ceid=US:en",
    type: "AI Lab",
    weight: 13,
  },
  {
    id: "deepmind-news",
    name: "Google DeepMind coverage",
    url: "https://news.google.com/rss/search?q=site:deepmind.google+DeepMind+when:30d&hl=en-US&gl=US&ceid=US:en",
    type: "AI Lab",
    weight: 12,
  },
  {
    id: "eu-ai-act",
    name: "EU AI Act coverage",
    url: "https://news.google.com/rss/search?q=%22EU+AI+Act%22+when:30d&hl=en-US&gl=US&ceid=US:en",
    type: "Policy",
    weight: 15,
  },
  {
    id: "ec-ai-policy",
    name: "European Commission AI policy",
    url: "https://news.google.com/rss/search?q=site:digital-strategy.ec.europa.eu+artificial+intelligence+when:30d&hl=en-US&gl=US&ceid=US:en",
    type: "Policy",
    weight: 12,
  },
  {
    id: "digital-omnibus",
    name: "Digital Omnibus coverage",
    url: "https://news.google.com/rss/search?q=%22Digital+Omnibus%22+AI+when:30d&hl=en-US&gl=US&ceid=US:en",
    type: "Policy",
    weight: 12,
  },
  {
    id: "guardian-ai",
    name: "The Guardian AI",
    url: "https://news.google.com/rss/search?q=site:theguardian.com+artificial+intelligence+when:14d&hl=en-US&gl=US&ceid=US:en",
    type: "News",
    weight: 8,
  },
  {
    id: "mit-ai",
    name: "MIT Technology Review AI",
    url: "https://news.google.com/rss/search?q=site:technologyreview.com+artificial+intelligence+when:14d&hl=en-US&gl=US&ceid=US:en",
    type: "News",
    weight: 10,
  },
  {
    id: "techcrunch-ai",
    name: "TechCrunch AI",
    url: "https://news.google.com/rss/search?q=site:techcrunch.com+artificial+intelligence+when:14d&hl=en-US&gl=US&ceid=US:en",
    type: "Business News",
    weight: 9,
  },
  {
    id: "enterprise-ai",
    name: "Enterprise AI tools coverage",
    url: "https://news.google.com/rss/search?q=enterprise+AI+tools+copilot+agent+when:14d&hl=en-US&gl=US&ceid=US:en",
    type: "Business News",
    weight: 11,
  },
  {
    id: "ai-use-cases",
    name: "AI use cases coverage",
    url: "https://news.google.com/rss/search?q=AI+use+cases+enterprise+adoption+when:14d&hl=en-US&gl=US&ceid=US:en",
    type: "Business News",
    weight: 9,
  },
  {
    id: "model-updates",
    name: "Model update coverage",
    url: "https://news.google.com/rss/search?q=OpenAI+Anthropic+DeepMind+model+update+when:14d&hl=en-US&gl=US&ceid=US:en",
    type: "AI Lab",
    weight: 10,
  },
];

const fallbackNewsItems = [
  {
    id: "fallback-regulation",
    title: "EU policy updates continue shaping AI compliance planning",
    source: "Policy Brief",
    sourceType: "Policy",
    link: "https://digital-strategy.ec.europa.eu/en/policies/european-approach-artificial-intelligence",
    date: "2026-04-13",
    description:
      "European AI policy continues to influence procurement, governance, and delivery expectations for organizations adopting AI at scale.",
  },
  {
    id: "fallback-enterprise",
    title: "Enterprise copilots are moving from demos into delivery workflows",
    source: "Enterprise Tracker",
    sourceType: "Business News",
    link: "https://news.google.com/home?hl=en-US&gl=US&ceid=US:en",
    date: "2026-04-12",
    description:
      "Teams are increasingly evaluating copilots and agents as workflow tools rather than novelty features, especially in support and operations functions.",
  },
  {
    id: "fallback-models",
    title: "Model providers keep pushing reasoning and multimodal updates",
    source: "Model Watch",
    sourceType: "AI Lab",
    link: "https://openai.com/news/",
    date: "2026-04-11",
    description:
      "Foundation model vendors are emphasizing more reliable reasoning, richer inputs, and stronger tools support to improve business usefulness.",
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

function normalizeWhitespace(value) {
  return value.replace(/\s+/g, " ").trim();
}

function stripHtml(value) {
  return normalizeWhitespace(value.replace(/<[^>]+>/g, " "));
}

function inferTopic(text) {
  const normalized = text.toLowerCase();
  let bestTopic = "ai_use_cases";
  let bestScore = 0;

  for (const [topicKey, definition] of Object.entries(TOPIC_DEFINITIONS)) {
    const score = definition.keywords.reduce(
      (total, keyword) => total + (normalized.includes(keyword) ? 1 : 0),
      0
    );

    if (score > bestScore) {
      bestScore = score;
      bestTopic = topicKey;
    }
  }

  return bestTopic;
}

function scoreConsultingRelevance(text, feed) {
  const normalized = text.toLowerCase();
  let score = 45 + (feed.weight || 0) * 2;

  const rules = [
    { terms: ["consulting", "services", "client", "delivery"], score: 12 },
    { terms: ["api", "integration", "workflow", "agent"], score: 14 },
    { terms: ["enterprise", "operations", "implementation"], score: 12 },
    { terms: ["compliance", "governance", "risk"], score: 10 },
  ];

  rules.forEach((rule) => {
    if (rule.terms.some((term) => normalized.includes(term))) {
      score += rule.score;
    }
  });

  return Math.min(score, 100);
}

function scoreClientImpact(text, topicKey) {
  const normalized = text.toLowerCase();
  let score = 42;

  const rules = [
    { terms: ["launch", "rolled out", "released", "availability"], score: 12 },
    { terms: ["pricing", "cost", "savings", "productivity"], score: 10 },
    { terms: ["regulation", "law", "act", "compliance"], score: 15 },
    { terms: ["adoption", "customer", "enterprise"], score: 12 },
    { terms: ["security", "safety", "risk"], score: 10 },
  ];

  rules.forEach((rule) => {
    if (rule.terms.some((term) => normalized.includes(term))) {
      score += rule.score;
    }
  });

  if (topicKey === "regulation") {
    score += 8;
  }

  if (topicKey === "enterprise_ai_tools") {
    score += 6;
  }

  return Math.min(score, 100);
}

function scoreTopicImportance(topicKey) {
  return TOPIC_DEFINITIONS[topicKey]?.importance || 60;
}

function scoreRecency(dateString) {
  const publishedAt = new Date(dateString);
  const now = new Date();

  if (Number.isNaN(publishedAt.getTime())) {
    return 50;
  }

  const hoursOld = Math.max(0, (now.getTime() - publishedAt.getTime()) / 36e5);

  if (hoursOld <= 24) {
    return 100;
  }
  if (hoursOld <= 72) {
    return 85;
  }
  if (hoursOld <= 168) {
    return 70;
  }
  if (hoursOld <= 336) {
    return 55;
  }
  return 35;
}

function computePriorityScore(factors, weights) {
  const total =
    factors.consultingRelevance * (weights.consultingRelevance / 100) +
    factors.clientImpact * (weights.clientImpact / 100) +
    factors.topicImportance * (weights.topicImportance / 100) +
    factors.recency * (weights.recency / 100);

  return Math.round(total);
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
  const topicLabel = TOPIC_DEFINITIONS[item.topicKey]?.label || "AI update";
  const strongestFactor = Object.entries(item.scoreFactors).sort((a, b) => b[1] - a[1])[0]?.[0];

  const factorExplanations = {
    consultingRelevance:
      "it creates a strong consulting conversation around implementation, governance, or delivery choices",
    clientImpact:
      "it could materially affect clients through compliance, adoption, tooling, or cost decisions",
    topicImportance:
      `it sits in the high-priority ${topicLabel.toLowerCase()} lane`,
    recency: "it is recent enough to matter for current planning and client conversations",
  };

  return `This ranks highly because ${factorExplanations[strongestFactor] || "it combines business relevance and recency"}.`;
}

function buildSummary(text, topicKey) {
  const clean = stripHtml(text);
  const lead =
    clean.length > 190 ? `${clean.slice(0, 187)}...` : clean || "A fresh AI update was captured from the configured source list.";

  const topicLabel = TOPIC_DEFINITIONS[topicKey]?.label || "AI";
  return `${lead} Focus area: ${topicLabel}.`;
}

function buildShortSummary(item) {
  return `${item.title}. ${item.whyItMatters}`;
}

function buildLinkedInDraft(item) {
  const topicLabel = TOPIC_DEFINITIONS[item.topicKey]?.label || "AI";

  return [
    `One ${topicLabel.toLowerCase()} update worth watching today: ${item.title}`,
    "",
    `${item.summary}`,
    "",
    `Why this matters: ${item.whyItMatters}`,
    "",
    "If you work in delivery, consulting, or leadership, this is the kind of signal that can shape client conversations quickly.",
    "",
    `Source: ${item.link}`,
  ].join("\n");
}

function extractEntities(text) {
  const normalized = text.toLowerCase();
  const entities = [
    "openai",
    "anthropic",
    "deepmind",
    "google",
    "eu ai act",
    "digital omnibus",
    "copilot",
    "gemini",
    "claude",
    "gpt",
    "enterprise ai",
    "agent",
  ];

  return entities.filter((entity) => normalized.includes(entity));
}

function buildClusterKey(item) {
  const entities = extractEntities(`${item.title} ${item.summary}`);
  if (entities.length > 0) {
    return `${item.topicKey}:${entities[0]}`;
  }

  const titleTokens = item.title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((token) => token.length > 4)
    .slice(0, 3);

  return `${item.topicKey}:${titleTokens.join("-") || "general"}`;
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
    if (b.priorityScore !== a.priorityScore) {
      return b.priorityScore - a.priorityScore;
    }

    const aTime = new Date(a.date).getTime() || 0;
    const bTime = new Date(b.date).getTime() || 0;
    return bTime - aTime;
  });
}

function normalizeItem(rawItem, feed) {
  const description = rawItem.description || rawItem.content || "";
  const combinedText = `${rawItem.title || ""} ${description}`;
  const topicKey = inferTopic(combinedText);

  const scoreFactors = {
    consultingRelevance: scoreConsultingRelevance(combinedText, feed),
    clientImpact: scoreClientImpact(combinedText, topicKey),
    topicImportance: scoreTopicImportance(topicKey),
    recency: scoreRecency(rawItem.date || rawItem.pubDate || ""),
  };

  const priorityScore = computePriorityScore(scoreFactors, DEFAULT_SCORING_WEIGHTS);

  const item = {
    id: rawItem.id || rawItem.link || `${feed.id}-${Math.random().toString(36).slice(2, 8)}`,
    title: rawItem.title || "Untitled AI update",
    source: rawItem.source || feed.name,
    sourceType: rawItem.sourceType || feed.type,
    link: rawItem.link || feed.url,
    date: rawItem.date || rawItem.pubDate || "",
    dateLabel: formatArticleDate(rawItem.date || rawItem.pubDate || ""),
    topicKey,
    topicLabel: TOPIC_DEFINITIONS[topicKey].label,
    scoreFactors,
    priorityScore,
    priorityBand: getPriorityBand(priorityScore),
    summary: buildSummary(description, topicKey),
  };

  item.whyItMatters = buildWhyItMatters(item);
  item.shortSummary = buildShortSummary(item);
  item.linkedInDraft = buildLinkedInDraft(item);
  item.clusterKey = buildClusterKey(item);

  return item;
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

  return items.slice(0, 8).map((item) =>
    normalizeItem(
      {
        title: item.title,
        source: item.author || data.feed?.title || feed.name,
        link: item.link,
        date: item.pubDate,
        description: item.description,
      },
      feed
    )
  );
}

function buildClusters(newsItems) {
  const groups = new Map();

  newsItems.forEach((item) => {
    const key = item.clusterKey;
    const group = groups.get(key) || [];
    group.push(item);
    groups.set(key, group);
  });

  return sortByPriority(
    [...groups.entries()].map(([key, items]) => {
      const topItem = sortByPriority(items)[0];
      const topicKey = topItem.topicKey;
      const clusterPriorityScore = Math.round(
        items.reduce((total, item) => total + item.priorityScore, 0) / items.length
      );

      return {
        id: key,
        clusterTitle:
          items.length > 1
            ? `${topItem.topicLabel}: ${topItem.title}`
            : `${topItem.topicLabel}: single-source signal`,
        clusterSummary:
          items.length > 1
            ? `${items.length} related stories point to the same development, helping reduce duplicate reading across sources.`
            : "A single high-signal article sits in this cluster right now.",
        whyItMatters:
          items.length > 1
            ? `This trend matters because ${items.length} related sources reinforce the same signal, improving confidence for client conversations.`
            : topItem.whyItMatters,
        articleIds: items.map((item) => item.id),
        itemIds: items.map((item) => item.id),
        itemCount: items.length,
        topicKey,
        topicLabel: topItem.topicLabel,
        clusterPriorityScore,
        priorityBand: getPriorityBand(clusterPriorityScore),
        sourceCount: new Set(items.map((item) => item.source)).size,
        shortSummary: `${topItem.topicLabel} trend: ${topItem.shortSummary}`,
        linkedInDraft: [
          `A trend I am watching in ${topItem.topicLabel.toLowerCase()}:`,
          "",
          topItem.title,
          "",
          `${items.length} related stories are reinforcing this signal across ${new Set(
            items.map((item) => item.source)
          ).size} sources.`,
          "",
          `Why it matters: ${
            items.length > 1
              ? `multiple sources suggest this is becoming more relevant for consulting and client planning.`
              : topItem.whyItMatters
          }`,
        ].join("\n"),
      };
    })
  );
}

function buildHighlights(newsItems, clusters) {
  const topCluster = clusters[0];
  const topItem = newsItems[0];

  return [
    {
      title: "Highest-value signal",
      text: topItem
        ? `${topItem.title} is currently the top-ranked story with a ${topItem.priorityBand.toLowerCase()} score band.`
        : "No top-ranked item is available yet.",
    },
    {
      title: "Clustered for lower noise",
      text: topCluster
        ? `${topCluster.itemCount} related articles have been grouped into the strongest cluster so duplicate coverage is easier to scan.`
        : "Clusters will appear here when related stories are detected.",
    },
    {
      title: "Built for consulting relevance",
      text: "Ranking uses consulting relevance, client impact, topic importance, and recency to keep the dashboard aligned to business value.",
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

    newsItems = sortByPriority(uniqueByLink(successfulItems)).slice(0, 18);
    status = "Live feeds connected on the server.";
  } catch (error) {
    newsItems = sortByPriority(
      fallbackNewsItems.map((item) =>
        normalizeItem(
          {
            ...item,
          },
          {
            id: "fallback",
            name: item.source,
            type: item.sourceType,
            url: item.link,
            weight: 10,
          }
        )
      )
    );
    status = "Live feeds were unavailable, so fallback stories are shown.";
  }

  const clusters = buildClusters(newsItems);

  return {
    updatedAt: formatToday(),
    status,
    newsItems,
    clusters,
    highlights: buildHighlights(newsItems, clusters),
    sources: FEEDS.map((feed) => ({
      id: feed.id,
      name: feed.name,
      type: feed.type,
      url: feed.url,
    })),
    defaultScoringWeights: DEFAULT_SCORING_WEIGHTS,
    defaultTopicSettings: DEFAULT_TOPIC_SETTINGS,
    topicDefinitions: Object.fromEntries(
      Object.entries(TOPIC_DEFINITIONS).map(([key, value]) => [key, value.label])
    ),
  };
}
