// Teto do regulamento 2026. Uma corrida encurtada paga menos.
// Piloto: 25 na corrida e 8 na sprint.
// Equipe: 43 na corrida (1º e 2º) e 15 na sprint (1º e 2º).

export const RACE_WIN_POINTS = 25;
export const SPRINT_WIN_POINTS = 8;
export const RACE_ONE_TWO_POINTS = 43;
export const SPRINT_ONE_TWO_POINTS = 15;

const RACE_DURATION_MS = 150 * 60 * 1000;
const SPRINT_DURATION_MS = 45 * 60 * 1000;
const RACE_WATCH_AFTER_MS = 90 * 60 * 1000;
const SPRINT_WATCH_AFTER_MS = 25 * 60 * 1000;
export const STANDINGS_CATCHUP_MS = 3 * 60 * 60 * 1000;

export interface ScoringSession {
  round: number;
  kind: 'race' | 'sprint';
  startsAt: number;
  endsAt: number;
}

export interface TitleContender {
  id: string;
  points: number;
  wins: number;
}

interface CalendarRace {
  round: string;
  sessions: {
    sprint?: { date: string; time: string };
    race: { date: string; time: string };
  };
}

function sessionStart(date: string, time: string) {
  const start = new Date(`${date}T${time}`).getTime();
  return Number.isNaN(start) ? null : start;
}

export function scoringSessionsFromRaces(races: CalendarRace[]): ScoringSession[] {
  const sessions: ScoringSession[] = [];

  races.forEach((race) => {
    const round = parseInt(race.round, 10);
    if (!Number.isFinite(round)) return;

    if (race.sessions.sprint) {
      const startsAt = sessionStart(race.sessions.sprint.date, race.sessions.sprint.time);
      if (startsAt !== null) {
        sessions.push({
          round,
          kind: 'sprint',
          startsAt,
          endsAt: startsAt + SPRINT_DURATION_MS,
        });
      }
    }

    const raceStart = sessionStart(race.sessions.race.date, race.sessions.race.time);
    if (raceStart !== null) {
      sessions.push({
        round,
        kind: 'race',
        startsAt: raceStart,
        endsAt: raceStart + RACE_DURATION_MS,
      });
    }
  });

  return sessions.sort((a, b) => a.startsAt - b.startsAt);
}

function sessionIsInStandings(session: ScoringSession, standingsRound: number, now: number) {
  if (session.endsAt > now) return false;
  if (session.round < standingsRound) return true;
  if (session.round > standingsRound) return false;
  return true;
}

function maxPointsForSessions(
  sessions: ScoringSession[],
  standingsRound: number,
  now: number,
  racePoints: number,
  sprintPoints: number,
) {
  return sessions.reduce((total, session) => {
    if (sessionIsInStandings(session, standingsRound, now)) return total;
    return total + (session.kind === 'sprint' ? sprintPoints : racePoints);
  }, 0);
}

export function maxPointsStillAvailable(sessions: ScoringSession[], standingsRound: number, now: number) {
  return maxPointsForSessions(sessions, standingsRound, now, RACE_WIN_POINTS, SPRINT_WIN_POINTS);
}

export function maxConstructorPointsStillAvailable(sessions: ScoringSession[], standingsRound: number, now: number) {
  return maxPointsForSessions(sessions, standingsRound, now, RACE_ONE_TWO_POINTS, SPRINT_ONE_TWO_POINTS);
}

export function championId(contenders: TitleContender[], maxRemaining: number) {
  if (contenders.length === 0) return null;

  const sorted = [...contenders].sort((a, b) => b.points - a.points || b.wins - a.wins);
  const leader = sorted[0];
  if (sorted.length === 1) return maxRemaining === 0 ? leader.id : null;

  const bestRival = sorted.slice(1).reduce((highest, rival) => Math.max(highest, rival.points), 0);
  if (leader.points > bestRival + maxRemaining) return leader.id;

  const tiedOnPoints = sorted.filter((contender) => contender.points === leader.points);
  if (maxRemaining === 0 && tiedOnPoints.length > 1 && leader.wins > tiedOnPoints[1].wins) {
    return leader.id;
  }

  return null;
}

export function nextStandingsCheck(sessions: ScoringSession[], now: number) {
  const windows = sessions.map((session) => {
    const watchFrom = session.startsAt + (session.kind === 'sprint' ? SPRINT_WATCH_AFTER_MS : RACE_WATCH_AFTER_MS);
    const watchUntil = session.endsAt + STANDINGS_CATCHUP_MS;
    return { watchFrom, watchUntil };
  });

  const open = windows.find((window) => now >= window.watchFrom && now < window.watchUntil);
  if (open) return { waitMs: 60 * 1000, shouldFetch: true };

  const upcoming = windows
    .map((window) => window.watchFrom)
    .filter((watchFrom) => watchFrom > now)
    .sort((a, b) => a - b)[0];

  if (upcoming === undefined) return null;
  return { waitMs: Math.min(upcoming - now, 2_147_000_000), shouldFetch: false };
}
