/** WeatherWise — Orchestration & Core Integration */

import { getWeatherData } from './weather.js';
import {
  showLoader, showToast, showSuccessToast, updateConnectionStatus,
 feature/cinematic-weather-news-dashboard
  initClock, renderWeather, renderTicker, renderFeatured,
  renderNewsGrid, renderNewsSkeleton, updateFilterButtons,
  initBackToTop, initPullToRefresh, setWeatherRefreshing, initSectionRift,
} from './ui.js';

  initClock, renderWeather, renderNewsSkeleton, updateFilterButtons,
  initBackToTop, setWeatherRefreshing,
} from './ui.js?v=4';
 develop
import { initSearch } from './search.js';
import { prefersReducedMotion } from './utils.js';
import { getAutomaticLocation, getManualLocation } from './location.js';
import { loadAndRenderNews, setNewsLocation } from './newsapi.js';

let currentCategory = 'all';
let currentLocation = null;

async function loadWeather(location) {
  const opts = typeof location === 'string' ? { city: location }
    : { city: location.city || 'Brooklyn', lat: location.lat, lon: location.lon };
  const data = await getWeatherData(opts);
  renderWeather(data);
  setNewsLocation(data.location.city, data.location.country);
  return data;
}

async function loadNews({ category = 'all' } = {}) {
  renderNewsSkeleton();
  updateFilterButtons(category);
  currentCategory = category;
  await loadAndRenderNews(category);
}

async function refreshApp(location) {
  currentLocation = location;
  await loadWeather(location);
  await loadNews({ category: currentCategory });
}

// ============================================================================
// PULAK'S WORK: SEARCH LOGIC & HISTORY
// ============================================================================
/**
 * Handles the successful submission of a search query by resolving the location
 * and refreshing the application state with new weather data.
 *
 * @param {string} city - The validated city name to search for.
 * @param {Function} done - Callback to execute once the search is complete.
 */
async function handleSearch(city, done) {
  try {
    const location = await getManualLocation(city);
    await refreshApp(location);
    showSuccessToast(`Weather updated for ${location.city}`);
    done?.();
  } catch (err) {
    showToast(err.message || 'Location not found. Please try another search.');
    done?.();
  }
}

/**
 * Handles invalid search submissions by displaying an error notification.
 *
 * @param {string} msg - The error message to display.
 */
function handleInvalidSearch(msg) {
  showToast(msg);
}
// ============================================================================
// END PULAK'S WORK
// ============================================================================

// ============================================================================
// PULAK'S WORK: FILTER LOGIC
// ============================================================================
/**
 * Initializes event listeners for the news category selection dropdown.
 * Upon selection change, it updates the application state to load articles
 * matching the selected category.
 */
function initCategoryFilters() {
  const select = document.getElementById('news-category-select');
  select?.addEventListener('change', (e) => {
    const category = e.target.value || 'all';
    loadNews({ category });
  });

  document.querySelectorAll('.n-filter[data-category]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const category = btn.dataset.category || 'all';
      if (select) {
        select.value = category;
        select.dispatchEvent(new Event('change'));
      } else {
        loadNews({ category });
      }
    });
  });
}
// ============================================================================
// END PULAK'S WORK
// ============================================================================

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

let searchApi;

function init() {
  initClock();
  initBackToTop();
  initKeyboardShortcuts();
  initCategoryFilters();

  document.getElementById('weather-refresh-btn')?.addEventListener('click', async () => {
    setWeatherRefreshing(true);
    try {
      if (currentLocation) {
        await loadWeather(currentLocation);
      } else {
        await loadWeather('Brooklyn');
      }
      showSuccessToast('Weather refreshed');
    } finally {
      setWeatherRefreshing(false);
    }
  });

 feature/cinematic-weather-news-dashboard
async function init() {
  initNetwork();
  initClock();
  initBackToTop();
  initScrollRestoration();
  initKeyboardShortcuts();
  initCategoryFilters();
  initInfiniteScroll();
  initWeatherRefresh();
  initSectionRift();

// ============================================================================
  // PULAK'S WORK: SEARCH LOGIC & HISTORY
  // ============================================================================
  /**
   * Resets active search and filter states when the geolocation button is triggered.
   * This ensures that manually entered queries or category filters are cleared 
   * before applying the automatically detected location.
   */
  document.getElementById('geolocate-btn')?.addEventListener('click', async () => {
    searchApi?.clear();

    const select = document.getElementById('news-category-select');
    if (select) {
      select.value = 'all';
      currentCategory = 'all';
    }
 develop

    setWeatherRefreshing(true);
    try {
      const location = await getAutomaticLocation();
      await refreshApp(location);
      showSuccessToast(`Location updated to ${location.city}`);
    } catch (err) {
      showToast('Could not determine location.');
    } finally {
      setWeatherRefreshing(false);
    }
  });
  // ============================================================================
  // END PULAK'S WORK
  // ============================================================================

  searchApi = initSearch({ onSearch: handleSearch, onInvalid: handleInvalidSearch });

  updateConnectionStatus({ online: navigator.onLine, health: 'healthy' });

  window.addEventListener('online', () => {
    updateConnectionStatus({ online: true, health: 'healthy' });
    showSuccessToast('Connection restored');
  });
  window.addEventListener('offline', () => {
    updateConnectionStatus({ online: false, health: 'offline' });
    showToast('You are offline. Some features may be unavailable.');
  });

  let pullStartY = 0;
  const pullEl = document.getElementById('pull-refresh');
  document.addEventListener('touchstart', (e) => {
    if (window.scrollY === 0) pullStartY = e.touches[0].clientY;
  }, { passive: true });
  document.addEventListener('touchmove', (e) => {
    if (pullStartY && window.scrollY === 0) {
      const dy = e.touches[0].clientY - pullStartY;
      if (dy > 60) {
        pullEl?.classList.add('active');
        pullEl?.setAttribute('aria-hidden', 'false');
      }
    }
  }, { passive: true });
  document.addEventListener('touchend', async () => {
    if (pullEl?.classList.contains('active')) {
      pullEl.classList.remove('active');
      pullEl?.setAttribute('aria-hidden', 'true');
      pullStartY = 0;
      if (currentLocation) {
        await refreshApp(currentLocation);
        showSuccessToast('Refreshed');
      }
    }
    pullStartY = 0;
  }, { passive: true });

  showLoader(true);

  const DEFAULT_LOCATION = { city: 'Brooklyn', countryCode: 'us' };
  refreshApp(DEFAULT_LOCATION).then(() => showLoader(false));

  if (!prefersReducedMotion()) {
    document.body.classList.add('animations-enabled');
  }

  setTimeout(async () => {
    try {
      const location = await getAutomaticLocation();
      if (location.city !== DEFAULT_LOCATION.city) {
        await refreshApp(location);
        showSuccessToast(`Location updated to ${location.city}`);
      }
    } catch {
      // keep default location
    }
  }, 600);
}

init();
