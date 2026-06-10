import { fetchWeather } from './weather.js';
import { fetchNews } from './news.js';
import { renderWeather, renderNews, showError } from './ui.js';
import { getAutomaticLocation, getManualLocation } from './location.js';


const FALLBACK_LOCATION = { lat: 40.7128, lon: -74.0060, city: 'New York', countryCode: 'us' };


async function updateDashboard(locationData) {
    console.log("App Orchestration: Dispatching updates for:", locationData);

    // Fetch and render weather profile
    try {
        const weatherData = await fetchWeather(locationData);
        renderWeather(weatherData);
    } catch (error) {
        showError('weather-output', `Weather Error: ${error.message}`);
    }

    // Fetch and render regional/filtered news feed
    try {
        const newsData = await fetchNews(locationData);
        renderNews(newsData);
    } catch (error) {
        showError('news-output', `News Error: ${error.message}`);
    }
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