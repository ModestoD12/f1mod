import { useState, useEffect, useCallback } from 'react';
import { f1CalendarApi, CalendarEvent } from '../services/f1CalendarService';

export function useF1Calendar(season: string = 'current') {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [seasonYear, setSeasonYear] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCalendar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { season: resolvedSeason, races } = await f1CalendarApi.getRaces(season);
      const calendarEvents = f1CalendarApi.convertToCalendarEvents(races);
      setSeasonYear(resolvedSeason);
      setEvents(calendarEvents);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar calendário');
    } finally {
      setLoading(false);
    }
  }, [season]);

  useEffect(() => {
    fetchCalendar();
  }, [fetchCalendar]);

  return { events, seasonYear, loading, error, refetch: fetchCalendar };
}
