export async function fetchNews() {
  // Placeholder implementation. Replace this with a real news API call.
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { title: 'Local weather stays mild through the week', url: '#' },
        { title: 'Meteorologists expect light rain tomorrow', url: '#' },
        { title: 'Top tips to stay cool during warm days', url: '#' },
      ]);
    }, 600);
  });
}
