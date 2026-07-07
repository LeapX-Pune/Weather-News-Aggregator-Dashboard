# WeatherWise - Cinematic Weather & News Dashboard

WeatherWise is a modern, real-time weather and global news aggregator dashboard with a stunning cinematic aesthetic. It provides live weather updates, dynamic 7-day forecasts, and trending news in an elegant, responsive interface.

## 🚀 Features

- **Real-Time Weather Tracking**: Get instant updates on temperature, conditions, and location using the OpenWeather API.
- **Global News Aggregation**: Stay informed with live, categorised news updates powered by NewsAPI.
- **Cinematic UI/UX**: Features glassmorphism effects, dynamic backgrounds, and smooth micro-animations.
- **Accessible Design (a11y)**: Built with ARIA roles, semantic HTML, and proper focus management for screen readers and keyboard navigation.
- **Robust Error Handling**: Comprehensive loading skeletons, error states, and network failure feedback.

## 📁 Project Structure

The project follows a clean, modular JavaScript architecture without heavy frameworks:

- `/index.html` - The main dashboard entry point.
- `/css/`
  - `styles.css` - Core styling, responsive layout, and glassmorphism utilities.
  - `feedback.css` - Styles for loaders, toasts, and skeleton components.
- `/js/`
  - `app.js` - Application bootstrap and state management.
  - `weather.js` - OpenWeather API integration and weather data processing.
  - `newsapi.js` - NewsAPI integration and article generation.
  - `location.js` - Geolocation services and reverse geocoding.
  - `ui.js` - DOM manipulation and UI state management.
  - `feedback.js` - Loading screens, error toasts, and skeleton loaders.
  - `utils.js` - Shared utility functions.
  - `search.js` - Search bar functionality and event bindings.

## 🛠️ Setup & Installation

To run this dashboard locally, you will need active API keys for OpenWeather and NewsAPI.

1. **Clone the repository**
2. **Configure API Keys**: Open `js/weather.js` and `js/newsapi.js` and replace the placeholder API keys with your own.
   - [OpenWeather API](https://openweathermap.org/api)
   - [NewsAPI](https://newsapi.org/)
3. **Run a local server**: Since the app uses ES Modules, you need a local server (e.g. VS Code Live Server, or `python -m http.server`).
4. **Open in browser**: Navigate to `http://localhost:5500` (or your chosen port).

## 🤝 Contributing

When contributing to this project, please ensure:
1. Code follows the existing modular structure.
2. Accessibility standards (a11y) are maintained (contrast, ARIA roles).
3. New UI components utilize the existing `feedback.js` and `feedback.css` systems for loading/error states.

## 📄 License

This project is licensed under the MIT License.
