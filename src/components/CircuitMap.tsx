import React, { useEffect, useState } from 'react';

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
}

export function CircuitMap({ circuitId, circuitName }: CircuitMapProps) {
  const [path, setPath] = useState<string | null>(circuitId ? pathCache.get(circuitId) || null : null);
  const [missing, setMissing] = useState(false);

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

  return (
    <div className="rounded-2xl border border-slate-600 bg-slate-900 p-5">
      <p className="text-xs font-bold uppercase tracking-wide text-slate-200">Traçado</p>
      <h3 className="mt-1 text-lg font-black text-white">{circuitName || 'Circuito'}</h3>
      {path ? (
        <svg viewBox="-4 -4 108 108" className="mx-auto mt-4 h-64 w-full max-w-md" role="img" aria-label={circuitName}>
          <path d={path} fill="none" stroke="#7f1d1d" strokeWidth="5" strokeLinejoin="round" strokeLinecap="round" />
          <path d={path} fill="none" stroke="#f8fafc" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
      ) : (
        <p className="mt-6 text-sm text-white">
          {missing ? 'Traçado ainda não disponível para este circuito.' : 'Carregando traçado...'}
        </p>
      )}
    </div>
  );
}
