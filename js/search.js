/** City search — dropdown, validation, keyboard, in-memory history */

import { debounce, cleanAndValidateQuery } from './utils.js';
import { getCitySuggestions, validateCity } from './weather.js';

const searchHistory = [];
const MAX_HISTORY = 8;

function addSearchHistory(city) {
  const normalized = city.trim();
  if (!normalized) return;
  const filtered = searchHistory.filter((h) => h.toLowerCase() !== normalized.toLowerCase());
  searchHistory.length = 0;
  searchHistory.push(normalized, ...filtered);
  if (searchHistory.length > MAX_HISTORY) searchHistory.length = MAX_HISTORY;
}

function clearSearchHistory() {
  searchHistory.length = 0;
}

export function initSearch({ onSearch, onInvalid }) {
  const input = document.getElementById('city-search');
  const dropdown = document.getElementById('search-dropdown');
  const clearBtn = document.getElementById('search-clear');
  const searchBtn = document.getElementById('search-btn');
  const wrapper = document.getElementById('search-wrapper');

  if (!input) return {};

  let isSearching = false;
  let _docClickBound = false;

  function setLoading(loading) {
    isSearching = loading;
    wrapper?.classList.toggle('is-loading', loading);
    searchBtn?.setAttribute('aria-busy', String(loading));
  }

  function showDropdown(items) {
    if (!dropdown) return;
    if (!items.length) {
      dropdown.hidden = true;
      dropdown.innerHTML = '';
      input.setAttribute('aria-expanded', 'false');
      return;
    }

    dropdown.hidden = false;
    input.setAttribute('aria-expanded', 'true');

    dropdown.innerHTML = items.map((city) =>
      `<button type="button" class="search-suggestion" role="option" data-city="${city}">${city}</button>`
    ).join('') +
      '<button type="button" class="search-clear-history">Clear recent searches</button>';
  }

  function hideDropdown() {
    if (dropdown) dropdown.hidden = true;
    input.setAttribute('aria-expanded', 'false');
  }

  function performSearch(query) {
    const trimmed = cleanAndValidateQuery(query);
    if (trimmed === null) {
      onInvalid?.('Please enter a city name.');
      return;
    }

    const valid = validateCity(trimmed);
    if (!valid) {
      input.classList.add('is-invalid');
      input.setAttribute('aria-invalid', 'true');
      onInvalid?.('Location not found. Try: Mumbai, Pune, Delhi, London, Tokyo\u2026');
      return;
    }

    input.classList.remove('is-invalid');
    input.setAttribute('aria-invalid', 'false');
    addSearchHistory(`${valid.city}, ${valid.region}`);
    hideDropdown();
    setLoading(true);
    onSearch(valid.city, () => setLoading(false));
  }

  const debouncedSuggest = debounce((query) => {
    const trimmed = cleanAndValidateQuery(query);
    if (trimmed === null) {
      showDropdown([...searchHistory]);
      return;
    }
    const suggestions = getCitySuggestions(trimmed);
    showDropdown(suggestions.length ? suggestions : [...searchHistory]);
  }, 250);

  input.addEventListener('input', () => {
    input.classList.remove('is-invalid');
    input.setAttribute('aria-invalid', 'false');
    clearBtn?.classList.toggle('visible', input.value.length > 0);
    debouncedSuggest(input.value);
  });

  input.addEventListener('focus', () => {
    const trimmed = cleanAndValidateQuery(input.value);
    showDropdown(trimmed ? getCitySuggestions(trimmed) : [...searchHistory]);
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      input.value = '';
      input.classList.remove('is-invalid');
      clearBtn?.classList.remove('visible');
      hideDropdown();
      input.blur();
    }
    if (e.key === 'ArrowDown' && dropdown && !dropdown.hidden) {
      e.preventDefault();
      dropdown.querySelector('.search-suggestion')?.focus();
    }
  });

  wrapper?.addEventListener('submit', (e) => {
    e.preventDefault();
    performSearch(input.value);
  });

  clearBtn?.addEventListener('click', () => {
    input.value = '';
    input.classList.remove('is-invalid');
    clearBtn.classList.remove('visible');
    hideDropdown();
    input.focus();
  });

  dropdown?.addEventListener('click', (e) => {
    const suggestion = e.target.closest('.search-suggestion');
    if (suggestion) {
      input.value = suggestion.dataset.city;
      performSearch(suggestion.dataset.city);
      return;
    }
    if (e.target.closest('.search-clear-history')) {
      clearSearchHistory();
      hideDropdown();
    }
  });

  if (!_docClickBound) {
    _docClickBound = true;
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#search-wrapper')) hideDropdown();
    });
  }

  return {
    setLoading,
    focus: () => {
      input.focus();
      if (!input.value.trim()) showDropdown([...searchHistory]);
    },
    clear: () => {
      input.value = '';
      clearBtn?.classList.remove('visible');
      hideDropdown();
    },
    isSearching: () => isSearching,
  };
}
