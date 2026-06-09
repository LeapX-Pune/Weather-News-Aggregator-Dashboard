import { fetchWeather } from './weather.js';
import { fetchNews } from './news.js';
import { renderWeather, renderNews, showError } from './ui.js';

const WEATHER_LOCATION = 'New York';

async function init() {
  try {
    const weatherData = await fetchWeather(WEATHER_LOCATION);
    renderWeather(weatherData);
  } catch (error) {
    showError('weather-output', error.message);
  }

  try {
    const newsData = await fetchNews();
    renderNews(newsData);
  } catch (error) {
    showError('news-output', error.message);
  }
}

init();
