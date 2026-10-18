import React, { useEffect, useMemo } from 'react';
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

function formatWeekend(start: string, end: string) {
  const first = fromDateKey(start);
  const last = fromDateKey(end);
  if (start === end) {
    return first.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  }
  if (first.getMonth() === last.getMonth()) {
    return `${first.getDate()} a ${last.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}`;
  }
  return `${first.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} – ${last.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`;
}

interface Weekend {
  round: number;
  events: CalendarEvent[];
  start: string;
  end: string;
  race: CalendarEvent;
}

export function F1CalendarWrapper({
  currentDate,
  onDateSelect,
}: F1CalendarWrapperProps) {
  const { events, seasonYear, loading, error, refetch } = useF1Calendar('current');

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
    if (!weekends.length) return;
    const key = toDateKey(currentDate);
    const current = weekends.find((weekend) => key >= weekend.start && key <= weekend.end);
    if (current) {
      if (key !== current.race.date) onDateSelect(fromDateKey(current.race.date));
      return;
    }
    const today = toDateKey(new Date());
    const next = weekends.find((weekend) => weekend.end >= today) || weekends[weekends.length - 1];
    if (key !== next.race.date) onDateSelect(fromDateKey(next.race.date));
  }, [weekends, currentDate, onDateSelect]);

  const currentKey = toDateKey(currentDate);
  const currentIndex = weekends.findIndex((weekend) => currentKey >= weekend.start && currentKey <= weekend.end);
  const weekend = currentIndex >= 0 ? weekends[currentIndex] : undefined;

  const jumpToWeekend = (direction: 1 | -1) => {
    if (!weekends.length) return;
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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-500 bg-slate-800 p-3">
        <Button
          variant="outline"
          size="icon"
          aria-label="Ver Grande Prêmio anterior"
          onClick={() => jumpToWeekend(-1)}
          disabled={currentIndex <= 0}
          className="size-11 shrink-0 border-slate-400 bg-slate-700 text-white shadow-lg shadow-black/20 hover:bg-red-600 hover:text-white disabled:opacity-35"
        >
          <ChevronLeft className="size-6" />
        </Button>

        <div className="flex min-w-0 items-center justify-center gap-3 text-center">
          {weekend?.race.country && (
            <CountryFlag nationality={weekend.race.country} size="md" />
          )}
          <span className="truncate text-base font-black tracking-tight text-white sm:text-lg">
            {weekend?.race.title || 'Calendário'}
          </span>
        </div>

        <Button
          variant="outline"
          size="icon"
          aria-label="Ver próximo Grande Prêmio"
          onClick={() => jumpToWeekend(1)}
          disabled={currentIndex === -1 || currentIndex >= weekends.length - 1}
          className="size-11 shrink-0 border-slate-400 bg-slate-700 text-white shadow-lg shadow-black/20 hover:bg-red-600 hover:text-white disabled:opacity-35"
        >
          <ChevronRight className="size-6" />
        </Button>
      </div>

      {weekend && (
        <>
          <div className="relative overflow-hidden rounded-2xl border border-red-700/50 bg-gradient-to-br from-red-950/70 via-slate-900 to-slate-950 p-5 shadow-xl shadow-red-950/20">
            <div className="absolute inset-y-0 left-0 w-1.5 bg-red-600" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.22em] text-red-300">Round {weekend.round} · Grande Prêmio</p>
                <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">{weekend.race.title}</h2>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-300">
                  {weekend.race.country && <CountryFlag nationality={weekend.race.country} size="md" />}
                  <span className="font-semibold text-slate-100">{weekend.race.country || 'Calendário internacional'}</span>
                  {weekend.race.location && <><span className="text-slate-600">•</span><span>{weekend.race.location}</span></>}
                </div>
              </div>
              <div className="flex-1 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-left backdrop-blur-sm sm:min-w-[190px]">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-red-200">Data e Hora</p>
                <p className="mt-1 text-sm font-bold capitalize text-white">{formatWeekend(weekend.race.date, weekend.race.date)}</p>
                <p className="text-2xl font-black text-white">{weekend.race.time || '—'}</p>
              </div>
            </div>
          </div>
          <GameSchedule games={weekend.events} sports={sports} currentDate={currentDate} showAll />
        </>
      )}
    </div>
  );
}

export default F1CalendarWrapper;
