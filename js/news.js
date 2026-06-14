/** News data layer — mock API with categories, pagination, cache */

import { getCache, setCache, TTL } from './cache.js';
import { withRetry } from './network.js';

// Category-specific fallback images from Unsplash (pre-sized, no auth needed)
export const CATEGORY_FALLBACKS = {
  technology: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=70',
  business:   'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=70',
  sports:     'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=70',
  science:    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=70',
  health:     'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=70',
  environment:'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=70',
  entertainment:'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=600&q=70',
  default:    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=70',
};

export function getArticleFallbackImage(category) {
  return CATEGORY_FALLBACKS[category] || CATEGORY_FALLBACKS.default;
}

const BASE_ARTICLES = [
  { id: 'n1', title: 'New AI Breakthrough Promises Faster Processing', excerpt: 'Researchers have developed a new architecture that dramatically reduces computation times for complex neural networks globally...', category: 'technology', source: 'TechCrunch', image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=70', publishedAt: new Date(Date.now() - 2 * 3600000).toISOString(), breaking: true },
  { id: 'n2', title: 'Global Markets Rally Amid Tech Sector Growth', excerpt: 'Investors are showing renewed confidence as major technology firms report earnings that exceed analyst expectations worldwide...', category: 'business', source: 'Bloomberg', image: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=70', publishedAt: new Date(Date.now() - 4 * 3600000).toISOString(), breaking: true },
  { id: 'n3', title: 'Mars Rover Discovers Traces of Ancient Water', excerpt: 'The latest soil samples analyzed by the rover indicate that liquid water once flowed freely across the Martian equator...', category: 'science', source: 'Space.com', image: 'https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?auto=format&fit=crop&w=600&q=70', publishedAt: new Date(Date.now() - 6 * 3600000).toISOString() },
  { id: 'n4', title: 'New Renewable Energy Policy Passed', excerpt: 'A landmark agreement has been reached to drastically increase subsidies for solar and wind energy production by 2030...', category: 'environment', source: 'Reuters', image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=70', publishedAt: new Date(Date.now() - 12 * 3600000).toISOString() },
  { id: 'n5', title: 'Championship Finals Draw Record Viewership', excerpt: "Millions tune in worldwide to watch the historic showdown between the league's top contenders...", category: 'sports', source: 'ESPN', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=70', publishedAt: new Date(Date.now() - 24 * 3600000).toISOString() },
  { id: 'n6', title: 'Blockbuster Movie Breaks Box Office Records', excerpt: 'The highly anticipated sequel has shattered opening weekend records across multiple global markets...', category: 'entertainment', source: 'Variety', image: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=600&q=70', publishedAt: new Date(Date.now() - 26 * 3600000).toISOString() },
  { id: 'n7', title: 'Next-Gen Smartphones Unveiled', excerpt: 'Major tech giants have announced their latest flagship devices featuring revolutionary battery technology...', category: 'technology', source: 'The Verge', image: 'https://images.unsplash.com/photo-1531297122539-d31b0a140618?auto=format&fit=crop&w=600&q=70', publishedAt: new Date(Date.now() - 48 * 3600000).toISOString() },
  { id: 'n8', title: 'Startup Funding Reaches New Highs', excerpt: 'Venture capital investments in green-tech startups have doubled in the last quarter...', category: 'business', source: 'Forbes', image: 'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&w=600&q=70', publishedAt: new Date(Date.now() - 50 * 3600000).toISOString() },
  { id: 'n9', title: 'New Nutritional Guidelines Published', excerpt: 'The World Health Organization releases updated dietary advice focusing on sustainable eating habits...', category: 'health', source: 'Healthline', image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=70', publishedAt: new Date(Date.now() - 72 * 3600000).toISOString() },
  { id: 'n10', title: 'Open Source Software Adoption Grows', excerpt: 'Enterprise adoption of open-source solutions has reached an all-time high this year globally...', category: 'technology', source: 'Wired', image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=70', publishedAt: new Date(Date.now() - 74 * 3600000).toISOString() },
  { id: 'n11', title: 'Cryptocurrency Regulations Expand', excerpt: 'Several nations have announced new frameworks for digital currency taxation and reporting...', category: 'business', source: 'WSJ', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=70', publishedAt: new Date(Date.now() - 96 * 3600000).toISOString() },
  { id: 'n12', title: 'New Exoplanet Discovered in Habitable Zone', excerpt: 'Astronomers have identified an Earth-sized planet orbiting a nearby star, showing signs of an atmosphere...', category: 'science', source: 'NatGeo', image: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=600&q=70', publishedAt: new Date(Date.now() - 120 * 3600000).toISOString() },
];

const EXTRA_TITLES = [
  { title: 'Quantum Computing Milestone Achieved', category: 'technology', source: 'MIT Review' },
  { title: 'Major Trade Agreement Signed', category: 'business', source: 'Financial Times' },
  { title: 'Olympic Records Shattered', category: 'sports', source: 'BBC Sport' },
  { title: 'Climate Summit Reaches Consensus', category: 'environment', source: 'The Guardian' },
  { title: 'Breakthrough in Cancer Treatment', category: 'health', source: 'Nature' },
  { title: 'Streaming Platform Hits 100M Users', category: 'entertainment', source: 'Hollywood Reporter' },
];

const CATEGORY_MAP = {
  all: () => true,
  technology: (a) => a.category === 'technology',
  business: (a) => a.category === 'business',
  sports: (a) => a.category === 'sports',
  health: (a) => a.category === 'health',
  entertainment: (a) => a.category === 'entertainment',
};

function generateExtraArticles(page) {
  return EXTRA_TITLES.map((item, i) => {
    const id = `extra_${page}_${i}`;
    const hoursAgo = (page * 6 + i + 1) * 24;
    return {
      id,
      title: item.title,
      excerpt: `Latest developments in ${item.category} as reported by ${item.source}. Industry experts weigh in on the implications...`,
      category: item.category,
      source: item.source,
      // Use category fallback — never null image
      image: getArticleFallbackImage(item.category),
      publishedAt: new Date(Date.now() - hoursAgo * 3600000).toISOString(),
      url: '#',
    };
  });
}

let activeController = null;

export async function fetchNews({ category = 'all', page = 1, force = false } = {}) {
  const cacheKey = `news_${category}_p${page}`;
  if (!force) {
    const cached = getCache(cacheKey);
    if (cached) return cached;
  }

  if (activeController) activeController.abort();
  activeController = new AbortController();
  const signal = activeController.signal;

  const result = await withRetry(async () => {
    await new Promise((resolve, reject) => {
      if (signal.aborted) return reject(new DOMException('Aborted', 'AbortError'));
      const timer = setTimeout(resolve, 400 + Math.random() * 300);
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      }, { once: true }); // { once: true } prevents listener accumulation
    });

    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');

    const filter = CATEGORY_MAP[category] || CATEGORY_MAP.all;
    let articles = page === 1
      ? BASE_ARTICLES.filter(filter)
      : generateExtraArticles(page).filter(filter);

    // Ensure every article has a valid image (never null/undefined)
    articles = articles.map((a) => ({
      ...a,
      image: a.image || getArticleFallbackImage(a.category),
    }));

    const response = {
      articles,
      page,
      hasMore: page < 4,
      total: articles.length,
    };

    setCache(cacheKey, response, TTL.NEWS);
    return response;
  });

  return result;
}

export function getTickerHeadlines(articles) {
  return articles
    .filter((a) => a.breaking || a.category === 'business')
    .slice(0, 3)
    .map((a) => `${a.title}...`);
}

export function cancelNewsFetch() {
  if (activeController) {
    activeController.abort();
    activeController = null;
  }
}
