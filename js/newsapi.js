/**
 * newsapi.js
 * NewsData.io integration — city-based real news, worldwide, with fallback
 *
 * API KEY: pub_51285dc6970740618c623b1b5c08d47b
 * Works on localhost AND GitHub Pages — no CORS blocking
 */
const NEWSDATA_API_KEY = 'pub_51285dc6970740618c623b1b5c08d47b';
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

// App filter → NewsData.io API category param
const NEWSDATA_CATEGORY = {
  all:           '',
  technology:    'technology',
  business:      'business',
  sports:        'sports',
  health:        'health',
  entertainment: 'entertainment',
};

// ─── Per-category unique fallback images (rotating pool) ─────────────────────

const CATEGORY_FALLBACK_POOL = {
  technology:    [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=70',
    'https://images.unsplash.com/photo-1531297122539-d31b0a140618?auto=format&fit=crop&w=600&q=70',
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=70',
  ],
  business:      [
    'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=70',
    'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&w=600&q=70',
    'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=70',
  ],
  sports:        [
    'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=70',
    'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=600&q=70',
    'https://images.unsplash.com/photo-1535131749006-b7f58c99034b?auto=format&fit=crop&w=600&q=70',
  ],
  health:        [
    'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=70',
    'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=70',
    'https://images.unsplash.com/photo-1505751172876-fa1923c5c528?auto=format&fit=crop&w=600&q=70',
  ],
  entertainment: [
    'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=600&q=70',
    'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&w=600&q=70',
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=70',
  ],
  science:       [
    'https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?auto=format&fit=crop&w=600&q=70',
    'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=600&q=70',
  ],
  environment:   [
    'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=70',
    'https://images.unsplash.com/photo-1466611653911-95081537e5b7?auto=format&fit=crop&w=600&q=70',
  ],
  general:       [
    'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=70',
    'https://images.unsplash.com/photo-1586339949916-3e9457bef6d3?auto=format&fit=crop&w=600&q=70',
    'https://images.unsplash.com/photo-1495020689067-958852a7765e?auto=format&fit=crop&w=600&q=70',
  ],
};

const _fallbackCounters = {};

// Unique rotating placeholder — different image for each card of same category
function getUniquePlaceholder(category) {
  const pool  = CATEGORY_FALLBACK_POOL[category] || CATEGORY_FALLBACK_POOL.general;
  const count = _fallbackCounters[category] || 0;
  _fallbackCounters[category] = (count + 1) % pool.length;
  return pool[count % pool.length];
}

// Reset counters on each new city fetch
function resetFallbackCounters() {
  Object.keys(_fallbackCounters).forEach((k) => { _fallbackCounters[k] = 0; });
}

// ─── Country → news portal (mock fallback URLs) ───────────────────────────────

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
    { title: `${loc} Tech Sector Reports Record Growth`,            desc: `Technology companies in ${loc} have reported unprecedented growth this quarter, with startups achieving new milestones in innovation and revenue.`,    cat: 'technology'    },
    { title: `${loc} Economy Strengthens Amid Global Uncertainty`,  desc: `Despite global economic headwinds, ${loc} markets have shown remarkable resilience with key sectors posting strong performance figures.`,              cat: 'business'      },
    { title: `Infrastructure Projects Transform ${city}`,           desc: `Major investments are reshaping ${city}'s urban landscape with new transportation networks and smart city initiatives planned for completion next year.`, cat: 'general'       },
    { title: `${city} Sports Teams Advance to Championships`,       desc: `Athletes from ${loc} secured spots in national and international championships with record-breaking performances this season.`,                          cat: 'sports'        },
    { title: `Health Initiatives in ${city} Show Promising Results`,desc: `New public health programs in ${city} have improved community wellbeing significantly, with vaccination and preventive care metrics exceeding targets.`,  cat: 'health'        },
    { title: `Cultural Festivals Bring ${city} to Life This Season`,desc: `${city} is buzzing with cultural activity as major festivals and events attract record attendance from locals and international visitors alike.`,         cat: 'entertainment' },
    { title: `${country} Leads Global Renewable Energy Push`,       desc: `${country} has set ambitious new targets for renewable energy, positioning itself as a global leader in sustainable power transition by 2035.`,          cat: 'general'       },
    { title: `Startup Ecosystem in ${city} Attracts VC Investment`, desc: `Venture capital investments in ${city}'s startup scene have doubled year-over-year, with fintech and cleantech companies receiving the most attention.`, cat: 'business'      },
    { title: `New Innovation Hub Opens in ${city}`,                 desc: `A state-of-the-art innovation and research hub has opened in ${city}, bringing together researchers, industry partners and government stakeholders.`,    cat: 'technology'    },
    { title: `${country} Education Reforms Boost Digital Skills`,   desc: `Education reforms across ${country} are equipping students with digital skills needed for the modern workforce, with coding now a core component.`,      cat: 'general'       },
    { title: `${city} Hosts International Business Summit`,         desc: `World leaders and executives gathered in ${city} for the annual summit, focusing on trade partnerships and sustainable development goals.`,              cat: 'business'      },
    { title: `${city} Unveils Comprehensive Smart City Plan`,       desc: `The city administration of ${city} has launched a smart city plan aimed at improving infrastructure, digital connectivity and quality of life.`,         cat: 'general'       },
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
    image:       getUniquePlaceholder(raw.cat),
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

// São Paulo → Sao Paulo, Zürich → Zurich
function normalizeCityName(city) {
  return city
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .trim();
}

// "2026-07-05 19:18:31" → "2026-07-05T19:18:31Z" (Safari-safe ISO format)
function normalizePubDate(pubDate) {
  if (!pubDate) return new Date().toISOString();
  return pubDate.replace(' ', 'T') + (pubDate.includes('Z') ? '' : 'Z');
}

// ['technology','top'] → 'technology' (first specific category wins)
function resolveCategory(apiCategories) {
  if (!Array.isArray(apiCategories)) return 'general';
  const priority = ['technology', 'business', 'sports', 'health', 'entertainment', 'science'];
  for (const p of priority) {
    if (apiCategories.includes(p)) return p;
  }
  return 'general';
}

// Raw NewsData.io article → project card object
function mapArticle(raw, index) {
  const title = raw?.title || 'Untitled News';

  // Clean up syndication noise in description
  const rawDesc = raw?.description || '';
  const excerpt = rawDesc
    .replace(/^\([^)]{0,80}\)\s*/u, '')
    .replace(/^Show Quick Read[\s\S]{0,80}newsroom\s*/i, '')
    .replace(/The post .{0,80} appeared first on[\s\S]*/i, '')
    .trim() || 'No description available.';

  const url         = raw?.link        || '#';
  const source      = raw?.source_name || 'Unknown Source';
  const publishedAt = normalizePubDate(raw?.pubDate);
  const category    = resolveCategory(raw?.category);

  // Use real image if valid, otherwise unique rotating placeholder
  const image = (raw?.image_url && raw.image_url.startsWith('http'))
    ? raw.image_url
    : getUniquePlaceholder(category);

  return { id: `api-${index}`, title, excerpt, url, image, source, publishedAt, category, breaking: index === 0 };
}

// 4-layer clean pipeline applied to raw API results
function cleanArticles(articles) {
  // 1. Remove API-flagged duplicates
  const step1 = articles.filter((a) => a.duplicate !== true);

  // 2. Require title + link + description (min 30 chars) — no empty cards
  const step2 = step1.filter(
    (a) => a.title && a.link && a.description && a.description.trim().length > 30
  );

  // 3. Deduplicate by exact URL
  const seenUrls = new Set();
  const step3 = step2.filter((a) => {
    if (seenUrls.has(a.link)) return false;
    seenUrls.add(a.link);
    return true;
  });

  // 4. Deduplicate by title prefix (catches same story on multiple outlets)
  const seenTitles = new Set();
  return step3.filter((a) => {
    const key = (a.title || '').toLowerCase().slice(0, 55).trim();
    if (seenTitles.has(key)) return false;
    seenTitles.add(key);
    return true;
  });
}

// ─── Fetch Logic ──────────────────────────────────────────────────────────────

// Build URL and fetch from NewsData.io with AbortSignal for timeout
async function callApi(params, signal) {
  const res = await fetch(`${NEWSDATA_BASE}?${params.toString()}`, { signal });
  if (!res.ok) return null;
  const data = await res.json();
  if (data.status !== 'success' || !Array.isArray(data.results) || !data.results.length) return null;
  return cleanArticles(data.results);
}

async function fetchFromNewsData(city, category = 'all') {
  if (!isKeySet()) {
    console.warn('[NewsData.io] Key missing. Mock data use ho raha hai.');
    return null;
  }

  const cleanCity = normalizeCityName(city);

  // Single AbortController — signal passed to all fetch calls
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), 10000);

  try {
    // Primary: city name must be in the article TITLE (most accurate)
    const primaryParams = new URLSearchParams({
      apikey: NEWSDATA_API_KEY, qInTitle: cleanCity, language: 'en', size: '10',
    });
    const catParam = NEWSDATA_CATEGORY[category];
    if (catParam) primaryParams.set('category', catParam);

    let results = await callApi(primaryParams, controller.signal);

    // Fallback: broader search if too few results (smaller/less-covered cities)
    if (!results || results.length < 3) {
      console.info(`[NewsData.io] qInTitle: ${results?.length ?? 0} results for "${cleanCity}", trying q= fallback.`);

      const fallbackParams = new URLSearchParams({
        apikey: NEWSDATA_API_KEY, q: cleanCity, language: 'en', size: '10',
      });
      if (catParam) fallbackParams.set('category', catParam);

      results = await callApi(fallbackParams, controller.signal);
    }

    clearTimeout(timeoutId);
    return results && results.length > 0 ? results : null;

  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      console.warn('[NewsData.io] Request timed out. Mock data use ho raha hai.');
    } else {
      console.warn('[NewsData.io] Fetch failed:', err.message);
    }
    return null;
  }
}

// ─── Main Public Functions ────────────────────────────────────────────────────

export async function getNewsData(category = 'all') {
  const { city, country } = getNewsLocation();

  // Reset placeholder image counters for fresh city
  resetFallbackCounters();

  const rawArticles = await fetchFromNewsData(city, category);

  if (rawArticles) {
    const articles = rawArticles.map((raw, i) => mapArticle(raw, i));
    return { articles, source: 'api' };
  }

  console.info(`[NewsData.io] Showing mock data for ${city}, ${country}.`);
  return { articles: getMockArticles(city, country, category), source: 'mock' };
}

function buildTickerHeadlines(articles) {
  return articles.slice(0, 3).map((a) => `${a.title}...`);
}

export async function loadAndRenderNews(category = 'all') {
  const { articles } = await getNewsData(category);
  renderNewsGrid(articles, { append: false, animate: true });
  renderTicker(buildTickerHeadlines(articles));
  renderFeatured(articles[0]);
}
