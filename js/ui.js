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

 feature/cinematic-weather-news-dashboard
// ─── Cinematic Background System ───
const BG_IMAGES = {
  sunny: {
    morning:   'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=1920&q=80',
    afternoon: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1920&q=80',
    evening:   'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1920&q=80',
    night:     'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1920&q=80',
  },
  'partly-cloudy': {
    morning:   'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80',
    afternoon: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80',
    evening:   'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?auto=format&fit=crop&w=1920&q=80',
    night:     'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1920&q=80',
  },
  cloudy: {
    morning:   'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1920&q=80',
    afternoon: 'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1920&q=80',
    evening:   'https://images.unsplash.com/photo-1534088568595-a066f410bcda?auto=format&fit=crop&w=1920&q=80',
    night:     'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1920&q=80',
  },
  rainy:        'https://images.unsplash.com/photo-1428592953211-077101b2021b?auto=format&fit=crop&w=1920&q=80',
  thunderstorm: 'https://images.unsplash.com/photo-1492011221367-f47e96b5d393?auto=format&fit=crop&w=1920&q=80',
  snowy:        'https://images.unsplash.com/photo-1491002052546-bf38f186af56?auto=format&fit=crop&w=1920&q=80',
};

const BG_FILTERS = {
  sunny: {
    morning:   'brightness(0.85) contrast(1.05) saturate(1.1)',
    afternoon: 'brightness(0.75) contrast(1.1) sepia(0.08)',
    evening:   'brightness(0.7) contrast(1.1) saturate(1.15) sepia(0.1)',
    night:     'brightness(0.45) contrast(1.2) saturate(0.65)',
  },
  'partly-cloudy': {
    morning:   'brightness(0.8) contrast(1.05) saturate(0.95)',
    afternoon: 'brightness(0.7) contrast(1.05) saturate(0.9)',
    evening:   'brightness(0.65) contrast(1.1) saturate(1.05)',
    night:     'brightness(0.4) contrast(1.15) saturate(0.6)',
  },
  cloudy: {
    morning:   'brightness(0.65) contrast(1.0) saturate(0.85)',
    afternoon: 'brightness(0.6) contrast(1.05) saturate(0.8)',
    evening:   'brightness(0.55) contrast(1.05) saturate(0.8)',
    night:     'brightness(0.4) contrast(1.1) saturate(0.6)',
  },
  rainy: {
    morning:   'brightness(0.5) contrast(1.1) saturate(0.7)',
    afternoon: 'brightness(0.5) contrast(1.1) saturate(0.7)',
    evening:   'brightness(0.45) contrast(1.1) saturate(0.65)',
    night:     'brightness(0.35) contrast(1.1) saturate(0.6)',
  },
  thunderstorm: {
    morning:   'brightness(0.45) contrast(1.2) saturate(0.6)',
    afternoon: 'brightness(0.45) contrast(1.2) saturate(0.6)',
    evening:   'brightness(0.4) contrast(1.2) saturate(0.55)',
    night:     'brightness(0.3) contrast(1.2) saturate(0.5)',
  },
  snowy: {
    morning:   'brightness(0.8) contrast(0.95) saturate(0.5)',
    afternoon: 'brightness(0.75) contrast(0.95) saturate(0.5)',
    evening:   'brightness(0.65) contrast(1.0) saturate(0.45)',
    night:     'brightness(0.45) contrast(1.0) saturate(0.4)',
  },
};

function getTimeOfDay(hour) {
  if (hour >= 5  && hour < 12) return 'morning';
  if (hour >= 12 && hour < 17) return 'afternoon';
  if (hour >= 17 && hour < 21) return 'evening';
  return 'night';
}

function getCinematicBgUrl(icon, hour) {
  const entry = BG_IMAGES[icon] || BG_IMAGES.sunny;
  if (typeof entry === 'string') return entry;
  const tod = getTimeOfDay(hour);
  return entry[tod] || entry.afternoon;
}

let _activeBgSlot = 'a';
let _lastBgUrl = null;

function applyWeatherFilter(icon, hour, imgEl) {
  if (prefersReducedMotion()) return;
  const tod = getTimeOfDay(hour);
  const entry = BG_FILTERS[icon] || BG_FILTERS.sunny;
  const filter = entry[tod] || entry.afternoon;
  if (!imgEl.dataset.filterTransition) {
    imgEl.style.transition = 'opacity 1s ease, filter 0.5s ease';
    imgEl.dataset.filterTransition = '1';
  }
  imgEl.style.filter = filter;
}

const TEMP_TINT_CLASSES = ['tint-freezing', 'tint-cold', 'tint-mild', 'tint-warm', 'tint-hot'];

function applyTempTint(temp) {
  const el = document.getElementById('temp-tint');
  if (!el) return;
  el.classList.remove(...TEMP_TINT_CLASSES);
  if (temp < 0)       el.classList.add('tint-freezing');
  else if (temp < 10) el.classList.add('tint-cold');
  else if (temp < 24) el.classList.add('tint-mild');
  else if (temp < 34) el.classList.add('tint-warm');
  else                el.classList.add('tint-hot');
}

function updateCinematicBackground(icon, temp) {
  const bgA = document.getElementById('bg-img-a');
  const bgB = document.getElementById('bg-img-b');
  if (!bgA || !bgB) return;

  const hour = new Date().getHours();
  const newUrl = getCinematicBgUrl(icon, hour);

  applyTempTint(temp);

  if (newUrl === _lastBgUrl) {
    // URL unchanged — just refresh filter in case temp/time shifted
    applyWeatherFilter(icon, hour, _activeBgSlot === 'a' ? bgA : bgB);
    return;
  }
  _lastBgUrl = newUrl;

  const nextSlot = _activeBgSlot === 'a' ? 'b' : 'a';
  const nextImg  = nextSlot === 'a' ? bgA : bgB;
  const currImg  = _activeBgSlot === 'a' ? bgA : bgB;

  // Pre-apply filter before the new image fades in
  applyWeatherFilter(icon, hour, nextImg);

  const onLoaded = () => {
    nextImg.classList.add('active');
    currImg.classList.remove('active');
    _activeBgSlot = nextSlot;
  };

  nextImg.onload = onLoaded;
  nextImg.onerror = () => { nextImg.onload = null; };
  nextImg.src = newUrl;

  // Already cached — fire immediately
  if (nextImg.complete && nextImg.naturalWidth > 0) {
    nextImg.onload = null;
    onLoaded();
  }

let _bgImg = null;
function getBgImg() {
  if (!_bgImg) _bgImg = document.querySelector('.cinematic-bg img');
  return _bgImg;
 develop
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

/** Reset lazy observer — call before rendering new grid so stale entries are cleared */
export function resetLazyObserver() {
  if (_lazyObserver) {
    _lazyObserver.disconnect();
    _lazyObserver = null;
  }
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
 feature/cinematic-weather-news-dashboard

  const bgImg = getBgImg();
 develop

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

 feature/cinematic-weather-news-dashboard
  updateCinematicBackground(data.current.icon, data.current.temp);

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
 develop

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
    const label = day.active ? 'Today' : sanitize(day.day);
    return `
      <div class="w-day-col${activeClass}"${colStyle}>
        <span class="w-name"${nameStyle}>${label}</span>
        <span class="w-temp${activeClass}"${tempStyle}>${Math.round(day.temp)}&deg;</span>
      </div>`;
  }).join('');

  // Dynamically synchronize SVG highlight markers with the active forecast column position
  const activeIndex = days.findIndex((d) => d.active);
  if (activeIndex !== -1) {
    const xCoords = [0, 166, 333, 500, 666, 833, 1000];
    const activeX = xCoords[activeIndex] !== undefined ? xCoords[activeIndex] : 500;
    const svgLine = document.querySelector('.wave-svg line');
    const svgCircle = document.querySelector('.wave-svg circle');
    if (svgLine) {
      svgLine.setAttribute('x1', activeX);
      svgLine.setAttribute('x2', activeX);
    }
    if (svgCircle) {
      svgCircle.setAttribute('cx', activeX);
    }
  }
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
  const articleUrl = article.url || article.link || '#';
  card.onclick = () => {
    if (articleUrl && articleUrl !== '#') window.open(articleUrl, '_blank', 'noopener');
  };
}

function buildNewsCard(article, readSet) {
  const isRead = readSet.has(article.id);
  const isNew = isRecentArticle(article.publishedAt);
  const badges = [
    article.breaking ? '<span class="nc-badge nc-badge-breaking">Breaking News</span>' : '',
    isNew ? '<span class="nc-badge nc-badge-new">New</span>' : '',
    article.local ? '<span class="nc-badge nc-badge-local">Local</span>' : '',
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

  const sentinel = document.getElementById('news-sentinel');
  if (sentinel && !sentinel.dataset.wired) {
    sentinel.dataset.wired = 'true';
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) {
          const endMsg = sentinel.querySelector('.sentinel-end');
          if (!endMsg) {
            const msg = document.createElement('div');
            msg.className = 'sentinel-end';
            msg.textContent = 'All articles loaded';
            msg.style.cssText = 'text-align:center;padding:32px;color:var(--text-dark);font-size:13px;font-weight:300;';
            sentinel.appendChild(msg);
          }
        }
      }, { rootMargin: '100px' }).observe(sentinel);
    }
  }

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

export function initSectionRift() {
  if (prefersReducedMotion()) return;

  const newsSection = document.querySelector('.news-view');
  if (!newsSection) return;

  // Pre-reveal state — hide header until we animate it in
  newsSection.classList.add('news-pre-reveal');

  let hasRevealed = false;

  // Reveal the news header with a sweep animation when the sheet enters the viewport
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !hasRevealed) {
        hasRevealed = true;
        newsSection.classList.remove('news-pre-reveal');
        newsSection.classList.add('news-revealed');
        revealObserver.disconnect();
      }
    });
  }, { threshold: 0.06 });

  revealObserver.observe(newsSection);

  // Scroll parallax: progressively darken the hero as news sheet slides up
  const heroEl = document.querySelector('.hero-view');
  if (!heroEl) return;

  let rafId = null;
  const onScroll = () => {
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      const heroBottom = heroEl.getBoundingClientRect().bottom;
      const vh = window.innerHeight;
      // 0 = hero fully in view, 1 = hero fully scrolled past
      const progress = Math.max(0, Math.min(1, 1 - heroBottom / vh));
      const overlay = document.getElementById('temp-tint');
      if (overlay) {
        // Override temp-tint background while scrolling to add darkness
        overlay.style.background = `rgba(5,5,10,${(progress * 0.45).toFixed(3)})`;
      }
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
}
