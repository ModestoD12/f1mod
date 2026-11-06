import { useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import { f1StandingsApi } from '../services/f1StandingsService';
import { Driver, LapData, Position, Session, Stint } from '../services/openF1Service';
import './live-timing.css';

interface F1TimingBoardProps {
  session: Session | null;
  drivers: Driver[];
  laps: LapData[];
  stints: Stint[];
  positions: Position[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

const COMPOUND: Record<string, { label: string; color: string }> = {
  SOFT: { label: 'S', color: '#e10600' },
  MEDIUM: { label: 'M', color: '#f5c451' },
  HARD: { label: 'H', color: '#f4f4f5' },
  INTERMEDIATE: { label: 'I', color: '#3ddc6a' },
  WET: { label: 'W', color: '#4aa3ff' },
};

function formatLap(seconds?: number | null) {
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) return '—';
  const minutes = Math.floor(seconds / 60);
  const rest = (seconds - minutes * 60).toFixed(3).padStart(6, '0');
  return `${minutes}:${rest}`;
}

function formatSector(seconds?: number | null) {
  if (seconds == null || !Number.isFinite(seconds) || seconds <= 0) return '—';
  return seconds.toFixed(3);
}

function formatDelta(value?: number | null) {
  if (value == null || !Number.isFinite(value)) return null;
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  return `${sign}${Math.abs(value).toFixed(3)}`;
}

function validLap(lap: LapData) {
  return Number.isFinite(lap.lap_duration) && lap.lap_duration > 0 && !lap.is_pit_out_lap;
}

const SECTOR_CLOSE = 0.1;

function sectorTone(current?: number | null, previous?: number | null, sessionBest?: number | null) {
  if (current != null && current > 0 && sessionBest != null && sessionBest < Infinity && Math.abs(current - sessionBest) < 0.001) {
    return ' is-purple';
  }
  if (current == null || previous == null || !(current > 0) || !(previous > 0)) return '';
  const delta = current - previous;
  if (delta < -SECTOR_CLOSE) return ' is-green';
  if (delta > SECTOR_CLOSE) return ' is-yellow';
  return '';
}

function earlierSector(laps: LapData[], last: LapData | undefined, key: 'duration_sector_1' | 'duration_sector_2' | 'duration_sector_3') {
  if (!last) return null;
  for (let index = laps.length - 1; index >= 0; index -= 1) {
    const lap = laps[index];
    if (lap.lap_number >= last.lap_number) continue;
    if (lap[key] > 0) return lap[key];
  }
  return null;
}

function teamLogo(teamName: string) {
  const name = teamName.toLowerCase();
  const id = name.includes('racing bull')
    ? 'rb'
    : name.includes('red bull')
      ? 'red_bull'
      : name.includes('mercedes')
        ? 'mercedes'
        : name.includes('ferrari')
          ? 'ferrari'
          : name.includes('mclaren')
            ? 'mclaren'
            : name.includes('alpine')
              ? 'alpine'
              : name.includes('haas')
                ? 'haas'
                : name.includes('audi')
                  ? 'audi'
                  : name.includes('williams')
                    ? 'williams'
                    : name.includes('aston')
                      ? 'aston_martin'
                      : name.includes('cadillac')
                        ? 'cadillac'
                        : '';
  return id ? f1StandingsApi.getTeamLogo(id) : null;
}

export function F1TimingBoard({
  session,
  drivers,
  laps,
  stints,
  positions,
  loading,
  error,
  onRefresh,
}: F1TimingBoardProps) {
  const rows = useMemo(() => {
    const byDriver = new Map<number, LapData[]>();
    laps.forEach((lap) => {
      const list = byDriver.get(lap.driver_number) || [];
      list.push(lap);
      byDriver.set(lap.driver_number, list);
    });

    let sessionBestLap = Infinity;
    const sessionBestSector = { s1: Infinity, s2: Infinity, s3: Infinity };
    laps.forEach((lap) => {
      if (validLap(lap)) sessionBestLap = Math.min(sessionBestLap, lap.lap_duration);
      if (lap.duration_sector_1 > 0) sessionBestSector.s1 = Math.min(sessionBestSector.s1, lap.duration_sector_1);
      if (lap.duration_sector_2 > 0) sessionBestSector.s2 = Math.min(sessionBestSector.s2, lap.duration_sector_2);
      if (lap.duration_sector_3 > 0) sessionBestSector.s3 = Math.min(sessionBestSector.s3, lap.duration_sector_3);
    });

    const runningOrder = session?.session_type === 'Race' || /sprint/i.test(session?.session_name || '');
    const positionByDriver = new Map(positions.map((item) => [item.driver_number, item.position]));

    const built = drivers.map((driver) => {
      const driverLaps = byDriver.get(driver.driver_number) || [];
      const timed = driverLaps.filter(validLap);
      const best = timed.reduce<LapData | null>((winner, lap) => {
        if (!winner || lap.lap_duration < winner.lap_duration) return lap;
        return winner;
      }, null);
      const ordered = [...driverLaps].sort((a, b) => a.lap_number - b.lap_number);
      const last = ordered[ordered.length - 1];
      const previous = [...ordered].reverse().find((lap) => last && lap.lap_number < last.lap_number && validLap(lap));
      const lastDelta = last && validLap(last) && previous ? last.lap_duration - previous.lap_duration : null;
      const driverStints = stints
        .filter((stint) => stint.driver_number === driver.driver_number)
        .sort((a, b) => a.stint_number - b.stint_number);
      const currentStint = driverStints[driverStints.length - 1];
      const referenceLap = last?.lap_number || currentStint?.lap_end || 0;
      const stintLaps = currentStint ? Math.max(1, referenceLap - currentStint.lap_start + 1) : 0;
      const tyreLaps = currentStint ? (currentStint.tyre_age_at_start || 0) + stintLaps : 0;

      return {
        driver,
        best,
        last,
        compound: currentStint?.compound || '',
        tyreLaps,
        racePosition: positionByDriver.get(driver.driver_number) || 0,
        sessionFastest: Boolean(best && Math.abs(best.lap_duration - sessionBestLap) < 0.001),
        bestDelta: best && sessionBestLap < Infinity ? best.lap_duration - sessionBestLap : null,
        lastDelta,
        sectors: [
          { value: last?.duration_sector_1, previous: earlierSector(ordered, last, 'duration_sector_1'), sessionBest: sessionBestSector.s1 },
          { value: last?.duration_sector_2, previous: earlierSector(ordered, last, 'duration_sector_2'), sessionBest: sessionBestSector.s2 },
          { value: last?.duration_sector_3, previous: earlierSector(ordered, last, 'duration_sector_3'), sessionBest: sessionBestSector.s3 },
        ],
      };
    }).filter((row) => row.best || row.last);

    return built
      .sort((a, b) => {
        if (runningOrder && positions.length) return (a.racePosition || 99) - (b.racePosition || 99);
        return (a.best?.lap_duration || Infinity) - (b.best?.lap_duration || Infinity);
      })
      .map((row, index) => ({
        ...row,
        position: runningOrder && row.racePosition ? row.racePosition : index + 1,
      }));
  }, [drivers, laps, positions, session, stints]);

  const live = session ? Date.now() <= new Date(session.date_end).getTime() && Date.now() >= new Date(session.date_start).getTime() : false;

  return (
    <section className="live-timing">
      <header className="live-timing__head">
        <div>
          <p className="prndl-kicker">Fórmula 1</p>
          <h2>Telemetria</h2>
          <p className="live-timing__meta">
            {session ? `${session.session_name} · ${session.circuit_short_name}` : 'Última sessão'}
            {loading ? ' · atualizando' : ''}
          </p>
          <p className={`live-timing__status${live ? ' is-live' : ''}`}>
            <i />
            {live ? 'Ao vivo' : 'Última sessão'}
          </p>
          {error ? <p className="live-timing__meta">{error}</p> : null}
        </div>
        <button type="button" className="live-timing__icon-button" onClick={onRefresh} aria-label="Atualizar telemetria">
          <RefreshCw />
        </button>
      </header>

      {rows.length === 0 ? (
        <p className="live-timing__empty">Ainda não há voltas cronometradas nesta sessão.</p>
      ) : (
        <div className="live-timing__table-wrap">
          <table className="live-timing__table">
            <thead>
              <tr>
                <th>Pos</th>
                <th>Piloto</th>
                <th>Pneu</th>
                <th>Voltas</th>
                <th>Melhor</th>
                <th>Última</th>
                <th className="live-timing__sector-col">S1</th>
                <th className="live-timing__sector-col">S2</th>
                <th className="live-timing__sector-col">S3</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const compound = COMPOUND[row.compound.toUpperCase()];
                const logo = teamLogo(row.driver.team_name);
                return (
                  <tr key={row.driver.driver_number} className={row.sessionFastest ? 'is-fastest' : ''}>
                    <td>
                      <span className={`live-timing__pos${row.position === 1 ? ' is-leader' : ''}`}>
                        {row.position}
                      </span>
                    </td>
                    <td>
                      <span className="live-timing__driver">
                        {logo ? <img className="live-timing__logo" src={logo} alt="" /> : null}
                        <span>
                          {row.driver.full_name || row.driver.broadcast_name}
                          <span className="live-timing__code">{row.driver.name_acronym}</span>
                        </span>
                      </span>
                    </td>
                    <td>
                      {compound ? (
                        <span className="live-timing__tyre" style={{ backgroundColor: compound.color }} title={row.compound}>
                          {compound.label}
                        </span>
                      ) : '—'}
                    </td>
                    <td>{row.tyreLaps || '—'}</td>
                    <td>
                      <span className="live-timing__stack">
                        <span className={`live-timing__time${row.sessionFastest ? ' is-purple' : ' is-green'}`}>
                          {formatLap(row.best?.lap_duration)}
                        </span>
                        {!row.sessionFastest && formatDelta(row.bestDelta) ? (
                          <span className="live-timing__delta is-green">{formatDelta(row.bestDelta)}</span>
                        ) : null}
                      </span>
                    </td>
                    <td>
                      <span className="live-timing__stack">
                        <span className="live-timing__time">{formatLap(row.last?.lap_duration)}</span>
                        {formatDelta(row.lastDelta) ? (
                          <span className={`live-timing__delta${(row.lastDelta || 0) > 0 ? ' is-yellow' : ' is-green'}`}>
                            {formatDelta(row.lastDelta)}
                          </span>
                        ) : null}
                      </span>
                    </td>
                    {row.sectors.map((sector, index) => (
                      <td key={index} className={`live-timing__sector-col live-timing__time${sectorTone(sector.value, sector.previous, sector.sessionBest)}`}>
                        {formatSector(sector.value)}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
