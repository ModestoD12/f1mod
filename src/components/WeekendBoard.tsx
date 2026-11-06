import { useEffect, useState } from 'react';
import { Bell, ExternalLink, Flag } from 'lucide-react';
import { Button } from './ui/button';
import { CircuitMap } from './CircuitMap';
import { getStreamingOptions } from '../services/streamingService';
import './weekend-board.css';

export interface WeekendSession {
  id: string | number;
  title: string;
  date: string;
  time: string;
  session?: string;
  sport: string;
  circuit?: string;
  circuitId?: string;
  weather?: string;
  latitude?: number;
  longitude?: number;
  timeUtc?: string;
  description?: string;
  location?: string;
}

const LABELS: Record<string, string> = {
  FP1: 'Treino livre 1',
  FP2: 'Treino livre 2',
  FP3: 'Treino livre 3',
  Qualifying: 'Classificação',
  'Sprint Qualifying': 'Classificação sprint',
  'Sprint Shootout': 'Classificação sprint',
  Sprint: 'Sprint',
  Race: 'Grande Prêmio',
};

function formatSessionDay(date: string, timeUtc?: string) {
  const match = date.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!match) return '';

  let year = Number(match[1]);
  let month = Number(match[2]);
  let day = Number(match[3]);
  const utcHours = timeUtc ? parseInt(timeUtc.replace('Z', '').split(':')[0], 10) : NaN;

  if (!Number.isNaN(utcHours) && utcHours - 3 < 0) {
    const shifted = new Date(Date.UTC(year, month - 1, day));
    shifted.setUTCDate(shifted.getUTCDate() - 1);
    year = shifted.getUTCFullYear();
    month = shifted.getUTCMonth() + 1;
    day = shifted.getUTCDate();
  }

  return `${String(day).padStart(2, '0')}/${String(month).padStart(2, '0')}`;
}

const DURATION_MINUTES: Record<string, number> = {
  FP1: 60,
  FP2: 60,
  FP3: 60,
  Qualifying: 60,
  'Sprint Qualifying': 45,
  'Sprint Shootout': 45,
  Sprint: 45,
  Race: 150,
};

function sessionStartMs(session: WeekendSession) {
  if (!session.date) return null;
  if (session.timeUtc) {
    const clock = session.timeUtc.replace('Z', '').slice(0, 8);
    const parsed = Date.parse(`${session.date}T${clock}Z`);
    return Number.isNaN(parsed) ? null : parsed;
  }
  const [hours, minutes] = (session.time || '').split(':').map(Number);
  if (Number.isNaN(hours)) return null;
  const parsed = Date.parse(`${session.date}T00:00:00Z`);
  if (Number.isNaN(parsed)) return null;
  return parsed + ((hours + 3) * 60 + (minutes || 0)) * 60 * 1000;
}

function sessionMarkers(sessions: WeekendSession[], now: number) {
  const timed = sessions.flatMap((session) => {
    const start = sessionStartMs(session);
    if (start == null) return [];
    const minutes = DURATION_MINUTES[session.session || ''] ?? 60;
    return [{ id: session.id, start, end: start + minutes * 60 * 1000 }];
  }).sort((a, b) => a.start - b.start);

  return {
    liveId: timed.find((item) => now >= item.start && now < item.end)?.id,
    nextId: timed.find((item) => item.start > now)?.id,
  };
}

function SessionCell({
  session,
  featured = false,
  tone,
}: {
  session: WeekendSession;
  featured?: boolean;
  tone?: 'live' | 'next';
}) {
  const day = formatSessionDay(session.date, session.timeUtc);
  const label = LABELS[session.session || ''] || session.title;

  return (
    <article className={`weekend-board__cell ${featured ? 'weekend-board__cell--feature' : ''} ${tone ? `weekend-board__cell--${tone}` : ''}`}>
      <div className="weekend-board__head">
        {day ? <p className="weekend-board__date">{day}</p> : <span />}
        {tone === 'live' ? (
          <p className="weekend-board__live">
            <span className="weekend-board__rec-dot" aria-hidden="true" />
            <strong>REC</strong>
            <span className="weekend-board__badge-full">Ao vivo</span>
          </p>
        ) : null}
        {tone === 'next' ? (
          <p className="weekend-board__next" aria-label="Próximo">
            <Flag className="weekend-board__next-icon" aria-hidden="true" />
            <span className="weekend-board__badge-full">Próximo</span>
            <span className="weekend-board__badge-short">Próx</span>
          </p>
        ) : null}
      </div>
      <p className="weekend-board__label">{label}</p>
      <p className="weekend-board__time">{session.time || '—'}</p>
    </article>
  );
}

export function WeekendBoard({
  sessions,
  onReminder,
}: {
  sessions: WeekendSession[];
  onReminder: (session: WeekendSession) => void;
}) {
  const bySession = (name: string) => sessions.find((session) => session.session === name);
  const practices = [bySession('FP1'), bySession('FP2'), bySession('FP3')].filter(Boolean) as WeekendSession[];
  const sprintRow = [bySession('Sprint Qualifying') || bySession('Sprint Shootout'), bySession('Sprint')].filter(Boolean) as WeekendSession[];
  const finals = [bySession('Qualifying'), bySession('Race')].filter(Boolean) as WeekendSession[];
  const race = bySession('Race') || sessions[0];
  const channels = getStreamingOptions(race?.sport || 'f1', 'Race');
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const markers = sessionMarkers([...practices, ...sprintRow, ...finals], now);
  const toneFor = (session: WeekendSession) => {
    if (session.id === markers.liveId) return 'live' as const;
    if (session.id === markers.nextId) return 'next' as const;
    return undefined;
  };

  return (
    <section className="weekend-board" aria-label="Programação do fim de semana">
      {practices.length > 0 && (
        <div className={`weekend-board__row ${practices.length === 1 ? 'weekend-board__row--single' : practices.length === 2 ? 'weekend-board__row--center' : ''}`}>
          {practices.map((session) => <SessionCell key={session.id} session={session} tone={toneFor(session)} />)}
        </div>
      )}
      {sprintRow.length > 0 && (
        <div className={`weekend-board__row weekend-board__row--center ${sprintRow.length === 1 ? 'weekend-board__row--single' : ''}`}>
          {sprintRow.map((session) => <SessionCell key={session.id} session={session} tone={toneFor(session)} />)}
        </div>
      )}
      {finals.length > 0 && (
        <div className="weekend-board__row weekend-board__row--center">
          {finals.map((session) => <SessionCell key={session.id} session={session} featured={session.session === 'Race'} tone={toneFor(session)} />)}
        </div>
      )}

      {race?.circuitId && (
        <CircuitMap
          key={race.circuitId}
          variant="tile"
          circuitId={race.circuitId}
          circuitName={race.circuit}
          weather={race.weather}
          latitude={race.latitude}
          longitude={race.longitude}
          date={race.date}
          timeUtc={race.timeUtc}
        />
      )}

      <div className="weekend-board__footer">
        <div className="weekend-board__footer-head">
          <p className="weekend-board__watch-label">Onde assistir</p>
          {race && (
            <Button type="button" className="weekend-board__remind" onClick={() => onReminder(race)}>
              <Bell className="h-4 w-4" />
              Avisar
            </Button>
          )}
        </div>
        <div className="weekend-board__channels">
          {channels.map((channel) => (
            <a
              key={channel.name}
              className={`weekend-board__channel ${channel.isPaid ? 'weekend-board__channel--paid' : 'weekend-board__channel--free'}`}
              href={channel.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="weekend-board__channel-icon" aria-hidden="true" />
              <span>{channel.name}</span>
              <small>{channel.isPaid ? 'Pago' : 'Grátis'}</small>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
