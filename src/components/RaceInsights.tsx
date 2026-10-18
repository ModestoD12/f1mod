import { useMemo } from 'react';
import { Driver, LapData, Position, RaceControlMessage, Stint } from '../services/openF1Service';

const COMPOUND_COLOR: Record<string, string> = {
  SOFT: '#ef4444',
  MEDIUM: '#facc15',
  HARD: '#f8fafc',
  INTERMEDIATE: '#22c55e',
  WET: '#38bdf8',
};

interface RaceInsightsProps {
  drivers: Driver[];
  stints: Stint[];
  laps: LapData[];
  raceControl: RaceControlMessage[];
  positions: Position[];
  selectedDriver?: number;
}

function formatLap(seconds?: number | null) {
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) return '—';
  const minutes = Math.floor(seconds / 60);
  const rest = (seconds - minutes * 60).toFixed(3).padStart(6, '0');
  return `${minutes}:${rest}`;
}

function formatClock(date: string) {
  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return '';
  return value.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function trackStatus(messages: RaceControlMessage[]) {
  let status = { label: 'Pista livre', tone: 'green' as const };
  [...messages]
    .sort((a, b) => a.date.localeCompare(b.date))
    .forEach((message) => {
      const text = `${message.flag || ''} ${message.category || ''} ${message.message || ''}`.toUpperCase();
      const ending = text.includes('ENDING') || text.includes('IN THIS LAP');
      if (text.includes('VIRTUAL SAFETY CAR')) {
        status = ending
          ? { label: 'VSC encerrando', tone: 'amber' }
          : { label: 'Virtual Safety Car', tone: 'amber' };
      } else if (text.includes('SAFETY CAR')) {
        status = ending
          ? { label: 'Safety car entrando', tone: 'amber' }
          : { label: 'Safety Car', tone: 'amber' };
      } else if (message.flag === 'RED' || text.includes('RED FLAG')) {
        status = { label: 'Bandeira vermelha', tone: 'red' };
      } else if (message.flag === 'YELLOW' || message.flag === 'DOUBLE YELLOW') {
        status = { label: 'Bandeira amarela', tone: 'yellow' };
      } else if (message.flag === 'CHEQUERED') {
        status = { label: 'Bandeira quadriculada', tone: 'slate' };
      } else if (message.flag === 'GREEN' || message.flag === 'CLEAR' || text.includes('TRACK CLEAR') || text.includes('GREEN FLAG')) {
        status = { label: 'Pista livre', tone: 'green' };
      }
    });
  return status;
}

export function retiredDrivers(messages: RaceControlMessage[]) {
  const retired = new Set<number>();
  messages.forEach((message) => {
    const text = (message.message || '').toLowerCase();
    if (!message.driver_number) return;
    if (text.includes('retired') || text.includes('out of the race') || text.includes('did not start')) {
      retired.add(message.driver_number);
    }
  });
  return retired;
}

const STATUS_STYLE = {
  green: 'border-emerald-400/40 bg-emerald-950/50 text-emerald-200',
  amber: 'border-amber-400/50 bg-amber-950/60 text-amber-100',
  yellow: 'border-yellow-400/50 bg-yellow-950/50 text-yellow-100',
  red: 'border-red-400/50 bg-red-950/60 text-red-100',
  slate: 'border-slate-400/50 bg-slate-800 text-slate-100',
};

export function RaceInsights({
  drivers,
  stints,
  laps,
  raceControl,
  positions,
  selectedDriver,
}: RaceInsightsProps) {
  const status = trackStatus(raceControl);
  const positionByDriver = new Map(positions.map((item) => [item.driver_number, item.position]));

  const strategy = useMemo(() => {
    const sessionLaps = Math.max(
      1,
      ...laps.map((lap) => lap.lap_number || 0),
      ...stints.map((stint) => stint.lap_end || stint.lap_start || 0),
    );
    return drivers
      .map((driver) => {
        const driverStints = stints
          .filter((stint) => stint.driver_number === driver.driver_number)
          .sort((a, b) => a.stint_number - b.stint_number)
          .map((stint) => {
            const end = stint.lap_end && stint.lap_end >= stint.lap_start ? stint.lap_end : sessionLaps;
            return { ...stint, laps: Math.max(1, end - stint.lap_start + 1) };
          });
        return { driver, driverStints };
      })
      .filter((row) => row.driverStints.length)
      .sort((a, b) => (positionByDriver.get(a.driver.driver_number) || 99) - (positionByDriver.get(b.driver.driver_number) || 99));
  }, [drivers, laps, positions, stints]);

  const lapChart = useMemo(() => {
    const timed = laps
      .filter((lap) => lap.driver_number === selectedDriver && lap.lap_duration > 0)
      .sort((a, b) => a.lap_number - b.lap_number);
    if (!timed.length) return [];
    const fastest = Math.min(...timed.map((lap) => lap.lap_duration));
    const slowest = Math.max(...timed.map((lap) => lap.lap_duration));
    const span = Math.max(0.001, slowest - fastest);
    return timed.map((lap) => ({
      ...lap,
      height: 18 + ((slowest - lap.lap_duration) / span) * 62,
      fastest: Math.abs(lap.lap_duration - fastest) < 0.001,
    }));
  }, [laps, selectedDriver]);

  const feed = [...raceControl].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
  const selected = drivers.find((driver) => driver.driver_number === selectedDriver);

  return (
    <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
      <div className="rounded-2xl border border-slate-500 bg-[#070b14] p-4 text-white">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-300">Estratégia de pneus</p>
            <h3 className="text-lg font-black">Stints da sessão</h3>
          </div>
          <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-wide ${STATUS_STYLE[status.tone]}`}>
            {status.label}
          </span>
        </div>
        {strategy.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-200">Os compostos aparecem quando a sessão registra os stints.</p>
        ) : (
          <div className="space-y-2">
            {strategy.map(({ driver, driverStints }) => (
              <div key={driver.driver_number} className="grid grid-cols-[3.2rem_1fr] items-center gap-2">
                <span className="text-xs font-black" style={{ color: `#${driver.team_colour || 'e2e8f0'}` }}>
                  {driver.name_acronym}
                </span>
                <div className="flex h-5 overflow-hidden rounded-md bg-slate-800">
                  {driverStints.map((stint) => (
                    <div
                      key={`${driver.driver_number}-${stint.stint_number}`}
                      title={`${stint.compound} · ${stint.laps} voltas`}
                      className="flex h-full min-w-4 items-center justify-center border-r border-black/30 text-[9px] font-black text-slate-950"
                      style={{
                        flexGrow: stint.laps,
                        backgroundColor: COMPOUND_COLOR[stint.compound?.toUpperCase()] || '#94a3b8',
                      }}
                    >
                      {stint.compound?.slice(0, 1)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-4">
        <div className="rounded-2xl border border-slate-500 bg-[#070b14] p-4 text-white">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-300">Direção de prova</p>
          <h3 className="mb-3 text-lg font-black">Race control</h3>
          {feed.length === 0 ? (
            <p className="py-6 text-sm text-slate-200">Nenhuma mensagem nesta sessão.</p>
          ) : (
            <ul className="space-y-2">
              {feed.map((message, index) => (
                <li key={`${message.date}-${index}`} className="rounded-lg border border-slate-700 bg-slate-950/70 px-3 py-2">
                  <div className="mb-1 flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-wide text-slate-300">
                    <span>{message.flag || message.category || 'Info'}</span>
                    <span>{formatClock(message.date)}</span>
                  </div>
                  <p className="text-sm font-semibold leading-snug text-white">{message.message}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-slate-500 bg-[#070b14] p-4 text-white">
          <div className="mb-3 flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-300">Ritmo</p>
              <h3 className="text-lg font-black">{selected ? `Voltas de ${selected.name_acronym}` : 'Voltas'}</h3>
            </div>
            {lapChart.some((lap) => lap.fastest) && (
              <p className="text-xs font-bold text-purple-300">
                Melhor {formatLap(lapChart.find((lap) => lap.fastest)?.lap_duration)}
              </p>
            )}
          </div>
          {lapChart.length === 0 ? (
            <p className="py-6 text-sm text-slate-200">Selecione um piloto com volta cronometrada.</p>
          ) : (
            <div className="flex h-28 items-end gap-1 overflow-x-auto">
              {lapChart.map((lap) => (
                <div key={lap.lap_number} className="flex h-full w-4 shrink-0 flex-col justify-end" title={`V${lap.lap_number} ${formatLap(lap.lap_duration)}`}>
                  <div
                    className="w-full rounded-sm"
                    style={{
                      height: `${lap.height}%`,
                      backgroundColor: lap.is_pit_out_lap ? '#facc15' : lap.fastest ? '#c084fc' : '#38bdf8',
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
