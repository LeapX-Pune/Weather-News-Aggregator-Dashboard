/**
 * feedback.js - Skeleton Loading System
 * Provides reusable, accessible loading skeleton components for the dashboard.
 */

const SkeletonSystem = (function() {
    
    // Define allowed skeleton types for validation
    const VALID_TYPES = ['weather', 'news', 'news-grid', 'search'];

    /**
     * Helper to safely resolve a target container
     * @param {HTMLElement|string} target - The DOM element or CSS selector
     * @returns {HTMLElement|null} The resolved DOM element or null
     */
    function resolveContainer(target) {
        if (!target) return null;
        try {
            return typeof target === 'string' ? document.querySelector(target) : target;
        } catch (e) {
            console.warn(`[SkeletonSystem] Invalid selector provided: ${target}`, e);
            return null;
        }
    }

    /**
     * Creates a base shimmer element
     * @param {string} classNames - Classes to apply to the element
     * @returns {HTMLElement}
     */
    function createShimmerElement(classNames) {
        const el = document.createElement('div');
        el.className = `skeleton-base ${classNames}`;
        return el;
    }

    /**
     * Adds accessibility and robust identification to a skeleton wrapper
     * @param {HTMLElement} wrapper - The skeleton wrapper element
     * @param {string} label - Screen reader accessible label
     */
    function setupSkeletonWrapper(wrapper, label) {
        wrapper.setAttribute('role', 'status');
        wrapper.setAttribute('aria-label', label);
        // Robust identifier to prevent accidental deletion of actual UI components
        wrapper.setAttribute('data-skeleton-wrapper', 'true');
    }

    /**
     * Creates a Weather Card Skeleton
     * @returns {HTMLElement} The weather skeleton DOM element
     */
    function createWeatherSkeleton() {
        const wrapper = document.createElement('div');
        wrapper.className = 'skeleton-weather-card';
        setupSkeletonWrapper(wrapper, 'Loading weather data');

        const frag = document.createDocumentFragment();
        frag.appendChild(createShimmerElement('skeleton-weather-icon'));
        frag.appendChild(createShimmerElement('skeleton-weather-temp'));
        frag.appendChild(createShimmerElement('skeleton-weather-desc'));
        
        const detailsContainer = document.createElement('div');
        detailsContainer.className = 'skeleton-weather-details';
        detailsContainer.appendChild(createShimmerElement('skeleton-weather-detail-item'));
        detailsContainer.appendChild(createShimmerElement('skeleton-weather-detail-item'));
        detailsContainer.appendChild(createShimmerElement('skeleton-weather-detail-item'));
        
        frag.appendChild(detailsContainer);
        wrapper.appendChild(frag);

        return wrapper;
    }

    /**
     * Creates a News Card Skeleton
     * @returns {HTMLElement} The news skeleton DOM element
     */
    function createNewsSkeleton() {
        const wrapper = document.createElement('article');
        wrapper.className = 'skeleton-news-card';
        setupSkeletonWrapper(wrapper, 'Loading news article');

        const frag = document.createDocumentFragment();
        frag.appendChild(createShimmerElement('skeleton-news-image'));
        
        const content = document.createElement('div');
        content.className = 'skeleton-news-content';
        
        content.appendChild(createShimmerElement('skeleton-news-title'));
        content.appendChild(createShimmerElement('skeleton-news-title-short'));
        
        content.appendChild(createShimmerElement('skeleton-news-text'));
        content.appendChild(createShimmerElement('skeleton-news-text'));
        content.appendChild(createShimmerElement('skeleton-news-text-short'));

        const meta = document.createElement('div');
        meta.className = 'skeleton-news-meta';
        meta.appendChild(createShimmerElement('skeleton-news-author'));
        meta.appendChild(createShimmerElement('skeleton-news-date'));
        content.appendChild(meta);

        frag.appendChild(content);
        wrapper.appendChild(frag);

        return wrapper;
    }

    /**
     * Creates a grid of News Card Skeletons
     * @param {number} count - Number of skeleton cards
     * @returns {HTMLElement} The grid container DOM element
     */
    function createNewsGridSkeleton(count = 6) {
        const validCount = (typeof count === 'number' && count > 0) ? count : 6;
        
        const grid = document.createElement('div');
        grid.className = 'skeleton-news-grid';
        setupSkeletonWrapper(grid, `Loading ${validCount} news articles`);
        
        const frag = document.createDocumentFragment();
        for (let i = 0; i < validCount; i++) {
            const item = createNewsSkeleton();
            // Prevent child skeletons from acting as independent wrappers during cleanup
            item.removeAttribute('data-skeleton-wrapper');
            frag.appendChild(item);
        }
        grid.appendChild(frag);
        
        return grid;
    }

    /**
     * Creates a Search Loading Skeleton
     * @returns {HTMLElement} The search skeleton DOM element
     */
    function createSearchSkeleton() {
        const wrapper = createShimmerElement('skeleton-search');
        setupSkeletonWrapper(wrapper, 'Loading search results');
        return wrapper;
    }

    /**
     * Renders a skeleton into a target container
     * @param {HTMLElement|string} target - The target element or selector
     * @param {string} type - 'weather', 'news', 'news-grid', or 'search'
     * @param {number} [count=6] - Number of items for grid type
     */
    function showSkeleton(target, type = 'news', count = 6) {
        const container = resolveContainer(target);
        if (!container) {
            console.warn(`[SkeletonSystem] showSkeleton failed: Target container not found.`, target);
            return;
        }
        
        if (!VALID_TYPES.includes(type)) {
            console.warn(`[SkeletonSystem] Unknown skeleton type: "${type}". Falling back to 'news'.`);
            type = 'news';
        }
        
        let skeletonElement;
        switch(type) {
            case 'weather': skeletonElement = createWeatherSkeleton(); break;
            case 'news-grid': skeletonElement = createNewsGridSkeleton(count); break;
            case 'search': skeletonElement = createSearchSkeleton(); break;
            case 'news':
            default: skeletonElement = createNewsSkeleton(); break;
        }

        // Replace existing container content with skeleton state.
        // Layout stability should be handled via skeleton CSS dimensions.
        container.innerHTML = ''; 
        container.appendChild(skeletonElement);
        
        // Ensure proper screen-reader announcements
        container.setAttribute('aria-busy', 'true');
        container.setAttribute('aria-live', 'polite');
    }

    /**
     * Safely removes a specific skeleton element from the DOM
     * @param {HTMLElement} skeletonElement - The skeleton node to remove
     */
    function destroySkeleton(skeletonElement) {
        if (skeletonElement && skeletonElement.parentNode) {
            skeletonElement.parentNode.removeChild(skeletonElement);
        }
    }

    /**
     * Removes the skeleton loading state from a container safely
     * @param {HTMLElement|string} target - The target element or selector
     */
    function hideSkeleton(target) {
        const container = resolveContainer(target);
        if (!container) {
            console.warn(`[SkeletonSystem] hideSkeleton failed: Target container not found.`, target);
            return;
        }
        
        // Target specifically marked skeletons to avoid destroying actual UI components
        const skeletons = container.querySelectorAll('[data-skeleton-wrapper="true"]');
        skeletons.forEach(destroySkeleton);
        
        // Cleanup ARIA states indicating loading completion
        container.removeAttribute('aria-busy');
    }

    /**
     * Utility to clear all skeletons globally from the current document
     */
    function clearAllSkeletons() {
        const allSkeletons = document.querySelectorAll('[data-skeleton-wrapper="true"]');
        allSkeletons.forEach(destroySkeleton);
        
        const busyContainers = document.querySelectorAll('[aria-busy="true"]');
        busyContainers.forEach(container => container.removeAttribute('aria-busy'));
    }

    /**
     * Utility to check if a container currently displays a skeleton
     * @param {HTMLElement|string} target - The target container or selector
     * @returns {boolean} True if a skeleton is currently active inside the target
     */
    function isSkeletonVisible(target) {
        const container = resolveContainer(target);
        if (!container) return false;
        return container.querySelector('[data-skeleton-wrapper="true"]') !== null;
    }

    /**
     * Reusable helper to manage loading state during an async operation
     * @param {HTMLElement|string} target - Target container for the skeleton
     * @param {Function} asyncOperation - A function returning a Promise
     * @param {string} type - Skeleton type ('weather', 'news', 'news-grid', 'search')
     * @param {number} [count=6] - Optional count for grid
     * @returns {Promise<any>} Resolves with the result of the async operation
     */
    async function withLoading(target, asyncOperation, type = 'news', count = 6) {
        if (typeof asyncOperation !== 'function') {
            console.warn('[SkeletonSystem] withLoading requires an async function as the second argument.');
            return;
        }

        showSkeleton(target, type, count);

        try {
            return await asyncOperation();
        } catch (error) {
            console.error('[SkeletonSystem] Error during async operation wrapped in withLoading:', error);
            throw error;
        } finally {
            hideSkeleton(target);
        }
    }

    // Expose public API
    return {
        createWeatherSkeleton,
        createNewsSkeleton,
        createNewsGridSkeleton,
        createSearchSkeleton,
        showSkeleton,
        hideSkeleton,
        destroySkeleton,
        clearAllSkeletons,
        isSkeletonVisible,
        withLoading
    };
})();

// Attach to window object for global usage (e.g., from weather.js or news.js)
if (typeof window !== 'undefined') {
    // Maintain API Compatibility
    window.createWeatherSkeleton = SkeletonSystem.createWeatherSkeleton;
    window.createNewsSkeleton = SkeletonSystem.createNewsSkeleton;
    window.createNewsGridSkeleton = SkeletonSystem.createNewsGridSkeleton;
    window.createSearchSkeleton = SkeletonSystem.createSearchSkeleton;
    window.showSkeleton = SkeletonSystem.showSkeleton;
    window.hideSkeleton = SkeletonSystem.hideSkeleton;
    
    // Export new professional utilities
    window.destroySkeleton = SkeletonSystem.destroySkeleton;
    window.clearAllSkeletons = SkeletonSystem.clearAllSkeletons;
    window.isSkeletonVisible = SkeletonSystem.isSkeletonVisible;
    window.withLoading = SkeletonSystem.withLoading;
}

/**
 * Toast Notification System
 * Reusable, accessible toast notifications for the dashboard.
 */
const ToastSystem = (function() {
    
    let container = null;

    /**
     * Initializes the toast container if it doesn't exist
     */
    function initContainer() {
        if (!container) {
            container = document.createElement('div');
            container.className = 'toast-container';
            container.setAttribute('aria-live', 'polite');
            container.setAttribute('aria-atomic', 'true');
            document.body.appendChild(container);
        }
    }

    /**
     * Get SVG icon based on type
     */
    function getIcon(type) {
        switch(type) {
            case 'success':
                return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`;
            case 'error':
                return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
            case 'warning':
                return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
            case 'info':
            default:
                return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
        }
    }

    /**
     * Shows a toast notification
     * @param {string} message - The message to display
     * @param {string} type - 'success', 'error', 'warning', 'info'
     */
    function showToast(message, type = 'info') {
        initContainer();

        const validTypes = ['success', 'error', 'warning', 'info'];
        const toastType = validTypes.includes(type) ? type : 'info';

        const toast = document.createElement('div');
        toast.className = `toast toast-${toastType}`;
        toast.setAttribute('role', 'alert');

        const iconDiv = document.createElement('div');
        iconDiv.className = 'toast-icon';
        iconDiv.innerHTML = getIcon(toastType);

        const contentDiv = document.createElement('div');
        contentDiv.className = 'toast-content';
        
        const messageP = document.createElement('p');
        messageP.className = 'toast-message';
        messageP.textContent = message;
        
        contentDiv.appendChild(messageP);

        const closeBtn = document.createElement('button');
        closeBtn.className = 'toast-close';
        closeBtn.setAttribute('aria-label', 'Close notification');
        closeBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`;

        toast.appendChild(iconDiv);
        toast.appendChild(contentDiv);
        toast.appendChild(closeBtn);

        container.appendChild(toast);

        // Trigger animation
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                toast.classList.add('show');
            });
        });

        // Setup auto dismiss
        let timeoutId = setTimeout(() => {
            dismissToast(toast);
        }, 4000);

        // Handle close button
        closeBtn.addEventListener('click', () => {
            clearTimeout(timeoutId);
            dismissToast(toast);
        });
    }

    /**
     * Dismisses a toast with animation
     * @param {HTMLElement} toast - The toast element
     */
    function dismissToast(toast) {
        if (toast.classList.contains('hide')) return;
        toast.classList.remove('show');
        toast.classList.add('hide');
        toast.addEventListener('transitionend', () => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        });
    }

    return {
        showToast
    };
})();

// Export to global scope
if (typeof window !== 'undefined') {
    window.showToast = ToastSystem.showToast;
}

/**
 * Error Handling & Fallback UI System
 * Reusable component for empty states, errors, and permissions.
 */
const FallbackSystem = (function() {
    
    const ERROR_CONTENT = {
        'permission_denied': {
            icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon><line x1="2" y1="2" x2="22" y2="22"></line></svg>`,
            title: "Location Permission Denied",
            desc: "We need your location to show local weather.",
            btnText: "Search City",
            variant: 'warning'
        },
        'invalid_city': {
            icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line><line x1="9" y1="9" x2="13" y2="13"></line><line x1="13" y1="9" x2="9" y2="13"></line></svg>`,
            title: "City Not Found",
            desc: "We couldn't find a city matching your search.",
            btnText: "Try Again",
            variant: 'error'
        },
        'weather_error': {
            icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.5 19a5 5 0 1 0-8.6-4.5"></path><path d="M22 22l-4-4"></path><path d="M9.8 11.2A5 5 0 0 0 10 9a7 7 0 1 0 11.8 5"></path></svg>`,
            title: "Weather Data Unavailable",
            desc: "Failed to load current weather details.",
            btnText: "Retry",
            variant: 'error'
        },
        'news_error': {
            icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"></path><line x1="18" y1="14" x2="12" y2="14"></line><line x1="18" y1="10" x2="12" y2="10"></line><line x1="18" y1="6" x2="12" y2="6"></line></svg>`,
            title: "News Unavailable",
            desc: "Failed to load the latest headlines.",
            btnText: "Retry",
            variant: 'error'
        },
        'network_offline': {
            icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path><path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>`,
            title: "You're Offline",
            desc: "Please check your internet connection.",
            btnText: "Retry Connection",
            variant: 'warning'
        },
        'empty_news': {
            icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="9" x2="15" y2="15"></line><line x1="15" y1="9" x2="9" y2="15"></line></svg>`,
            title: "No News Found",
            desc: "We couldn't find any articles for this category.",
            btnText: "Clear Filters",
            variant: 'warning'
        }
    };

    /**
     * Resolves the target container safely
     * @param {HTMLElement|string} target - The DOM element or CSS selector
     * @returns {HTMLElement|null} The resolved DOM element or null
     */
    function resolveContainer(target) {
        if (!target) return null;
        try {
            return typeof target === 'string' ? document.querySelector(target) : target;
        } catch (e) {
            console.warn(`[FallbackSystem] Invalid selector provided: ${target}`, e);
            return null;
        }
    }

    /**
     * Internal function to render a custom fallback UI
     * @param {HTMLElement|string} target - Container element
     * @param {Object} options - Fallback configuration
     */
    function showFallback(target, options = {}) {
        const container = resolveContainer(target);
        if (!container) return;

        const {
            title = 'Error',
            desc = 'Something went wrong.',
            icon = '',
            btnText = 'Retry',
            variant = 'error',
            onRetry = null
        } = options;

        const fallbackEl = document.createElement('div');
        fallbackEl.className = `fallback-container fallback-${variant}`;
        fallbackEl.setAttribute('role', 'alert');
        fallbackEl.setAttribute('aria-live', 'assertive');
        fallbackEl.setAttribute('data-fallback-wrapper', 'true');

        const iconEl = document.createElement('div');
        iconEl.className = 'fallback-icon';
        iconEl.innerHTML = icon;

        const titleEl = document.createElement('h3');
        titleEl.className = 'fallback-title';
        titleEl.textContent = title;

        const descEl = document.createElement('p');
        descEl.className = 'fallback-desc';
        descEl.textContent = desc;

        fallbackEl.appendChild(iconEl);
        fallbackEl.appendChild(titleEl);
        fallbackEl.appendChild(descEl);

        if (onRetry && typeof onRetry === 'function') {
            const btnEl = document.createElement('button');
            btnEl.className = 'fallback-btn';
            btnEl.innerHTML = `${btnText}`;
            btnEl.addEventListener('click', onRetry);
            fallbackEl.appendChild(btnEl);
        }

        container.innerHTML = '';
        container.appendChild(fallbackEl);
    }

    /**
     * Pre-configured error displays
     * @param {HTMLElement|string} target - Container element
     * @param {string} type - Preset error type
     * @param {Function} onRetry - Callback function for the retry button
     */
    function showError(target, type, onRetry) {
        if (!ERROR_CONTENT[type]) {
            console.warn(`[FallbackSystem] Unknown error type: "${type}". Falling back to 'weather_error'.`);
            type = 'weather_error';
        }
        
        const content = ERROR_CONTENT[type];
        showFallback(target, {
            ...content,
            onRetry
        });
    }

    /**
     * Removes the fallback UI safely from a container
     * @param {HTMLElement|string} target - Container element
     */
    function hideError(target) {
        const container = resolveContainer(target);
        if (!container) return;

        const fallbacks = container.querySelectorAll('[data-fallback-wrapper="true"]');
        fallbacks.forEach(el => {
            if (el.parentNode) el.parentNode.removeChild(el);
        });
    }

    return {
        showError,
        hideError,
        showFallback
    };
})();

// Export to global scope
if (typeof window !== 'undefined') {
    window.showError = FallbackSystem.showError;
    window.hideError = FallbackSystem.hideError;
    window.showFallback = FallbackSystem.showFallback;
}

/**
 * Full Page Loading Experience
 * Application startup loader system.
 */
const AppLoaderSystem = (function() {
    let loaderContainer = null;
    let hideTimeout = null;

    function initLoader() {
        if (loaderContainer) return;

        loaderContainer = document.createElement('div');
        loaderContainer.id = 'app-startup-loader';
        loaderContainer.className = 'app-startup-loader';
        loaderContainer.setAttribute('role', 'status');
        loaderContainer.setAttribute('aria-label', 'Loading Application');
        
        const content = document.createElement('div');
        content.className = 'app-startup-content';

        // Dashboard Logo/Title
        const brand = document.createElement('div');
        brand.className = 'app-startup-brand';
        brand.innerHTML = `<span>WeatherWise</span>`;

        // Loading Text
        const text = document.createElement('div');
        text.className = 'app-startup-text';
        text.textContent = 'Initializing Dashboard...';

        // Progress Indicator
        const progressWrapper = document.createElement('div');
        progressWrapper.className = 'app-startup-progress-wrapper';
        const progressBar = document.createElement('div');
        progressBar.className = 'app-startup-progress-bar';
        progressWrapper.appendChild(progressBar);

        content.appendChild(brand);
        content.appendChild(progressWrapper);
        content.appendChild(text);
        
        loaderContainer.appendChild(content);
        document.body.appendChild(loaderContainer);
    }

    function showAppLoader() {
        initLoader();
        if (hideTimeout) {
            clearTimeout(hideTimeout);
            hideTimeout = null;
        }
        // Force reflow
        void loaderContainer.offsetWidth;
        loaderContainer.classList.add('show');
        loaderContainer.classList.remove('hide');
    }

    function hideAppLoader() {
        if (!loaderContainer) return;
        loaderContainer.classList.remove('show');
        loaderContainer.classList.add('hide');
        
        if (hideTimeout) clearTimeout(hideTimeout);
        
        // Remove after transition completes
        hideTimeout = setTimeout(() => {
            if (loaderContainer && loaderContainer.parentNode) {
                loaderContainer.parentNode.removeChild(loaderContainer);
                loaderContainer = null;
            }
            hideTimeout = null;
        }, 600); // Wait for the CSS fade-out transition (0.6s)
    }

    return {
        showAppLoader,
        hideAppLoader
    };
})();

// Export AppLoaderSystem to global scope
if (typeof window !== 'undefined') {
    window.showAppLoader = AppLoaderSystem.showAppLoader;
    window.hideAppLoader = AppLoaderSystem.hideAppLoader;
}

/**
 * Offline Detection & Retry System
 * Manages network state, offline banners, and retry buttons.
 */
const NetworkMonitorSystem = (function() {
    let bannerElement = null;

    function createRetryButton(callback) {
        const btn = document.createElement('button');
        btn.className = 'network-retry-btn';
        btn.setAttribute('aria-label', 'Retry Connection');
        btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"></path></svg> Retry`;
        
        if (typeof callback === 'function') {
            btn.addEventListener('click', async () => {
                if (btn.classList.contains('loading')) return;
                btn.classList.add('loading');
                btn.setAttribute('aria-busy', 'true');
                try {
                    await callback();
                } catch (error) {
                    console.error('[NetworkMonitorSystem] Retry failed', error);
                } finally {
                    btn.classList.remove('loading');
                    btn.removeAttribute('aria-busy');
                }
            });
        }
        return btn;
    }

    function showOfflineBanner() {
        if (!bannerElement) {
            bannerElement = document.createElement('div');
            bannerElement.id = 'feedback-offline-banner';
            bannerElement.className = 'feedback-offline-banner';
            bannerElement.setAttribute('role', 'alert');
            bannerElement.setAttribute('aria-live', 'assertive');

            const contentWrapper = document.createElement('div');
            contentWrapper.style.display = 'flex';
            contentWrapper.style.alignItems = 'center';
            contentWrapper.style.gap = '8px';

            const icon = document.createElement('div');
            icon.className = 'feedback-offline-icon';
            icon.innerHTML = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="1" y1="1" x2="23" y2="23"></line><path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path><path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path><path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path><path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path><path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path><line x1="12" y1="20" x2="12.01" y2="20"></line></svg>`;

            const text = document.createElement('span');
            text.textContent = 'You are offline. Please check your connection.';

            contentWrapper.appendChild(icon);
            contentWrapper.appendChild(text);
            bannerElement.appendChild(contentWrapper);
            document.body.appendChild(bannerElement);
        }

        // Add a small delay so display takes effect before transform class is added
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                bannerElement.classList.add('visible');
            });
        });
    }

    function hideOfflineBanner() {
        if (bannerElement) {
            bannerElement.classList.remove('visible');
        }
    }

    function handleOnline() {
        hideOfflineBanner();
        // Show reconnect notification
        if (typeof window.showToast === 'function') {
            window.showToast('Connection restored', 'success');
        }
    }

    function handleOffline() {
        showOfflineBanner();
    }

    function initNetworkMonitor() {
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        if (!navigator.onLine) {
            handleOffline();
        }
    }

    function destroyNetworkMonitor() {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
        hideOfflineBanner();
    }

    return {
        initNetworkMonitor,
        destroyNetworkMonitor,
        showOfflineBanner,
        hideOfflineBanner,
        createRetryButton
    };
})();

// Export NetworkMonitorSystem to global scope
if (typeof window !== 'undefined') {
    window.initNetworkMonitor = NetworkMonitorSystem.initNetworkMonitor;
    window.destroyNetworkMonitor = NetworkMonitorSystem.destroyNetworkMonitor;
    window.showOfflineBanner = NetworkMonitorSystem.showOfflineBanner;
    window.hideOfflineBanner = NetworkMonitorSystem.hideOfflineBanner;
    window.createRetryButton = NetworkMonitorSystem.createRetryButton;
}

/**
 * Centralized Feedback Controller (Integration Layer)
 * Single source of truth for loading, errors, and notifications.
 */
const FeedbackManager = (function() {
    let state = {
        isLoading: false,
        hasError: false,
        isOffline: false,
        activeToasts: 0,
        activeFallbacks: new Set(),
        activeSkeletons: new Set()
    };
    
    let activeToastMessages = new Set();

    let debugMode = false;

    function log(msg, data = '') {
        if (debugMode) console.log(`[FeedbackManager] ${msg}`, data);
    }
    
    function warn(msg, data = '') {
        console.warn(`[FeedbackManager] ${msg}`, data);
    }

    function handleNetworkChange() {
        state.isOffline = !navigator.onLine;
        log('Network state changed:', state.isOffline ? 'Offline' : 'Online');
    }

    function initFeedbackSystem(options = {}) {
        debugMode = options.debug || false;
        log('Initializing system...');

        if (typeof window.initNetworkMonitor === 'function') {
            window.initNetworkMonitor();
        }
        
        state.isOffline = !navigator.onLine;
        window.addEventListener('online', handleNetworkChange);
        window.addEventListener('offline', handleNetworkChange);
        
        log('System initialized. Initial state:', state);
    }

    function destroyFeedbackSystem() {
        log('Destroying system...');
        window.removeEventListener('online', handleNetworkChange);
        window.removeEventListener('offline', handleNetworkChange);
        
        if (typeof window.destroyNetworkMonitor === 'function') {
            window.destroyNetworkMonitor();
        }
        
        resetFeedbackState();
    }

    function normalizeTarget(target) {
        if (!target) return null;
        if (typeof target === 'string') return target;
        if (target.id) return `#${target.id}`;
        return target;
    }

    /**
     * Shows a loading state. 
     * If type is 'app', shows the full page loader. Otherwise delegates to SkeletonSystem.
     */
    function showLoading(target, type = 'news', count = 6) {
        if (type === 'app' || !target) {
            if (window.showAppLoader) {
                window.showAppLoader();
                state.isLoading = true;
                log('Show full app loader');
            } else {
                warn('AppLoaderSystem not available');
            }
            return;
        }

        const normTarget = normalizeTarget(target);

        // Prevent UI conflict: do not show skeleton if there is an active error fallback on target
        if (state.hasError && state.activeFallbacks.has(normTarget)) {
            log(`Prevented skeleton on ${normTarget} due to active error fallback.`);
            return;
        }

        if (window.showSkeleton) {
            window.showSkeleton(target, type, count);
            state.activeSkeletons.add(normTarget);
            state.isLoading = true;
            log(`Show skeleton on ${normTarget} (${type})`);
        }
    }

    /**
     * Hides a loading state.
     */
    function hideLoading(target, type = 'news') {
        if (type === 'app' || !target) {
            if (window.hideAppLoader) {
                window.hideAppLoader();
                if (state.activeSkeletons.size === 0) state.isLoading = false;
                log('Hide full app loader');
            }
            return;
        }

        const normTarget = normalizeTarget(target);

        if (window.hideSkeleton) {
            window.hideSkeleton(target);
            state.activeSkeletons.delete(normTarget);
            if (state.activeSkeletons.size === 0) state.isLoading = false;
            log(`Hide skeleton on ${normTarget}`);
        }
    }

    function showError(target, config) {
        if (!target) {
            warn('showError requires a target container.');
            return;
        }

        const normTarget = normalizeTarget(target);

        // Prevent UI conflict: remove skeleton if present
        if (state.activeSkeletons.has(normTarget)) {
            hideLoading(target);
        }

        if (window.showFallback) {
            window.showFallback(target, config);
            state.activeFallbacks.add(normTarget);
            state.hasError = true;
            log(`Show error fallback on ${normTarget}`);
        } else {
            warn('FallbackSystem not available');
        }
    }

    function hideError(target) {
        if (!target) return;
        
        const normTarget = normalizeTarget(target);
        
        if (window.hideError) {
            window.hideError(target);
            state.activeFallbacks.delete(normTarget);
            if (state.activeFallbacks.size === 0) state.hasError = false;
            log(`Hide error fallback on ${normTarget}`);
        }
    }

    function showFallback(target, config) {
        showError(target, config);
    }

    function hideFallback(target) {
        hideError(target);
    }

    function showToast(config) {
        if (window.showToast) {
            let message = '';
            let type = 'info';
            
            if (typeof config === 'string') {
                message = config;
                type = arguments[1] || 'info';
            } else if (config && config.message) {
                message = config.message;
                type = config.type || 'info';
            }

            if (!message) {
                warn('showToast requires a message.');
                return;
            }
            
            const toastKey = `${type}:${message}`;
            if (activeToastMessages.has(toastKey)) {
                log(`Prevented duplicate toast: ${message}`);
                return;
            }

            window.showToast(message, type);
            state.activeToasts++;
            activeToastMessages.add(toastKey);
            log(`Show toast: ${message} (${type})`);
            
            setTimeout(() => {
                state.activeToasts = Math.max(0, state.activeToasts - 1);
                activeToastMessages.delete(toastKey);
            }, 4500);
        } else {
            warn('ToastSystem not available');
        }
    }

    function getFeedbackState() {
        return {
            isLoading: state.isLoading,
            hasError: state.hasError,
            isOffline: state.isOffline,
            activeToasts: state.activeToasts,
            activeFallbacksCount: state.activeFallbacks.size,
            activeSkeletonsCount: state.activeSkeletons.size
        };
    }

    function resetFeedbackState() {
        log('Resetting all feedback states');
        
        if (window.clearAllSkeletons) window.clearAllSkeletons();
        
        state.activeFallbacks.forEach(target => {
            if (window.hideError) window.hideError(target);
        });
        
        if (window.hideAppLoader) window.hideAppLoader();

        state.activeFallbacks.clear();
        state.activeSkeletons.clear();
        activeToastMessages.clear();
        state.isLoading = false;
        state.hasError = false;
        state.activeToasts = 0;
    }

    return {
        initFeedbackSystem,
        destroyFeedbackSystem,
        showLoading,
        hideLoading,
        showError,
        hideError,
        showToast,
        showFallback,
        hideFallback,
        getFeedbackState,
        resetFeedbackState
    };
})();

// Export FeedbackManager to global scope
if (typeof window !== 'undefined') {
    window.FeedbackManager = FeedbackManager;
    window.initFeedbackSystem = FeedbackManager.initFeedbackSystem;
    window.destroyFeedbackSystem = FeedbackManager.destroyFeedbackSystem;
}
