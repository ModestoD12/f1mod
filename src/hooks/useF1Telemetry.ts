import { useCallback, useEffect, useRef, useState } from 'react';
import {
  CarData,
  Driver,
  LapData,
  LocationPoint,
  Position,
  RaceControlMessage,
  Session,
  Stint,
  Weather,
  openF1Api,
} from '../services/openF1Service';

export function useF1Telemetry(driverNumber?: number, pollMs = 15000) {
  const [session, setSession] = useState<Session | null>(null);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [weather, setWeather] = useState<Weather | null>(null);
  const [locations, setLocations] = useState<LocationPoint[]>([]);
  const [laps, setLaps] = useState<LapData[]>([]);
  const [stints, setStints] = useState<Stint[]>([]);
  const [raceControl, setRaceControl] = useState<RaceControlMessage[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [carData, setCarData] = useState<CarData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const sessionRef = useRef<Session | null>(null);
  const driversRef = useRef<Driver[]>([]);
  const anchorRef = useRef<string | undefined>(undefined);
  const anchorReadyRef = useRef(false);
  const controlReadyRef = useRef(false);

  const fetchTelemetry = useCallback(async (initial = false) => {
    try {
      if (initial) {
        setLoading(true);
        controlReadyRef.current = false;
      }

      let latestSession = sessionRef.current;
      if (initial || !latestSession) {
        latestSession = await openF1Api.getLatestSession();
        sessionRef.current = latestSession;
        setSession(latestSession);
      }

      if (!latestSession) {
        setDrivers([]);
        setWeather(null);
        setLocations([]);
        setCarData(null);
        return;
      }

      const sessionKey = latestSession.session_key;
      let uniqueDrivers = driversRef.current;

      if (!anchorReadyRef.current) {
        const [lapBundle, driverList, stintList] = await Promise.all([
          openF1Api.getSessionLaps(latestSession),
          uniqueDrivers.length
            ? Promise.resolve(uniqueDrivers)
            : openF1Api.getDrivers({ session_key: sessionKey }),
          openF1Api.getStints(sessionKey),
        ]);

        anchorRef.current = lapBundle.anchor;
        anchorReadyRef.current = true;
        setLaps(lapBundle.laps);
        setStints(stintList);
        const standings = await openF1Api.getLatestPositions(sessionKey, lapBundle.anchor).catch(() => []);
        setPositions(standings);

        if (!uniqueDrivers.length) {
          uniqueDrivers = driverList.reduce((acc: Driver[], driver) => {
            if (!acc.find((item) => item.driver_number === driver.driver_number)) acc.push(driver);
            return acc;
          }, []).sort((a, b) => a.driver_number - b.driver_number);
          driversRef.current = uniqueDrivers;
          setDrivers(uniqueDrivers);
        }
      }
      if (!controlReadyRef.current) {
        controlReadyRef.current = true;
        const key = sessionKey;
        void (async () => {
          for (let attempt = 0; attempt < 4; attempt += 1) {
            try {
              const control = await openF1Api.getRaceControl({ session_key: key });
              setRaceControl(control);
              return;
            } catch {
              await new Promise((resolve) => setTimeout(resolve, 8000));
            }
          }
          controlReadyRef.current = false;
        })();
      }
      const relativeTo = anchorRef.current;

      const [weatherSample, locationSamples] = await Promise.all([
        openF1Api.getLatestWeather(sessionKey),
        openF1Api.getLatestLocations(sessionKey, relativeTo),
      ]);

      setWeather(weatherSample);
      setLocations(locationSamples);

      const selected =
        driverNumber ||
        uniqueDrivers[0]?.driver_number ||
        locationSamples[0]?.driver_number;

      if (selected) {
        const sample = await openF1Api.getLatestCarSample({
          session_key: sessionKey,
          driver_number: selected,
          relativeTo,
        });
        setCarData(sample);
      } else {
        setCarData(null);
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar telemetria');
    } finally {
      setLoading(false);
    }
  }, [driverNumber]);

  useEffect(() => {
    fetchTelemetry(true);
    const timer = setInterval(() => fetchTelemetry(false), pollMs);
    return () => clearInterval(timer);
  }, [fetchTelemetry, pollMs]);

  return {
    session,
    drivers,
    weather,
    locations,
    laps,
    stints,
    raceControl,
    positions,
    carData,
    loading,
    error,
    refetch: () => fetchTelemetry(true),
  };
}
