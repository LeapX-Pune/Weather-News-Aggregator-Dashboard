/** Shared utilities — debounce, formatting, time helpers */

export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
}

export function formatDate(date = new Date()) {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  return `( ${days[date.getDay()]}, ${months[date.getMonth()]} ${date.getDate()} )`;
}

export function formatClock(date = new Date()) {
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
}

export function formatRelativeTime(dateStr) {
  const date = new Date(dateStr);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

export function isRecentArticle(publishedAt, hours = 3) {
  return Date.now() - new Date(publishedAt).getTime() < hours * 3600000;
}

export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function createAbortable(delay = 600) {
  let timeoutId;
  const promise = new Promise((resolve, reject) => {
    timeoutId = setTimeout(resolve, delay);
  });
  return {
    promise,
    abort: () => {
      clearTimeout(timeoutId);
    },
  };
}

export function sanitize(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Trims whitespace from a query string and validates that it is non-empty.
 * Returns the trimmed query if valid, or null if the input is empty or invalid.
 * Used to prevent execution of empty submissions.
 */
export function cleanAndValidateQuery(query) {
  if (typeof query !== 'string') return null;
  const trimmed = query.trim();
  return trimmed !== '' ? trimmed : null;
}

