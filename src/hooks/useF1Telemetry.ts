import { useCallback, useEffect, useRef, useState } from 'react';
import { Driver, LapData, Position, Session, Stint, openF1Api } from '../services/openF1Service';

function latestByDriver(points: Position[]) {
  const byDriver = new Map<number, Position>();
  points.forEach((point) => {
    const current = byDriver.get(point.driver_number);
    if (!current || new Date(point.date) > new Date(current.date)) byDriver.set(point.driver_number, point);
  });
  return [...byDriver.values()];
}

export function useF1Telemetry(pollMs = 15000) {
  const [session, setSession] = useState<Session | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [laps, setLaps] = useState<LapData[]>([]);
  const [stints, setStints] = useState<Stint[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<Session | null>(null);
  const driversRef = useRef<Driver[]>([]);
  const positionsRef = useRef<Position[]>([]);

  const fetchTelemetry = useCallback(async (initial = false) => {
    try {
      if (initial) setLoading(true);

      const current = sessionRef.current;
      const sessionOpen = current ? Date.now() <= new Date(current.date_end).getTime() : false;
      let latestSession = current;
      if (initial || !latestSession || !sessionOpen) {
        latestSession = await openF1Api.getLatestSession();
        if (latestSession?.session_key !== current?.session_key) {
          driversRef.current = [];
          positionsRef.current = [];
        }
        sessionRef.current = latestSession;
        setSession(latestSession);
      }

      if (!latestSession) {
        setDrivers([]);
        setLaps([]);
        setStints([]);
        setPositions([]);
        return;
      }

      const sessionKey = latestSession.session_key;
      const live = Date.now() <= new Date(latestSession.date_end).getTime();
      const [lapList, stintList, driverList] = await Promise.all([
        openF1Api.getLaps({ session_key: sessionKey }),
        openF1Api.getStints(sessionKey),
        driversRef.current.length
          ? Promise.resolve(driversRef.current)
          : openF1Api.getDrivers({ session_key: sessionKey }),
      ]);
      const standings = live || initial || !positionsRef.current.length
        ? await (live
          ? openF1Api.getLatestPositions(sessionKey)
          : openF1Api.getPositions({ session_key: sessionKey }).then(latestByDriver)
        ).catch(() => positionsRef.current)
        : positionsRef.current;

      if (!driversRef.current.length) {
        const uniqueDrivers = driverList.reduce((acc: Driver[], driver) => {
          if (!acc.find((item) => item.driver_number === driver.driver_number)) acc.push(driver);
          return acc;
        }, []).sort((a, b) => a.driver_number - b.driver_number);
        driversRef.current = uniqueDrivers;
        setDrivers(uniqueDrivers);
      }

      setLaps(lapList);
      setStints(stintList);
      positionsRef.current = standings;
      setPositions(standings);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar telemetria');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTelemetry(true);
    const timer = setInterval(() => fetchTelemetry(false), pollMs);
    return () => clearInterval(timer);
  }, [fetchTelemetry, pollMs]);

  return {
    session,
    drivers,
    laps,
    stints,
    positions,
    loading,
    error,
    refetch: () => fetchTelemetry(true),
  };
}
