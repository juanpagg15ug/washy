export function calculateDryingHours(temp: number, humidity: number, cloudCover: number): number {
  let hours = 3;
  if (temp < 15) hours += 1.5;
  else if (temp > 25) hours -= 1;
  if (humidity > 70) hours += 1.5;
  else if (humidity < 40) hours -= 0.5;
  if (cloudCover > 60) hours += 1;
  return Math.max(1, Math.round(hours));
}

export async function fetchDryingEstimate(): Promise<{ dryingHours: number, sunsetHour: number }> {
  try {
    const ipRes = await fetch('https://get.geojs.io/v1/ip/geo.json');
    const ipData = await ipRes.json();
    if (ipData.latitude && ipData.longitude) {
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${ipData.latitude}&longitude=${ipData.longitude}&daily=sunset&current=temperature_2m,relative_humidity_2m,cloud_cover&timezone=auto`);
      const weatherData = await weatherRes.json();
      if (weatherData?.daily?.sunset?.[0] && weatherData?.current) {
        const sunsetHour = new Date(weatherData.daily.sunset[0]).getHours();
        const { temperature_2m, relative_humidity_2m, cloud_cover } = weatherData.current;
        const dryingHours = calculateDryingHours(temperature_2m, relative_humidity_2m, cloud_cover);
        return { dryingHours, sunsetHour };
      }
    }
  } catch (e) {
    console.warn('No se pudo obtener el clima real, usando defaults.', e);
  }
  return { dryingHours: 4, sunsetHour: 18 };
}

