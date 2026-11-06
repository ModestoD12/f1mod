import React, { useEffect, useState } from 'react';
import { Droplets, Thermometer, Wind } from 'lucide-react';
import { getRaceWeather, RaceWeather } from '../services/weatherService';
import { CircuitFacts, formatCircuitLength, getCircuitFacts } from '../services/f1CircuitService';
import './circuit-card.css';

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
  variant?: 'card' | 'tile';
}

export function CircuitMap({ circuitId, circuitName, weather, latitude, longitude, date, timeUtc, variant = 'card' }: CircuitMapProps) {
  const [path, setPath] = useState<string | null>(circuitId ? pathCache.get(circuitId) || null : null);
  const [missing, setMissing] = useState(false);
  const [forecast, setForecast] = useState<RaceWeather | null>(null);
  const [forecastNote, setForecastNote] = useState<string | null>(null);
  const [facts, setFacts] = useState<CircuitFacts | null>(null);

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
    setPath(circuitId ? pathCache.get(circuitId) || null : null);
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

  useEffect(() => {
    if (!circuitId) {
      setFacts(null);
      return;
    }

    let cancelled = false;
    setFacts(null);
    getCircuitFacts(circuitId)
      .then((next) => {
        if (!cancelled) setFacts(next);
      })
      .catch(() => {
        if (!cancelled) setFacts(null);
      });

    return () => {
      cancelled = true;
    };
  }, [circuitId]);

  const summary = forecast?.summary || forecastNote || weather || 'Condições variáveis';
  const place = [facts?.city, facts?.country].filter(Boolean).join(' · ');

  if (variant === 'tile') {
    const ready = Boolean(facts || forecast);
    return (
      <div className={`weekend-stage ${ready ? 'weekend-stage--ready' : ''}`}>
        <div className="weekend-tile__sheet">
          {path ? (
            <svg viewBox="-6 -6 112 112" role="img" aria-label={circuitName || 'Traçado'}>
              <path d={path} fill="none" stroke="#e10600" strokeWidth="5.5" strokeLinejoin="round" strokeLinecap="round" />
              <path d={path} fill="none" stroke="#ffffff" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
            </svg>
          ) : (
            <p>{missing ? 'Traçado indisponível' : 'Carregando traçado...'}</p>
          )}
        </div>
        <div className="weekend-stage__info">
          <p className="weekend-stage__kicker">{place || 'Circuito'}</p>
          <h3 className="weekend-stage__title">{facts?.circuitName || circuitName || 'Circuito'}</h3>
          <div className="weekend-stage__weather">
            <span><Thermometer className="size-3.5" aria-hidden="true" /> {forecast ? `${forecast.temperature}°C` : '—'}</span>
            <span><Droplets className="size-3.5" aria-hidden="true" /> {forecast ? `${forecast.humidity}%` : '—'}</span>
            <span><Wind className="size-3.5" aria-hidden="true" /> {forecast ? `${forecast.windKmh} km/h` : '—'}</span>
            <strong>{summary}</strong>
          </div>
          <div className="weekend-stage__stats">
            <div>
              <span>Comprimento</span>
              <strong>{formatCircuitLength(facts?.lengthMeters ?? null)}</strong>
            </div>
            <div>
              <span>Curvas</span>
              <strong>{facts?.corners ?? '—'}</strong>
            </div>
            <div>
              <span>Recorde</span>
              <strong>{facts?.lapRecord || '—'}</strong>
              {facts?.recordYear ? <small>{facts.recordYear}</small> : null}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className="prndl-circuit">
      <div className="prndl-circuit__top">
        <div>
          <p className="prndl-circuit__kicker">{place || 'Circuito'}</p>
          <h3 className="prndl-circuit__title">{facts?.circuitName || circuitName || 'Circuito'}</h3>
        </div>
        <span className="prndl-circuit__badge">Race</span>
      </div>
      <div className="prndl-circuit__weather">
        <div>
          <p className="prndl-circuit__weather-label">Previsão</p>
          <p className="prndl-circuit__weather-value">{summary}</p>
        </div>
        <div className="prndl-circuit__metrics">
          <span><Thermometer className="size-3.5" aria-hidden="true" /> {forecast ? `${forecast.temperature}°C` : '—'}</span>
          <span><Droplets className="size-3.5" aria-hidden="true" /> {forecast ? `${forecast.humidity}%` : '—'}</span>
          <span><Wind className="size-3.5" aria-hidden="true" /> {forecast ? `${forecast.windKmh} km/h` : '—'}</span>
        </div>
      </div>
      <div className="prndl-circuit__stats">
        <div className="prndl-circuit__stat">
          <span>Comprimento</span>
          <strong>{formatCircuitLength(facts?.lengthMeters ?? null)}</strong>
        </div>
        <div className="prndl-circuit__stat">
          <span>Curvas</span>
          <strong>{facts?.corners ?? '—'}</strong>
        </div>
        <div className="prndl-circuit__stat">
          <span>Recorde</span>
          <strong>{facts?.lapRecord || '—'}</strong>
          {facts?.recordYear ? <small>{facts.recordYear}</small> : null}
        </div>
      </div>
      {path ? (
        <svg viewBox="-4 -4 108 108" className="prndl-circuit__map" role="img" aria-label={circuitName}>
          <path d={path} fill="none" stroke="#e10600" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
          <path d={path} fill="none" stroke="#f8fafc" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      ) : (
        <p className="prndl-circuit__note">
          {missing ? 'Traçado ainda não disponível para este circuito.' : 'Carregando traçado...'}
        </p>
      )}
    </article>
  );
}
