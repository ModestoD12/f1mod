import { useState, useEffect, useCallback } from 'react';
import { openF1Api, Session, Driver, Meeting, Position, LapData, Interval } from '../services/openF1Service';

// Hook para buscar sessão mais recente
export function useLatestSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSession = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await openF1Api.getLatestSession();
      setSession(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar sessão');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  return { session, loading, error, refetch: fetchSession };
}

// Hook para buscar meetings (GPs) do ano
export function useMeetings(year?: number) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMeetings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await openF1Api.getMeetings({ year: year || new Date().getFullYear() });
      setMeetings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar GPs');
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    fetchMeetings();
  }, [fetchMeetings]);

  return { meetings, loading, error, refetch: fetchMeetings };
}

// Hook para buscar pilotos de uma sessão
export function useDrivers(sessionKey?: number | string) {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDrivers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await openF1Api.getDrivers({ session_key: sessionKey || 'latest' });
      // Remove duplicatas baseado no driver_number
      const uniqueDrivers = data.reduce((acc: Driver[], driver) => {
        if (!acc.find(d => d.driver_number === driver.driver_number)) {
          acc.push(driver);
        }
        return acc;
      }, []);
      setDrivers(uniqueDrivers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar pilotos');
    } finally {
      setLoading(false);
    }
  }, [sessionKey]);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  return { drivers, loading, error, refetch: fetchDrivers };
}

// Hook para buscar posições em tempo real
export function usePositions(sessionKey: number | string, autoRefresh = false, interval = 5000) {
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPositions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await openF1Api.getPositions({ session_key: sessionKey });
      // Pegar apenas a posição mais recente de cada piloto
      const latestPositions = data.reduce((acc: Position[], pos) => {
        const existing = acc.find(p => p.driver_number === pos.driver_number);
        if (!existing || new Date(pos.date) > new Date(existing.date)) {
          const filtered = acc.filter(p => p.driver_number !== pos.driver_number);
          filtered.push(pos);
          return filtered;
        }
        return acc;
      }, []);
      setPositions(latestPositions.sort((a, b) => a.position - b.position));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar posições');
    } finally {
      setLoading(false);
    }
  }, [sessionKey]);

  useEffect(() => {
    fetchPositions();
    
    if (autoRefresh) {
      const timer = setInterval(fetchPositions, interval);
      return () => clearInterval(timer);
    }
  }, [fetchPositions, autoRefresh, interval]);

  return { positions, loading, error, refetch: fetchPositions };
}

// Hook para buscar dados de volta
export function useLaps(sessionKey: number | string, driverNumber?: number) {
  const [laps, setLaps] = useState<LapData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLaps = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await openF1Api.getLaps({ session_key: sessionKey, driver_number: driverNumber });
      setLaps(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar voltas');
    } finally {
      setLoading(false);
    }
  }, [sessionKey, driverNumber]);

  useEffect(() => {
    fetchLaps();
  }, [fetchLaps]);

  return { laps, loading, error, refetch: fetchLaps };
}

// Hook para buscar intervalos
export function useIntervals(sessionKey: number | string) {
  const [intervals, setIntervals] = useState<Interval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIntervals = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await openF1Api.getIntervals({ session_key: sessionKey });
      // Pegar apenas o intervalo mais recente de cada piloto
      const latestIntervals = data.reduce((acc: Interval[], int) => {
        const existing = acc.find(i => i.driver_number === int.driver_number);
        if (!existing || new Date(int.date) > new Date(existing.date)) {
          const filtered = acc.filter(i => i.driver_number !== int.driver_number);
          filtered.push(int);
          return filtered;
        }
        return acc;
      }, []);
      setIntervals(latestIntervals);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar intervalos');
    } finally {
      setLoading(false);
    }
  }, [sessionKey]);

  useEffect(() => {
    fetchIntervals();
  }, [fetchIntervals]);

  return { intervals, loading, error, refetch: fetchIntervals };
}

// Hook combinado para dados completos de F1
export function useF1LiveData() {
  const { session, loading: sessionLoading, error: sessionError } = useLatestSession();
  const { drivers, loading: driversLoading, error: driversError } = useDrivers(session?.session_key);
  const { meetings, loading: meetingsLoading, error: meetingsError } = useMeetings();

  return {
    session,
    drivers,
    meetings,
    loading: sessionLoading || driversLoading || meetingsLoading,
    error: sessionError || driversError || meetingsError
  };
}
