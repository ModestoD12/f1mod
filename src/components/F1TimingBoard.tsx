import { useMemo } from 'react';
import { Driver, LapData, Position, RaceControlMessage, Session, Stint, Weather } from '../services/openF1Service';
import { retiredDrivers } from './RaceInsights';

interface F1TimingBoardProps {
  session: Session | null;
  drivers: Driver[];
  laps: LapData[];
  stints: Stint[];
  weather: Weather | null;
  raceControl: RaceControlMessage[];
  positions: Position[];
  selectedDriver?: number;
  onSelectDriver: (driverNumber: number) => void;
}

const COMPOUND_COLOR: Record<string, string> = {
  SOFT: '#ef4444',
  MEDIUM: '#facc15',
  HARD: '#f8fafc',
  INTERMEDIATE: '#22c55e',
  WET: '#38bdf8',
};

function formatLap(seconds?: number | null) {
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) return '—';
  const minutes = Math.floor(seconds / 60);
  const rest = (seconds - minutes * 60).toFixed(3).padStart(6, '0');
  return `${minutes}:${rest}`;
}

function formatDelta(value?: number | null) {
  if (value == null || !Number.isFinite(value)) return '—';
  if (Math.abs(value) < 0.0005) return formatLap(0).replace('0:00.000', '0.000');
  const sign = value > 0 ? '+' : '−';
  return `${sign}${Math.abs(value).toFixed(3)}`;
}

function validLap(lap: LapData) {
  return Number.isFinite(lap.lap_duration) && lap.lap_duration > 0 && !lap.is_pit_out_lap;
}

function sectorColor(value: number | null, personalBest: number | null, sessionBest: number | null) {
  if (value == null) return '#334155';
  if (sessionBest != null && Math.abs(value - sessionBest) < 0.001) return '#c084fc';
  if (personalBest != null && Math.abs(value - personalBest) < 0.001) return '#4ade80';
  return '#facc15';
}

export function F1TimingBoard({
  session,
  drivers,
  laps,
  stints,
  weather,
  raceControl,
  positions,
  selectedDriver,
  onSelectDriver,
}: F1TimingBoardProps) {
  const rows = useMemo(() => {
    const byDriver = new Map<number, LapData[]>();
    laps.forEach((lap) => {
      const list = byDriver.get(lap.driver_number) || [];
      list.push(lap);
      byDriver.set(lap.driver_number, list);
    });

    const sessionBest = {
      s1: Infinity,
      s2: Infinity,
      s3: Infinity,
    };
    laps.forEach((lap) => {
      if (lap.duration_sector_1 > 0) sessionBest.s1 = Math.min(sessionBest.s1, lap.duration_sector_1);
      if (lap.duration_sector_2 > 0) sessionBest.s2 = Math.min(sessionBest.s2, lap.duration_sector_2);
      if (lap.duration_sector_3 > 0) sessionBest.s3 = Math.min(sessionBest.s3, lap.duration_sector_3);
    });

    const retired = retiredDrivers(raceControl);
    const penalties = new Map<number, number>();
    raceControl.forEach((message) => {
      if (!message.driver_number) return;
      const text = `${message.category || ''} ${message.message || ''}`.toLowerCase();
      if (text.includes('penal') || text.includes('warning')) {
        penalties.set(message.driver_number, (penalties.get(message.driver_number) || 0) + 1);
      }
    });

    const built = drivers.map((driver) => {
      const driverLaps = byDriver.get(driver.driver_number) || [];
      const timed = driverLaps.filter(validLap);
      const best = timed.reduce<LapData | null>((winner, lap) => {
        if (!winner || lap.lap_duration < winner.lap_duration) return lap;
        return winner;
      }, null);
      const last = [...driverLaps].sort((a, b) => b.lap_number - a.lap_number)[0];
      const personal = {
        s1: Math.min(...timed.map((lap) => lap.duration_sector_1).filter((value) => value > 0), Infinity),
        s2: Math.min(...timed.map((lap) => lap.duration_sector_2).filter((value) => value > 0), Infinity),
        s3: Math.min(...timed.map((lap) => lap.duration_sector_3).filter((value) => value > 0), Infinity),
      };
      const driverStints = stints
        .filter((stint) => stint.driver_number === driver.driver_number)
        .sort((a, b) => a.stint_number - b.stint_number);
      const currentStint = driverStints[driverStints.length - 1];
      const referenceLap = last?.lap_number || currentStint?.lap_end || 0;
      const stintLaps = currentStint ? Math.max(1, referenceLap - currentStint.lap_start + 1) : 0;

      return {
        driver,
        best,
        last,
        speed: best?.st_speed || last?.st_speed || 0,
        personal,
        compound: currentStint?.compound || '',
        tyreAge: currentStint ? (currentStint.tyre_age_at_start || 0) + stintLaps : 0,
        stintLaps,
        pits: Math.max(0, driverStints.length - 1),
        penalties: penalties.get(driver.driver_number) || 0,
        retired: retired.has(driver.driver_number),
        lapNumber: last?.lap_number || 0,
      };
    }).filter((row) => row.best || row.last);

    const leaderTime = Math.min(...built.map((row) => row.best?.lap_duration || Infinity));
    const positionByDriver = new Map(positions.map((item) => [item.driver_number, item.position]));

    return built
      .map((row) => ({
        ...row,
        bestDelta: row.best ? row.best.lap_duration - leaderTime : null,
        lastDelta: row.last && row.best ? row.last.lap_duration - row.best.lap_duration : null,
        sectors: [
          sectorColor(row.last?.duration_sector_1 || null, row.personal.s1, sessionBest.s1),
          sectorColor(row.last?.duration_sector_2 || null, row.personal.s2, sessionBest.s2),
          sectorColor(row.last?.duration_sector_3 || null, row.personal.s3, sessionBest.s3),
        ],
        racePosition: positionByDriver.get(row.driver.driver_number) || 0,
      }))
      .sort((a, b) => {
        if (positions.length) return (a.racePosition || 99) - (b.racePosition || 99);
        return (a.best?.lap_duration || Infinity) - (b.best?.lap_duration || Infinity);
      })
      .map((row, index) => ({ ...row, position: row.racePosition || index + 1 }));
  }, [drivers, laps, positions, raceControl, stints]);

  const fastest = rows[0];
  const currentLap = rows.reduce((max, row) => Math.max(max, row.lapNumber), 0);

  if (!session) return null;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-500 bg-[#070b14] text-white">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-600 px-4 py-3">
        <div className="flex items-end gap-4">
          <div>
            <p className="text-xs font-semibold tracking-[0.2em] text-red-400">
              {session.country_code || session.country_name}
            </p>
            <p className="text-2xl font-black uppercase leading-none">{session.circuit_short_name}</p>
          </div>
          <p className="text-lg font-bold text-slate-200">
            L{currentLap || '—'} · {session.session_name}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm">
          <Stat label="Ar" value={weather ? `${weather.air_temperature.toFixed(0)}°C` : '—'} />
          <Stat label="Pista" value={weather ? `${weather.track_temperature.toFixed(0)}°C` : '—'} />
          <Stat label="Vento" value={weather ? `${(weather.wind_speed * 3.6).toFixed(0)} km/h` : '—'} />
          <Stat label="Chuva" value={weather ? (weather.rainfall ? 'Sim' : 'Não') : '—'} />
        </div>

        <div className="text-right">
          <p className="text-[11px] font-semibold tracking-[0.18em] text-slate-200">FASTEST LAP</p>
          <p className="text-xl font-black" style={{ color: '#d8b4fe' }}>
            {formatLap(fastest?.best?.lap_duration)}
            <span className="ml-2 text-base text-white">{fastest?.driver.name_acronym || ''}</span>
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-left text-sm">
          <thead>
            <tr className="text-[11px] uppercase tracking-wider text-slate-200">
              {['Pos', 'Piloto', 'Pneu', 'Melhor volta', 'Última volta', 'Setores', 'Pits'].map((label) => (
                <th key={label} className="px-3 py-2 font-semibold">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const selected = row.driver.driver_number === selectedDriver;
              const compoundColor = COMPOUND_COLOR[row.compound.toUpperCase()] || '#94a3b8';
              return (
                <tr
                  key={row.driver.driver_number}
                  onClick={() => onSelectDriver(row.driver.driver_number)}
                  className="cursor-pointer border-t border-slate-700"
                  style={{ backgroundColor: selected ? 'rgba(255,255,255,0.08)' : 'transparent' }}
                >
                  <td className="px-3 py-3 font-black">{row.position}</td>
                  <td className="px-3 py-3">
                    <div className="flex items-center gap-2">
                      <span className="h-8 w-1.5 rounded-full" style={{ backgroundColor: `#${row.driver.team_colour}` }} />
                      <div>
                        <p className="font-black tracking-wide">
                          {row.driver.broadcast_name || row.driver.last_name}
                          {row.retired && <span className="ml-2 text-xs font-black text-red-300">OUT</span>}
                        </p>
                        <p className="text-xs text-slate-200">{row.driver.team_name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-black" style={{ color: compoundColor }}>{row.compound || '—'}</p>
                    <p className="text-xs text-slate-200">
                      {row.stintLaps ? `${row.stintLaps} voltas · idade ${row.tyreAge}` : '—'}
                    </p>
                    {row.penalties > 0 && (
                      <p className="text-xs font-bold text-amber-300">{row.penalties} aviso/penalidade</p>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-bold" style={{ color: row.position === 1 ? '#c084fc' : '#4ade80' }}>
                      {row.position === 1 ? formatLap(row.best?.lap_duration) : formatDelta(row.bestDelta)}
                    </p>
                    <p className="text-xs text-slate-200">
                      {row.speed ? `${row.speed.toFixed(1)} km/h` : '—'}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-bold text-white">{formatLap(row.last?.lap_duration)}</p>
                    <p className="text-xs" style={{ color: (row.lastDelta || 0) > 0 ? '#facc15' : '#4ade80' }}>
                      {formatDelta(row.lastDelta)}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex gap-1">
                      {row.sectors.map((color, index) => (
                        <span key={index} className="h-2.5 w-8 rounded-sm" style={{ backgroundColor: color }} />
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-3 font-bold">{row.pits}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <p className="px-4 py-8 text-center text-white">
          Ainda não há voltas cronometradas nesta sessão.
        </p>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wider text-slate-200">{label}</p>
      <p className="font-black">{value}</p>
    </div>
  );
}
