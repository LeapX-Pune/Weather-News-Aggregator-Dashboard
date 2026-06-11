/** Weather data layer — mock API with cache, geocoding simulation */

import { getCache, setCache, TTL } from './cache.js';
import { withRetry } from './network.js';

// Comprehensive city database including Indian cities and major global cities
const VALID_CITIES = {
  // India — Major Cities
  mumbai: { city: 'Mumbai', region: 'Maharashtra', country: 'India', lat: 19.0760, lon: 72.8777 },
  pune: { city: 'Pune', region: 'Maharashtra', country: 'India', lat: 18.5204, lon: 73.8567 },
  delhi: { city: 'Delhi', region: 'Delhi', country: 'India', lat: 28.6139, lon: 77.2090 },
  'new delhi': { city: 'New Delhi', region: 'Delhi', country: 'India', lat: 28.6139, lon: 77.2090 },
  bengaluru: { city: 'Bengaluru', region: 'Karnataka', country: 'India', lat: 12.9716, lon: 77.5946 },
  bangalore: { city: 'Bengaluru', region: 'Karnataka', country: 'India', lat: 12.9716, lon: 77.5946 },
  hyderabad: { city: 'Hyderabad', region: 'Telangana', country: 'India', lat: 17.3850, lon: 78.4867 },
  chennai: { city: 'Chennai', region: 'Tamil Nadu', country: 'India', lat: 13.0827, lon: 80.2707 },
  kolkata: { city: 'Kolkata', region: 'West Bengal', country: 'India', lat: 22.5726, lon: 88.3639 },
  calcutta: { city: 'Kolkata', region: 'West Bengal', country: 'India', lat: 22.5726, lon: 88.3639 },
  ahmedabad: { city: 'Ahmedabad', region: 'Gujarat', country: 'India', lat: 23.0225, lon: 72.5714 },
  nagpur: { city: 'Nagpur', region: 'Maharashtra', country: 'India', lat: 21.1458, lon: 79.0882 },
  nashik: { city: 'Nashik', region: 'Maharashtra', country: 'India', lat: 19.9975, lon: 73.7898 },
  thane: { city: 'Thane', region: 'Maharashtra', country: 'India', lat: 19.2183, lon: 72.9781 },
  jaipur: { city: 'Jaipur', region: 'Rajasthan', country: 'India', lat: 26.9124, lon: 75.7873 },
  lucknow: { city: 'Lucknow', region: 'Uttar Pradesh', country: 'India', lat: 26.8467, lon: 80.9462 },
  surat: { city: 'Surat', region: 'Gujarat', country: 'India', lat: 21.1702, lon: 72.8311 },
  kanpur: { city: 'Kanpur', region: 'Uttar Pradesh', country: 'India', lat: 26.4499, lon: 80.3319 },
  patna: { city: 'Patna', region: 'Bihar', country: 'India', lat: 25.5941, lon: 85.1376 },
  bhopal: { city: 'Bhopal', region: 'Madhya Pradesh', country: 'India', lat: 23.2599, lon: 77.4126 },
  indore: { city: 'Indore', region: 'Madhya Pradesh', country: 'India', lat: 22.7196, lon: 75.8577 },
  kochi: { city: 'Kochi', region: 'Kerala', country: 'India', lat: 9.9312, lon: 76.2673 },
  chandigarh: { city: 'Chandigarh', region: 'Punjab', country: 'India', lat: 30.7333, lon: 76.7794 },
  coimbatore: { city: 'Coimbatore', region: 'Tamil Nadu', country: 'India', lat: 11.0168, lon: 76.9558 },
  vadodara: { city: 'Vadodara', region: 'Gujarat', country: 'India', lat: 22.3072, lon: 73.1812 },
  agra: { city: 'Agra', region: 'Uttar Pradesh', country: 'India', lat: 27.1767, lon: 78.0081 },
  varanasi: { city: 'Varanasi', region: 'Uttar Pradesh', country: 'India', lat: 25.3176, lon: 82.9739 },
  goa: { city: 'Goa', region: 'Goa', country: 'India', lat: 15.2993, lon: 74.1240 },
  amritsar: { city: 'Amritsar', region: 'Punjab', country: 'India', lat: 31.6340, lon: 74.8723 },
  visakhapatnam: { city: 'Visakhapatnam', region: 'Andhra Pradesh', country: 'India', lat: 17.6868, lon: 83.2185 },
  vizag: { city: 'Visakhapatnam', region: 'Andhra Pradesh', country: 'India', lat: 17.6868, lon: 83.2185 },

  // USA
  brooklyn: { city: 'Brooklyn', region: 'New York', country: 'USA', lat: 40.6782, lon: -73.9442 },
  'new york': { city: 'New York', region: 'New York', country: 'USA', lat: 40.7128, lon: -74.006 },
  nyc: { city: 'New York', region: 'New York', country: 'USA', lat: 40.7128, lon: -74.006 },
  'los angeles': { city: 'Los Angeles', region: 'California', country: 'USA', lat: 34.0522, lon: -118.2437 },
  la: { city: 'Los Angeles', region: 'California', country: 'USA', lat: 34.0522, lon: -118.2437 },
  chicago: { city: 'Chicago', region: 'Illinois', country: 'USA', lat: 41.8781, lon: -87.6298 },
  houston: { city: 'Houston', region: 'Texas', country: 'USA', lat: 29.7604, lon: -95.3698 },
  phoenix: { city: 'Phoenix', region: 'Arizona', country: 'USA', lat: 33.4484, lon: -112.0740 },
  philadelphia: { city: 'Philadelphia', region: 'Pennsylvania', country: 'USA', lat: 39.9526, lon: -75.1652 },
  'san antonio': { city: 'San Antonio', region: 'Texas', country: 'USA', lat: 29.4241, lon: -98.4936 },
  'san diego': { city: 'San Diego', region: 'California', country: 'USA', lat: 32.7157, lon: -117.1611 },
  dallas: { city: 'Dallas', region: 'Texas', country: 'USA', lat: 32.7767, lon: -96.7970 },
  'san francisco': { city: 'San Francisco', region: 'California', country: 'USA', lat: 37.7749, lon: -122.4194 },
  sf: { city: 'San Francisco', region: 'California', country: 'USA', lat: 37.7749, lon: -122.4194 },
  seattle: { city: 'Seattle', region: 'Washington', country: 'USA', lat: 47.6062, lon: -122.3321 },
  miami: { city: 'Miami', region: 'Florida', country: 'USA', lat: 25.7617, lon: -80.1918 },
  boston: { city: 'Boston', region: 'Massachusetts', country: 'USA', lat: 42.3601, lon: -71.0589 },
  denver: { city: 'Denver', region: 'Colorado', country: 'USA', lat: 39.7392, lon: -104.9903 },
  atlanta: { city: 'Atlanta', region: 'Georgia', country: 'USA', lat: 33.7490, lon: -84.3880 },
  'las vegas': { city: 'Las Vegas', region: 'Nevada', country: 'USA', lat: 36.1699, lon: -115.1398 },
  portland: { city: 'Portland', region: 'Oregon', country: 'USA', lat: 45.5051, lon: -122.6750 },
  nashville: { city: 'Nashville', region: 'Tennessee', country: 'USA', lat: 36.1627, lon: -86.7816 },

  // Europe
  london: { city: 'London', region: 'England', country: 'UK', lat: 51.5074, lon: -0.1278 },
  paris: { city: 'Paris', region: 'Île-de-France', country: 'France', lat: 48.8566, lon: 2.3522 },
  berlin: { city: 'Berlin', region: 'Berlin', country: 'Germany', lat: 52.52, lon: 13.405 },
  madrid: { city: 'Madrid', region: 'Community of Madrid', country: 'Spain', lat: 40.4168, lon: -3.7038 },
  rome: { city: 'Rome', region: 'Lazio', country: 'Italy', lat: 41.9028, lon: 12.4964 },
  amsterdam: { city: 'Amsterdam', region: 'North Holland', country: 'Netherlands', lat: 52.3676, lon: 4.9041 },
  barcelona: { city: 'Barcelona', region: 'Catalonia', country: 'Spain', lat: 41.3851, lon: 2.1734 },
  vienna: { city: 'Vienna', region: 'Vienna', country: 'Austria', lat: 48.2082, lon: 16.3738 },
  munich: { city: 'Munich', region: 'Bavaria', country: 'Germany', lat: 48.1351, lon: 11.5820 },
  zurich: { city: 'Zürich', region: 'Zurich', country: 'Switzerland', lat: 47.3769, lon: 8.5417 },
  brussels: { city: 'Brussels', region: 'Brussels', country: 'Belgium', lat: 50.8503, lon: 4.3517 },
  stockholm: { city: 'Stockholm', region: 'Stockholm County', country: 'Sweden', lat: 59.3293, lon: 18.0686 },
  oslo: { city: 'Oslo', region: 'Oslo', country: 'Norway', lat: 59.9139, lon: 10.7522 },
  copenhagen: { city: 'Copenhagen', region: 'Capital Region', country: 'Denmark', lat: 55.6761, lon: 12.5683 },
  helsinki: { city: 'Helsinki', region: 'Uusimaa', country: 'Finland', lat: 60.1699, lon: 24.9384 },
  lisbon: { city: 'Lisbon', region: 'Lisbon', country: 'Portugal', lat: 38.7169, lon: -9.1395 },
  athens: { city: 'Athens', region: 'Attica', country: 'Greece', lat: 37.9838, lon: 23.7275 },
  warsaw: { city: 'Warsaw', region: 'Masovian', country: 'Poland', lat: 52.2297, lon: 21.0122 },
  prague: { city: 'Prague', region: 'Prague', country: 'Czech Republic', lat: 50.0755, lon: 14.4378 },
  budapest: { city: 'Budapest', region: 'Budapest', country: 'Hungary', lat: 47.4979, lon: 19.0402 },

  // Asia-Pacific
  tokyo: { city: 'Tokyo', region: 'Kanto', country: 'Japan', lat: 35.6762, lon: 139.6503 },
  osaka: { city: 'Osaka', region: 'Kansai', country: 'Japan', lat: 34.6937, lon: 135.5023 },
  beijing: { city: 'Beijing', region: 'Beijing', country: 'China', lat: 39.9042, lon: 116.4074 },
  shanghai: { city: 'Shanghai', region: 'Shanghai', country: 'China', lat: 31.2304, lon: 121.4737 },
  'hong kong': { city: 'Hong Kong', region: 'Hong Kong', country: 'China', lat: 22.3193, lon: 114.1694 },
  singapore: { city: 'Singapore', region: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198 },
  seoul: { city: 'Seoul', region: 'Seoul', country: 'South Korea', lat: 37.5665, lon: 126.9780 },
  bangkok: { city: 'Bangkok', region: 'Bangkok', country: 'Thailand', lat: 13.7563, lon: 100.5018 },
  sydney: { city: 'Sydney', region: 'NSW', country: 'Australia', lat: -33.8688, lon: 151.2093 },
  melbourne: { city: 'Melbourne', region: 'Victoria', country: 'Australia', lat: -37.8136, lon: 144.9631 },
  kuala: { city: 'Kuala Lumpur', region: 'Federal Territory', country: 'Malaysia', lat: 3.1390, lon: 101.6869 },
  'kuala lumpur': { city: 'Kuala Lumpur', region: 'Federal Territory', country: 'Malaysia', lat: 3.1390, lon: 101.6869 },
  jakarta: { city: 'Jakarta', region: 'DKI Jakarta', country: 'Indonesia', lat: -6.2088, lon: 106.8456 },
  manila: { city: 'Manila', region: 'Metro Manila', country: 'Philippines', lat: 14.5995, lon: 120.9842 },
  taipei: { city: 'Taipei', region: 'Taipei', country: 'Taiwan', lat: 25.0330, lon: 121.5654 },
  karachi: { city: 'Karachi', region: 'Sindh', country: 'Pakistan', lat: 24.8607, lon: 67.0011 },
  lahore: { city: 'Lahore', region: 'Punjab', country: 'Pakistan', lat: 31.5204, lon: 74.3587 },
  dhaka: { city: 'Dhaka', region: 'Dhaka', country: 'Bangladesh', lat: 23.8103, lon: 90.4125 },
  colombo: { city: 'Colombo', region: 'Western Province', country: 'Sri Lanka', lat: 6.9271, lon: 79.8612 },
  kathmandu: { city: 'Kathmandu', region: 'Bagmati', country: 'Nepal', lat: 27.7172, lon: 85.3240 },

  // Middle East & Africa
  dubai: { city: 'Dubai', region: 'Dubai', country: 'UAE', lat: 25.2048, lon: 55.2708 },
  'abu dhabi': { city: 'Abu Dhabi', region: 'Abu Dhabi', country: 'UAE', lat: 24.4539, lon: 54.3773 },
  riyadh: { city: 'Riyadh', region: 'Riyadh', country: 'Saudi Arabia', lat: 24.6877, lon: 46.7219 },
  doha: { city: 'Doha', region: 'Ad Dawhah', country: 'Qatar', lat: 25.2854, lon: 51.5310 },
  istanbul: { city: 'Istanbul', region: 'Istanbul', country: 'Turkey', lat: 41.0082, lon: 28.9784 },
  cairo: { city: 'Cairo', region: 'Cairo Governorate', country: 'Egypt', lat: 30.0444, lon: 31.2357 },
  nairobi: { city: 'Nairobi', region: 'Nairobi County', country: 'Kenya', lat: -1.2921, lon: 36.8219 },
  lagos: { city: 'Lagos', region: 'Lagos State', country: 'Nigeria', lat: 6.5244, lon: 3.3792 },
  johannesburg: { city: 'Johannesburg', region: 'Gauteng', country: 'South Africa', lat: -26.2041, lon: 28.0473 },
  capetown: { city: 'Cape Town', region: 'Western Cape', country: 'South Africa', lat: -33.9249, lon: 18.4241 },
  'cape town': { city: 'Cape Town', region: 'Western Cape', country: 'South Africa', lat: -33.9249, lon: 18.4241 },
  'tel aviv': { city: 'Tel Aviv', region: 'Tel Aviv District', country: 'Israel', lat: 32.0853, lon: 34.7818 },
  tehran: { city: 'Tehran', region: 'Tehran Province', country: 'Iran', lat: 35.6892, lon: 51.3890 },

  // Americas
  toronto: { city: 'Toronto', region: 'Ontario', country: 'Canada', lat: 43.6532, lon: -79.3832 },
  vancouver: { city: 'Vancouver', region: 'British Columbia', country: 'Canada', lat: 49.2827, lon: -123.1207 },
  montreal: { city: 'Montreal', region: 'Quebec', country: 'Canada', lat: 45.5017, lon: -73.5673 },
  'sao paulo': { city: 'São Paulo', region: 'São Paulo State', country: 'Brazil', lat: -23.5505, lon: -46.6333 },
  'rio de janeiro': { city: 'Rio de Janeiro', region: 'Rio de Janeiro', country: 'Brazil', lat: -22.9068, lon: -43.1729 },
  'buenos aires': { city: 'Buenos Aires', region: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lon: -58.3816 },
  lima: { city: 'Lima', region: 'Lima Region', country: 'Peru', lat: -12.0464, lon: -77.0428 },
  bogota: { city: 'Bogotá', region: 'Cundinamarca', country: 'Colombia', lat: 4.7110, lon: -74.0721 },
  'mexico city': { city: 'Mexico City', region: 'CDMX', country: 'Mexico', lat: 19.4326, lon: -99.1332 },
};

const CONDITIONS = [
  { condition: 'Sunny', description: 'clear skies', icon: 'sunny', color: '#fbbf24' },
  { condition: 'Cloudy', description: 'overcast clouds', icon: 'cloudy', color: '#94a3b8' },
  { condition: 'Rainy', description: 'light rain', icon: 'rainy', color: '#38bdf8' },
  { condition: 'Thunderstorm', description: 'thunderstorms', icon: 'thunderstorm', color: '#a78bfa' },
  { condition: 'Partly Cloudy', description: 'scattered clouds', icon: 'partly-cloudy', color: '#fbbf24' },
];

function hashLocation(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) hash = ((hash << 5) - hash) + str.charCodeAt(i);
  return Math.abs(hash);
}

function generateWeatherData(locationKey, coords) {
  const seed = hashLocation(locationKey);
  const cond = CONDITIONS[seed % CONDITIONS.length];
  const baseTemp = 15 + (seed % 20);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const today = new Date().getDay();

  const forecast = days.map((name, i) => {
    const offset = (i - today + 7) % 7;
    const dayIndex = (today + offset) % 7;
    const temp = baseTemp + ((seed + i * 3) % 8) - 3;
    return {
      day: days[dayIndex],
      temp,
      active: offset === 3,
      offsetY: [40, 30, 25, 0, 20, 35, 30][offset] || 20,
    };
  });

  const windSpeed = 8 + (seed % 30);
  const windDesc = windSpeed > 25 ? 'Dangerous winds' : windSpeed > 15 ? 'Moderate winds' : 'Light breeze';

  return {
    location: {
      city: coords.city,
      region: coords.region,
      country: coords.country,
      display: `${coords.city}, ${coords.region}, ${coords.country}`,
    },
    current: {
      temp: baseTemp + 5,
      tempHigh: baseTemp + 10,
      tempLow: baseTemp - 5,
      condition: cond.condition,
      description: cond.description,
      humidity: 40 + (seed % 50),
      uv: 1 + (seed % 10),
      feelsLike: baseTemp - 2,
      windSpeed,
      windDesc,
      icon: cond.icon,
      color: cond.color,
    },
    forecast,
    updatedAt: new Date().toISOString(),
  };
}

export function validateCity(query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized || normalized.length < 2) return null;

  // Exact match
  if (VALID_CITIES[normalized]) return VALID_CITIES[normalized];

  // Fuzzy: query starts with city key or city key starts with query
  const match = Object.entries(VALID_CITIES).find(([key]) =>
    key.startsWith(normalized) || normalized.startsWith(key) ||
    key.includes(normalized) || normalized.includes(key)
  );
  return match ? match[1] : null;
}

export function getCitySuggestions(query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return Object.values(VALID_CITIES)
    .slice(0, 8)
    .map((c) => `${c.city}, ${c.region}`);

  const seen = new Set();
  const results = [];

  for (const [key, c] of Object.entries(VALID_CITIES)) {
    const label = `${c.city}, ${c.region}`;
    if (seen.has(label)) continue;

    const matches = key.startsWith(normalized) ||
      c.city.toLowerCase().startsWith(normalized) ||
      key.includes(normalized) ||
      c.city.toLowerCase().includes(normalized) ||
      c.region.toLowerCase().includes(normalized) ||
      c.country.toLowerCase().includes(normalized);

    if (matches) {
      seen.add(label);
      results.push(label);
    }

    if (results.length >= 8) break;
  }

  return results;
}

let activeController = null;

export async function fetchWeather(location, { force = false } = {}) {
  const coords = typeof location === 'string'
    ? validateCity(location)
    : location;

  if (!coords) {
    throw new Error('Location not found. Please try another search.');
  }

  const cacheKey = `weather_${coords.city.toLowerCase()}`;
  if (!force) {
    const cached = getCache(cacheKey);
    if (cached) return cached;
  }

  if (activeController) activeController.abort();
  activeController = new AbortController();
  const signal = activeController.signal;

  const data = await withRetry(async () => {
    // Use a clean abort-aware promise
    await new Promise((resolve, reject) => {
      if (signal.aborted) return reject(new DOMException('Aborted', 'AbortError'));
      const timer = setTimeout(resolve, 500 + Math.random() * 400);
      // Use { once: true } to prevent listener accumulation
      signal.addEventListener('abort', () => {
        clearTimeout(timer);
        reject(new DOMException('Aborted', 'AbortError'));
      }, { once: true });
    });

    if (signal.aborted) throw new DOMException('Aborted', 'AbortError');

    const result = generateWeatherData(coords.city.toLowerCase(), coords);
    setCache(cacheKey, result, TTL.WEATHER);
    return result;
  });

  return data;
}

export async function fetchWeatherByCoords(lat, lon) {
  const coords = {
    city: 'Current Location',
    region: `${lat.toFixed(2)}°, ${lon.toFixed(2)}°`,
    country: 'GPS',
    lat,
    lon,
  };
  const cacheKey = `weather_gps_${lat.toFixed(1)}_${lon.toFixed(1)}`;
  const cached = getCache(cacheKey);
  if (cached) return cached;

  await new Promise((r) => setTimeout(r, 600));
  const result = generateWeatherData(`gps_${lat}_${lon}`, coords);
  setCache(cacheKey, result, TTL.WEATHER);
  return result;
}

export function cancelWeatherFetch() {
  if (activeController) {
    activeController.abort();
    activeController = null;
  }
}
