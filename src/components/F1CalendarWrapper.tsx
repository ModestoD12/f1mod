import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useF1Calendar } from '../hooks/useF1Calendar';
import { GameSchedule } from './GameSchedule';
import { CountryFlag } from './CountryFlag';
import { CalendarEvent } from '../services/f1CalendarService';
import { Card, CardContent } from './ui/card';
import { Loader2, AlertCircle, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

interface F1CalendarWrapperProps {
  currentDate: Date;
  onDateSelect: (date: Date) => void;
}

const sports = [
  { id: 'f1', name: 'Fórmula 1', icon: '🏎️' },
];

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function fromDateKey(key: string) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDayMonth(date: string, timeUtc?: string) {
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

interface Weekend {
  round: number;
  events: CalendarEvent[];
  start: string;
  end: string;
  race: CalendarEvent;
}

const SESSION_MINUTES: Record<string, number> = {
  FP1: 60,
  FP2: 60,
  FP3: 60,
  Qualifying: 60,
  'Sprint Qualifying': 45,
  'Sprint Shootout': 45,
  Sprint: 45,
  Race: 150,
};

function sessionEndMs(event: CalendarEvent) {
  if (!event.date) return null;
  let start: number | null = null;
  if (event.timeUtc) {
    const clock = event.timeUtc.replace('Z', '').slice(0, 8);
    const parsed = Date.parse(`${event.date}T${clock}Z`);
    start = Number.isNaN(parsed) ? null : parsed;
  } else if (event.time) {
    const [hours, minutes] = event.time.split(':').map(Number);
    const parsed = Date.parse(`${event.date}T00:00:00Z`);
    if (!Number.isNaN(hours) && !Number.isNaN(parsed)) {
      start = parsed + ((hours + 3) * 60 + (minutes || 0)) * 60 * 1000;
    }
  }
  if (start == null) return null;
  const minutes = SESSION_MINUTES[event.session || ''] ?? 60;
  return start + minutes * 60 * 1000;
}

function pickActiveWeekend(weekends: Weekend[], now: number) {
  return weekends.find((weekend) => weekend.events.some((event) => {
    const end = sessionEndMs(event);
    return end != null && now < end;
  })) || weekends[weekends.length - 1];
}

export function F1CalendarWrapper({
  currentDate,
  onDateSelect,
}: F1CalendarWrapperProps) {
  const { events, seasonYear, loading, error, refetch } = useF1Calendar('current');
  const [now, setNow] = useState(() => Date.now());
  const userPicked = useRef(false);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30000);
    return () => window.clearInterval(timer);
  }, []);

  const weekends = useMemo<Weekend[]>(() => {
    const grouped = new Map<number, CalendarEvent[]>();
    events.forEach((event) => {
      const round = event.round || 0;
      grouped.set(round, [...(grouped.get(round) || []), event]);
    });

    return [...grouped.entries()]
      .map(([round, list]) => {
        const dates = list.map((event) => event.date).sort();
        const race = list.find((event) => event.session === 'Race') || list[0];
        return { round, events: list, start: dates[0], end: dates[dates.length - 1], race };
      })
      .sort((a, b) => a.start.localeCompare(b.start));
  }, [events]);

  useEffect(() => {
    if (!weekends.length || userPicked.current) return;
    const active = pickActiveWeekend(weekends, now);
    const key = toDateKey(currentDate);
    if (key !== active.race.date) onDateSelect(fromDateKey(active.race.date));
  }, [weekends, currentDate, onDateSelect, now]);

  const currentKey = toDateKey(currentDate);
  const currentIndex = weekends.findIndex((weekend) => currentKey >= weekend.start && currentKey <= weekend.end);
  const weekend = currentIndex >= 0 ? weekends[currentIndex] : undefined;

  const jumpToWeekend = (direction: 1 | -1) => {
    if (!weekends.length) return;
    userPicked.current = true;
    const nextIndex = currentIndex === -1
      ? (direction === 1 ? 0 : weekends.length - 1)
      : currentIndex + direction;
    if (nextIndex < 0 || nextIndex >= weekends.length) return;
    onDateSelect(fromDateKey(weekends[nextIndex].race.date));
  };

  if (loading) {
    return (
      <Card className="bg-slate-900 border-slate-700">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-10 w-10 animate-spin text-red-500" />
            <span className="mt-4 text-slate-200">Carregando calendário F1 {seasonYear || 'atual'}...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-slate-900 border-slate-700">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-slate-200 mb-4">{error}</p>
            <Button onClick={refetch} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const previous = currentIndex > 0 ? weekends[currentIndex - 1] : undefined;
  const next = currentIndex >= 0 && currentIndex < weekends.length - 1 ? weekends[currentIndex + 1] : undefined;
  const shortName = (title?: string) => (title || 'Etapa').replace(/\s+Grand Prix$/i, '');

  return (
    <div className="flex w-full min-w-0 flex-col gap-4">
      <nav className="prndl-nav" aria-label="Navegação entre Grandes Prêmios">
        <Button
          type="button"
          aria-label={previous ? `Grande Prêmio anterior: ${previous.race.title}` : 'Não há Grande Prêmio anterior'}
          onClick={() => jumpToWeekend(-1)}
          disabled={!previous}
          className="prndl-nav__step"
        >
          <ChevronLeft className="size-5 shrink-0" />
          <span>
            <small>Anterior</small>
            <strong>
              {previous?.race.country ? (
                <CountryFlag nationality={previous.race.country} size="lg" className="prndl-nav__flag" />
              ) : (
                'Início'
              )}
            </strong>
          </span>
        </Button>

        <div className="prndl-nav__current">
          <small>Etapa {weekend ? `${currentIndex + 1} de ${weekends.length}` : '—'}</small>
          <strong>
            {weekend?.race.country && <CountryFlag nationality={weekend.race.country} size="sm" />}
            {shortName(weekend?.race.title)}
          </strong>
        </div>

        <Button
          type="button"
          aria-label={next ? `Próximo Grande Prêmio: ${next.race.title}` : 'Não há próximo Grande Prêmio'}
          onClick={() => jumpToWeekend(1)}
          disabled={!next}
          className="prndl-nav__step prndl-nav__step--next"
        >
          <span>
            <small>Próximo</small>
            <strong>
              {next?.race.country ? (
                <CountryFlag nationality={next.race.country} size="lg" className="prndl-nav__flag" />
              ) : (
                'Fim'
              )}
            </strong>
          </span>
          <ChevronRight className="size-5 shrink-0" />
        </Button>
      </nav>

      {weekend && (
        <>
          <div className="prndl-hero">
            <div className="prndl-hero__kicker">
              <p className="prndl-kicker">Round {weekend.round} · Grande Prêmio</p>
              <p className="prndl-hero__date">{formatDayMonth(weekend.race.date, weekend.race.timeUtc)}</p>
            </div>
            <h2 className="text-2xl text-white sm:text-3xl">{weekend.race.title}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#b8b8c2]">
              {weekend.race.country && <CountryFlag nationality={weekend.race.country} size="md" />}
              <span className="font-semibold text-white">{weekend.race.country || 'Calendário internacional'}</span>
              {weekend.race.location && <><span className="text-white/30">•</span><span>{weekend.race.location}</span></>}
            </div>
          </div>
          <GameSchedule games={weekend.events} sports={sports} currentDate={currentDate} showAll />
        </>
      )}
    </div>
  );
}

export default F1CalendarWrapper;
