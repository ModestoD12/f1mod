// OpenF1 API Service
// Documentação: https://openf1.org/

const BASE_URL = 'https://api.openf1.org/v1';

export interface Driver {
  driver_number: number;
  broadcast_name: string;
  full_name: string;
  name_acronym: string;
  team_name: string;
  team_colour: string;
  first_name: string;
  last_name: string;
  headshot_url: string;
  country_code: string;
  session_key: number;
  meeting_key: number;
}

export interface Session {
  session_key: number;
  session_name: string;
  session_type: string;
  date_start: string;
  date_end: string;
  gmt_offset: string;
  meeting_key: number;
  location: string;
  country_key: number;
  country_code: string;
  country_name: string;
  circuit_key: number;
  circuit_short_name: string;
  year: number;
}

export interface Meeting {
  meeting_key: number;
  meeting_name: string;
  meeting_official_name: string;
  location: string;
  country_key: number;
  country_code: string;
  country_name: string;
  circuit_key: number;
  circuit_short_name: string;
  date_start: string;
  gmt_offset: string;
  year: number;
}

export interface Position {
  driver_number: number;
  position: number;
  date: string;
  session_key: number;
  meeting_key: number;
}

export interface LapData {
  driver_number: number;
  lap_number: number;
  lap_duration: number;
  duration_sector_1: number;
  duration_sector_2: number;
  duration_sector_3: number;
  i1_speed: number;
  i2_speed: number;
  st_speed: number;
  is_pit_out_lap: boolean;
  date_start: string;
  session_key: number;
  meeting_key: number;
}

export interface Interval {
  driver_number: number;
  gap_to_leader: number;
  interval: number;
  date: string;
  session_key: number;
  meeting_key: number;
}

export interface CarData {
  driver_number: number;
  speed: number;
  rpm: number;
  n_gear: number;
  throttle: number;
  brake: number;
  drs: number;
  date: string;
  session_key: number;
  meeting_key: number;
}

export interface RaceControlMessage {
  date: string;
  category: string;
  message: string;
  flag: string;
  scope: string;
  sector: number;
  driver_number: number;
  lap_number: number;
  session_key: number;
  meeting_key: number;
}

export interface Weather {
  air_temperature: number;
  humidity: number;
  pressure: number;
  rainfall: number;
  track_temperature: number;
  wind_direction: number;
  wind_speed: number;
  date: string;
  session_key: number;
  meeting_key: number;
}

export interface LocationPoint {
  driver_number: number;
  x: number;
  y: number;
  z: number;
  date: string;
  session_key: number;
  meeting_key: number;
}

export interface Stint {
  compound: string;
  driver_number: number;
  lap_start: number;
  lap_end: number;
  stint_number: number;
  tyre_age_at_start: number;
  session_key: number;
  meeting_key: number;
}

function sinceIso(msAgo: number, relativeTo?: string) {
  const base = relativeTo ? new Date(relativeTo).getTime() : Date.now();
  return new Date(base - msAgo).toISOString().replace(/\.\d{3}Z$/, '+00:00');
}

async function fetchJson<T>(url: string, errorMessage: string): Promise<T> {
  const response = await fetch(url);
  if (response.status === 429) {
    throw new Error('Limite da OpenF1 (30 req/min). Aguarde um instante.');
  }
  if (!response.ok) throw new Error(errorMessage);
  const data = await response.json();
  if (!Array.isArray(data)) throw new Error(errorMessage);
  return data as T;
}

// Funções de API
export const openF1Api = {
  // Buscar sessões (corridas, treinos, classificações)
  async getSessions(params?: { year?: number; session_key?: number; meeting_key?: number }): Promise<Session[]> {
    const queryParams = new URLSearchParams();
    if (params?.year) queryParams.append('year', params.year.toString());
    if (params?.session_key) queryParams.append('session_key', params.session_key.toString());
    if (params?.meeting_key) queryParams.append('meeting_key', params.meeting_key.toString());
    
    const url = `${BASE_URL}/sessions${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Erro ao buscar sessões');
    return response.json();
  },

  // Buscar sessão mais recente
  async getLatestSession(): Promise<Session | null> {
    const url = `${BASE_URL}/sessions?session_key=latest`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Erro ao buscar sessão');
    const data = await response.json();
    return data[0] || null;
  },

  // Buscar meetings (GPs)
  async getMeetings(params?: { year?: number; meeting_key?: number }): Promise<Meeting[]> {
    const queryParams = new URLSearchParams();
    if (params?.year) queryParams.append('year', params.year.toString());
    if (params?.meeting_key) queryParams.append('meeting_key', params.meeting_key.toString());
    
    const url = `${BASE_URL}/meetings${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Erro ao buscar meetings');
    return response.json();
  },

  // Buscar pilotos
  async getDrivers(params?: { session_key?: number | string; driver_number?: number }): Promise<Driver[]> {
    const queryParams = new URLSearchParams();
    if (params?.session_key) queryParams.append('session_key', params.session_key.toString());
    if (params?.driver_number) queryParams.append('driver_number', params.driver_number.toString());
    
    const url = `${BASE_URL}/drivers${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Erro ao buscar pilotos');
    return response.json();
  },

  // Buscar posições
  async getPositions(params: { session_key: number | string; driver_number?: number }): Promise<Position[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('session_key', params.session_key.toString());
    if (params.driver_number) queryParams.append('driver_number', params.driver_number.toString());
    
    const url = `${BASE_URL}/position?${queryParams.toString()}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Erro ao buscar posições');
    return response.json();
  },

  // Buscar dados de volta
  async getLaps(params: { session_key: number | string; driver_number?: number; lap_number?: number }): Promise<LapData[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('session_key', params.session_key.toString());
    if (params.driver_number) queryParams.append('driver_number', params.driver_number.toString());
    if (params.lap_number) queryParams.append('lap_number', params.lap_number.toString());
    const url = `${BASE_URL}/laps?${queryParams.toString()}`;
    return fetchJson<LapData[]>(url, 'Erro ao buscar voltas');
  },

  async getStints(sessionKey: number | string): Promise<Stint[]> {
    const url = `${BASE_URL}/stints?session_key=${sessionKey}`;
    return fetchJson<Stint[]>(url, 'Erro ao buscar pneus');
  },

  // Buscar intervalos entre pilotos
  async getIntervals(params: { session_key: number | string; driver_number?: number }): Promise<Interval[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('session_key', params.session_key.toString());
    if (params.driver_number) queryParams.append('driver_number', params.driver_number.toString());
    
    const url = `${BASE_URL}/intervals?${queryParams.toString()}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Erro ao buscar intervalos');
    return response.json();
  },

  async getCarData(params: {
    session_key: number | string;
    driver_number: number;
    sinceMs?: number;
    relativeTo?: string;
  }): Promise<CarData[]> {
    const since = encodeURIComponent(sinceIso(params.sinceMs ?? 20_000, params.relativeTo));
    const url = `${BASE_URL}/car_data?session_key=${params.session_key}&driver_number=${params.driver_number}&date>=${since}`;
    return fetchJson<CarData[]>(url, 'Erro ao buscar telemetria');
  },

  async getLatestCarSample(params: {
    session_key: number | string;
    driver_number: number;
    relativeTo?: string;
  }): Promise<CarData | null> {
    const samples = await this.getCarData({ ...params, sinceMs: 45_000 });
    if (!samples.length) return null;
    return samples.reduce((latest, sample) =>
      new Date(sample.date) > new Date(latest.date) ? sample : latest
    );
  },

  async getWeather(params: { session_key: number | string }): Promise<Weather[]> {
    const url = `${BASE_URL}/weather?session_key=${params.session_key}`;
    return fetchJson<Weather[]>(url, 'Erro ao buscar clima da pista');
  },

  async getLatestWeather(sessionKey: number | string): Promise<Weather | null> {
    const data = await this.getWeather({ session_key: sessionKey });
    if (!data.length) return null;
    return data.reduce((latest, sample) =>
      new Date(sample.date) > new Date(latest.date) ? sample : latest
    );
  },

  async getLocations(params: { session_key: number | string; sinceMs?: number; relativeTo?: string }): Promise<LocationPoint[]> {
    const since = encodeURIComponent(sinceIso(params.sinceMs ?? 8_000, params.relativeTo));
    const url = `${BASE_URL}/location?session_key=${params.session_key}&date>=${since}`;
    return fetchJson<LocationPoint[]>(url, 'Erro ao buscar posições na pista');
  },

  async getSessionLaps(session: Session): Promise<{ anchor?: string; laps: LapData[] }> {
    const live = Date.now() <= new Date(session.date_end).getTime();
    const laps = await this.getLaps({ session_key: session.session_key });
    if (live) return { laps };
    const dated = laps.filter((lap) => lap.date_start);
    if (!dated.length) return { anchor: session.date_end, laps };
    const anchor = dated.reduce((latest, lap) =>
      new Date(lap.date_start) > new Date(latest) ? lap.date_start : latest,
      dated[0].date_start
    );
    return { anchor, laps };
  },

  async getLatestPositions(sessionKey: number | string, relativeTo?: string): Promise<Position[]> {
    const since = encodeURIComponent(sinceIso(90_000, relativeTo));
    const url = `${BASE_URL}/position?session_key=${sessionKey}&date>=${since}`;
    const points = await fetchJson<Position[]>(url, 'Erro ao buscar posições');
    return points.reduce((acc: Position[], point) => {
      const existing = acc.find((item) => item.driver_number === point.driver_number);
      if (!existing || new Date(point.date) > new Date(existing.date)) {
        return [...acc.filter((item) => item.driver_number !== point.driver_number), point];
      }
      return acc;
    }, []);
  },

  async getLatestLocations(sessionKey: number | string, relativeTo?: string): Promise<LocationPoint[]> {
    const points = await this.getLocations({ session_key: sessionKey, sinceMs: 45_000, relativeTo });
    return points.reduce((acc: LocationPoint[], point) => {
      const existing = acc.find((item) => item.driver_number === point.driver_number);
      if (!existing || new Date(point.date) > new Date(existing.date)) {
        return [...acc.filter((item) => item.driver_number !== point.driver_number), point];
      }
      return acc;
    }, []);
  },

  // Buscar mensagens de controle de corrida
  async getRaceControl(params: { session_key: number | string }): Promise<RaceControlMessage[]> {
    const queryParams = new URLSearchParams();
    queryParams.append('session_key', params.session_key.toString());
    
    const url = `${BASE_URL}/race_control?${queryParams.toString()}`;
    const response = await fetch(url);
    if (!response.ok) throw new Error('Erro ao buscar mensagens');
    return response.json();
  }
};
