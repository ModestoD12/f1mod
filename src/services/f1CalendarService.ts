// F1 Calendar Service usando Jolpica API
const BASE_URL = 'https://api.jolpi.ca/ergast/f1';

export interface F1Race {
  round: string;
  raceName: string;
  circuitId: string;
  circuitName: string;
  locality: string;
  country: string;
  date: string;
  time: string;
  sessions: {
    fp1?: { date: string; time: string };
    fp2?: { date: string; time: string };
    fp3?: { date: string; time: string };
    qualifying?: { date: string; time: string };
    sprintQualifying?: { date: string; time: string };
    sprint?: { date: string; time: string };
    race: { date: string; time: string };
  };
}

export interface F1RaceResult {
  position: number;
  points: number;
  driver: {
    code: string;
    givenName: string;
    familyName: string;
    nationality: string;
    permanentNumber: string;
  };
  constructorName: string;
}

export interface F1LastRace {
  season: string;
  round: string;
  raceName: string;
  date: string;
  time: string;
  locality: string;
  country: string;
  results: F1RaceResult[];
}

export interface CalendarEvent {
  id: string;
  sport: string;
  title: string;
  date: string;
  time: string;
  teams: string[];
  channel: string;
  status: string;
  session?: string;
  sessionType?: string;
  duration?: string;
  circuit?: string;
  circuitId?: string;
  location?: string;
  country?: string;
  description?: string;
  laps?: string;
  round?: number;
}

function mapRace(race: any): F1Race {
  return {
    round: race.round,
    raceName: race.raceName,
    circuitId: race.Circuit.circuitId,
    circuitName: race.Circuit.circuitName,
    locality: race.Circuit.Location.locality,
    country: race.Circuit.Location.country,
    date: race.date,
    time: race.time || '14:00:00Z',
    sessions: {
      fp1: race.FirstPractice ? { date: race.FirstPractice.date, time: race.FirstPractice.time } : undefined,
      fp2: race.SecondPractice ? { date: race.SecondPractice.date, time: race.SecondPractice.time } : undefined,
      fp3: race.ThirdPractice ? { date: race.ThirdPractice.date, time: race.ThirdPractice.time } : undefined,
      qualifying: race.Qualifying ? { date: race.Qualifying.date, time: race.Qualifying.time } : undefined,
      sprintQualifying: race.SprintQualifying
        ? { date: race.SprintQualifying.date, time: race.SprintQualifying.time }
        : undefined,
      sprint: race.Sprint ? { date: race.Sprint.date, time: race.Sprint.time } : undefined,
      race: { date: race.date, time: race.time || '14:00:00Z' },
    },
  };
}

function sessionStatus(date: string, time: string, durationMinutes: number): string {
  const start = new Date(`${date}T${time}`);
  if (Number.isNaN(start.getTime())) return 'Agendado';
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  const now = new Date();
  if (now >= start && now <= end) return 'Ao vivo';
  if (now > end) return 'Finalizado';
  return 'Agendado';
}

export const f1CalendarApi = {
  async getRaces(season: string = 'current'): Promise<{ season: string; races: F1Race[] }> {
    try {
      const response = await fetch(`${BASE_URL}/${season}.json?limit=100`);
      if (!response.ok) throw new Error('Erro ao buscar calendário');

      const data = await response.json();
      const races = data.MRData.RaceTable.Races || [];

      return {
        season: data.MRData.RaceTable.season || String(new Date().getFullYear()),
        races: races.map(mapRace),
      };
    } catch (error) {
      console.error('Erro ao buscar calendário:', error);
      throw error;
    }
  },

  async getNextRace(season: string = 'current'): Promise<F1Race | null> {
    const response = await fetch(`${BASE_URL}/${season}/next.json`);
    if (!response.ok) throw new Error('Erro ao buscar próxima corrida');
    const data = await response.json();
    const race = data.MRData.RaceTable.Races?.[0];
    return race ? mapRace(race) : null;
  },

  async getLastRace(season: string = 'current'): Promise<F1LastRace | null> {
    const response = await fetch(`${BASE_URL}/${season}/last/results.json`);
    if (!response.ok) throw new Error('Erro ao buscar último resultado');
    const data = await response.json();
    const race = data.MRData.RaceTable.Races?.[0];
    if (!race) return null;

    return {
      season: race.season,
      round: race.round,
      raceName: race.raceName,
      date: race.date,
      time: race.time || '14:00:00Z',
      locality: race.Circuit.Location.locality,
      country: race.Circuit.Location.country,
      results: (race.Results || []).map((result: any) => ({
        position: parseInt(result.position, 10),
        points: parseFloat(result.points),
        driver: {
          code: result.Driver.code,
          givenName: result.Driver.givenName,
          familyName: result.Driver.familyName,
          nationality: result.Driver.nationality,
          permanentNumber: result.Driver.permanentNumber,
        },
        constructorName: result.Constructor?.name || '',
      })),
    };
  },

  // Converter corridas em eventos para o calendário
  convertToCalendarEvents(races: F1Race[]): CalendarEvent[] {
    const events: CalendarEvent[] = [];

    races.forEach((race) => {
      const shared = {
        sport: 'f1',
        teams: [] as string[],
        circuit: race.circuitName,
        circuitId: race.circuitId,
        location: `${race.locality}, ${race.country}`,
        country: race.country,
        round: parseInt(race.round, 10),
      };

      if (race.sessions.fp1) {
        events.push({
          ...shared,
          id: `f1-fp1-${race.round}`,
          title: `${race.raceName} - Treino Livre 1`,
          date: race.sessions.fp1.date,
          time: this.formatTime(race.sessions.fp1.time),
          channel: 'sportv',
          status: sessionStatus(race.sessions.fp1.date, race.sessions.fp1.time, 60),
          session: 'FP1',
          sessionType: 'Treino Livre',
          duration: '60 minutos',
          description: 'Transmissão ao vivo no sportv / Globoplay',
        });
      }

      if (race.sessions.fp2) {
        events.push({
          ...shared,
          id: `f1-fp2-${race.round}`,
          title: `${race.raceName} - Treino Livre 2`,
          date: race.sessions.fp2.date,
          time: this.formatTime(race.sessions.fp2.time),
          channel: 'sportv',
          status: sessionStatus(race.sessions.fp2.date, race.sessions.fp2.time, 60),
          session: 'FP2',
          sessionType: 'Treino Livre',
          duration: '60 minutos',
          description: 'Transmissão ao vivo no sportv / Globoplay',
        });
      }

      if (race.sessions.fp3) {
        events.push({
          ...shared,
          id: `f1-fp3-${race.round}`,
          title: `${race.raceName} - Treino Livre 3`,
          date: race.sessions.fp3.date,
          time: this.formatTime(race.sessions.fp3.time),
          channel: 'sportv',
          status: sessionStatus(race.sessions.fp3.date, race.sessions.fp3.time, 60),
          session: 'FP3',
          sessionType: 'Treino Livre',
          duration: '60 minutos',
          description: 'Transmissão ao vivo no sportv / Globoplay',
        });
      }

      if (race.sessions.qualifying) {
        events.push({
          ...shared,
          id: `f1-quali-${race.round}`,
          title: `${race.raceName} - Classificação`,
          date: race.sessions.qualifying.date,
          time: this.formatTime(race.sessions.qualifying.time),
          channel: 'Globo',
          status: sessionStatus(race.sessions.qualifying.date, race.sessions.qualifying.time, 60),
          session: 'Qualifying',
          sessionType: 'Classificação',
          duration: '60 minutos (Q1-Q2-Q3)',
          description: 'Transmissão Globo, sportv e Globoplay',
        });
      }

      if (race.sessions.sprintQualifying) {
        events.push({
          ...shared,
          id: `f1-sprint-quali-${race.round}`,
          title: `${race.raceName} - Classificação Sprint`,
          date: race.sessions.sprintQualifying.date,
          time: this.formatTime(race.sessions.sprintQualifying.time),
          channel: 'Globo',
          status: sessionStatus(race.sessions.sprintQualifying.date, race.sessions.sprintQualifying.time, 45),
          session: 'Sprint Qualifying',
          sessionType: 'Classificação Sprint',
          duration: '45 minutos',
          description: 'Transmissão Globo, sportv e Globoplay',
        });
      }

      if (race.sessions.sprint) {
        events.push({
          ...shared,
          id: `f1-sprint-${race.round}`,
          title: `${race.raceName} - Sprint`,
          date: race.sessions.sprint.date,
          time: this.formatTime(race.sessions.sprint.time),
          channel: 'Globo',
          status: sessionStatus(race.sessions.sprint.date, race.sessions.sprint.time, 45),
          session: 'Sprint',
          sessionType: 'Corrida Sprint',
          duration: '~30 minutos',
          description: 'Transmissão Globo, sportv e Globoplay',
        });
      }

      events.push({
        ...shared,
        id: `f1-race-${race.round}`,
        title: race.raceName,
        date: race.sessions.race.date,
        time: this.formatTime(race.sessions.race.time),
        channel: 'Globo',
        status: sessionStatus(race.sessions.race.date, race.sessions.race.time, 150),
        session: 'Race',
        sessionType: 'Grande Prêmio',
        duration: '~2 horas',
        description: 'Transmissão Globo, sportv e Globoplay',
      });
    });

    return events.sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });
  },

  formatTime(time: string): string {
    if (!time) return '14:00';
    // Converter de UTC para horário local (Brasil -3)
    try {
      const [hours, minutes] = time.replace('Z', '').split(':');
      const utcHours = parseInt(hours);
      // Ajustar para horário de Brasília (UTC-3)
      let brHours = utcHours - 3;
      if (brHours < 0) brHours += 24;
      return `${String(brHours).padStart(2, '0')}:${minutes}`;
    } catch {
      return time.substring(0, 5);
    }
  },
};
