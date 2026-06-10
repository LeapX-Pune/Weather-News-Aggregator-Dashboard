/**
 * @file weather.js
 * @description Fetches live real-time weather conditions from WeatherAPI.com
 */

/**
 * Fetches current weather information using coordinates or city name from the location data object.
 * @param {Object} locationData - Contains { lat, lon, city, countryCode }
 * @returns {Promise<Object>} Cleaned weather data structure for the UI module
 */
export async function fetchWeather(locationData) {
  // 1. Fallback security check in case location object is missing details
  const queryParam = locationData.city ? locationData.city : `${locationData.lat},${locationData.lon}`;

  // 2. Build the live WeatherAPI.com URL using your global window key
  const url = `https://api.weatherapi.com/v1/current.json?key=${window.WEATHER_API_KEY}&q=${encodeURIComponent(queryParam)}`;

  console.log(`Weather Service: Fetching live data for query: "${queryParam}"`);

  // 3. Make the actual network call to the API
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Weather API Error: ${response.status} - Unable to fetch current weather.`);
  }

  const data = await response.json();

  // 4. Map the API response fields to match what your js/ui.js module expects to print
  return {
    location: data.location.name,
    temperature: Math.round(data.current.temp_c), // Standardizes to Celsius integer
    description: data.current.condition.text,    // e.g., "Sunny", "Partly cloudy"
    humidity: data.current.humidity
  };
}