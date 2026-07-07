/**
 * @file location.js
 * @description Handles location detection via WeatherAPI.com or mock fallback.
 */

function getApiKey() {
  return window.WEATHER_API_KEY || '';
}

const COUNTRY_NAME_MAP = {
  'united states of america': 'us', 'usa': 'us', 'united states': 'us',
  'united kingdom': 'gb', 'uk': 'gb', 'great britain': 'gb', 'england': 'gb',
  'uae': 'ae', 'united arab emirates': 'ae',
  'south korea': 'kr', 'korea, republic of': 'kr',
  'russia': 'ru', 'russian federation': 'ru',
  'germany': 'de',
  'switzerland': 'ch',
  'netherlands': 'nl',
  'austria': 'at',
  'sweden': 'se',
  'norway': 'no',
  'denmark': 'dk',
  'portugal': 'pt',
  'finland': 'fi',
  'belgium': 'be',
  'czech republic': 'cz',
  'poland': 'pl',
  'hungary': 'hu',
  'romania': 'ro',
  'ukraine': 'ua',
  'greece': 'gr',
  'ireland': 'ie',
  'new zealand': 'nz',
  'saudi arabia': 'sa',
  'south africa': 'za',
};

function resolveCountryCode(countryName) {
  const lower = countryName.trim().toLowerCase();
  return COUNTRY_NAME_MAP[lower] || lower.substring(0, 2);
}

const MOCK_LOCATIONS = {
  // --- Major Indian cities ---
  'mumbai': { lat: 19.0760, lon: 72.8777, city: 'Mumbai', countryCode: 'in' },
  'pune': { lat: 18.5204, lon: 73.8567, city: 'Pune', countryCode: 'in' },
  'delhi': { lat: 28.6139, lon: 77.2090, city: 'Delhi', countryCode: 'in' },
  'new delhi': { lat: 28.6139, lon: 77.2090, city: 'New Delhi', countryCode: 'in' },
  'bengaluru': { lat: 12.9716, lon: 77.5946, city: 'Bengaluru', countryCode: 'in' },
  'hyderabad': { lat: 17.3850, lon: 78.4867, city: 'Hyderabad', countryCode: 'in' },
  'chennai': { lat: 13.0827, lon: 80.2707, city: 'Chennai', countryCode: 'in' },
  'kolkata': { lat: 22.5726, lon: 88.3639, city: 'Kolkata', countryCode: 'in' },
  'ahmedabad': { lat: 23.0225, lon: 72.5714, city: 'Ahmedabad', countryCode: 'in' },
  'jaipur': { lat: 26.9124, lon: 75.7873, city: 'Jaipur', countryCode: 'in' },
  'lucknow': { lat: 26.8467, lon: 80.9462, city: 'Lucknow', countryCode: 'in' },
  'surat': { lat: 21.1702, lon: 72.8311, city: 'Surat', countryCode: 'in' },
  'bhopal': { lat: 23.2599, lon: 77.4126, city: 'Bhopal', countryCode: 'in' },
  'indore': { lat: 22.7196, lon: 75.8577, city: 'Indore', countryCode: 'in' },
  'kochi': { lat: 9.9312, lon: 76.2673, city: 'Kochi', countryCode: 'in' },
  'chandigarh': { lat: 30.7333, lon: 76.7794, city: 'Chandigarh', countryCode: 'in' },
  'goa': { lat: 15.2993, lon: 74.1240, city: 'Goa', countryCode: 'in' },
  'amritsar': { lat: 31.6340, lon: 74.8723, city: 'Amritsar', countryCode: 'in' },
  'varanasi': { lat: 25.3176, lon: 82.9739, city: 'Varanasi', countryCode: 'in' },
  'agra': { lat: 27.1767, lon: 78.0081, city: 'Agra', countryCode: 'in' },

  // --- Mumbai suburbs & localities ---
  'thane': { lat: 19.2183, lon: 72.9781, city: 'Thane', countryCode: 'in' },
  'navimumbai': { lat: 19.0330, lon: 73.0297, city: 'Navi Mumbai', countryCode: 'in' },
  'navi mumbai': { lat: 19.0330, lon: 73.0297, city: 'Navi Mumbai', countryCode: 'in' },
  'kalyan': { lat: 19.2403, lon: 73.1305, city: 'Kalyan', countryCode: 'in' },
  'dombivali': { lat: 19.2167, lon: 73.0833, city: 'Dombivali', countryCode: 'in' },
  'ulhasnagar': { lat: 19.2167, lon: 73.1500, city: 'Ulhasnagar', countryCode: 'in' },
  'panvel': { lat: 18.9894, lon: 73.1170, city: 'Panvel', countryCode: 'in' },
  'andheri': { lat: 19.1192, lon: 72.8470, city: 'Andheri', countryCode: 'in' },
  'bandra': { lat: 19.0544, lon: 72.8406, city: 'Bandra', countryCode: 'in' },
  'borivali': { lat: 19.2310, lon: 72.8550, city: 'Borivali', countryCode: 'in' },
  'vile parle': { lat: 19.0999, lon: 72.8431, city: 'Vile Parle', countryCode: 'in' },
  'worli': { lat: 19.0023, lon: 72.8155, city: 'Worli', countryCode: 'in' },
  'colaba': { lat: 18.9076, lon: 72.8123, city: 'Colaba', countryCode: 'in' },
  'dadar': { lat: 19.0200, lon: 72.8420, city: 'Dadar', countryCode: 'in' },
  'powai': { lat: 19.1170, lon: 72.9050, city: 'Powai', countryCode: 'in' },
  'ghatkopar': { lat: 19.0855, lon: 72.9077, city: 'Ghatkopar', countryCode: 'in' },
  'malad west': { lat: 19.1840, lon: 72.8380, city: 'Malad West', countryCode: 'in' },
  'malad': { lat: 19.1800, lon: 72.8500, city: 'Malad', countryCode: 'in' },
  'kurla': { lat: 19.0740, lon: 72.8800, city: 'Kurla', countryCode: 'in' },
  'kharghar': { lat: 19.0500, lon: 73.0700, city: 'Kharghar', countryCode: 'in' },
  'kamothe': { lat: 19.0200, lon: 73.1000, city: 'Kamothe', countryCode: 'in' },
  'airoli': { lat: 19.1500, lon: 72.9800, city: 'Airoli', countryCode: 'in' },
  'mira road': { lat: 19.2870, lon: 72.8650, city: 'Mira Road', countryCode: 'in' },
  'vasai virar': { lat: 19.3500, lon: 72.8000, city: 'Vasai-Virar', countryCode: 'in' },
  'bhiwandi': { lat: 19.2961, lon: 73.0632, city: 'Bhiwandi', countryCode: 'in' },

  // --- Delhi NCR ---
  'gurugram': { lat: 28.4595, lon: 77.0266, city: 'Gurugram', countryCode: 'in' },
  'gurgaon': { lat: 28.4595, lon: 77.0266, city: 'Gurugram', countryCode: 'in' },
  'noida': { lat: 28.5355, lon: 77.3910, city: 'Noida', countryCode: 'in' },
  'greater noida': { lat: 28.4963, lon: 77.5360, city: 'Greater Noida', countryCode: 'in' },
  'ghaziabad': { lat: 28.6692, lon: 77.4538, city: 'Ghaziabad', countryCode: 'in' },
  'faridabad': { lat: 28.4089, lon: 77.3178, city: 'Faridabad', countryCode: 'in' },
  'dwarka': { lat: 28.5921, lon: 77.0464, city: 'Dwarka', countryCode: 'in' },
  'rohini': { lat: 28.7349, lon: 77.0879, city: 'Rohini', countryCode: 'in' },
  'saket': { lat: 28.5239, lon: 77.2076, city: 'Saket', countryCode: 'in' },
  'karol bagh': { lat: 28.6514, lon: 77.1904, city: 'Karol Bagh', countryCode: 'in' },
  'connaught place': { lat: 28.6315, lon: 77.2167, city: 'Connaught Place', countryCode: 'in' },
  'lajpat nagar': { lat: 28.5697, lon: 77.2428, city: 'Lajpat Nagar', countryCode: 'in' },

  // --- Bengaluru suburbs ---
  'whitefield': { lat: 12.9698, lon: 77.7500, city: 'Whitefield', countryCode: 'in' },
  'elektronikacity': { lat: 12.8399, lon: 77.6770, city: 'Electronic City', countryCode: 'in' },
  'electronic city': { lat: 12.8399, lon: 77.6770, city: 'Electronic City', countryCode: 'in' },
  'btm layout': { lat: 12.9119, lon: 77.6080, city: 'BTM Layout', countryCode: 'in' },
  'koramangala': { lat: 12.9350, lon: 77.6240, city: 'Koramangala', countryCode: 'in' },
  'indiranagar': { lat: 12.9719, lon: 77.6412, city: 'Indiranagar', countryCode: 'in' },
  'mg road': { lat: 12.9757, lon: 77.6062, city: 'MG Road', countryCode: 'in' },
  'jayanagar': { lat: 12.9299, lon: 77.5800, city: 'Jayanagar', countryCode: 'in' },
  'marathahalli': { lat: 12.9591, lon: 77.6974, city: 'Marathahalli', countryCode: 'in' },
  'yelahanka': { lat: 13.1007, lon: 77.5963, city: 'Yelahanka', countryCode: 'in' },

  // --- Hyderabad areas ---
  'hi tech city': { lat: 17.4474, lon: 78.3767, city: 'HITEC City', countryCode: 'in' },
  'gachibowli': { lat: 17.4400, lon: 78.3400, city: 'Gachibowli', countryCode: 'in' },
  'madhapur': { lat: 17.4510, lon: 78.3700, city: 'Madhapur', countryCode: 'in' },
  'kondapur': { lat: 17.4580, lon: 78.3600, city: 'Kondapur', countryCode: 'in' },
  'secunderabad': { lat: 17.4399, lon: 78.4983, city: 'Secunderabad', countryCode: 'in' },

  // --- Chennai areas ---
  'old mahabalipuram road': { lat: 12.9520, lon: 80.2420, city: 'OMR', countryCode: 'in' },
  'omr': { lat: 12.9520, lon: 80.2420, city: 'OMR', countryCode: 'in' },
  'velachery': { lat: 12.9739, lon: 80.2180, city: 'Velachery', countryCode: 'in' },
  'tambaram': { lat: 12.9249, lon: 80.1000, city: 'Tambaram', countryCode: 'in' },
  'anna nagar': { lat: 13.0840, lon: 80.2100, city: 'Anna Nagar', countryCode: 'in' },
  't nagar': { lat: 13.0390, lon: 80.2340, city: 'T Nagar', countryCode: 'in' },
  'adyar': { lat: 13.0012, lon: 80.2565, city: 'Adyar', countryCode: 'in' },
  'guindy': { lat: 13.0067, lon: 80.2206, city: 'Guindy', countryCode: 'in' },

  // --- Kolkata areas ---
  'salt lake': { lat: 22.5847, lon: 88.4150, city: 'Salt Lake', countryCode: 'in' },
  'new town': { lat: 22.5920, lon: 88.4870, city: 'New Town', countryCode: 'in' },
  'howrah': { lat: 22.5958, lon: 88.3100, city: 'Howrah', countryCode: 'in' },
  'dum dum': { lat: 22.6201, lon: 88.4320, city: 'Dum Dum', countryCode: 'in' },

  // --- Pune areas ---
  'hinjewadi': { lat: 18.5950, lon: 73.7400, city: 'Hinjewadi', countryCode: 'in' },
  'kharadi': { lat: 18.5536, lon: 73.9410, city: 'Kharadi', countryCode: 'in' },
  'baner': { lat: 18.5578, lon: 73.7790, city: 'Baner', countryCode: 'in' },
  'wakad': { lat: 18.5990, lon: 73.7570, city: 'Wakad', countryCode: 'in' },
  'hadapsar': { lat: 18.5070, lon: 73.9250, city: 'Hadapsar', countryCode: 'in' },
  'pimpri chinchwad': { lat: 18.6298, lon: 73.7997, city: 'Pimpri-Chinchwad', countryCode: 'in' },

  // --- Gujarat ---
  'gandhinagar': { lat: 23.2156, lon: 72.6369, city: 'Gandhinagar', countryCode: 'in' },
  'vadodara': { lat: 22.3072, lon: 73.1812, city: 'Vadodara', countryCode: 'in' },
  'rajkot': { lat: 22.3039, lon: 70.8022, city: 'Rajkot', countryCode: 'in' },
  'bhavnagar': { lat: 21.7645, lon: 72.1519, city: 'Bhavnagar', countryCode: 'in' },
  'jamnagar': { lat: 22.4707, lon: 70.0577, city: 'Jamnagar', countryCode: 'in' },

  // --- Other major districts ---
  'nashik': { lat: 19.9975, lon: 73.7898, city: 'Nashik', countryCode: 'in' },
  'aurangabad': { lat: 19.8762, lon: 75.3433, city: 'Aurangabad', countryCode: 'in' },
  'nagpur': { lat: 21.1458, lon: 79.0882, city: 'Nagpur', countryCode: 'in' },
  'solapur': { lat: 17.6599, lon: 75.9064, city: 'Solapur', countryCode: 'in' },
  'kolhapur': { lat: 16.7050, lon: 74.2433, city: 'Kolhapur', countryCode: 'in' },
  'patna': { lat: 25.5941, lon: 85.1376, city: 'Patna', countryCode: 'in' },
  'ranchi': { lat: 23.3441, lon: 85.3096, city: 'Ranchi', countryCode: 'in' },
  'jamshedpur': { lat: 22.8046, lon: 86.2029, city: 'Jamshedpur', countryCode: 'in' },
  'bhubaneswar': { lat: 20.2961, lon: 85.8245, city: 'Bhubaneswar', countryCode: 'in' },
  'cuttack': { lat: 20.4625, lon: 85.8828, city: 'Cuttack', countryCode: 'in' },
  'guwahati': { lat: 26.1445, lon: 91.7362, city: 'Guwahati', countryCode: 'in' },
  'dehradun': { lat: 30.3165, lon: 78.0322, city: 'Dehradun', countryCode: 'in' },
  'shimla': { lat: 31.1048, lon: 77.1734, city: 'Shimla', countryCode: 'in' },
  'srinagar': { lat: 34.0837, lon: 74.7973, city: 'Srinagar', countryCode: 'in' },
  'jammu': { lat: 32.7266, lon: 74.8570, city: 'Jammu', countryCode: 'in' },
  'leh': { lat: 34.1526, lon: 77.5771, city: 'Leh', countryCode: 'in' },
  'manali': { lat: 32.2432, lon: 77.1892, city: 'Manali', countryCode: 'in' },
  'coimbatore': { lat: 11.0168, lon: 76.9558, city: 'Coimbatore', countryCode: 'in' },
  'madurai': { lat: 9.9252, lon: 78.1198, city: 'Madurai', countryCode: 'in' },
  'trichy': { lat: 10.7905, lon: 78.7047, city: 'Trichy', countryCode: 'in' },
  'mangalore': { lat: 12.9141, lon: 74.8560, city: 'Mangalore', countryCode: 'in' },
  'mysore': { lat: 12.2958, lon: 76.6394, city: 'Mysore', countryCode: 'in' },
  'kozhikode': { lat: 11.2588, lon: 75.7804, city: 'Kozhikode', countryCode: 'in' },
  'trivandrum': { lat: 8.5241, lon: 76.9366, city: 'Thiruvananthapuram', countryCode: 'in' },
  'thiruvananthapuram': { lat: 8.5241, lon: 76.9366, city: 'Thiruvananthapuram', countryCode: 'in' },
  'vijayawada': { lat: 16.5062, lon: 80.6480, city: 'Vijayawada', countryCode: 'in' },
  'visakhapatnam': { lat: 17.6868, lon: 83.2185, city: 'Visakhapatnam', countryCode: 'in' },
  'ludhiana': { lat: 30.9010, lon: 75.8573, city: 'Ludhiana', countryCode: 'in' },
  'jalandhar': { lat: 31.3260, lon: 75.5762, city: 'Jalandhar', countryCode: 'in' },
  'kanpur': { lat: 26.4499, lon: 80.3319, city: 'Kanpur', countryCode: 'in' },
  'allahabad': { lat: 25.4358, lon: 81.8463, city: 'Allahabad', countryCode: 'in' },
  'meerut': { lat: 28.9845, lon: 77.7064, city: 'Meerut', countryCode: 'in' },
  'ujjain': { lat: 23.1793, lon: 75.7849, city: 'Ujjain', countryCode: 'in' },
  'gwalior': { lat: 26.2183, lon: 78.1828, city: 'Gwalior', countryCode: 'in' },
  'mathura': { lat: 27.4924, lon: 77.6737, city: 'Mathura', countryCode: 'in' },
  'haridwar': { lat: 29.9457, lon: 78.1642, city: 'Haridwar', countryCode: 'in' },
  'rishikesh': { lat: 30.0869, lon: 78.2676, city: 'Rishikesh', countryCode: 'in' },
  'alwar': { lat: 27.5571, lon: 76.6495, city: 'Alwar', countryCode: 'in' },
  'udaipur': { lat: 24.5854, lon: 73.7125, city: 'Udaipur', countryCode: 'in' },
  'jodhpur': { lat: 26.2389, lon: 73.0243, city: 'Jodhpur', countryCode: 'in' },
  'mount abu': { lat: 24.5926, lon: 72.7156, city: 'Mount Abu', countryCode: 'in' },
  'new york': { lat: 40.7128, lon: -74.0060, city: 'New York', countryCode: 'us' },
  'brooklyn': { lat: 40.6782, lon: -73.9442, city: 'Brooklyn', countryCode: 'us' },
  'los angeles': { lat: 34.0522, lon: -118.2437, city: 'Los Angeles', countryCode: 'us' },
  'chicago': { lat: 41.8781, lon: -87.6298, city: 'Chicago', countryCode: 'us' },
  'houston': { lat: 29.7604, lon: -95.3698, city: 'Houston', countryCode: 'us' },
  'phoenix': { lat: 33.4484, lon: -112.0740, city: 'Phoenix', countryCode: 'us' },
  'san francisco': { lat: 37.7749, lon: -122.4194, city: 'San Francisco', countryCode: 'us' },
  'seattle': { lat: 47.6062, lon: -122.3321, city: 'Seattle', countryCode: 'us' },
  'miami': { lat: 25.7617, lon: -80.1918, city: 'Miami', countryCode: 'us' },
  'boston': { lat: 42.3601, lon: -71.0589, city: 'Boston', countryCode: 'us' },
  'denver': { lat: 39.7392, lon: -104.9903, city: 'Denver', countryCode: 'us' },
  'atlanta': { lat: 33.7490, lon: -84.3880, city: 'Atlanta', countryCode: 'us' },
  'dallas': { lat: 32.7767, lon: -96.7970, city: 'Dallas', countryCode: 'us' },
  'london': { lat: 51.5074, lon: -0.1278, city: 'London', countryCode: 'gb' },
  'paris': { lat: 48.8566, lon: 2.3522, city: 'Paris', countryCode: 'fr' },
  'berlin': { lat: 52.52, lon: 13.405, city: 'Berlin', countryCode: 'de' },
  'madrid': { lat: 40.4168, lon: -3.7038, city: 'Madrid', countryCode: 'es' },
  'rome': { lat: 41.9028, lon: 12.4964, city: 'Rome', countryCode: 'it' },
  'amsterdam': { lat: 52.3676, lon: 4.9041, city: 'Amsterdam', countryCode: 'nl' },
  'barcelona': { lat: 41.3851, lon: 2.1734, city: 'Barcelona', countryCode: 'es' },
  'vienna': { lat: 48.2082, lon: 16.3738, city: 'Vienna', countryCode: 'at' },
  'zurich': { lat: 47.3769, lon: 8.5417, city: 'Zürich', countryCode: 'ch' },
  'stockholm': { lat: 59.3293, lon: 18.0686, city: 'Stockholm', countryCode: 'se' },
  'oslo': { lat: 59.9139, lon: 10.7522, city: 'Oslo', countryCode: 'no' },
  'copenhagen': { lat: 55.6761, lon: 12.5683, city: 'Copenhagen', countryCode: 'dk' },
  'lisbon': { lat: 38.7169, lon: -9.1395, city: 'Lisbon', countryCode: 'pt' },
  'tokyo': { lat: 35.6762, lon: 139.6503, city: 'Tokyo', countryCode: 'jp' },
  'osaka': { lat: 34.6937, lon: 135.5023, city: 'Osaka', countryCode: 'jp' },
  'beijing': { lat: 39.9042, lon: 116.4074, city: 'Beijing', countryCode: 'cn' },
  'shanghai': { lat: 31.2304, lon: 121.4737, city: 'Shanghai', countryCode: 'cn' },
  'singapore': { lat: 1.3521, lon: 103.8198, city: 'Singapore', countryCode: 'sg' },
  'seoul': { lat: 37.5665, lon: 126.9780, city: 'Seoul', countryCode: 'kr' },
  'bangkok': { lat: 13.7563, lon: 100.5018, city: 'Bangkok', countryCode: 'th' },
  'sydney': { lat: -33.8688, lon: 151.2093, city: 'Sydney', countryCode: 'au' },
  'melbourne': { lat: -37.8136, lon: 144.9631, city: 'Melbourne', countryCode: 'au' },
  'dubai': { lat: 25.2048, lon: 55.2708, city: 'Dubai', countryCode: 'ae' },
  'istanbul': { lat: 41.0082, lon: 28.9784, city: 'Istanbul', countryCode: 'tr' },
  'cairo': { lat: 30.0444, lon: 31.2357, city: 'Cairo', countryCode: 'eg' },
  'toronto': { lat: 43.6532, lon: -79.3832, city: 'Toronto', countryCode: 'ca' },
  'vancouver': { lat: 49.2827, lon: -123.1207, city: 'Vancouver', countryCode: 'ca' },
  'mexico city': { lat: 19.4326, lon: -99.1332, city: 'Mexico City', countryCode: 'mx' },
  'sao paulo': { lat: -23.5505, lon: -46.6333, city: 'São Paulo', countryCode: 'br' },
  'buenos aires': { lat: -34.6037, lon: -58.3816, city: 'Buenos Aires', countryCode: 'ar' },
};

function getMockLocation(cityName) {
  const key = cityName?.trim().toLowerCase();
  if (!key) return { lat: 40.7128, lon: -74.0060, city: 'New York', countryCode: 'us' };
  if (MOCK_LOCATIONS[key]) return { ...MOCK_LOCATIONS[key] };
  const match = Object.entries(MOCK_LOCATIONS).find(([k]) =>
    k.startsWith(key) || key.startsWith(k) || k.includes(key) || key.includes(k)
  );
  if (match) return { ...match[1] };
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
            countryCode: resolveCountryCode(country),
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

export async function getCityAutocomplete(query) {
  const trimmed = query?.trim();
  if (!trimmed || trimmed.length < 2) return [];

  const key = getApiKey();
  if (!key) return [];

  try {
    const url = `https://api.weatherapi.com/v1/search.json?key=${key}&q=${encodeURIComponent(trimmed)}`;
    const resp = await fetch(url);
    if (!resp.ok) return [];
    const data = await resp.json();
    const seen = new Set();
    const indiaResults = [];
    const otherResults = [];
    for (const r of data) {
      const label = `${r.name}, ${r.region}`;
      if (seen.has(label)) continue;
      seen.add(label);
      const isIndia = (r.country || '').toLowerCase() === 'india';
      (isIndia ? indiaResults : otherResults).push(label);
    }
    const results = [...indiaResults, ...otherResults].slice(0, 8);
    if (results.length === 0) {
      const retryUrl = `https://api.weatherapi.com/v1/search.json?key=${key}&q=${encodeURIComponent(trimmed + ', India')}`;
      try {
        const retryResp = await fetch(retryUrl);
        if (retryResp.ok) {
          const retryData = await retryResp.json();
          for (const r of retryData) {
            const label = `${r.name}, ${r.region}`;
            if (!seen.has(label)) {
              seen.add(label);
              results.push(label);
              if (results.length >= 8) break;
            }
          }
        }
      } catch { /* ignore retry errors */ }
    }
    return results;
  } catch {
    return [];
  }
}

export async function getManualLocation(cityName) {
  if (!cityName || cityName.trim() === '') {
    throw new Error('Please enter a valid city name.');
  }

  const key = getApiKey();
  if (!key) {
    console.warn('Location Service: No API key set. Using mock location lookup.');
    const mock = getMockLocation(cityName);
    if (mock.city !== 'New York' || cityName.trim().toLowerCase() === 'new york') {
      return mock;
    }
    throw new Error('City not found. Try a major city like Mumbai, New York, London, or Tokyo.');
  }

  const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${key}&q=${encodeURIComponent(cityName)}`;
  const response = await fetch(apiUrl);

  if (!response.ok) {
    throw new Error('City not found');
  }

  const data = await response.json();
  let { lat, lon, name: city, country } = data.location;

  let countryCode = resolveCountryCode(country);
  if (countryCode !== 'in') {
    const mock = getMockLocation(cityName);
    if (mock.countryCode === 'in') {
      return mock;
    }
    const retryQuery = `${cityName},India`;
    const retryUrl = `https://api.weatherapi.com/v1/current.json?key=${key}&q=${encodeURIComponent(retryQuery)}`;
    try {
      const retryResp = await fetch(retryUrl);
      if (retryResp.ok) {
        const retryData = await retryResp.json();
        if (resolveCountryCode(retryData.location.country) === 'in') {
          city = retryData.location.name;
          lat = retryData.location.lat;
          lon = retryData.location.lon;
          country = retryData.location.country;
          countryCode = 'in';
        }
      }
    } catch { /* ignore retry errors */ }
  }

  return { lat, lon, city, countryCode };
}
