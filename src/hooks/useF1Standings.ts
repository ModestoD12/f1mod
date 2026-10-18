import { useState, useEffect, useCallback } from 'react';
import { f1StandingsApi, DriverStanding, ConstructorStanding } from '../services/f1StandingsService';

export function useDriverStandings(season: string = 'current') {
  const [standings, setStandings] = useState<DriverStanding[]>([]);
  const [seasonYear, setSeasonYear] = useState<string>('');
  const [round, setRound] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStandings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await f1StandingsApi.getDriverStandings(season);
      setStandings(data.standings);
      setSeasonYear(data.season);
      setRound(data.round);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar classificação');
    } finally {
      setLoading(false);
    }
  }, [season]);

  useEffect(() => {
    fetchStandings();
  }, [fetchStandings]);

  return { standings, seasonYear, round, loading, error, refetch: fetchStandings };
}

export function useConstructorStandings(season: string = 'current') {
  const [standings, setStandings] = useState<ConstructorStanding[]>([]);
  const [seasonYear, setSeasonYear] = useState<string>('');
  const [round, setRound] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStandings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await f1StandingsApi.getConstructorStandings(season);
      setStandings(data.standings);
      setSeasonYear(data.season);
      setRound(data.round);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar classificação');
    } finally {
      setLoading(false);
    }
  }, [season]);

  useEffect(() => {
    fetchStandings();
  }, [fetchStandings]);

  return { standings, seasonYear, round, loading, error, refetch: fetchStandings };
}
