/** localStorage wrapper with safe JSON parsing */

const KEYS = {
  SEARCH_HISTORY: 'ww_search_history',
  LAST_CITY: 'ww_last_city',
  NEWS_CATEGORY: 'ww_news_category',
  READ_ARTICLES: 'ww_read_articles',
  SCROLL_POSITION: 'ww_scroll_position',
};

export function getItem(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota exceeded — silently fail */
  }
}

export function addSearchHistory(city) {
  const history = getItem(KEYS.SEARCH_HISTORY, []);
  const normalized = city.trim();
  if (!normalized) return history;
  const filtered = history.filter((h) => h.toLowerCase() !== normalized.toLowerCase());
  const updated = [normalized, ...filtered].slice(0, 8);
  setItem(KEYS.SEARCH_HISTORY, updated);
  return updated;
}

export function getSearchHistory() {
  return getItem(KEYS.SEARCH_HISTORY, []);
}

export function clearSearchHistory() {
  setItem(KEYS.SEARCH_HISTORY, []);
}

export function getLastCity() {
  return getItem(KEYS.LAST_CITY, 'Brooklyn');
}

export function setLastCity(city) {
  setItem(KEYS.LAST_CITY, city);
}

export function getNewsCategory() {
  return getItem(KEYS.NEWS_CATEGORY, 'all');
}

export function setNewsCategory(category) {
  setItem(KEYS.NEWS_CATEGORY, category);
}

export function getReadArticles() {
  return getItem(KEYS.READ_ARTICLES, []);
}

export function markArticleRead(id) {
  const read = getReadArticles();
  if (!read.includes(id)) {
    setItem(KEYS.READ_ARTICLES, [...read, id]);
  }
}

export function isArticleRead(id) {
  return getReadArticles().includes(id);
}

export function saveScrollPosition(y) {
  setItem(KEYS.SCROLL_POSITION, y);
}

export function getScrollPosition() {
  return getItem(KEYS.SCROLL_POSITION, 0);
}

export { KEYS };
