export async function fetchWeather(location) {
  // Placeholder implementation. Replace this with a real API call.
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        location,
        temperature: 22,
        description: 'Partly cloudy',
        humidity: 58,
      });
    }, 600);
  });
}
