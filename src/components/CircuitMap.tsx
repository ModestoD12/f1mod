import React, { useEffect, useState } from 'react';
import { CloudSun, Droplets, Thermometer, Wind } from 'lucide-react';
import { getRaceWeather, RaceWeather } from '../services/weatherService';

const CIRCUITS: Record<string, { key: number; year: number }> = {
  albert_park: { key: 10, year: 2022 },
  shanghai: { key: 49, year: 2019 },
  suzuka: { key: 46, year: 2025 },
  miami: { key: 151, year: 2022 },
  villeneuve: { key: 23, year: 2022 },
  monaco: { key: 22, year: 2022 },
  catalunya: { key: 15, year: 2023 },
  red_bull_ring: { key: 19, year: 2022 },
  silverstone: { key: 2, year: 2022 },
  spa: { key: 7, year: 2021 },
  hungaroring: { key: 4, year: 2021 },
  zandvoort: { key: 55, year: 2021 },
  monza: { key: 39, year: 2021 },
  baku: { key: 144, year: 2022 },
  marina_bay: { key: 61, year: 2023 },
  americas: { key: 9, year: 2021 },
  rodriguez: { key: 65, year: 2021 },
  interlagos: { key: 14, year: 2023 },
  vegas: { key: 152, year: 2023 },
  losail: { key: 150, year: 2023 },
  yas_marina: { key: 70, year: 2021 },
  jeddah: { key: 149, year: 2022 },
  bahrain: { key: 63, year: 2022 },
  sakhir: { key: 63, year: 2022 },
};

const pathCache = new Map<string, string>();

function outline(xs: number[], ys: number[]) {
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const width = maxX - minX || 1;
  const height = maxY - minY || 1;
  return xs
    .map((x, index) => {
      const px = ((x - minX) / width) * 100;
      const py = (1 - (ys[index] - minY) / height) * 100;
      return `${index === 0 ? 'M' : 'L'}${px.toFixed(2)} ${py.toFixed(2)}`;
    })
    .join(' ');
}

interface CircuitMapProps {
  circuitId?: string;
  circuitName?: string;
  weather?: string;
  latitude?: number;
  longitude?: number;
  date?: string;
  timeUtc?: string;
}

export function CircuitMap({ circuitId, circuitName, weather, latitude, longitude, date, timeUtc }: CircuitMapProps) {
  const [path, setPath] = useState<string | null>(circuitId ? pathCache.get(circuitId) || null : null);
  const [missing, setMissing] = useState(false);
  const [forecast, setForecast] = useState<RaceWeather | null>(null);
  const [forecastNote, setForecastNote] = useState<string | null>(null);

  useEffect(() => {
    const meta = circuitId ? CIRCUITS[circuitId] : undefined;
    if (!circuitId || !meta) {
      setPath(null);
      setMissing(true);
      return;
    }
    const cached = pathCache.get(circuitId);
    if (cached) {
      setPath(cached);
      setMissing(false);
      return;
    }

    let cancelled = false;
    setMissing(false);
    fetch(`https://api.multiviewer.app/api/v1/circuits/${meta.key}/${meta.year}`)
      .then((response) => {
        if (!response.ok) throw new Error('sem traçado');
        return response.json();
      })
      .then((data) => {
        if (cancelled || !Array.isArray(data.x) || !Array.isArray(data.y)) return;
        const next = outline(data.x, data.y);
        pathCache.set(circuitId, next);
        setPath(next);
      })
      .catch(() => {
        if (!cancelled) setMissing(true);
      });

    return () => {
      cancelled = true;
    };
  }, [circuitId]);

  useEffect(() => {
    if (latitude == null || longitude == null || !date || Number.isNaN(latitude) || Number.isNaN(longitude)) {
      setForecast(null);
      setForecastNote(null);
      return;
    }

    let cancelled = false;
    setForecast(null);
    setForecastNote(null);
    getRaceWeather(latitude, longitude, date, timeUtc)
      .then((next) => {
        if (!cancelled) setForecast(next);
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setForecastNote(error instanceof Error ? error.message : 'Previsão indisponível');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [latitude, longitude, date, timeUtc]);

  const summary = forecast?.summary || forecastNote || weather || 'Condições variáveis';

  return (
    <div className="rounded-2xl border border-slate-600 bg-slate-900 p-3 sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300">Traçado e setores</p>
          <h3 className="mt-1 truncate text-base font-black text-white">{circuitName || 'Circuito'}</h3>
        </div>
        <span className="shrink-0 rounded-full border border-red-500/40 bg-red-950/50 px-2 py-1 text-[9px] font-black uppercase tracking-wider text-red-200">S1 · S2 · S3</span>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sky-400/25 bg-slate-950/70 px-3 py-2.5 text-white shadow-inner">
        <div className="flex items-center gap-2">
          <CloudSun className="size-5 text-amber-300" aria-hidden="true" />
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-sky-200">Previsão do tempo</p>
            <p className="text-sm font-bold text-white">{summary}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-300">
          <span className="inline-flex items-center gap-1"><Thermometer className="size-3.5 text-orange-300" aria-hidden="true" /> {forecast ? `${forecast.temperature}°C` : '—°C'}</span>
          <span className="inline-flex items-center gap-1"><Droplets className="size-3.5 text-sky-300" aria-hidden="true" /> {forecast ? `${forecast.humidity}%` : '—%'}</span>
          <span className="hidden items-center gap-1 sm:inline-flex"><Wind className="size-3.5 text-slate-300" aria-hidden="true" /> {forecast ? `${forecast.windKmh} km/h` : '— km/h'}</span>
        </div>
      </div>
      {path ? (
        <>
        <svg viewBox="-4 -4 108 108" className="mx-auto mt-3 h-24 w-full max-w-xs sm:h-28 lg:h-32" role="img" aria-label={circuitName}>
          <path d={path} fill="none" stroke="#7f1d1d" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
          <path d={path} fill="none" stroke="#f8fafc" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
        <div className="mt-2 flex items-center justify-center gap-2 border-t border-slate-700/70 pt-3" aria-label="Setores da pista">
          {['S1', 'S2', 'S3'].map((sector) => (
            <span key={sector} className="rounded-md border border-red-500/40 bg-red-950/40 px-2.5 py-1 text-[10px] font-black tracking-widest text-red-200">{sector}</span>
          ))}
          <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">setores</span>
        </div>
        </>
      ) : (
        <p className="mt-6 text-sm text-white">
          {missing ? 'Traçado ainda não disponível para este circuito.' : 'Carregando traçado...'}
        </p>
      )}
    </div>
  );
}
