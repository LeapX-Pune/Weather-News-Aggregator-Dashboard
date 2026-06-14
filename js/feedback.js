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
