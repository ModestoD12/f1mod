// F1 Standings Service usando Jolpica API (fork da Ergast)
// API: https://api.jolpi.ca/ergast/

const BASE_URL = 'https://api.jolpi.ca/ergast/f1';

export interface DriverStanding {
  position: number;
  points: number;
  wins: number;
  driver: {
    driverId: string;
    permanentNumber: string;
    code: string;
    givenName: string;
    familyName: string;
    nationality: string;
  };
  constructors: {
    constructorId: string;
    name: string;
    nationality: string;
  }[];
}

export interface ConstructorStanding {
  position: number;
  points: number;
  wins: number;
  constructor: {
    constructorId: string;
    name: string;
    nationality: string;
  };
}

// Mapeamento completo de nacionalidade para bandeira emoji
const nationalityFlags: Record<string, string> = {
  // Pilotos atuais 2025
  'British': '🇬🇧',
  'Dutch': '🇳🇱',
  'Monegasque': '🇲🇨',
  'Spanish': '🇪🇸',
  'Australian': '🇦🇺',
  'German': '🇩🇪',
  'French': '🇫🇷',
  'Mexican': '🇲🇽',
  'Canadian': '🇨🇦',
  'Japanese': '🇯🇵',
  'Thai': '🇹🇭',
  'Finnish': '🇫🇮',
  'Danish': '🇩🇰',
  'Chinese': '🇨🇳',
  'American': '🇺🇸',
  'Italian': '🇮🇹',
  'Brazilian': '🇧🇷',
  'New Zealander': '🇳🇿',
  'Argentine': '🇦🇷',
  // Outros
  'Polish': '🇵🇱',
  'Russian': '🇷🇺',
  'Belgian': '🇧🇪',
  'Swiss': '🇨🇭',
  'Austrian': '🇦🇹',
  'Swedish': '🇸🇪',
  'Norwegian': '🇳🇴',
  'South African': '🇿🇦',
  'Indian': '🇮🇳',
  'Indonesian': '🇮🇩',
  'Venezuelan': '🇻🇪',
  'Colombian': '🇨🇴',
  'Portuguese': '🇵🇹',
  'Korean': '🇰🇷',
  'Singaporean': '🇸🇬',
  'Malaysian': '🇲🇾',
  'Irish': '🇮🇪',
  'Czech': '🇨🇿',
  'Hungarian': '🇭🇺',
  'Greek': '🇬🇷',
  'Turkish': '🇹🇷',
  'Emirati': '🇦🇪',
  'Saudi': '🇸🇦',
  'Qatari': '🇶🇦',
  'Bahraini': '🇧🇭',
};

// Cores oficiais das equipes 2025
const teamColors: Record<string, string> = {
  'mclaren': '#FF8700',
  'ferrari': '#E8002D',
  'red_bull': '#3671C6',
  'mercedes': '#27F4D2',
  'aston_martin': '#229971',
  'alpine': '#00A1E8',
  'haas': '#B6BABD',
  'rb': '#6692FF',
  'racing_bulls': '#6692FF',
  'williams': '#1868DB',
  'sauber': '#52E252',
  'kick_sauber': '#52E252',
  'audi': '#BB0A30',
  'cadillac': '#D4AF37',
};

// Nomes curtos das equipes
const teamShortNames: Record<string, string> = {
  'mclaren': 'McLaren',
  'ferrari': 'Ferrari',
  'red_bull': 'Red Bull',
  'mercedes': 'Mercedes',
  'aston_martin': 'Aston Martin',
  'alpine': 'Alpine',
  'haas': 'Haas',
  'rb': 'RB',
  'racing_bulls': 'Racing Bulls',
  'williams': 'Williams',
  'sauber': 'Sauber',
  'kick_sauber': 'Kick Sauber',
  'audi': 'Audi',
  'cadillac': 'Cadillac',
};

// Bandeiras das equipes por nacionalidade
const teamNationalityFlags: Record<string, string> = {
  'British': '🇬🇧',
  'Italian': '🇮🇹',
  'Austrian': '🇦🇹',
  'German': '🇩🇪',
  'French': '🇫🇷',
  'American': '🇺🇸',
  'Swiss': '🇨🇭',
};

export interface ChampionshipStandings<T> {
  season: string;
  round: string;
  standings: T[];
}

export const f1StandingsApi = {
  // Buscar classificação de pilotos
  async getDriverStandings(season: string = 'current'): Promise<ChampionshipStandings<DriverStanding>> {
    try {
      const response = await fetch(`${BASE_URL}/${season}/driverStandings.json`);
      if (!response.ok) throw new Error('Erro ao buscar classificação');
      
      const data = await response.json();
      const list = data.MRData.StandingsTable.StandingsLists[0];
      const standings = list?.DriverStandings || [];
      
      return {
        season: list?.season || data.MRData.StandingsTable.season,
        round: list?.round || '',
        standings: standings.map((s: any) => ({
        position: parseInt(s.position),
        points: parseFloat(s.points),
        wins: parseInt(s.wins),
        driver: {
          driverId: s.Driver.driverId,
          permanentNumber: s.Driver.permanentNumber,
          code: s.Driver.code,
          givenName: s.Driver.givenName,
          familyName: s.Driver.familyName,
          nationality: s.Driver.nationality,
        },
        constructors: Array.isArray(s.Constructors) 
          ? s.Constructors.map((c: any) => ({
              constructorId: c.constructorId,
              name: c.name,
              nationality: c.nationality,
            }))
          : [],
      })),
      };
    } catch (error) {
      console.error('Erro ao buscar standings:', error);
      throw error;
    }
  },

  // Buscar classificação de construtores
  async getConstructorStandings(season: string = 'current'): Promise<ChampionshipStandings<ConstructorStanding>> {
    try {
      const response = await fetch(`${BASE_URL}/${season}/constructorStandings.json`);
      if (!response.ok) throw new Error('Erro ao buscar classificação');
      
      const data = await response.json();
      const list = data.MRData.StandingsTable.StandingsLists[0];
      const standings = list?.ConstructorStandings || [];
      
      return {
        season: list?.season || data.MRData.StandingsTable.season,
        round: list?.round || '',
        standings: standings.map((s: any) => ({
        position: parseInt(s.position),
        points: parseFloat(s.points),
        wins: parseInt(s.wins),
        constructor: {
          constructorId: s.Constructor.constructorId,
          name: s.Constructor.name,
          nationality: s.Constructor.nationality,
        },
      })),
      };
    } catch (error) {
      console.error('Erro ao buscar standings:', error);
      throw error;
    }
  },

  // Helpers
  getFlag(nationality: string): string {
    return nationalityFlags[nationality] || '🏁';
  },

  getTeamFlag(nationality: string): string {
    return teamNationalityFlags[nationality] || '🏁';
  },

  getTeamColor(constructorId: string): string {
    const id = constructorId.toLowerCase().replace(/ /g, '_');
    return teamColors[id] || '#666666';
  },

  getTeamShortName(constructorId: string): string {
    const id = constructorId.toLowerCase().replace(/ /g, '_');
    return teamShortNames[id] || constructorId;
  },

  // Retorna gradiente baseado na cor da equipe
  getTeamGradient(constructorId: string): string {
    const color = this.getTeamColor(constructorId);
    return `linear-gradient(135deg, ${color}20 0%, transparent 100%)`;
  },
};
