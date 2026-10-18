export interface RaceWeather {
  summary: string;
  temperature: number;
  humidity: number;
  windKmh: number;
  rainChance: number | null;
}

interface HourlyPayload {
  utc_offset_seconds?: number;
  hourly?: {
    time?: string[];
    temperature_2m?: number[];
    relative_humidity_2m?: number[];
    precipitation_probability?: number[];
    precipitation?: number[];
    wind_speed_10m?: number[];
    weather_code?: number[];
  };
}

const cache = new Map<string, RaceWeather>();

function weatherLabel(code: number): string {
  if (code === 0) return 'Céu limpo';
  if (code <= 3) return 'Parcialmente nublado';
  if (code <= 48) return 'Neblina';
  if (code <= 57) return 'Garoa';
  if (code <= 67) return 'Chuva';
  if (code <= 77) return 'Neve';
  if (code <= 82) return 'Pancadas de chuva';
  if (code <= 86) return 'Pancadas de neve';
  return 'Tempestade';
}

function dayOffset(date: string): number {
  const [year, month, day] = date.split('-').map(Number);
  const target = Date.UTC(year, month - 1, day);
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((target - today) / 86_400_000);
}

function pickIndex(payload: HourlyPayload, targetMs: number): number {
  const times = payload.hourly?.time || [];
  if (!times.length) return -1;
  const offset = payload.utc_offset_seconds || 0;
  let best = 0;
  let bestDiff = Infinity;
  times.forEach((stamp, index) => {
    const instant = new Date(`${stamp}:00Z`).getTime() - offset * 1000;
    const diff = Math.abs(instant - targetMs);
    if (diff < bestDiff) {
      best = index;
      bestDiff = diff;
    }
  });
  return best;
}

async function fetchHourly(url: string): Promise<HourlyPayload> {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Erro ao buscar previsão');
  return response.json();
}

export async function getRaceWeather(
  latitude: number,
  longitude: number,
  date: string,
  timeUtc?: string,
): Promise<RaceWeather> {
  const key = `${latitude.toFixed(3)}|${longitude.toFixed(3)}|${date}|${timeUtc || ''}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const offset = dayOffset(date);
  if (offset > 16) {
    throw new Error('A previsão abre cerca de 16 dias antes da corrida.');
  }

  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    start_date: date,
    end_date: date,
    hourly: 'temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m,weather_code',
    timezone: 'auto',
  });

  const base = offset < -5
    ? 'https://archive-api.open-meteo.com/v1/archive'
    : 'https://api.open-meteo.com/v1/forecast';

  if (offset < -5) {
    params.set('hourly', 'temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m,weather_code');
  }

  const payload = await fetchHourly(`${base}?${params.toString()}`);
  const target = new Date(`${date}T${(timeUtc || '15:00:00Z').replace('Z', '')}Z`);
  const index = pickIndex(payload, Number.isNaN(target.getTime()) ? Date.now() : target.getTime());
  const hourly = payload.hourly;
  if (index < 0 || !hourly?.temperature_2m) throw new Error('Previsão indisponível');

  const temperature = hourly.temperature_2m[index];
  const humidity = hourly.relative_humidity_2m?.[index] ?? 0;
  const windKmh = hourly.wind_speed_10m?.[index] ?? 0;
  const rainChance = hourly.precipitation_probability?.[index] ?? null;
  const code = hourly.weather_code?.[index] ?? 0;
  const rainNote = rainChance != null && rainChance >= 30 ? ` · ${Math.round(rainChance)}% de chuva` : '';

  const weather: RaceWeather = {
    summary: `${weatherLabel(code)}, ${Math.round(temperature)}°C${rainNote}`,
    temperature: Math.round(temperature),
    humidity: Math.round(humidity),
    windKmh: Math.round(windKmh),
    rainChance: rainChance == null ? null : Math.round(rainChance),
  };

  cache.set(key, weather);
  return weather;
}
