/** WeatherWise — main application orchestrator */

import { fetchWeather, fetchWeatherByCoords, cancelWeatherFetch } from './weather.js';
import { fetchNews, getTickerHeadlines, cancelNewsFetch } from './news.js';
import {
  showLoader, showToast, showSuccessToast, updateConnectionStatus,
  initClock, renderWeather, renderTicker, renderFeatured,
  renderNewsGrid, renderNewsSkeleton, updateFilterButtons,
  initBackToTop, initPullToRefresh, setWeatherRefreshing,
} from './ui.js';
import { initSearch } from './search.js';
import { initNetwork, onNetworkChange, isOnline } from './network.js';
import { getLastCity, setLastCity, getNewsCategory, setNewsCategory, saveScrollPosition, getScrollPosition } from './storage.js';
import { prefersReducedMotion } from './utils.js';

const WEATHER_REFRESH_MS = 10 * 60 * 1000;

let currentCity = getLastCity();
let currentCategory = getNewsCategory();
let newsPage = 1;
let allArticles = [];
let isLoadingNews = false;
let hasMoreNews = true;
let weatherRefreshTimer = null;
let searchApi = null;

// Track in-flight network recovery to prevent duplicate requests
let isRecovering = false;

async function loadWeather(city, { force = false, silent = false } = {}) {
  if (!silent) setWeatherRefreshing(true);
  try {
    const data = await fetchWeather(city, { force });
    renderWeather(data);
    setLastCity(city);
    currentCity = city;
    if (force && !silent) showSuccessToast(`Weather updated for ${data.location.display}`);
    return data;
  } catch (err) {
    if (err.name !== 'AbortError') showToast(err.message);
    throw err;
  } finally {
    setWeatherRefreshing(false);
  }
}

async function loadNews({ category = currentCategory, page = 1, append = false, force = false } = {}) {
  if (isLoadingNews) return;
  isLoadingNews = true;

  if (!append) renderNewsSkeleton();

  try {
    const { articles, hasMore } = await fetchNews({ category, page, force });
    hasMoreNews = hasMore;

    if (append) {
      allArticles = [...allArticles, ...articles];
    } else {
      allArticles = articles;
    }

    renderNewsGrid(articles, { append, animate: !append });
    updateFilterButtons(category);

    if (page === 1) {
      renderTicker(getTickerHeadlines(allArticles));
      const featured = allArticles.find((a) => a.breaking) || allArticles[0];
      renderFeatured(featured);
    }

    newsPage = page;
    currentCategory = category;
    setNewsCategory(category);
  } catch (err) {
    if (err.name !== 'AbortError') showToast(err.message);
  } finally {
    isLoadingNews = false;
  }
}

function handleSearch(city, done) {
  loadWeather(city, { force: true })
    .catch(() => {})
    .finally(() => done?.());
}

function handleInvalidSearch(msg) {
  showToast(msg);
}

async function handleGeolocation() {
  if (!navigator.geolocation) {
    showToast('Geolocation is not supported by your browser.');
    return;
  }

  showLoader(true);
  navigator.geolocation.getCurrentPosition(
    async (pos) => {
      try {
        const data = await fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
        renderWeather(data);
        // FIX: Update currentCity so the refresh timer uses the GPS location
        currentCity = data.location.city;
        setLastCity(currentCity);
        showSuccessToast('Location updated from GPS');
      } catch (err) {
        showToast(err.message);
      } finally {
        showLoader(false);
      }
    },
    () => {
      showLoader(false);
      showToast('Unable to retrieve your location. Please check permissions.');
    },
    { timeout: 10000, enableHighAccuracy: false }
  );
}

function initCategoryFilters() {
  document.querySelectorAll('.n-filter').forEach((btn) => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category || 'all';
      newsPage = 1;
      hasMoreNews = true;
      loadNews({ category, page: 1 });
    });
  });
}

function initInfiniteScroll() {
  const sentinel = document.getElementById('news-sentinel');
  if (!sentinel || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && hasMoreNews && !isLoadingNews) {
      loadNews({ category: currentCategory, page: newsPage + 1, append: true });
    }
  }, { rootMargin: '200px' });

  observer.observe(sentinel);
}

function initWeatherRefresh() {
  const btn = document.getElementById('weather-refresh-btn');
  btn?.addEventListener('click', () => loadWeather(currentCity, { force: true }));

  // Ensure only one timer ever runs
  if (weatherRefreshTimer) clearInterval(weatherRefreshTimer);
  weatherRefreshTimer = setInterval(() => {
    if (isOnline()) loadWeather(currentCity, { force: true, silent: true });
  }, WEATHER_REFRESH_MS);
}

function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    const tag = e.target.tagName;
    const isInput = tag === 'INPUT' || tag === 'TEXTAREA';

    if (e.key === '/' && !isInput) {
      e.preventDefault();
      searchApi?.focus();
    }

    if (e.key === 'Escape' && isInput) {
      searchApi?.clear();
    }
  });
}

function initScrollRestoration() {
  const savedY = getScrollPosition();
  if (savedY > 0) {
    requestAnimationFrame(() => window.scrollTo(0, savedY));
  }

  let scrollTimer;
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimer);
    scrollTimer = setTimeout(() => saveScrollPosition(window.scrollY), 200);
  }, { passive: true });
}

function initNetworkRecovery() {
  onNetworkChange(async ({ online }) => {
    updateConnectionStatus({ online, health: online ? 'healthy' : 'offline' });
    if (online) {
      // FIX: Guard against concurrent recovery attempts and race with isLoadingNews
      if (isRecovering) return;
      isRecovering = true;
      showSuccessToast('Connection restored. Syncing data...');
      try {
        await Promise.allSettled([
          loadWeather(currentCity, { force: true, silent: true }),
          loadNews({ category: currentCategory, force: true }),
        ]);
      } finally {
        isRecovering = false;
      }
    }
  });
}

async function init() {
  initNetwork();
  initClock();
  initBackToTop();
  initScrollRestoration();
  initKeyboardShortcuts();
  initCategoryFilters();
  initInfiniteScroll();
  initWeatherRefresh();

  updateConnectionStatus({ online: isOnline(), health: 'healthy' });
  initNetworkRecovery();

  searchApi = initSearch({ onSearch: handleSearch, onInvalid: handleInvalidSearch });

  document.getElementById('geolocate-btn')?.addEventListener('click', handleGeolocation);

  initPullToRefresh(async () => {
    showLoader(true);
    await Promise.allSettled([
      loadWeather(currentCity, { force: true, silent: true }),
      loadNews({ category: currentCategory, force: true }),
    ]);
    showLoader(false);
    showSuccessToast('Content refreshed');
  });

  showLoader(true);
  try {
    await Promise.all([
      loadWeather(currentCity, { silent: true }),
      loadNews({ category: currentCategory }),
    ]);
  } finally {
    showLoader(false);
  }

  if (!prefersReducedMotion()) {
    document.body.classList.add('animations-enabled');
  }
}

init();

window.addEventListener('beforeunload', () => {
  cancelWeatherFetch();
  cancelNewsFetch();
  if (weatherRefreshTimer) clearInterval(weatherRefreshTimer);
});
