/**
 * @file location.js
 * @description Handles location detection via WeatherAPI.com or mock fallback.
 */

function getApiKey() {
  return window.WEATHER_API_KEY || '';
}

const MOCK_LOCATIONS = {
  'new york': { lat: 40.7128, lon: -74.0060, city: 'New York', countryCode: 'us' },
  'london': { lat: 51.5074, lon: -0.1278, city: 'London', countryCode: 'gb' },
  'tokyo': { lat: 35.6762, lon: 139.6503, city: 'Tokyo', countryCode: 'jp' },
  'mumbai': { lat: 19.0760, lon: 72.8777, city: 'Mumbai', countryCode: 'in' },
  'sydney': { lat: -33.8688, lon: 151.2093, city: 'Sydney', countryCode: 'au' },
};

function getMockLocation(cityName) {
  const key = cityName?.trim().toLowerCase();
  if (key && MOCK_LOCATIONS[key]) return { ...MOCK_LOCATIONS[key] };
  return { lat: 40.7128, lon: -74.0060, city: 'New York', countryCode: 'us' };
}

export async function getAutomaticLocation() {
  // console.log('Location Service: Requesting browser geolocation...');

  if (!navigator.geolocation) {
    console.warn('Location Service: Geolocation not supported. Using mock location.');
    return getMockLocation('New York');
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        // console.log(`Location Service: Found coordinates (${latitude}, ${longitude})`);

        const key = getApiKey();
        if (!key) {
          console.warn('Location Service: No API key set. Using mock location.');
          resolve(getMockLocation('New York'));
          return;
        }

        try {
          const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${key}&q=${latitude},${longitude}`;
          const response = await fetch(apiUrl);
          if (!response.ok) throw new Error('Failed to fetch location metadata from WeatherAPI.');

          const data = await response.json();
          const city = data.location.name;
          const country = data.location.country.toLowerCase();

          resolve({
            lat: latitude,
            lon: longitude,
            city,
            countryCode: country === 'united states of america' || country === 'usa' ? 'us' : country.substring(0, 2),
          });
        } catch (error) {
          console.error('Failed parsing WeatherAPI data:', error);
          resolve({ lat: latitude, lon: longitude, city: 'Local Area', countryCode: 'us' });
        }
      },
      () => {
        console.warn('Location Service: User denied or timed out geolocation. Using mock location.');
        resolve(getMockLocation('New York'));
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    );
  });
}

export async function getManualLocation(cityName) {
  if (!cityName || cityName.trim() === '') {
    throw new Error('Please enter a valid city name.');
  }

  // console.log(`Location Service: Searching for city: "${cityName}"`);

  const key = getApiKey();
  if (!key) {
    console.warn('Location Service: No API key set. Using mock location lookup.');
    const mock = getMockLocation(cityName);
    if (mock.city !== 'New York' || cityName.trim().toLowerCase() === 'new york') {
      return mock;
    }
    throw new Error('City not found. Try: New York, London, Tokyo, Mumbai, Sydney');
  }

  const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${key}&q=${encodeURIComponent(cityName)}`;
  const response = await fetch(apiUrl);

  if (!response.ok) {
    throw new Error('City not found');
  }

  const data = await response.json();
  const { lat, lon, name, country } = data.location;
  const resolvedCountry = country.toLowerCase();

  return {
    lat,
    lon,
    city: name,
    countryCode: resolvedCountry === 'united states of america' || resolvedCountry === 'usa' ? 'us' : resolvedCountry.substring(0, 2),
  };
}
