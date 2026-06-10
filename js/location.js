/**
 * @file location.js
 * @description Handles tracking using the WeatherAPI.com provider platform.
 */

// Your active key copied from Screenshot 2026-06-10 at 3.11.36 PM.jpg
window.WEATHER_API_KEY = 'c73ce7602d1f44e8b6c91526261006'; 

/**
 * Attempts to automatically get the user's browser coordinates and fetches details.
 * @returns {Promise<Object>} Resolves with the standard location object contract.
 */
export async function getAutomaticLocation() {
    console.log("Location Service: Requesting browser geolocation...");

    if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported by your browser.");
    }

    return new Promise((resolve, reject) => {
        const options = {
            enableHighAccuracy: true,
            timeout: 8000,
            maximumAge: 0
        };

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                console.log(`Location Service: Found coordinates (${latitude}, ${longitude})`);

                try {
                    // WeatherAPI.com allows passing lat,lon straight into the 'q' parameter!
                    const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${window.WEATHER_API_KEY}&q=${latitude},${longitude}`;
                    
                    const response = await fetch(apiUrl);
                    if (!response.ok) throw new Error("Failed to fetch location metadata from WeatherAPI.");
                    
                    const data = await response.json();
                    
                    // Extract data from WeatherAPI response layout structure
                    const city = data.location.name;
                    const countryCode = data.location.country.toLowerCase();

                    resolve({
                        lat: latitude,
                        lon: longitude,
                        city: city,
                        countryCode: countryCode === "united states of america" || countryCode === "usa" ? "us" : countryCode.substring(0, 2)
                    });
                } catch (error) {
                    console.error("Failed parsing WeatherAPI data:", error);
                    resolve({ lat: latitude, lon: longitude, city: "Local Area", countryCode: "us" });
                }
            },
            (error) => {
                reject(new Error("User denied or timed out geolocation tracking access."));
            },
            options
        );
    });
}

/**
 * Processes a text input city name manually searched by a user.
 * @param {string} cityName 
 * @returns {Promise<Object>} Resolves with coordinates and country validation parameters.
 */
export async function getManualLocation(cityName) {
    if (!cityName || cityName.trim() === "") {
        throw new Error("Please enter a valid city name.");
    }

    console.log(`Location Service: Searching WeatherAPI for city string: "${cityName}"`);
    
    const apiUrl = `https://api.weatherapi.com/v1/current.json?key=${window.WEATHER_API_KEY}&q=${encodeURIComponent(cityName)}`;
    
    const response = await fetch(apiUrl);
    
    // Day 4 matrix requirement: Handle fake/invalid city errors cleanly
    if (!response.ok) {
        throw new Error("City not found");
    }
    
    const data = await response.json();
    
    const { lat, lon, name, country } = data.location;
    const resolvedCountry = country.toLowerCase();

    return {
        lat,
        lon,
        city: name,
        countryCode: resolvedCountry === "united states of america" || resolvedCountry === "usa" ? "us" : resolvedCountry.substring(0, 2)
    };
}