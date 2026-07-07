/**
 * newsapi.js
 * NewsAPI integration — city-based real news, worldwide, with fallback
 *
 * ⚠️  IMPORTANT NOTE:
 * NewsAPI free plan blocks browser requests from published domains (GitHub
 * Pages) via CORS. On localhost → live city news loads. On GitHub Pages →
 * location-aware mock data renders automatically. Never blank.
 *
 * APNI NEWSAPI KEY YAHAN DAALO 👇
 * Key lo: https://newsapi.org/register
 */
const NEWS_API_KEY = '7df66bae5ce043ba848cdb4aa8473a9c';

const NEWS_API_BASE = 'https://newsapi.org/v2';

// ─── Imports ──────────────────────────────────────────────────────────────────

import { renderNewsGrid, renderTicker, renderFeatured } from './ui.js';

// ─── Location State ───────────────────────────────────────────────────────────

// Current selected city/country — news fetch mein use hoga
let _currentCity    = 'Brooklyn';
let _currentCountry = 'USA';

/** Location update karna — app.js se call hoga jab user city change kare */
export function setNewsLocation(city, country) {
  _currentCity    = (city    || 'Brooklyn').trim();
  _currentCountry = (country || 'USA').trim();
}

export function getNewsLocation() {
  return { city: _currentCity, country: _currentCountry };
}

// ─── Category Map ─────────────────────────────────────────────────────────────

const CATEGORY_MAP = {
  all:           'general',
  technology:    'technology',
  business:      'business',
  sports:        'sports',
  health:        'health',
  entertainment: 'entertainment',
};

const CATEGORY_KEYWORDS = {
  technology:    ['tech', 'software', 'app', 'apple', 'google', 'microsoft', 'ai', 'cyber', 'data', 'internet', 'computer', 'digital', 'startup', 'innovation'],
  business:      ['market', 'stock', 'economy', 'trade', 'finance', 'business', 'company', 'ceo', 'profit', 'bank', 'invest', 'revenue', 'corporate'],
  sports:        ['sport', 'football', 'cricket', 'basketball', 'tennis', 'game', 'match', 'tournament', 'champion', 'player', 'team', 'league', 'cup'],
  health:        ['health', 'hospital', 'doctor', 'patient', 'disease', 'virus', 'vaccine', 'medicine', 'medical', 'treatment', 'drug', 'clinic', 'fitness'],
  entertainment: ['movie', 'film', 'music', 'actor', 'actress', 'hollywood', 'bollywood', 'celebrity', 'star', 'theater', 'show', 'cinema', 'song'],
};

function filterByCategory(articles, category) {
  if (category === 'all' || category === 'general') return articles;
  
  const keywords = CATEGORY_KEYWORDS[category];
  if (!keywords) return articles;

  const filtered = articles.filter(a => {
    const text = ((a.title || '') + ' ' + (a.description || '')).toLowerCase();
    return keywords.some(kw => text.includes(kw));
  });

  return filtered.length > 0 ? filtered : articles;
}

// ─── Fallback Images ──────────────────────────────────────────────────────────

const CATEGORY_FALLBACK_IMAGES = {
  technology:    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=70',
  business:      'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=70',
  sports:        'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=70',
  health:        'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=70',
  entertainment: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=600&q=70',
  science:       'https://images.unsplash.com/photo-1444858291040-58f756a3bdd6?auto=format&fit=crop&w=600&q=70',
  environment:   'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=70',
  general:       'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&w=600&q=70',
};

function getPlaceholderImage(category) {
  return CATEGORY_FALLBACK_IMAGES[category] || CATEGORY_FALLBACK_IMAGES.general;
}

// ─── Country → news portal map (mock fallback URLs ke liye) ───────────────────

// Country ke hisaab se relevant news portal dena
// Ye mock fallback mein Read More ke liye use hoga
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

/**
 * Country ke liye relevant news portal URL dena
 */
function getNewsPortalUrl(country, city) {
  const key = country.toLowerCase();
  const base = COUNTRY_NEWS_PORTAL[key] || COUNTRY_NEWS_PORTAL.default;
  const slug = encodeURIComponent(city.toLowerCase().replace(/\s+/g, '-'));
  return `${base}/${slug}`;
}

// ─── Mock Fallback Data ───────────────────────────────────────────────────────

/**
 * Location-aware mock articles — city + country naam titles mein hoga
 * Read More URLs city ke relevant news portal pe jaayenge (not homepages)
 * GitHub Pages pe yahi dikhega
 */
function getMockArticles(city = 'Brooklyn', country = 'USA', category = 'all') {
  const loc     = `${city}, ${country}`;
  const portal  = getNewsPortalUrl(country, city);

  const BASE_MOCK = [
    {
      title:       `${loc} Tech Sector Reports Record Growth`,
      description: `Technology companies in ${loc} have reported unprecedented growth, with startups and established firms achieving new milestones in innovation and revenue this quarter.`,
      url:         portal,
      urlToImage:  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=70',
      publishedAt: new Date(Date.now() - 1 * 3600000).toISOString(),
      source:      { name: 'Local News' },
      category:    'technology',
      breaking:    true,
    },
    {
      title:       `${loc} Economy Strengthens Amid Global Uncertainty`,
      description: `Despite global economic headwinds, ${loc} markets have shown remarkable resilience with key sectors posting strong performance figures this month.`,
      url:         portal,
      urlToImage:  'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=600&q=70',
      publishedAt: new Date(Date.now() - 3 * 3600000).toISOString(),
      source:      { name: 'Business News' },
      category:    'business',
      breaking:    true,
    },
    {
      title:       `Infrastructure Projects Transform ${city}`,
      description: `Major investments are reshaping ${city}'s urban landscape, with new transportation networks, smart city initiatives, and public spaces planned for completion next year.`,
      url:         portal,
      urlToImage:  'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=600&q=70',
      publishedAt: new Date(Date.now() - 5 * 3600000).toISOString(),
      source:      { name: 'City News' },
      category:    'general',
    },
    {
      title:       `${city} Sports Teams Advance to Championships`,
      description: `Athletes representing ${loc} have delivered outstanding performances, securing spots in national and international championships with record-breaking results this season.`,
      url:         portal,
      urlToImage:  'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&w=600&q=70',
      publishedAt: new Date(Date.now() - 8 * 3600000).toISOString(),
      source:      { name: 'Sports Daily' },
      category:    'sports',
    },
    {
      title:       `Health Initiatives in ${city} Show Promising Results`,
      description: `New public health programs in ${city} have demonstrated significant improvements in community wellbeing, with vaccination and preventive care metrics exceeding targets.`,
      url:         portal,
      urlToImage:  'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=70',
      publishedAt: new Date(Date.now() - 12 * 3600000).toISOString(),
      source:      { name: 'Health Today' },
      category:    'health',
    },
    {
      title:       `Cultural Festivals Bring ${city} to Life This Season`,
      description: `${city} is buzzing with cultural activity as major festivals and entertainment events attract record attendance from locals and international visitors alike.`,
      url:         portal,
      urlToImage:  'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=600&q=70',
      publishedAt: new Date(Date.now() - 16 * 3600000).toISOString(),
      source:      { name: 'Entertainment Weekly' },
      category:    'entertainment',
    },
    {
      title:       `${country} Leads Global Renewable Energy Push`,
      description: `${country} has announced ambitious new targets for renewable energy, positioning itself as a global leader in sustainable power transition by 2035.`,
      url:         portal,
      urlToImage:  'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=600&q=70',
      publishedAt: new Date(Date.now() - 20 * 3600000).toISOString(),
      source:      { name: 'Reuters' },
      category:    'general',
    },
    {
      title:       `Startup Ecosystem in ${city} Attracts Major VC Investment`,
      description: `Venture capital investments in ${city}'s startup scene have doubled year-over-year, with fintech, healthtech, and cleantech companies attracting the most attention.`,
      url:         portal,
      urlToImage:  'https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?auto=format&fit=crop&w=600&q=70',
      publishedAt: new Date(Date.now() - 28 * 3600000).toISOString(),
      source:      { name: 'Forbes' },
      category:    'business',
    },
    {
      title:       `New Innovation Hub Opens in ${city}`,
      description: `A state-of-the-art innovation and research hub has opened in ${city}, bringing together researchers, industry partners, and government stakeholders to drive progress.`,
      url:         portal,
      urlToImage:  'https://images.unsplash.com/photo-1531297122539-d31b0a140618?auto=format&fit=crop&w=600&q=70',
      publishedAt: new Date(Date.now() - 36 * 3600000).toISOString(),
      source:      { name: 'Tech Insider' },
      category:    'technology',
    },
    {
      title:       `${country} Education Reforms Boost Digital Skills`,
      description: `Sweeping education reforms across ${country} are equipping students with digital skills needed for the modern workforce, with coding now a core curriculum component.`,
      url:         portal,
      urlToImage:  'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=70',
      publishedAt: new Date(Date.now() - 48 * 3600000).toISOString(),
      source:      { name: 'Education Today' },
      category:    'general',
    },
    {
      title:       `${city} Hosts Major International Business Summit`,
      description: `World leaders and executives gathered in ${city} for the annual business summit, focusing on trade partnerships, economic cooperation, and sustainable development goals.`,
      url:         portal,
      urlToImage:  'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=70',
      publishedAt: new Date(Date.now() - 60 * 3600000).toISOString(),
      source:      { name: 'Business Standard' },
      category:    'business',
    },
    {
      title:       `${city} Unveils Smart City Development Plan`,
      description: `The city administration of ${city} has unveiled a comprehensive smart city plan aimed at improving infrastructure, digital connectivity, and quality of life for all residents.`,
      url:         portal,
      urlToImage:  'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=600&q=70',
      publishedAt: new Date(Date.now() - 72 * 3600000).toISOString(),
      source:      { name: 'City Herald' },
      category:    'general',
    },
  ];

  // Category filter
  const filtered = category === 'all'
    ? BASE_MOCK
    : BASE_MOCK.filter((a) => a.category === category);

  const pool = filtered.length > 0 ? filtered : BASE_MOCK;

  return pool.map((raw, i) => ({
    id:          `mock-${i}`,
    title:       raw.title,
    excerpt:     raw.description,
    url:         raw.url,
    image:       raw.urlToImage || getPlaceholderImage(raw.category),
    source:      raw.source.name,
    publishedAt: raw.publishedAt,
    category:    raw.category,
    breaking:    raw.breaking || false,
  }));
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isKeySet() {
  return (
    typeof NEWS_API_KEY === 'string' &&
    NEWS_API_KEY.trim() !== '' &&
    NEWS_API_KEY !== 'YOUR_NEWSAPI_KEY_HERE'
  );
}

/**
 * NewsAPI raw article → project card format
 * url preserved exactly — Read More will open real article
 */
function mapArticle(raw, index, category = 'general') {
  const title       = (raw?.title       && raw.title       !== '[Removed]') ? raw.title       : 'Untitled News';
  const description = (raw?.description && raw.description !== '[Removed]') ? raw.description : 'No description available.';
  const url         = raw?.url         || '#';
  const source      = raw?.source?.name || 'Unknown Source';
  const publishedAt = raw?.publishedAt  || new Date().toISOString();
  const image       = raw?.urlToImage   || getPlaceholderImage(category);

  return {
    id:       `api-${index}`,
    title,
    excerpt:  description,
    url,
    image,
    source,
    publishedAt,
    category,
    breaking: index === 0,
  };
}

/**
 * URL se duplicate articles remove karna
 * NewsAPI kabhi kabhi same article multiple times deta hai
 */
function deduplicate(articles) {
  const seen = new Set();
  return articles.filter((a) => {
    if (!a.url || seen.has(a.url)) return false;
    seen.add(a.url);
    return true;
  });
}

// ─── Fetch Logic ──────────────────────────────────────────────────────────────

/**
 * NewsAPI /everything endpoint se city-specific real news fetch karna
 *
 * Query strategy (live API tested):
 * - Just city name in exact quotes → most accurate, most results
 * - Adding country OR category terms → causes irrelevant results (tested)
 * - Category filtering is done CLIENT-SIDE after fetching city articles
 *
 * Examples (tested):
 *   "Surat"    → 237 real articles (Times of India, ET, etc.)
 *   "Tokyo"    → 3706 real articles
 *   "London"   → 17080 real articles
 *   "New York" → 54107 real articles
 *   "Dubai"    → 1736 real articles
 *   "Sydney"   → 3300 real articles
 */
async function fetchFromNewsApi(city = 'Brooklyn') {
  if (!isKeySet()) {
    console.warn('[NewsAPI] Key missing. Mock data use ho raha hai.');
    return null;
  }

  // City exact match — sirf city name, koi extra terms nahi
  // City ke articles lao, category client-side filter karega
  const params = new URLSearchParams({
    q:        `"${city}"`,
    sortBy:   'publishedAt',
    pageSize: '20',         // 20 fetch karo — category filter ke baad ~12 milenge
    language: 'en',
    apiKey:   NEWS_API_KEY,
  });

  const url = `${NEWS_API_BASE}/everything?${params.toString()}`;

  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), 8000);

  try {
    // City ka real news laa rahe hain
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[NewsAPI] HTTP ${response.status}. Mock data use ho raha hai.`);
      return null;
    }

    const data = await response.json();

    if (data.status !== 'ok' || !Array.isArray(data.articles) || data.articles.length === 0) {
      console.warn('[NewsAPI] Empty/invalid response. Mock data use ho raha hai.');
      return null;
    }

    // Invalid aur removed articles filter karna
    const clean = data.articles.filter(
      (a) => a.title &&
             a.title !== '[Removed]' &&
             a.url   &&
             a.url   !== 'https://removed.com'
    );

    // Duplicate URLs remove karna
    const unique = deduplicate(clean);

    return unique.length > 0 ? unique : null;

  } catch (err) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      console.warn('[NewsAPI] Request timed out. Mock data use ho raha hai.');
    } else {
      console.warn('[NewsAPI] Fetch failed (CORS on GitHub Pages). Mock data use ho raha hai.');
    }
    return null;
  }
}

// ─── Main Public Functions ────────────────────────────────────────────────────

/**
 * News data laana — live city-specific API ya location-aware mock fallback
 * Kabhi blank nahi hoga
 * @param {string} category
 * @returns {{ articles: Object[], source: 'api'|'mock' }}
 */
export async function getNewsData(category = 'all') {
  const { city, country } = getNewsLocation();
  const rawArticles = await fetchFromNewsApi(city);

  if (rawArticles) {
    // Real API data — real articles, real URLs, Read More sahi jagah jaayega
    const apiCategory = CATEGORY_MAP[category] || 'general';
    
    // Perform client-side keyword filtering
    const filteredRaw = filterByCategory(rawArticles, apiCategory);

    const articles = filteredRaw.map((raw, i) => mapArticle(raw, i, apiCategory));
    return { articles, source: 'api' };
  }

  // Fallback — location-aware mock with relevant news portal links
  console.info(`[NewsAPI] Mock data for ${city}, ${country}.`);
  return { articles: getMockArticles(city, country, category), source: 'mock' };
}

/**
 * Ticker ke liye top 3 headlines banana
 */
function buildTickerHeadlines(articles) {
  return articles.slice(0, 3).map((a) => `${a.title}...`);
}

/**
 * Poora news section load aur render karna
 * app.js se sirf yahi ek function call hoga
 */
export async function loadAndRenderNews(category = 'all') {
  const { articles } = await getNewsData(category);
  renderNewsGrid(articles, { append: false, animate: true });
  renderTicker(buildTickerHeadlines(articles));
  renderFeatured(articles[0]);
}
