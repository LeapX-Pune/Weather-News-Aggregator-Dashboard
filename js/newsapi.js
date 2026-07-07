/**
 * newsapi.js
 * NewsData.io integration — city-based real news, worldwide, with fallback
 *
 * API KEY: pub_bb28e833805540278095be60924e2647
 * Works on localhost AND GitHub Pages — no CORS blocking
 */
const NEWSDATA_API_KEY = 'pub_bb28e833805540278095be60924e2647';
const NEWSDATA_BASE    = 'https://newsdata.io/api/1/news';

// ─── Imports ──────────────────────────────────────────────────────────────────

import { renderNewsGrid, renderTicker, renderFeatured } from './ui.js';

// ─── Location State ───────────────────────────────────────────────────────────

let _currentCity    = 'Brooklyn';
let _currentCountry = 'USA';

export function setNewsLocation(city, country) {
  _currentCity    = (city    || 'Brooklyn').trim();
  _currentCountry = (country || 'USA').trim();
}

export function getNewsLocation() {
  return { city: _currentCity, country: _currentCountry };
}

// ─── Category Maps ────────────────────────────────────────────────────────────

// App filter → display label
const CATEGORY_DISPLAY = {
  all:           'general',
  technology:    'technology',
  business:      'business',
  sports:        'sports',
  health:        'health',
  entertainment: 'entertainment',
};

// App filter → NewsData.io API category param
const NEWSDATA_CATEGORY = {
  all:           '',
  technology:    'technology',
  business:      'business',
  sports:        'sports',
  health:        'health',
  entertainment: 'entertainment',
};

// NewsData.io category array → app category label
// Used to tag each article with its correct category from API response
const API_CATEGORY_LABEL = {
  technology:    'technology',
  business:      'business',
  sports:        'sports',
  health:        'health',
  entertainment: 'entertainment',
  politics:      'general',
  world:         'general',
  science:       'science',
  environment:   'environment',
  top:           'general',
  breaking:      'general',
};

// ─── Per-category unique fallback images ─────────────────────────────────────
// Each category has multiple images — randomly picked so same-category cards
// never show the same static image twice in a row

const CATEGORY_FALLBACK_POOL = {
  technology: [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=70',
    'https://images.unsplash.com/photo-1531297122539-d31b0a140618?auto=format&fit=crop&w=600&q=70',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=70',
  ],
  business: [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=70',
    'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&w=600&q=70',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=70',
  ],
  sports: [
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=70',
    'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=600&q=70',
    'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=600&q=70',
  ],
  health: [
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=70',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=70',
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=70',
  ],
  entertainment: [
    'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=600&q=70',
    'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=600&q=70',
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=70',
  ],
  science: [
    'https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?auto=format&fit=crop&w=600&q=70',
    'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=600&q=70',
  ],
  environment: [
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=70',
    'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=600&q=70',
  ],
  general: [
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=70',
    'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?auto=format&fit=crop&w=600&q=70',
    'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=600&q=70',
  ],
};

// Per-category counter so each card in same category gets a DIFFERENT placeholder
const _fallbackCounters = {};

/**
 * Category ke liye unique placeholder image — rotating pool se
 * Baar baar same image nahi aayegi same category mein
 */
function getUniquePlaceholder(category) {
  const pool = CATEGORY_FALLBACK_POOL[category] || CATEGORY_FALLBACK_POOL.general;
  const count = _fallbackCounters[category] || 0;
  _fallbackCounters[category] = (count + 1) % pool.length;
  return pool[count % pool.length];
}

/** Reset counters har naye city fetch pe */
function resetFallbackCounters() {
  Object.keys(_fallbackCounters).forEach((k) => { _fallbackCounters[k] = 0; });
}

// ─── Country → news portal (mock fallback Read More URLs) ────────────────────

const COUNTRY_NEWS_PORTAL = {
  'india':          'https://timesofindia.indiatimes.com/topic',
  'usa':            'https://apnews.com/hub',
  'united states':  'https://apnews.com/hub',
  'uk':             'https://www.bbc.com/news',
  'united kingdom': 'https://www.bbc.com/news',
  'australia':      'https://www.abc.net.au/news',
  'canada':         'https://www.cbc.ca/news',
  'germany':        'https://www.dw.com/en',
  'france':         'https://www.france24.com/en',
  'japan':          'https://www3.nhk.or.jp/nhkworld/en/news',
  'china':          'https://www.scmp.com',
  'south korea':    'https://www.koreaherald.com',
  'brazil':         'https://braziljournal.com',
  'mexico':         'https://mexiconewsdaily.com',
  'singapore':      'https://www.channelnewsasia.com',
  'uae':            'https://www.khaleejtimes.com',
  'turkey':         'https://www.hurriyetdailynews.com',
  'egypt':          'https://english.ahram.org.eg',
  'default':        'https://apnews.com/hub',
};

function getNewsPortalUrl(country, city) {
  const base = COUNTRY_NEWS_PORTAL[country.toLowerCase()] || COUNTRY_NEWS_PORTAL.default;
  const slug = encodeURIComponent(city.toLowerCase().replace(/\s+/g, '-'));
  return `${base}/${slug}`;
}

// ─── Mock Fallback Data ───────────────────────────────────────────────────────

function getMockArticles(city = 'Brooklyn', country = 'USA', category = 'all') {
  const loc    = `${city}, ${country}`;
  const portal = getNewsPortalUrl(country, city);

  const ALL_MOCK = [
    { title: `${loc} Tech Sector Reports Record Growth`,           desc: `Technology companies in ${loc} have reported unprecedented growth this quarter, with startups achieving new milestones in innovation.`,          cat: 'technology'    },
    { title: `${loc} Economy Strengthens Amid Global Uncertainty`, desc: `Despite global headwinds, ${loc} markets have shown remarkable resilience with key sectors posting strong figures.`,                            cat: 'business'      },
    { title: `Infrastructure Projects Transform ${city}`,          desc: `Major investments are reshaping ${city}'s urban landscape, with new transport networks and smart city initiatives underway.`,                    cat: 'general'       },
    { title: `${city} Sports Teams Advance to Championships`,      desc: `Athletes from ${loc} secured spots in national championships with record-breaking performances this season.`,                                    cat: 'sports'        },
    { title: `Health Initiatives in ${city} Show Results`,         desc: `New public health programs in ${city} have improved community wellbeing significantly, with vaccination metrics exceeding targets.`,              cat: 'health'        },
    { title: `Cultural Festivals Bring ${city} to Life`,           desc: `${city} is buzzing with activity as major festivals attract record attendance from locals and international visitors.`,                           cat: 'entertainment' },
    { title: `${country} Leads Renewable Energy Push`,             desc: `${country} has set ambitious renewable energy targets, positioning itself as a global leader in sustainable power transition.`,                   cat: 'general'       },
    { title: `Startup Ecosystem in ${city} Attracts VC Investment`,desc: `Venture capital investments in ${city}'s startup scene have doubled year-over-year, with fintech receiving the most attention.`,               cat: 'business'      },
    { title: `New Innovation Hub Opens in ${city}`,                desc: `A state-of-the-art innovation hub has opened in ${city}, bringing together researchers and industry partners.`,                                  cat: 'technology'    },
    { title: `${country} Education Reforms Boost Digital Skills`,  desc: `Education reforms across ${country} are equipping students with digital skills needed for the modern workforce.`,                              cat: 'general'       },
    { title: `${city} Hosts International Business Summit`,        desc: `Leaders and executives gathered in ${city} for the annual summit, focusing on trade and sustainable development goals.`,                         cat: 'business'      },
    { title: `${city} Unveils Smart City Development Plan`,        desc: `The city administration of ${city} launched a smart city plan to improve infrastructure and digital connectivity.`,                             cat: 'general'       },
  ];

  const filtered = category === 'all'
    ? ALL_MOCK
    : ALL_MOCK.filter((a) => a.cat === category);

  const pool = filtered.length > 0 ? filtered : ALL_MOCK;

  return pool.map((raw, i) => ({
    id:          `mock-${i}`,
    title:       raw.title,
    excerpt:     raw.desc,
    url:         portal,
    image:       getUniquePlaceholder(raw.cat),  // Unique image per card
    source:      'Local News',
    publishedAt: new Date(Date.now() - i * 3600000).toISOString(),
    category:    raw.cat,
    breaking:    i === 0,
  }));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isKeySet() {
  return (
    typeof NEWSDATA_API_KEY === 'string' &&
    NEWSDATA_API_KEY.trim() !== '' &&
    NEWSDATA_API_KEY !== 'YOUR_API_KEY_HERE'
  );
}

/**
 * Special characters strip karna
 * São Paulo → Sao Paulo, Zürich → Zurich
 */
function normalizeCityName(city) {
  return city
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim();
}

/**
 * NewsData.io pubDate format fix
 * "2026-07-05 19:18:31" → "2026-07-05T19:18:31Z"
 * Space separator breaks Safari — must be ISO format
 */
function normalizePubDate(pubDate) {
  if (!pubDate) return new Date().toISOString();
  return pubDate.replace(' ', 'T') + (pubDate.includes('Z') ? '' : 'Z');
}

/**
 * NewsData.io article categories array → single app category label
 * Priority order: specific category first, then fall to general
 */
function resolveCategory(apiCategories) {
  if (!Array.isArray(apiCategories)) return 'general';
  const priority = ['technology','business','sports','health','entertainment','science'];
  for (const p of priority) {
    if (apiCategories.includes(p)) return p;
  }
  return 'general';
}

/**
 * NewsData.io raw article → project card format
 * Each article gets its OWN correct category and unique image
 */
function mapArticle(raw, index) {
  const title = raw?.title || 'Untitled News';

  // Strip syndication prefixes — "(MENAFN - ForPressRelease) ..."
  // Also strip "Show Quick Read Key points generated by AI, verified by newsroom"
  const rawDesc = raw?.description || '';
  const excerpt = rawDesc
    .replace(/^\([^)]{0,80}\)\s*/u, '')
    .replace(/^Show Quick Read[\s\S]{0,80}newsroom\s*/i, '')
    .replace(/^The post .{0,60} appeared first on[\s\S]*/i, '')
    .trim() || 'No description available.';

  const url         = raw?.link        || '#';
  const source      = raw?.source_name || 'Unknown Source';
  const publishedAt = normalizePubDate(raw?.pubDate);

  // Resolve correct category from article's own category array
  const category = resolveCategory(raw?.category);

  // Use API image if valid http URL — otherwise unique rotating placeholder
  // This ensures each card without an image gets a DIFFERENT fallback
  const image = (raw?.image_url && raw.image_url.startsWith('http'))
    ? raw.image_url
    : getUniquePlaceholder(category);

  return {
    id:       `api-${index}`,
    title,
    excerpt,
    url,
    image,
    source,
    publishedAt,
    category,
    breaking: index === 0,
  };
}

/** URL-based deduplication */
function deduplicate(articles) {
  const seen = new Set();
  return articles.filter((a) => {
    if (!a.link || seen.has(a.link)) return false;
    seen.add(a.link);
    return true;
  });
}

/**
 * Full clean pipeline:
 * 1. Remove API-flagged duplicates
 * 2. Remove articles with no description AND no image (empty cards)
 * 3. Deduplicate by URL
 * 4. Deduplicate by title (first 60 chars) — catches syndicated same-story
 */
function cleanArticles(articles) {
  // Step 1 — remove API-flagged duplicates
  const notFlagged = articles.filter((a) => a.duplicate !== true);

  // Step 2 — remove articles that have neither description nor image
  const hasContent = notFlagged.filter(
    (a) => a.title && a.link && (a.description || a.image_url)
  );

  // Step 3 — deduplicate by URL
  const seenUrls = new Set();
  const dedupedByUrl = hasContent.filter((a) => {
    if (seenUrls.has(a.link)) return false;
    seenUrls.add(a.link);
    return true;
  });

  // Step 4 — deduplicate by title prefix (first 55 chars, lowercased)
  // Catches same story published on multiple outlets with identical headline
  const seenTitles = new Set();
  return dedupedByUrl.filter((a) => {
    const key = (a.title || '').toLowerCase().slice(0, 55).trim();
    if (seenTitles.has(key)) return false;
    seenTitles.add(key);
    return true;
  });
}

// ─── Fetch Logic ──────────────────────────────────────────────────────────────

/**
 * Primary fetch — qInTitle gives articles where city is IN THE HEADLINE
 * This is the most accurate city-specific news
 */
async function fetchPrimary(cleanCity, category) {
  const params = new URLSearchParams({
    apikey:   NEWSDATA_API_KEY,
    qInTitle: cleanCity,
    language: 'en',
    size:     '10',          // free plan max is 10
  });

  const catParam = NEWSDATA_CATEGORY[category];
  if (catParam) params.set('category', catParam);

  const res = await fetch(`${NEWSDATA_BASE}?${params.toString()}`);
  if (!res.ok) return null;
  const data = await res.json();
  if (data.status !== 'success' || !Array.isArray(data.results) || !data.results.length) return null;
  return cleanArticles(data.results.filter((a) => a.title && a.link));
}

/**
 * Fallback fetch — broader q= search when qInTitle returns < 3 results
 * Used for smaller/less-covered cities
 */
async function fetchFallback(cleanCity, category) {
  const params = new URLSearchParams({
    apikey:   NEWSDATA_API_KEY,
    q:        cleanCity,
    language: 'en',
    size:     '10',          // free plan max is 10
  });

  const catParam = NEWSDATA_CATEGORY[category];
  if (catParam) params.set('category', catParam);

  const res = await fetch(`${NEWSDATA_BASE}?${params.toString()}`);
  if (!res.ok) return null;
  const data = await res.json();
  if (data.status !== 'success' || !Array.isArray(data.results) || !data.results.length) return null;
  return cleanArticles(data.results.filter((a) => a.title && a.link));
}

/**
 * Main fetch orchestrator
 * 1. Try qInTitle (city in headline) — most accurate
 * 2. If < 3 results, try q= broad search
 * 3. If both fail, return null → mock data used
 */
async function fetchFromNewsData(city, category = 'all') {
  if (!isKeySet()) {
    console.warn('[NewsData.io] Key missing.');
    return null;
  }

  const cleanCity = normalizeCityName(city);
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), 10000);

  try {
    // City ka news headline mein dhundna
    let results = await fetchPrimary(cleanCity, category);

    // Agar kam results mile toh broad search karo
    if (!results || results.length < 3) {
      console.info(`[NewsData.io] qInTitle gave ${results?.length ?? 0} for "${cleanCity}", trying q= fallback.`);
      results = await fetchFallback(cleanCity, category);
    }

    clearTimeout(timeoutId);
    return results && results.length > 0 ? results : null;

  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      console.warn('[NewsData.io] Request timed out.');
    } else {
      console.warn('[NewsData.io] Fetch failed:', err.message);
    }
    return null;
  }
}

// ─── Main Public Functions ────────────────────────────────────────────────────

/**
 * News data laana — live city API ya location-aware mock fallback
 * Har city change pe fallback counters reset hote hain
 * @param {string} category
 */
export async function getNewsData(category = 'all') {
  const { city, country } = getNewsLocation();

  // Reset unique placeholder counters for fresh city load
  resetFallbackCounters();

  const rawArticles = await fetchFromNewsData(city, category);

  if (rawArticles) {
    // Real API data — each article gets its own correct category + image
    const articles = rawArticles.map((raw, i) => mapArticle(raw, i));
    return { articles, source: 'api' };
  }

  // Fallback — location-aware mock with unique images per card
  console.info(`[NewsData.io] Using mock data for ${city}, ${country}.`);
  return { articles: getMockArticles(city, country, category), source: 'mock' };
}

/** Ticker ke liye top 3 headlines */
function buildTickerHeadlines(articles) {
  return articles.slice(0, 3).map((a) => `${a.title}...`);
}

/**
 * Poora news section load aur render karna
 * app.js se sirf yahi call hoga
 */
export async function loadAndRenderNews(category = 'all') {
  const { articles } = await getNewsData(category);
  renderNewsGrid(articles, { append: false, animate: true });
  renderTicker(buildTickerHeadlines(articles));
  renderFeatured(articles[0]);
}
