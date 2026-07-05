/** WeatherWise — UI-only dashboard shell */

import { getWeatherFixture } from './weather.js';
import {
  showLoader, showToast, showSuccessToast, updateConnectionStatus,
  initClock, renderWeather,
  renderNewsSkeleton, updateFilterButtons,
  initBackToTop, setWeatherRefreshing,
} from './ui.js';
import { initSearch } from './search.js';
import { prefersReducedMotion } from './utils.js';
import { getAutomaticLocation } from './location.js';
import { loadAndRenderNews, setNewsLocation } from './newsapi.js';

let currentCategory = 'all';

function loadWeather(city) {
  const data = getWeatherFixture(city);
  renderWeather(data);
  // Location change hone par news location bhi update karna
  setNewsLocation(data.location.city, data.location.country);
  return data;
}

// NewsAPI se news load karna — async function
async function loadNews({ category = 'all' } = {}) {
  renderNewsSkeleton();
  updateFilterButtons(category);
  currentCategory = category;
  await loadAndRenderNews(category);
}

function handleSearch(city, done) {
  loadWeather(city); // loadWeather already calls setNewsLocation internally
  loadNews({ category: currentCategory });
  showSuccessToast(`Weather updated for ${city}`);
  done?.();
}

function handleInvalidSearch(msg) {
  showToast(msg);
}

function initCategoryFilters() {
  const select = document.getElementById('news-category-select');
  select?.addEventListener('change', (e) => {
    const category = e.target.value || 'all';
    loadNews({ category });
  });

  // Pill button filters — drive the hidden select so existing logic stays intact
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

  document.getElementById('weather-refresh-btn')?.addEventListener('click', () => {
    setWeatherRefreshing(true);
    setTimeout(() => {
      loadWeather('Brooklyn');
      setWeatherRefreshing(false);
      showSuccessToast('Weather refreshed');
    }, 400);
  });

  document.getElementById('geolocate-btn')?.addEventListener('click', async () => {
    searchApi?.clear();
    
    const select = document.getElementById('news-category-select');
    if (select) {
      select.value = 'all';
    }

    setWeatherRefreshing(true);
    try {
      const location = await getAutomaticLocation();
      loadWeather(location.city); // setNewsLocation called inside loadWeather
      await loadNews({ category: 'all' });
      showSuccessToast(`Location updated to ${location.city}`);
    } catch (err) {
      showToast('Could not determine location.');
    } finally {
      setWeatherRefreshing(false);
    }
  });

  searchApi = initSearch({ onSearch: handleSearch, onInvalid: handleInvalidSearch });

  updateConnectionStatus({ online: true, health: 'healthy' });

  showLoader(true);
  setTimeout(async () => {
    loadWeather('Brooklyn');
    await loadNews({ category: 'all' });
    showLoader(false);

    if (!prefersReducedMotion()) {
      document.body.classList.add('animations-enabled');
    }
  }, 300);
}

init();