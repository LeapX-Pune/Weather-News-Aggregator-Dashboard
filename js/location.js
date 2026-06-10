// DATA CONTRACT: The location object passed to Weather and News modules
/*
{
    lat: 18.5204,          // Numeric latitude
    lon: 73.8567,          // Numeric longitude
    city: "Pune",          // String city name (for manual search or reverse geocoding)
    countryCode: "IN"      // 2-letter ISO country code (required for NewsAPI)
}
*/

/*
 * Attempts to automatically get the user's browser coordinates.
 * @returns {Promise<Object>} Resolves with the standard location object.
 */
async function getAutomaticLocation() {
    console.log("Attempting to get browser geolocation...");
    // TODO: Implement navigator.geolocation.getCurrentPosition
}

/**
 * Validates and processes a city name typed manually by the user.
 * @param {string} cityName 
 * @returns {Promise<Object>} Resolves with coordinates and country code for the city.
 */
async function getManualLocation(cityName) {
    console.log(`Processing manual search for city: ${cityName}`);
    // TODO: Connect to geocoding to turn string city into coordinates
}

// Export the functions so app.js can use them
export { getAutomaticLocation, getManualLocation };