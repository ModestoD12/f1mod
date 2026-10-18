import React, { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import {
  RefreshCw,
  AlertCircle,
  Loader2,
  Gauge,
  Thermometer,
  Wind,
  Droplets,
  Activity,
  MapPin,
} from 'lucide-react';
import { useF1Telemetry } from '../hooks/useF1Telemetry';
import { F1TimingBoard } from './F1TimingBoard';
import { Driver, LocationPoint, Weather } from '../services/openF1Service';

function LoadingSpinner({ text = 'Carregando...' }: { text?: string }) {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-red-500" />
      <span className="ml-3 text-slate-400">{text}</span>
    </div>
  );
}

function ErrorMessage({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
      <p className="text-slate-400 mb-4">{message}</p>
      <Button onClick={onRetry} variant="outline" size="sm" className="border-slate-600">
        <RefreshCw className="h-4 w-4 mr-2" />
        Tentar novamente
      </Button>
    </div>
  );
}

function drsLabel(drs?: number) {
  if (drs == null) return { text: '—', on: false, available: false };
  if (drs >= 10) return { text: 'DRS ON', on: true, available: true };
  if (drs === 8) return { text: 'DRS disponível', on: false, available: true };
  return { text: 'DRS off', on: false, available: false };
}

function Meter({
  label,
  value,
  max,
  unit,
  color,
}: {
  label: string;
  value: number;
  max: number;
  unit: string;
  color: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm text-white">
        <span className="font-medium">{label}</span>
        <span className="font-mono font-semibold">
          {Math.round(value)}
          {unit}
        </span>
      </div>
      <div className="h-3 rounded-full bg-slate-600 overflow-hidden">
        <div
          className={`h-full rounded-full ${color} transition-all duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function TrackMap({
  locations,
  drivers,
  selectedDriver,
  onSelectDriver,
}: {
  locations: LocationPoint[];
  drivers: Driver[];
  selectedDriver?: number;
  onSelectDriver: (n: number) => void;
}) {
  const mapped = useMemo(() => {
    if (!locations.length) return [];
    const xs = locations.map((p) => p.x);
    const ys = locations.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    const pad = 24;
    const w = 640;
    const h = 360;
    const spanX = Math.max(1, maxX - minX);
    const spanY = Math.max(1, maxY - minY);

    return locations.map((point) => {
      const driver = drivers.find((d) => d.driver_number === point.driver_number);
      return {
        ...point,
        cx: pad + ((point.x - minX) / spanX) * (w - pad * 2),
        cy: pad + ((maxY - point.y) / spanY) * (h - pad * 2),
        colour: driver?.team_colour ? `#${driver.team_colour}` : '#94a3b8',
        acronym: driver?.name_acronym || `#${point.driver_number}`,
      };
    });
  }, [locations, drivers]);

  if (!locations.length) {
    return (
      <div className="h-[360px] flex flex-col items-center justify-center rounded-xl border border-slate-500 bg-slate-950 text-center px-6">
        <MapPin className="h-10 w-10 mb-3 text-red-400" />
        <p className="text-base font-semibold text-white">Pista fora do ar</p>
        <p className="text-sm text-white mt-2 max-w-md">
          O traçado e a posição dos carros aparecem ao vivo no treino, na classificação e na corrida.
        </p>
      </div>
    );
  }

  return (
    <svg viewBox="0 0 640 360" className="w-full h-auto rounded-xl bg-[#0b1220] border-2 border-slate-400">
      <rect width="640" height="360" fill="#0b1220" />
      {mapped.map((point) => {
        const selected = point.driver_number === selectedDriver;
        return (
          <g
            key={point.driver_number}
            className="cursor-pointer"
            onClick={() => onSelectDriver(point.driver_number)}
          >
            <circle
              cx={point.cx}
              cy={point.cy}
              r={selected ? 12 : 7}
              fill={point.colour}
              stroke="#ffffff"
              strokeWidth={selected ? 3 : 1.5}
            />
            {selected && (
              <>
                <rect
                  x={point.cx + 16}
                  y={point.cy - 12}
                  width={point.acronym.length * 10 + 16}
                  height={22}
                  rx={6}
                  fill="#020617"
                  stroke="#ffffff"
                />
                <text
                  x={point.cx + 24}
                  y={point.cy + 4}
                  fontSize="13"
                  fill="#ffffff"
                  fontWeight={700}
                >
                  {point.acronym}
                </text>
              </>
            )}
          </g>
        );
      })}
    </svg>
  );
}

function WeatherPanel({ weather }: { weather: Weather | null }) {
  const items = [
    {
      icon: Thermometer,
      label: 'Pista',
      value: weather ? `${weather.track_temperature.toFixed(1)}°C` : '—',
      color: 'text-orange-400',
    },
    {
      icon: Thermometer,
      label: 'Ar',
      value: weather ? `${weather.air_temperature.toFixed(1)}°C` : '—',
      color: 'text-sky-400',
    },
    {
      icon: Droplets,
      label: 'Umidade',
      value: weather ? `${Math.round(weather.humidity)}%` : '—',
      color: 'text-cyan-400',
    },
    {
      icon: Wind,
      label: 'Vento',
      value: weather ? `${weather.wind_speed.toFixed(1)} m/s` : '—',
      color: 'text-slate-300',
    },
    {
      icon: Activity,
      label: 'Pressão',
      value: weather ? `${Math.round(weather.pressure)} hPa` : '—',
      color: 'text-emerald-400',
    },
    {
      icon: Droplets,
      label: 'Chuva',
      value: weather ? (weather.rainfall ? 'Sim' : 'Não') : '—',
      color: weather?.rainfall ? 'text-blue-400' : 'text-slate-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {items.map((item) => (
        <div key={item.label} className="rounded-xl border border-slate-400 bg-slate-800 p-3">
          <div className="flex items-center gap-2 text-sm font-semibold text-white mb-1">
            <item.icon className={`h-4 w-4 ${item.color}`} />
            {item.label}
          </div>
          <p className="text-2xl font-bold text-white">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

export function OpenF1Dashboard() {
  const [selectedDriver, setSelectedDriver] = useState<number | undefined>(undefined);
  const { session, drivers, weather, locations, laps, stints, raceControl, positions, carData, loading, error, refetch } =
    useF1Telemetry(selectedDriver);

  const activeDriver =
    drivers.find((d) => d.driver_number === selectedDriver) ||
    drivers.find((d) => d.driver_number === carData?.driver_number) ||
    drivers[0];

  const sessionDate = session ? new Date(session.date_start) : null;
  const endDate = session ? new Date(session.date_end) : null;
  const now = new Date();
  const isLive = !!(sessionDate && endDate && now >= sessionDate && now <= endDate);
  const drs = drsLabel(carData?.drs);

  const teams = useMemo(() => {
    const grouped = new Map<string, Driver[]>();
    drivers.forEach((driver) => {
      const list = grouped.get(driver.team_name) || [];
      list.push(driver);
      grouped.set(driver.team_name, list);
    });
    return [...grouped.entries()];
  }, [drivers]);

  if (loading && !session) return <LoadingSpinner text="Conectando telemetria OpenF1..." />;
  if (error && !session) return <ErrorMessage message={error} onRetry={refetch} />;

  return (
    <div className="space-y-6">
      {error && session && (
        <div className="rounded-lg border border-amber-700/50 bg-amber-950/40 px-4 py-2 text-sm text-amber-200">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-red-600 to-red-700 rounded-xl shadow-lg shadow-red-600/30">
            <Gauge className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">Telemetria ao vivo</h2>
            <p className="text-sm text-white">
              Carros e pista via OpenF1
              {session ? ` • ${session.session_name} • ${session.circuit_short_name}` : ''}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            className={
              isLive
                ? 'bg-red-600/20 text-red-400 border border-red-600/30 px-3 py-1'
                : 'bg-slate-700/40 text-slate-300 border border-slate-600 px-3 py-1'
            }
          >
            <span
              className={`w-2 h-2 rounded-full inline-block mr-2 ${
                isLive ? 'bg-red-500 animate-pulse' : 'bg-slate-500'
              }`}
            />
            {isLive ? 'Sessão ao vivo' : 'Última sessão'}
          </Badge>
          <Button onClick={refetch} variant="ghost" size="sm" className="text-slate-400 hover:text-white">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading && laps.length === 0 ? (
        <LoadingSpinner text="Montando o timing da sessão..." />
      ) : (
        <F1TimingBoard
          session={session}
          drivers={drivers}
          laps={laps}
          stints={stints}
          weather={weather}
          raceControl={raceControl}
          positions={positions}
          selectedDriver={activeDriver?.driver_number}
          onSelectDriver={setSelectedDriver}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {teams.map(([team, members]) => (
          <div key={team} className="rounded-xl border border-slate-700/80 bg-slate-950/70 px-3 py-2.5">
            <div className="mb-2 flex items-center gap-2">
              <span
                className="size-2.5 rounded-full"
                style={{ backgroundColor: `#${members[0]?.team_colour || '64748b'}` }}
              />
              <p className="truncate text-xs font-bold uppercase tracking-wide text-slate-200">{team}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {members.map((driver) => {
                const selected = activeDriver?.driver_number === driver.driver_number;
                return (
                  <button
                    key={driver.driver_number}
                    onClick={() => setSelectedDriver(driver.driver_number)}
                    aria-pressed={selected}
                    className="flex min-w-0 items-center justify-between rounded-lg border px-3 py-2 text-left transition-colors hover:bg-slate-700/80"
                    style={{
                      backgroundColor: selected ? '#f8fafc' : '#1e293b',
                      borderColor: `#${driver.team_colour || '94a3b8'}`,
                      color: selected ? '#020617' : '#ffffff',
                    }}
                  >
                    <span className="text-base font-black leading-none">{driver.name_acronym}</span>
                    <span className="text-xs font-semibold" style={{ color: selected ? '#334155' : '#cbd5e1' }}>
                      #{driver.driver_number}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 items-start">
        <Card className="min-w-0 bg-slate-900 border-slate-400 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white flex items-center gap-2">
              <MapPin className="h-5 w-5 text-red-400" />
              Telemetria da pista
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <TrackMap
              locations={locations}
              drivers={drivers}
              selectedDriver={activeDriver?.driver_number}
              onSelectDriver={setSelectedDriver}
            />
            <WeatherPanel weather={weather} />
          </CardContent>
        </Card>

        <Card className="xl:col-span-2 bg-slate-900 border-slate-400 text-white">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-white flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <Gauge className="h-5 w-5 text-red-400" />
                {activeDriver ? activeDriver.full_name : 'Telemetria do carro'}
              </span>
              {activeDriver && (
                <span
                  className="text-xs px-2 py-1 rounded-md font-bold"
                  style={{ backgroundColor: '#ffffff', color: '#020617' }}
                >
                  {activeDriver.team_name}
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!carData ? (
              <div className="py-10 text-center">
                <Activity className="h-10 w-10 mx-auto mb-3 text-red-400" />
                <p className="text-base font-semibold text-white">Sem amostra do carro agora</p>
                <p className="text-sm text-slate-200 mt-2">
                  Velocidade, RPM, marcha, acelerador, freio e DRS entram ao vivo no treino, na classificação e na corrida.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl bg-slate-950 border border-slate-400 p-4 text-center">
                    <p className="text-xs uppercase tracking-wider text-slate-200 font-semibold">Velocidade</p>
                    <p className="text-3xl font-bold text-white mt-1">{Math.round(carData.speed)}</p>
                    <p className="text-sm text-slate-200">km/h</p>
                  </div>
                  <div className="rounded-xl bg-slate-950 border border-slate-400 p-4 text-center">
                    <p className="text-xs uppercase tracking-wider text-slate-200 font-semibold">Marcha</p>
                    <p className="text-3xl font-bold text-white mt-1">{carData.n_gear}</p>
                    <p className="text-sm text-slate-200">gear</p>
                  </div>
                  <div className="rounded-xl bg-slate-950 border border-slate-400 p-4 text-center">
                    <p className="text-xs uppercase tracking-wider text-slate-200 font-semibold">RPM</p>
                    <p className="text-3xl font-bold text-white mt-1">{Math.round(carData.rpm).toLocaleString('pt-BR')}</p>
                    <p className="text-sm text-slate-200">rpm</p>
                  </div>
                </div>

                <Meter label="Acelerador" value={carData.throttle} max={100} unit="%" color="bg-emerald-500" />
                <Meter label="Freio" value={carData.brake} max={100} unit="%" color="bg-red-500" />
                <Meter label="RPM" value={carData.rpm} max={15000} unit="" color="bg-amber-500" />

                <div
                  className={`rounded-xl px-4 py-3 text-center font-semibold border ${
                    drs.on
                      ? 'bg-purple-600/20 border-purple-400 text-purple-200'
                      : drs.available
                        ? 'bg-slate-800 border-purple-700/50 text-purple-300'
                        : 'bg-slate-800 border-slate-300 text-white'
                  }`}
                >
                  {drs.text}
                </div>
                <p className="text-xs text-slate-200 text-right">
                  Amostra {new Date(carData.date).toLocaleTimeString('pt-BR')}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default OpenF1Dashboard;
