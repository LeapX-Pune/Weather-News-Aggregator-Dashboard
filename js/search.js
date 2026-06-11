/** Premium city search — debounce, history, validation, keyboard */

import { debounce } from './utils.js';
import { getSearchHistory, addSearchHistory, clearSearchHistory } from './storage.js';
import { getCitySuggestions, validateCity } from './weather.js';

export function initSearch({ onSearch, onInvalid }) {
  const input = document.getElementById('city-search');
  const dropdown = document.getElementById('search-dropdown');
  const clearBtn = document.getElementById('search-clear');
  const searchBtn = document.getElementById('search-btn');
  const wrapper = document.getElementById('search-wrapper');

  if (!input) return {};

  let isSearching = false;
  // Track document click listener so we add it only once
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

    // Show items with clear history button only when items exist
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
    const trimmed = query.trim();
    if (!trimmed) {
      onInvalid?.('Please enter a city name.');
      return;
    }

    const valid = validateCity(trimmed);
    if (!valid) {
      input.classList.add('is-invalid');
      input.setAttribute('aria-invalid', 'true');
      onInvalid?.('Location not found. Try: Mumbai, Pune, Delhi, London, Tokyo…');
      return;
    }

    input.classList.remove('is-invalid');
    input.setAttribute('aria-invalid', 'false');
    addSearchHistory(`${valid.city}, ${valid.region}`);
    hideDropdown();
    setLoading(true);
    onSearch(valid.city, () => setLoading(false));
  }

  // Improved: searches both city name and history simultaneously
  const debouncedSuggest = debounce((query) => {
    if (!query.trim()) {
      showDropdown(getSearchHistory());
      return;
    }
    const suggestions = getCitySuggestions(query);
    // Show suggestions; if empty, show history as fallback
    showDropdown(suggestions.length ? suggestions : getSearchHistory());
  }, 250);

  input.addEventListener('input', () => {
    input.classList.remove('is-invalid');
    input.setAttribute('aria-invalid', 'false');
    clearBtn?.classList.toggle('visible', input.value.length > 0);
    debouncedSuggest(input.value);
  });

  input.addEventListener('focus', () => {
    const val = input.value.trim();
    showDropdown(val ? getCitySuggestions(val) : getSearchHistory());
  });

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      performSearch(input.value);
    }
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

  searchBtn?.addEventListener('click', () => performSearch(input.value));

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

  // Guard: add document click listener only once
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
      // Show search history on "/" shortcut focus
      if (!input.value.trim()) showDropdown(getSearchHistory());
    },
    clear: () => {
      input.value = '';
      clearBtn?.classList.remove('visible');
      hideDropdown();
    },
    isSearching: () => isSearching,
  };
}
