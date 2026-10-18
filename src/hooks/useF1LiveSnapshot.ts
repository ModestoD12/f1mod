import { useState, useEffect, useCallback } from 'react';
import { f1CalendarApi, F1LastRace, F1Race } from '../services/f1CalendarService';
import { f1StandingsApi, DriverStanding } from '../services/f1StandingsService';

export function useF1LiveSnapshot() {
  const [nextRace, setNextRace] = useState<F1Race | null>(null);
  const [lastRace, setLastRace] = useState<F1LastRace | null>(null);
  const [leader, setLeader] = useState<DriverStanding | null>(null);
  const [seasonYear, setSeasonYear] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSnapshot = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [next, last, championship] = await Promise.all([
        f1CalendarApi.getNextRace(),
        f1CalendarApi.getLastRace(),
        f1StandingsApi.getDriverStandings(),
      ]);
      setNextRace(next);
      setLastRace(last);
      setLeader(championship.standings[0] || null);
      setSeasonYear(championship.season || last?.season || '');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar dados da F1');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSnapshot();
  }, [fetchSnapshot]);

  return { nextRace, lastRace, leader, seasonYear, loading, error, refetch: fetchSnapshot };
}
