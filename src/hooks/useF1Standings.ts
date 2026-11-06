import { useCallback, useEffect, useMemo, useState } from 'react';
import { f1CalendarApi } from '../services/f1CalendarService';
import {
  championId,
  maxConstructorPointsStillAvailable,
  maxPointsStillAvailable,
  nextStandingsCheck,
  scoringSessionsFromRaces,
  ScoringSession,
} from '../services/championshipClincher';
import { ConstructorStanding, DriverStanding, f1StandingsApi } from '../services/f1StandingsService';

export function useF1Standings(season: string = 'current') {
  const [driverStandings, setDriverStandings] = useState<DriverStanding[]>([]);
  const [constructorStandings, setConstructorStandings] = useState<ConstructorStanding[]>([]);
  const [sessions, setSessions] = useState<ScoringSession[]>([]);
  const [seasonYear, setSeasonYear] = useState('');
  const [round, setRound] = useState('');
  const [clock, setClock] = useState(() => Date.now());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStandings = useCallback(async (silent = false) => {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const [drivers, constructors] = await Promise.all([
        f1StandingsApi.getDriverStandings(season),
        f1StandingsApi.getConstructorStandings(season),
      ]);
      setDriverStandings(drivers.standings);
      setConstructorStandings(constructors.standings);
      setSeasonYear(drivers.season || constructors.season);
      setRound(drivers.round || constructors.round);
      setClock(Date.now());
    } catch (cause) {
      if (!silent) {
        setError(cause instanceof Error ? cause.message : 'Erro ao buscar classificação');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [season]);

  useEffect(() => {
    void fetchStandings(false);
  }, [fetchStandings]);

  useEffect(() => {
    let cancelled = false;
    f1CalendarApi.getRaces(season)
      .then((data) => {
        if (!cancelled) setSessions(scoringSessionsFromRaces(data.races));
      })
      .catch(() => {
        if (!cancelled) setSessions([]);
      });
    return () => {
      cancelled = true;
    };
  }, [season]);

  useEffect(() => {
    let cancelled = false;
    let timer = 0;

    const arm = () => {
      window.clearTimeout(timer);
      const plan = nextStandingsCheck(sessions, Date.now());
      if (!plan) return;
      timer = window.setTimeout(() => {
        if (cancelled) return;
        setClock(Date.now());
        const current = nextStandingsCheck(sessions, Date.now());
        if (current?.shouldFetch) {
          void fetchStandings(true).finally(() => {
            if (!cancelled) arm();
          });
          return;
        }
        arm();
      }, plan.waitMs);
    };

    arm();

    const onVisible = () => {
      if (document.visibilityState === 'visible') void fetchStandings(true);
    };
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [fetchStandings, sessions]);

  const standingsRound = Number(round) || 0;

  const championDriverId = useMemo(() => {
    if (sessions.length === 0 || driverStandings.length === 0) return null;
    const remaining = maxPointsStillAvailable(sessions, standingsRound, clock);
    return championId(
      driverStandings.map((standing) => ({
        id: standing.driver.driverId,
        points: standing.points,
        wins: standing.wins,
      })),
      remaining,
    );
  }, [clock, driverStandings, standingsRound, sessions]);

  const championConstructorId = useMemo(() => {
    if (sessions.length === 0 || constructorStandings.length === 0) return null;
    const remaining = maxConstructorPointsStillAvailable(sessions, standingsRound, clock);
    return championId(
      constructorStandings.map((standing) => ({
        id: standing.constructor.constructorId,
        points: standing.points,
        wins: standing.wins,
      })),
      remaining,
    );
  }, [clock, constructorStandings, standingsRound, sessions]);

  return {
    driverStandings,
    constructorStandings,
    seasonYear,
    round,
    loading,
    refreshing,
    error,
    championDriverId,
    championConstructorId,
    refetch: () => fetchStandings(false),
  };
}
