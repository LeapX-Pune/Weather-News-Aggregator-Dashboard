/** DOM rendering — updates existing UI without redesign */

import { formatDate, formatClock, formatRelativeTime, getGreeting, isRecentArticle, sanitize, prefersReducedMotion } from './utils.js';
import { getArticleFallbackImage } from './news.js';

const readArticles = new Set();

const ICON_MAP = {
  sunny: { icon: 'ph-fill ph-sun', color: '#fbbf24' },
  cloudy: { icon: 'ph-fill ph-cloud', color: '#94a3b8' },
  rainy: { icon: 'ph-fill ph-cloud-rain', color: '#38bdf8' },
  thunderstorm: { icon: 'ph-fill ph-cloud-lightning', color: '#a78bfa' },
  'partly-cloudy': { icon: 'ph-fill ph-cloud-sun', color: '#fbbf24' },
};

const AMBIENCE_MAP = {
  sunny: 'ambience-sunny',
  cloudy: 'ambience-cloudy',
  rainy: 'ambience-rainy',
  thunderstorm: 'ambience-thunderstorm',
  'partly-cloudy': 'ambience-partly-cloudy',
};

let clockInterval = null;

let _bgImg = null;
function getBgImg() {
  if (!_bgImg) _bgImg = document.querySelector('.cinematic-bg img');
  return _bgImg;
}

let _lazyObserver = null;
function getLazyObserver() {
  if (_lazyObserver) return _lazyObserver;
  if (!('IntersectionObserver' in window)) return null;
  _lazyObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
        img.addEventListener('error', () => {
          const card = img.closest('[data-category]');
          const category = card?.dataset.category || 'default';
          img.src = getArticleFallbackImage(category);
          img.classList.add('loaded');
        }, { once: true });
        if (img.complete && img.naturalWidth > 0) img.classList.add('loaded');
        _lazyObserver.unobserve(img);
      }
    });
  }, { rootMargin: '150px' });
  return _lazyObserver;
}

export function showLoader(show = true) {
  const loader = document.getElementById('app-loader');
  if (loader) loader.classList.toggle('active', show);
  loader?.setAttribute('aria-hidden', String(!show));
}

export function showToast(message, type = 'error') {
  const toast = document.getElementById('error-toast');
  if (!toast) return;
  const span = toast.querySelector('span');
  const icon = toast.querySelector('i');
  if (span) span.textContent = message;
  if (icon) {
    icon.className = type === 'success'
      ? 'ph-fill ph-check-circle'
      : 'ph-fill ph-warning-circle';
  }
  toast.classList.add('active');
  toast.setAttribute('role', 'alert');
  toast.dataset.type = type;
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.remove('active'), 4000);
}

export function showSuccessToast(message) {
  showToast(message, 'success');
}

export function updateConnectionStatus({ online, health }) {
  const indicator = document.getElementById('connection-status');
  const banner = document.getElementById('offline-banner');
  if (indicator) {
    indicator.className = `connection-status status-${online ? health : 'offline'}`;
    indicator.setAttribute('aria-label', online ? `Connection ${health}` : 'Offline');
    indicator.title = online ? `Connection: ${health}` : 'You are offline';
  }
  if (banner) {
    banner.classList.toggle('visible', !online);
    banner.setAttribute('aria-hidden', String(online));
  }
}

export function initClock() {
  const clockEl = document.getElementById('live-clock');
  const dateEl = document.getElementById('location-date');
  const greetingEl = document.getElementById('greeting-text');

  function tick() {
    const now = new Date();
    if (clockEl) clockEl.textContent = formatClock(now);
    if (dateEl) dateEl.textContent = formatDate(now);
    if (greetingEl) greetingEl.textContent = getGreeting();
  }

  tick();
  if (clockInterval) clearInterval(clockInterval);
  clockInterval = setInterval(tick, 1000);
}

export function renderWeather(data) {
  const loc = document.getElementById('location-name');
  const temp = document.getElementById('current-temp');
  const tempHigh = document.getElementById('temp-high');
  const tempLow = document.getElementById('temp-low');
  const conditionTitle = document.getElementById('condition-title');
  const conditionDesc = document.getElementById('condition-desc');
  const humidity = document.getElementById('metric-humidity');
  const uv = document.getElementById('metric-uv');
  const feelsLike = document.getElementById('metric-feels');
  const windVal = document.getElementById('wind-value');
  const windDesc = document.getElementById('wind-desc');
  const conditionIcon = document.getElementById('condition-icon');
  const lastUpdated = document.getElementById('weather-last-updated');
  const syncTime = document.getElementById('sync-timestamp');
  const ambience = document.getElementById('weather-ambience');
  const bgImg = getBgImg();

  if (loc) loc.textContent = data.location.display;
  if (temp) temp.innerHTML = `${Math.round(data.current.temp)}&deg;`;
  if (tempHigh) tempHigh.innerHTML = `${Math.round(data.current.tempHigh)}&deg;`;
  if (tempLow) tempLow.innerHTML = `${Math.round(data.current.tempLow)}&deg;`;

  const iconInfo = ICON_MAP[data.current.icon] || ICON_MAP.sunny;
  if (conditionTitle) {
    conditionTitle.textContent = data.current.condition;
    conditionTitle.style.color = data.current.color || iconInfo.color;
  }
  if (conditionDesc) conditionDesc.textContent = data.current.description;

  if (humidity) humidity.textContent = `${data.current.humidity}%`;
  if (uv) uv.textContent = String(data.current.uv);
  if (feelsLike) feelsLike.innerHTML = `${Math.round(data.current.feelsLike)}&deg;`;
  if (windVal) windVal.innerHTML = `<i class="ph ph-wind" style="font-size: 24px; vertical-align: middle;" aria-hidden="true"></i> ${data.current.windSpeed} km/h`;
  if (windDesc) windDesc.textContent = data.current.windDesc;

  if (conditionIcon) {
    conditionIcon.innerHTML = `<i class="${iconInfo.icon}" style="font-size: 32px; color: ${iconInfo.color};" aria-hidden="true"></i>`;
    conditionIcon.className = `condition-icon-wrap weather-${data.current.icon}`;
  }

  const updated = new Date(data.updatedAt);
  const timeStr = updated.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  if (lastUpdated) lastUpdated.textContent = `Updated ${timeStr}`;
  if (syncTime) syncTime.textContent = `Last sync: ${timeStr}`;

  if (ambience) {
    ambience.className = 'weather-ambience';
    ambience.classList.add(AMBIENCE_MAP[data.current.icon] || 'ambience-sunny');
  }

  if (bgImg && !prefersReducedMotion()) {
    if (!bgImg.dataset.transitionSet) {
      bgImg.style.transition = 'filter 0.5s ease';
      bgImg.dataset.transitionSet = '1';
    }
    const filters = {
      sunny: 'brightness(0.75) contrast(1.1) sepia(0.1)',
      cloudy: 'brightness(0.6) contrast(1.05) saturate(0.8)',
      rainy: 'brightness(0.5) contrast(1.1) saturate(0.7)',
      thunderstorm: 'brightness(0.45) contrast(1.2) saturate(0.6)',
      'partly-cloudy': 'brightness(0.65) contrast(1.05)',
    };
    bgImg.style.filter = filters[data.current.icon] || filters.sunny;
  }

  renderForecast(data.forecast);
}

function renderForecast(days) {
  const container = document.getElementById('wave-days');
  if (!container) return;

  container.innerHTML = days.map((day) => {
    const activeClass = day.active ? ' active' : '';
    const colStyle = day.active ? ' style="transform: translateY(-20px);"' : '';
    const nameStyle = day.active ? ' style="color: #ffffff; font-weight: 500;"' : '';
    const tempStyle = day.active ? '' : ` style="margin-top: ${day.offsetY}px;"`;
    return `
      <div class="w-day-col${activeClass}"${colStyle}>
        <span class="w-name"${nameStyle}>${sanitize(day.day)}</span>
        <span class="w-temp${activeClass}"${tempStyle}>${Math.round(day.temp)}&deg;</span>
      </div>`;
  }).join('');
}

export function renderTicker(headlines) {
  const wrapper = document.querySelector('.ticker-wrapper');
  if (!wrapper || !headlines.length) return;

  wrapper.innerHTML = headlines.map((text, i) =>
    `<h4 class="ticker-item t-${i + 1}">${sanitize(text)}</h4>`
  ).join('');
  wrapper.setAttribute('aria-live', 'polite');
}

export function renderFeatured(article) {
  const card = document.getElementById('featured-news');
  if (!card || !article) return;

  const imgSrc = article.image || getArticleFallbackImage(article.category);
  const fallbackSrc = getArticleFallbackImage(article.category || 'default');

  card.innerHTML = `
    <div style="width: 90px; height: 90px; border-radius: 16px; overflow: hidden; flex-shrink: 0;">
      <img src="${imgSrc}" style="width: 100%; height: 100%; object-fit: cover;" alt="" loading="lazy" decoding="async"
        onerror="this.onerror=null;this.src='${fallbackSrc}'">
    </div>
    <div style="display: flex; flex-direction: column; justify-content: center;">
      <span style="font-size: 10px; text-transform: uppercase; letter-spacing: 1px; color: #38bdf8; font-weight: 500;">Top Story</span>
      <h4 style="font-size: 14px; font-weight: 400; line-height: 1.4; margin: 6px 0;">${sanitize(article.title)}</h4>
      <span style="font-size: 11px; color: var(--text-dark);">${sanitize(article.source)} &bull; ${formatRelativeTime(article.publishedAt)}</span>
    </div>`;
  card.dataset.articleId = article.id;
}

function buildNewsCard(article, readSet) {
  const isRead = readSet.has(article.id);
  const isNew = isRecentArticle(article.publishedAt);
  const badges = [
    article.breaking ? '<span class="nc-badge nc-badge-breaking">Breaking News</span>' : '',
    isNew ? '<span class="nc-badge nc-badge-new">New</span>' : '',
  ].filter(Boolean).join('');

  const imgSrc = article.image || getArticleFallbackImage(article.category);
  const fallbackSrc = getArticleFallbackImage(article.category || 'default');

  // Use article.url if available (real API), otherwise fall back gracefully
  const articleUrl = article.url || article.link || '#';

  return `
    <article class="news-card glass-panel${isRead ? ' is-read' : ''}" data-id="${article.id}" data-category="${article.category}" tabindex="0" role="article" aria-label="${sanitize(article.title)}">
      <div class="nc-img">
        <img src="${imgSrc}" alt="${sanitize(article.title)}" loading="lazy" decoding="async" class="nc-img-lazy"
          onerror="this.onerror=null;this.src='${fallbackSrc}'">
        <span class="nc-tag">${sanitize(article.category)}</span>
        ${badges ? `<div class="nc-badges">${badges}</div>` : ''}
      </div>
      <div class="nc-body">
        <h4>${sanitize(article.title)}</h4>
        <p>${sanitize(article.excerpt)}</p>
      </div>
      <div class="nc-footer">
        <div class="nc-meta">
          <span class="nc-source"><i class="ph ph-newspaper" aria-hidden="true"></i> ${sanitize(article.source)}</span>
          <span class="nc-time"><i class="ph ph-clock" aria-hidden="true"></i> ${formatRelativeTime(article.publishedAt)}</span>
        </div>
        <a href="${articleUrl}" target="_blank" rel="noopener noreferrer" class="nc-read-more" aria-label="Read more: ${sanitize(article.title)}">
          Read More <i class="ph ph-arrow-right" aria-hidden="true"></i>
        </a>
      </div>
    </article>`;
}

export function renderNewsSkeleton(count = 4) {
  const grid = document.getElementById('news-grid');
  if (!grid) return;
  grid.innerHTML = Array.from({ length: count }, () => `
    <div class="news-card glass-panel skeleton-card" aria-hidden="true">
      <div class="skeleton-img skeleton-shimmer"></div>
      <div class="skeleton-body">
        <div class="skeleton-tag skeleton-shimmer"></div>
        <div class="skeleton-line skeleton-shimmer" style="width: 90%;"></div>
        <div class="skeleton-line skeleton-shimmer" style="width: 70%;"></div>
        <div class="skeleton-line skeleton-shimmer" style="width: 100%;"></div>
        <div class="skeleton-line skeleton-shimmer" style="width: 85%;"></div>
        <div class="skeleton-footer">
          <div class="skeleton-line skeleton-shimmer" style="width: 40%;"></div>
          <div class="skeleton-line skeleton-shimmer" style="width: 25%;"></div>
        </div>
      </div>
    </div>`).join('');
}

export function renderNewsGrid(articles, { append = false, animate = true } = {}) {
  const grid = document.getElementById('news-grid');
  if (!grid) return;

  if (!articles || articles.length === 0) {
    grid.innerHTML = `
      <div class="news-empty" role="status" aria-live="polite">
        <i class="ph ph-newspaper" aria-hidden="true"></i>
        <h3>No articles available</h3>
        <p>Try selecting a different category or check back later.</p>
      </div>`;
    return;
  }

  const html = articles.map((a) => buildNewsCard(a, readArticles)).join('');

  if (append) {
    grid.insertAdjacentHTML('beforeend', html);
  } else {
    grid.innerHTML = html;
    if (animate && !prefersReducedMotion()) {
      grid.querySelectorAll('.news-card').forEach((card, i) => {
        card.style.animationDelay = `${i * 50}ms`;
        card.classList.add('card-reveal');
      });
    }
  }

  bindNewsCardEvents(grid);
  observeLazyImages(grid);
}

function bindNewsCardEvents(grid) {
  grid.querySelectorAll('.news-card:not([data-bound])').forEach((card) => {
    card.dataset.bound = 'true';
    card.addEventListener('click', () => {
      readArticles.add(card.dataset.id);
      card.classList.add('is-read');
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });
}

export { readArticles };

function observeLazyImages(container) {
  const observer = getLazyObserver();
  const images = container.querySelectorAll('.nc-img-lazy:not(.loaded)');

  if (!observer) {
    images.forEach((img) => {
      img.classList.add('loaded');
      img.addEventListener('error', () => {
        const card = img.closest('[data-category]');
        img.src = getArticleFallbackImage(card?.dataset.category);
        img.onerror = null;
      }, { once: true });
    });
    return;
  }

  images.forEach((img) => observer.observe(img));
}

export function updateFilterButtons(activeCategory) {
  document.querySelectorAll('.n-filter').forEach((btn) => {
    const cat = btn.dataset.category || 'all';
    const isActive = cat === activeCategory;
    btn.classList.toggle('active', isActive);
    btn.setAttribute('aria-pressed', String(isActive));
  });

  const select = document.getElementById('news-category-select');
  if (select) {
    select.value = activeCategory;
  }
}

export function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  const toggle = () => btn.classList.toggle('visible', window.scrollY > 400);
  window.addEventListener('scroll', toggle, { passive: true });
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  });
}

export function setWeatherRefreshing(isRefreshing) {
  const btn = document.getElementById('weather-refresh-btn');
  if (btn) {
    btn.classList.toggle('is-refreshing', isRefreshing);
    btn.setAttribute('aria-busy', String(isRefreshing));
    btn.disabled = isRefreshing;
  }
}
