/** WeatherWise — UI-only dashboard shell */

import { getWeatherFixture } from './weather.js';
import { getNewsFixture, getTickerHeadlines } from './news.js';
import {
  showLoader, showToast, showSuccessToast, updateConnectionStatus,
  initClock, renderWeather, renderTicker, renderFeatured,
  renderNewsGrid, renderNewsSkeleton, updateFilterButtons,
  initBackToTop, setWeatherRefreshing,
} from './ui.js';
import { initSearch } from './search.js';
import { prefersReducedMotion } from './utils.js';

let currentCategory = 'all';

function loadWeather(city) {
  const data = getWeatherFixture(city);
  renderWeather(data);
  return data;
}

function loadNews({ category = 'all' } = {}) {
  renderNewsSkeleton();
  const { articles } = getNewsFixture({ category });
  renderNewsGrid(articles, { append: false, animate: true });
  renderTicker(getTickerHeadlines(articles));
  renderFeatured(articles[0]);
  updateFilterButtons(category);
  currentCategory = category;
}

function handleSearch(city, done) {
  loadWeather(city);
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

  document.getElementById('geolocate-btn')?.addEventListener('click', () => {
    showToast('Use the search bar to find a city.');
  });

  searchApi = initSearch({ onSearch: handleSearch, onInvalid: handleInvalidSearch });

  updateConnectionStatus({ online: true, health: 'healthy' });

  showLoader(true);
  setTimeout(() => {
    loadWeather('Brooklyn');
    loadNews({ category: 'all' });
    showLoader(false);

    if (!prefersReducedMotion()) {
      document.body.classList.add('animations-enabled');
    }
  }, 300);
}


function setupSearchListeners() {
    // Looks for standard search triggers in index.html layout template
    const searchButton = document.querySelector('#search-button') || document.querySelector('button');
    const searchInput = document.querySelector('#search-input') || document.querySelector('input[type="text"]');

    const handleSearchExecution = async () => {
        const query = searchInput.value;
        try {
            // Trigger manual location extraction flow
            const manualLocation = await getManualLocation(query);
            await updateDashboard(manualLocation);
        } catch (error) {

            showError('weather-output', error.message);
        }
    };

    if (searchButton && searchInput) {
        searchButton.addEventListener('click', handleSearchExecution);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearchExecution();
        });
    }
}

// Initial App Bootstrapping flow
window.addEventListener('DOMContentLoaded', async () => {
    setupSearchListeners();

    try {
        // Attempt initial automatic tracking pipeline load
        const autoLocation = await getAutomaticLocation();
        await updateDashboard(autoLocation);
    } catch (error) {

        console.warn("App.js Initial Load: Gracefully dropping into default fallback settings.");
        showError('weather-output', 'Location access blocked/unavailable. Showing default city.');
        await updateDashboard(FALLBACK_LOCATION);
    }
});