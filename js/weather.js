/** Weather data layer — static fixture generation for UI shell */

const VALID_CITIES = {
  // --- Major Indian cities ---
  mumbai: { city: 'Mumbai', region: 'Maharashtra', country: 'India', lat: 19.0760, lon: 72.8777 },
  pune: { city: 'Pune', region: 'Maharashtra', country: 'India', lat: 18.5204, lon: 73.8567 },
  delhi: { city: 'Delhi', region: 'Delhi', country: 'India', lat: 28.6139, lon: 77.2090 },
  'new delhi': { city: 'New Delhi', region: 'Delhi', country: 'India', lat: 28.6139, lon: 77.2090 },
  bengaluru: { city: 'Bengaluru', region: 'Karnataka', country: 'India', lat: 12.9716, lon: 77.5946 },
  hyderabad: { city: 'Hyderabad', region: 'Telangana', country: 'India', lat: 17.3850, lon: 78.4867 },
  chennai: { city: 'Chennai', region: 'Tamil Nadu', country: 'India', lat: 13.0827, lon: 80.2707 },
  kolkata: { city: 'Kolkata', region: 'West Bengal', country: 'India', lat: 22.5726, lon: 88.3639 },
  ahmedabad: { city: 'Ahmedabad', region: 'Gujarat', country: 'India', lat: 23.0225, lon: 72.5714 },
  jaipur: { city: 'Jaipur', region: 'Rajasthan', country: 'India', lat: 26.9124, lon: 75.7873 },
  lucknow: { city: 'Lucknow', region: 'Uttar Pradesh', country: 'India', lat: 26.8467, lon: 80.9462 },
  surat: { city: 'Surat', region: 'Gujarat', country: 'India', lat: 21.1702, lon: 72.8311 },
  bhopal: { city: 'Bhopal', region: 'Madhya Pradesh', country: 'India', lat: 23.2599, lon: 77.4126 },
  indore: { city: 'Indore', region: 'Madhya Pradesh', country: 'India', lat: 22.7196, lon: 75.8577 },
  kochi: { city: 'Kochi', region: 'Kerala', country: 'India', lat: 9.9312, lon: 76.2673 },
  chandigarh: { city: 'Chandigarh', region: 'Punjab', country: 'India', lat: 30.7333, lon: 76.7794 },
  goa: { city: 'Goa', region: 'Goa', country: 'India', lat: 15.2993, lon: 74.1240 },
  amritsar: { city: 'Amritsar', region: 'Punjab', country: 'India', lat: 31.6340, lon: 74.8723 },
  varanasi: { city: 'Varanasi', region: 'Uttar Pradesh', country: 'India', lat: 25.3176, lon: 82.9739 },
  agra: { city: 'Agra', region: 'Uttar Pradesh', country: 'India', lat: 27.1767, lon: 78.0081 },

  // --- Mumbai suburbs & localities ---
  thane: { city: 'Thane', region: 'Maharashtra', country: 'India', lat: 19.2183, lon: 72.9781 },
  navimumbai: { city: 'Navi Mumbai', region: 'Maharashtra', country: 'India', lat: 19.0330, lon: 73.0297 },
  'navi mumbai': { city: 'Navi Mumbai', region: 'Maharashtra', country: 'India', lat: 19.0330, lon: 73.0297 },
  kalyan: { city: 'Kalyan', region: 'Maharashtra', country: 'India', lat: 19.2403, lon: 73.1305 },
  dombivali: { city: 'Dombivali', region: 'Maharashtra', country: 'India', lat: 19.2167, lon: 73.0833 },
  ulhasnagar: { city: 'Ulhasnagar', region: 'Maharashtra', country: 'India', lat: 19.2167, lon: 73.1500 },
  panvel: { city: 'Panvel', region: 'Maharashtra', country: 'India', lat: 18.9894, lon: 73.1170 },
  andheri: { city: 'Andheri', region: 'Maharashtra', country: 'India', lat: 19.1192, lon: 72.8470 },
  bandra: { city: 'Bandra', region: 'Maharashtra', country: 'India', lat: 19.0544, lon: 72.8406 },
  borivali: { city: 'Borivali', region: 'Maharashtra', country: 'India', lat: 19.2310, lon: 72.8550 },
  'vile parle': { city: 'Vile Parle', region: 'Maharashtra', country: 'India', lat: 19.0999, lon: 72.8431 },
  worli: { city: 'Worli', region: 'Maharashtra', country: 'India', lat: 19.0023, lon: 72.8155 },
  colaba: { city: 'Colaba', region: 'Maharashtra', country: 'India', lat: 18.9076, lon: 72.8123 },
  dadar: { city: 'Dadar', region: 'Maharashtra', country: 'India', lat: 19.0200, lon: 72.8420 },
  powai: { city: 'Powai', region: 'Maharashtra', country: 'India', lat: 19.1170, lon: 72.9050 },
  ghatkopar: { city: 'Ghatkopar', region: 'Maharashtra', country: 'India', lat: 19.0855, lon: 72.9077 },
  'malad west': { city: 'Malad West', region: 'Maharashtra', country: 'India', lat: 19.1840, lon: 72.8380 },
  malad: { city: 'Malad', region: 'Maharashtra', country: 'India', lat: 19.1800, lon: 72.8500 },
  kurla: { city: 'Kurla', region: 'Maharashtra', country: 'India', lat: 19.0740, lon: 72.8800 },
  kharghar: { city: 'Kharghar', region: 'Maharashtra', country: 'India', lat: 19.0500, lon: 73.0700 },
  kamothe: { city: 'Kamothe', region: 'Maharashtra', country: 'India', lat: 19.0200, lon: 73.1000 },
  airoli: { city: 'Airoli', region: 'Maharashtra', country: 'India', lat: 19.1500, lon: 72.9800 },
  'mira road': { city: 'Mira Road', region: 'Maharashtra', country: 'India', lat: 19.2870, lon: 72.8650 },
  'vasai virar': { city: 'Vasai-Virar', region: 'Maharashtra', country: 'India', lat: 19.3500, lon: 72.8000 },
  bhiwandi: { city: 'Bhiwandi', region: 'Maharashtra', country: 'India', lat: 19.2961, lon: 73.0632 },

  // --- Delhi NCR ---
  gurugram: { city: 'Gurugram', region: 'Haryana', country: 'India', lat: 28.4595, lon: 77.0266 },
  gurgaon: { city: 'Gurugram', region: 'Haryana', country: 'India', lat: 28.4595, lon: 77.0266 },
  noida: { city: 'Noida', region: 'Uttar Pradesh', country: 'India', lat: 28.5355, lon: 77.3910 },
  'greater noida': { city: 'Greater Noida', region: 'Uttar Pradesh', country: 'India', lat: 28.4963, lon: 77.5360 },
  ghaziabad: { city: 'Ghaziabad', region: 'Uttar Pradesh', country: 'India', lat: 28.6692, lon: 77.4538 },
  faridabad: { city: 'Faridabad', region: 'Haryana', country: 'India', lat: 28.4089, lon: 77.3178 },
  dwarka: { city: 'Dwarka', region: 'Delhi', country: 'India', lat: 28.5921, lon: 77.0464 },
  rohini: { city: 'Rohini', region: 'Delhi', country: 'India', lat: 28.7349, lon: 77.0879 },
  saket: { city: 'Saket', region: 'Delhi', country: 'India', lat: 28.5239, lon: 77.2076 },
  'karol bagh': { city: 'Karol Bagh', region: 'Delhi', country: 'India', lat: 28.6514, lon: 77.1904 },
  'connaught place': { city: 'Connaught Place', region: 'Delhi', country: 'India', lat: 28.6315, lon: 77.2167 },
  'lajpat nagar': { city: 'Lajpat Nagar', region: 'Delhi', country: 'India', lat: 28.5697, lon: 77.2428 },

  // --- Bengaluru suburbs ---
  whitefield: { city: 'Whitefield', region: 'Karnataka', country: 'India', lat: 12.9698, lon: 77.7500 },
  elektronikacity: { city: 'Electronic City', region: 'Karnataka', country: 'India', lat: 12.8399, lon: 77.6770 },
  'electronic city': { city: 'Electronic City', region: 'Karnataka', country: 'India', lat: 12.8399, lon: 77.6770 },
  'btm layout': { city: 'BTM Layout', region: 'Karnataka', country: 'India', lat: 12.9119, lon: 77.6080 },
  koramangala: { city: 'Koramangala', region: 'Karnataka', country: 'India', lat: 12.9350, lon: 77.6240 },
  indiranagar: { city: 'Indiranagar', region: 'Karnataka', country: 'India', lat: 12.9719, lon: 77.6412 },
  'mg road': { city: 'MG Road', region: 'Karnataka', country: 'India', lat: 12.9757, lon: 77.6062 },
  jayanagar: { city: 'Jayanagar', region: 'Karnataka', country: 'India', lat: 12.9299, lon: 77.5800 },
  marathahalli: { city: 'Marathahalli', region: 'Karnataka', country: 'India', lat: 12.9591, lon: 77.6974 },
  yelahanka: { city: 'Yelahanka', region: 'Karnataka', country: 'India', lat: 13.1007, lon: 77.5963 },

  // --- Hyderabad areas ---
  'hi tech city': { city: 'HITEC City', region: 'Telangana', country: 'India', lat: 17.4474, lon: 78.3767 },
  'gachibowli': { city: 'Gachibowli', region: 'Telangana', country: 'India', lat: 17.4400, lon: 78.3400 },
  madhapur: { city: 'Madhapur', region: 'Telangana', country: 'India', lat: 17.4510, lon: 78.3700 },
  kondapur: { city: 'Kondapur', region: 'Telangana', country: 'India', lat: 17.4580, lon: 78.3600 },
  secunderabad: { city: 'Secunderabad', region: 'Telangana', country: 'India', lat: 17.4399, lon: 78.4983 },

  // --- Chennai areas ---
  'old mahabalipuram road': { city: 'OMR', region: 'Tamil Nadu', country: 'India', lat: 12.9520, lon: 80.2420 },
  omr: { city: 'OMR', region: 'Tamil Nadu', country: 'India', lat: 12.9520, lon: 80.2420 },
  velachery: { city: 'Velachery', region: 'Tamil Nadu', country: 'India', lat: 12.9739, lon: 80.2180 },
  tambaram: { city: 'Tambaram', region: 'Tamil Nadu', country: 'India', lat: 12.9249, lon: 80.1000 },
  'anna nagar': { city: 'Anna Nagar', region: 'Tamil Nadu', country: 'India', lat: 13.0840, lon: 80.2100 },
  't nagar': { city: 'T Nagar', region: 'Tamil Nadu', country: 'India', lat: 13.0390, lon: 80.2340 },
  'adyar': { city: 'Adyar', region: 'Tamil Nadu', country: 'India', lat: 13.0012, lon: 80.2565 },
  'guindy': { city: 'Guindy', region: 'Tamil Nadu', country: 'India', lat: 13.0067, lon: 80.2206 },

  // --- Kolkata areas ---
  'salt lake': { city: 'Salt Lake', region: 'West Bengal', country: 'India', lat: 22.5847, lon: 88.4150 },
  'new town': { city: 'New Town', region: 'West Bengal', country: 'India', lat: 22.5920, lon: 88.4870 },
  howrah: { city: 'Howrah', region: 'West Bengal', country: 'India', lat: 22.5958, lon: 88.3100 },
  'dum dum': { city: 'Dum Dum', region: 'West Bengal', country: 'India', lat: 22.6201, lon: 88.4320 },

  // --- Pune areas ---
  'hinjewadi': { city: 'Hinjewadi', region: 'Maharashtra', country: 'India', lat: 18.5950, lon: 73.7400 },
  'kharadi': { city: 'Kharadi', region: 'Maharashtra', country: 'India', lat: 18.5536, lon: 73.9410 },
  'baner': { city: 'Baner', region: 'Maharashtra', country: 'India', lat: 18.5578, lon: 73.7790 },
  'wakad': { city: 'Wakad', region: 'Maharashtra', country: 'India', lat: 18.5990, lon: 73.7570 },
  'hadapsar': { city: 'Hadapsar', region: 'Maharashtra', country: 'India', lat: 18.5070, lon: 73.9250 },
  'pimpri chinchwad': { city: 'Pimpri-Chinchwad', region: 'Maharashtra', country: 'India', lat: 18.6298, lon: 73.7997 },

  // --- Gujarat ---
  'gandhinagar': { city: 'Gandhinagar', region: 'Gujarat', country: 'India', lat: 23.2156, lon: 72.6369 },
  'vadodara': { city: 'Vadodara', region: 'Gujarat', country: 'India', lat: 22.3072, lon: 73.1812 },
  'rajkot': { city: 'Rajkot', region: 'Gujarat', country: 'India', lat: 22.3039, lon: 70.8022 },
  'bhavnagar': { city: 'Bhavnagar', region: 'Gujarat', country: 'India', lat: 21.7645, lon: 72.1519 },
  'jamnagar': { city: 'Jamnagar', region: 'Gujarat', country: 'India', lat: 22.4707, lon: 70.0577 },

  // --- Other major districts ---
  'nashik': { city: 'Nashik', region: 'Maharashtra', country: 'India', lat: 19.9975, lon: 73.7898 },
  'aurangabad': { city: 'Aurangabad', region: 'Maharashtra', country: 'India', lat: 19.8762, lon: 75.3433 },
  'nagpur': { city: 'Nagpur', region: 'Maharashtra', country: 'India', lat: 21.1458, lon: 79.0882 },
  'solapur': { city: 'Solapur', region: 'Maharashtra', country: 'India', lat: 17.6599, lon: 75.9064 },
  'kolhapur': { city: 'Kolhapur', region: 'Maharashtra', country: 'India', lat: 16.7050, lon: 74.2433 },
  'patna': { city: 'Patna', region: 'Bihar', country: 'India', lat: 25.5941, lon: 85.1376 },
  'ranchi': { city: 'Ranchi', region: 'Jharkhand', country: 'India', lat: 23.3441, lon: 85.3096 },
  'jamshedpur': { city: 'Jamshedpur', region: 'Jharkhand', country: 'India', lat: 22.8046, lon: 86.2029 },
  'bhubaneswar': { city: 'Bhubaneswar', region: 'Odisha', country: 'India', lat: 20.2961, lon: 85.8245 },
  'cuttack': { city: 'Cuttack', region: 'Odisha', country: 'India', lat: 20.4625, lon: 85.8828 },
  'guwahati': { city: 'Guwahati', region: 'Assam', country: 'India', lat: 26.1445, lon: 91.7362 },
  'dehradun': { city: 'Dehradun', region: 'Uttarakhand', country: 'India', lat: 30.3165, lon: 78.0322 },
  'shimla': { city: 'Shimla', region: 'Himachal Pradesh', country: 'India', lat: 31.1048, lon: 77.1734 },
  'srinagar': { city: 'Srinagar', region: 'Jammu and Kashmir', country: 'India', lat: 34.0837, lon: 74.7973 },
  'jammu': { city: 'Jammu', region: 'Jammu and Kashmir', country: 'India', lat: 32.7266, lon: 74.8570 },
  'leh': { city: 'Leh', region: 'Ladakh', country: 'India', lat: 34.1526, lon: 77.5771 },
  'manali': { city: 'Manali', region: 'Himachal Pradesh', country: 'India', lat: 32.2432, lon: 77.1892 },
  'coimbatore': { city: 'Coimbatore', region: 'Tamil Nadu', country: 'India', lat: 11.0168, lon: 76.9558 },
  'madurai': { city: 'Madurai', region: 'Tamil Nadu', country: 'India', lat: 9.9252, lon: 78.1198 },
  'trichy': { city: 'Trichy', region: 'Tamil Nadu', country: 'India', lat: 10.7905, lon: 78.7047 },
  'mangalore': { city: 'Mangalore', region: 'Karnataka', country: 'India', lat: 12.9141, lon: 74.8560 },
  'mysore': { city: 'Mysore', region: 'Karnataka', country: 'India', lat: 12.2958, lon: 76.6394 },
  'kozhikode': { city: 'Kozhikode', region: 'Kerala', country: 'India', lat: 11.2588, lon: 75.7804 },
  'trivandrum': { city: 'Thiruvananthapuram', region: 'Kerala', country: 'India', lat: 8.5241, lon: 76.9366 },
  'thiruvananthapuram': { city: 'Thiruvananthapuram', region: 'Kerala', country: 'India', lat: 8.5241, lon: 76.9366 },
  'vijayawada': { city: 'Vijayawada', region: 'Andhra Pradesh', country: 'India', lat: 16.5062, lon: 80.6480 },
  'visakhapatnam': { city: 'Visakhapatnam', region: 'Andhra Pradesh', country: 'India', lat: 17.6868, lon: 83.2185 },
  'ludhiana': { city: 'Ludhiana', region: 'Punjab', country: 'India', lat: 30.9010, lon: 75.8573 },
  'jalandhar': { city: 'Jalandhar', region: 'Punjab', country: 'India', lat: 31.3260, lon: 75.5762 },
  'kanpur': { city: 'Kanpur', region: 'Uttar Pradesh', country: 'India', lat: 26.4499, lon: 80.3319 },
  'allahabad': { city: 'Allahabad', region: 'Uttar Pradesh', country: 'India', lat: 25.4358, lon: 81.8463 },
  'meerut': { city: 'Meerut', region: 'Uttar Pradesh', country: 'India', lat: 28.9845, lon: 77.7064 },
  'ujjain': { city: 'Ujjain', region: 'Madhya Pradesh', country: 'India', lat: 23.1793, lon: 75.7849 },
  'gwalior': { city: 'Gwalior', region: 'Madhya Pradesh', country: 'India', lat: 26.2183, lon: 78.1828 },
  'mathura': { city: 'Mathura', region: 'Uttar Pradesh', country: 'India', lat: 27.4924, lon: 77.6737 },
  'haridwar': { city: 'Haridwar', region: 'Uttarakhand', country: 'India', lat: 29.9457, lon: 78.1642 },
  'rishikesh': { city: 'Rishikesh', region: 'Uttarakhand', country: 'India', lat: 30.0869, lon: 78.2676 },
  'alwar': { city: 'Alwar', region: 'Rajasthan', country: 'India', lat: 27.5571, lon: 76.6495 },
  'udaipur': { city: 'Udaipur', region: 'Rajasthan', country: 'India', lat: 24.5854, lon: 73.7125 },
  'jodhpur': { city: 'Jodhpur', region: 'Rajasthan', country: 'India', lat: 26.2389, lon: 73.0243 },
  'mount abu': { city: 'Mount Abu', region: 'Rajasthan', country: 'India', lat: 24.5926, lon: 72.7156 },

  // --- International cities ---
  brooklyn: { city: 'Brooklyn', region: 'New York', country: 'USA', lat: 40.6782, lon: -73.9442 },
  'new york': { city: 'New York', region: 'New York', country: 'USA', lat: 40.7128, lon: -74.006 },
  nyc: { city: 'New York', region: 'New York', country: 'USA', lat: 40.7128, lon: -74.006 },
  'los angeles': { city: 'Los Angeles', region: 'New York', country: 'USA', lat: 34.0522, lon: -118.2437 },
  chicago: { city: 'Chicago', region: 'Illinois', country: 'USA', lat: 41.8781, lon: -87.6298 },
  houston: { city: 'Houston', region: 'Texas', country: 'USA', lat: 29.7604, lon: -95.3698 },
  phoenix: { city: 'Phoenix', region: 'Arizona', country: 'USA', lat: 33.4484, lon: -112.0740 },
  'san francisco': { city: 'San Francisco', region: 'California', country: 'USA', lat: 37.7749, lon: -122.4194 },
  seattle: { city: 'Seattle', region: 'Washington', country: 'USA', lat: 47.6062, lon: -122.3321 },
  miami: { city: 'Miami', region: 'Florida', country: 'USA', lat: 25.7617, lon: -80.1918 },
  boston: { city: 'Boston', region: 'Massachusetts', country: 'USA', lat: 42.3601, lon: -71.0589 },
  denver: { city: 'Denver', region: 'Colorado', country: 'USA', lat: 39.7392, lon: -104.9903 },
  atlanta: { city: 'Atlanta', region: 'Georgia', country: 'USA', lat: 33.7490, lon: -84.3880 },
  dallas: { city: 'Dallas', region: 'Texas', country: 'USA', lat: 32.7767, lon: -96.7970 },
  london: { city: 'London', region: 'England', country: 'UK', lat: 51.5074, lon: -0.1278 },
  paris: { city: 'Paris', region: 'Île-de-France', country: 'France', lat: 48.8566, lon: 2.3522 },
  berlin: { city: 'Berlin', region: 'Berlin', country: 'Germany', lat: 52.52, lon: 13.405 },
  madrid: { city: 'Madrid', region: 'Community of Madrid', country: 'Spain', lat: 40.4168, lon: -3.7038 },
  rome: { city: 'Rome', region: 'Lazio', country: 'Italy', lat: 41.9028, lon: 12.4964 },
  amsterdam: { city: 'Amsterdam', region: 'North Holland', country: 'Netherlands', lat: 52.3676, lon: 4.9041 },
  barcelona: { city: 'Barcelona', region: 'Catalonia', country: 'Spain', lat: 41.3851, lon: 2.1734 },
  vienna: { city: 'Vienna', region: 'Vienna', country: 'Austria', lat: 48.2082, lon: 16.3738 },
  zurich: { city: 'Zürich', region: 'Zurich', country: 'Switzerland', lat: 47.3769, lon: 8.5417 },
  stockholm: { city: 'Stockholm', region: 'Stockholm County', country: 'Sweden', lat: 59.3293, lon: 18.0686 },
  oslo: { city: 'Oslo', region: 'Oslo', country: 'Norway', lat: 59.9139, lon: 10.7522 },
  copenhagen: { city: 'Copenhagen', region: 'Capital Region', country: 'Denmark', lat: 55.6761, lon: 12.5683 },
  lisbon: { city: 'Lisbon', region: 'Lisbon', country: 'Portugal', lat: 38.7169, lon: -9.1395 },
  tokyo: { city: 'Tokyo', region: 'Kanto', country: 'Japan', lat: 35.6762, lon: 139.6503 },
  osaka: { city: 'Osaka', region: 'Kansai', country: 'Japan', lat: 34.6937, lon: 135.5023 },
  beijing: { city: 'Beijing', region: 'Beijing', country: 'China', lat: 39.9042, lon: 116.4074 },
  shanghai: { city: 'Shanghai', region: 'Shanghai', country: 'China', lat: 31.2304, lon: 121.4737 },
  singapore: { city: 'Singapore', region: 'Singapore', country: 'Singapore', lat: 1.3521, lon: 103.8198 },
  seoul: { city: 'Seoul', region: 'Seoul', country: 'South Korea', lat: 37.5665, lon: 126.9780 },
  bangkok: { city: 'Bangkok', region: 'Bangkok', country: 'Thailand', lat: 13.7563, lon: 100.5018 },
  sydney: { city: 'Sydney', region: 'NSW', country: 'Australia', lat: -33.8688, lon: 151.2093 },
  melbourne: { city: 'Melbourne', region: 'Victoria', country: 'Australia', lat: -37.8136, lon: 144.9631 },
  dubai: { city: 'Dubai', region: 'Dubai', country: 'UAE', lat: 25.2048, lon: 55.2708 },
  istanbul: { city: 'Istanbul', region: 'Istanbul', country: 'Turkey', lat: 41.0082, lon: 28.9784 },
  cairo: { city: 'Cairo', region: 'Cairo Governorate', country: 'Egypt', lat: 30.0444, lon: 31.2357 },
  toronto: { city: 'Toronto', region: 'Ontario', country: 'Canada', lat: 43.6532, lon: -79.3832 },
  vancouver: { city: 'Vancouver', region: 'British Columbia', country: 'Canada', lat: 49.2827, lon: -123.1207 },
  'mexico city': { city: 'Mexico City', region: 'CDMX', country: 'Mexico', lat: 19.4326, lon: -99.1332 },
  'sao paulo': { city: 'São Paulo', region: 'São Paulo State', country: 'Brazil', lat: -23.5505, lon: -46.6333 },
  'buenos aires': { city: 'Buenos Aires', region: 'Buenos Aires', country: 'Argentina', lat: -34.6037, lon: -58.3816 },
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

  // Wave curve offsets: today (i=0) is at the top, rest curve naturally
  const waveOffsets = [0, 15, 28, 38, 30, 20, 10];

  const forecast = Array.from({ length: 7 }, (_, i) => {
    const dayIndex = (today + i) % 7;
    const temp = baseTemp + ((seed + i * 3) % 8) - 3;
    return {
      day: days[dayIndex],
      temp,
      active: i === 0,  // today is always first and active
      offsetY: waveOffsets[i] ?? 20,
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

export function getWeatherFixture(cityName) {
  if (!cityName) cityName = 'Brooklyn';
  const coords = validateCity(cityName);
  if (!coords) {
    const fallback = VALID_CITIES['brooklyn'];
    return generateWeatherData('brooklyn', fallback);
  }
  return generateWeatherData(coords.city.toLowerCase(), coords);
}

export function validateCity(query) {
  const normalized = query.trim().toLowerCase();
  if (!normalized || normalized.length < 2) return null;
  if (VALID_CITIES[normalized]) return VALID_CITIES[normalized];
  const match = Object.entries(VALID_CITIES).find(([key]) =>
    key.startsWith(normalized) || normalized.startsWith(key) ||
    key.includes(normalized) || normalized.includes(key)
  );
  return match ? match[1] : null;
}

function getApiKey() {
  return window.WEATHER_API_KEY || '';
}

function mapConditionToIcon(text) {
  const t = text.toLowerCase();
  if (t.includes('sunny') || t.includes('clear')) return 'sunny';
  if (t.includes('thunder') || t.includes('storm')) return 'thunderstorm';
  if (t.includes('rain') || t.includes('drizzle') || t.includes('shower')) return 'rainy';
  if (t.includes('overcast') || t.includes('cloudy') || t.includes('fog') || t.includes('mist') || t.includes('haze')) return 'cloudy';
  if (t.includes('partly') || t.includes('patchy')) return 'partly-cloudy';
  if (t.includes('snow') || t.includes('sleet') || t.includes('ice')) return 'rainy';
  return 'sunny';
}

function shortDesc(text) {
  const t = text.toLowerCase();
  if (t.includes('sunny') || t.includes('clear')) return 'clear skies';
  if (t.includes('overcast') || t.includes('cloudy')) return 'overcast clouds';
  if (t.includes('fog') || t.includes('mist') || t.includes('haze')) return 'low visibility';
  if (t.includes('thunder') || t.includes('storm')) return 'thunderstorms expected';
  if (t.includes('torrential') || t.includes('heavy')) return 'heavy precipitation';
  if (t.includes('moderate')) return 'moderate precipitation';
  if (t.includes('light rain') || t.includes('drizzle') || t.includes('patchy rain')) return 'light precipitation';
  if (t.includes('rain') || t.includes('shower')) return 'rain expected';
  if (t.includes('snow') || t.includes('sleet') || t.includes('ice')) return 'wintry conditions';
  if (t.includes('wind')) return 'windy conditions';
  if (t.includes('partly') || t.includes('patchy')) return 'partial clouds';
  return 'varying conditions';
}

function mapColor(text) {
  const t = text.toLowerCase();
  if (t.includes('sunny') || t.includes('clear') || t.includes('partly') || t.includes('patchy')) return '#fbbf24';
  if (t.includes('rain') || t.includes('drizzle') || t.includes('shower') || t.includes('snow') || t.includes('sleet')) return '#38bdf8';
  if (t.includes('thunder') || t.includes('storm')) return '#a78bfa';
  return '#94a3b8';
}

function windDesc(speed) {
  if (speed > 50) return 'Dangerous winds';
  if (speed > 30) return 'Strong winds';
  if (speed > 15) return 'Moderate winds';
  return 'Light breeze';
}

export async function getWeatherData(opts) {
  const cityName = typeof opts === 'string' ? opts : opts?.city || 'Brooklyn';
  const lat = opts?.lat;
  const lon = opts?.lon;

  const key = getApiKey();
  if (!key) return getWeatherFixture(cityName);

  const query = (lat != null && lon != null) ? `${lat},${lon}` : encodeURIComponent(cityName);
  try {
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${key}&q=${query}&days=3`;
    const resp = await fetch(url);
    if (!resp.ok) return getWeatherFixture(cityName);

    const d = await resp.json();
    const loc = d.location;
    const cur = d.current;
    const apiDays = d.forecast.forecastday;
    const today = new Date().getDay();
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const forecast = [];

    for (let i = 0; i < 7; i++) {
      const dayIndex = (today + i) % 7;
      if (i < apiDays.length) {
        const ad = apiDays[i];
        const dayName = new Date(ad.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long' });
        forecast.push({
          day: dayName,
          temp: Math.round(ad.day.avgtemp_c),
          active: i === 0,
          offsetY: [40, 30, 25, 0, 20, 35, 30][i] || 20,
        });
      } else {
        const last = apiDays[apiDays.length - 1];
        const avg = last.day.avgtemp_c;
        forecast.push({
          day: dayNames[dayIndex],
          temp: Math.round(avg + (i - apiDays.length + 1) * 2),
          active: false,
          offsetY: [40, 30, 25, 0, 20, 35, 30][i] || 20,
        });
      }
    }

    const display = lat != null && lon != null
      ? `${cityName}, ${loc.region}, ${loc.country}`
      : `${loc.name}, ${loc.region}, ${loc.country}`;

    return {
      location: {
        city: lat != null && lon != null ? cityName : loc.name,
        region: loc.region,
        country: loc.country,
        display,
      },
      current: {
        temp: cur.temp_c,
        tempHigh: apiDays[0]?.day?.maxtemp_c ?? cur.temp_c + 5,
        tempLow: apiDays[0]?.day?.mintemp_c ?? cur.temp_c - 5,
        condition: cur.condition.text,
        description: shortDesc(cur.condition.text),
        humidity: cur.humidity,
        uv: cur.uv,
        feelsLike: cur.feelslike_c,
        windSpeed: cur.wind_kph,
        windDesc: windDesc(cur.wind_kph),
        icon: mapConditionToIcon(cur.condition.text),
        color: mapColor(cur.condition.text),
      },
      forecast,
      updatedAt: new Date().toISOString(),
    };
  } catch {
    return getWeatherFixture(cityName);
  }
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
      c.city.toLowerCase().includes(normalized);
    if (matches) {
      seen.add(label);
      results.push(label);
    }
    if (results.length >= 8) break;
  }

  return results;
}
