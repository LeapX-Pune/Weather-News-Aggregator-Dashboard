export function renderWeather(weather) {
  const output = document.getElementById('weather-output');
  output.innerHTML = `
    <p><strong>${weather.location}</strong></p>
    <p>${weather.description}</p>
    <p>Temperature: ${weather.temperature}°C</p>
    <p>Humidity: ${weather.humidity}%</p>
  `;
}

export function renderNews(articles) {
  const output = document.getElementById('news-output');
  output.innerHTML = articles
    .map(
      (article) => `
        <div class="news-item">
          <a href="${article.url}">${article.title}</a>
        </div>
      `
    )
    .join('');
}

export function showError(elementId, message) {
  const output = document.getElementById(elementId);
  output.textContent = `Error: ${message}`;
}
