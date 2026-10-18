// Dados da Fórmula 1 - Temporada 2025
// Grid atualizado com mudanças de pilotos para 2025
export const f1Drivers = [
  // Red Bull Racing
  { id: 1, name: 'Max Verstappen', number: 1, team: 'Red Bull Racing', teamColor: '#3671C6', nationality: '🇳🇱', points: 0 },
  { id: 2, name: 'Liam Lawson', number: 30, team: 'Red Bull Racing', teamColor: '#3671C6', nationality: '🇳🇿', points: 0 },
  // Ferrari (Hamilton chegou!)
  { id: 3, name: 'Lewis Hamilton', number: 44, team: 'Scuderia Ferrari', teamColor: '#DC143C', nationality: '🇬🇧', points: 0 },
  { id: 4, name: 'Charles Leclerc', number: 16, team: 'Scuderia Ferrari', teamColor: '#DC143C', nationality: '🇲🇨', points: 0 },
  // McLaren
  { id: 5, name: 'Lando Norris', number: 4, team: 'McLaren', teamColor: '#FF8700', nationality: '🇬🇧', points: 0 },
  { id: 6, name: 'Oscar Piastri', number: 81, team: 'McLaren', teamColor: '#FF8700', nationality: '🇦🇺', points: 0 },
  // Mercedes
  { id: 7, name: 'George Russell', number: 63, team: 'Mercedes', teamColor: '#27F4D2', nationality: '🇬🇧', points: 0 },
  { id: 8, name: 'Andrea Kimi Antonelli', number: 12, team: 'Mercedes', teamColor: '#27F4D2', nationality: '🇮🇹', points: 0 },
  // Aston Martin
  { id: 9, name: 'Fernando Alonso', number: 14, team: 'Aston Martin', teamColor: '#229971', nationality: '🇪🇸', points: 0 },
  { id: 10, name: 'Lance Stroll', number: 18, team: 'Aston Martin', teamColor: '#229971', nationality: '🇨🇦', points: 0 },
  // Alpine
  { id: 11, name: 'Pierre Gasly', number: 10, team: 'Alpine', teamColor: '#FF87BC', nationality: '🇫🇷', points: 0 },
  { id: 12, name: 'Jack Doohan', number: 7, team: 'Alpine', teamColor: '#FF87BC', nationality: '🇦🇺', points: 0 },
  // Williams
  { id: 13, name: 'Alexander Albon', number: 23, team: 'Williams', teamColor: '#64C4FF', nationality: '🇹🇭', points: 0 },
  { id: 14, name: 'Carlos Sainz', number: 55, team: 'Williams', teamColor: '#64C4FF', nationality: '🇪🇸', points: 0 },
  // RB (Visa Cash App RB)
  { id: 15, name: 'Yuki Tsunoda', number: 22, team: 'RB', teamColor: '#6692FF', nationality: '🇯🇵', points: 0 },
  { id: 16, name: 'Isack Hadjar', number: 6, team: 'RB', teamColor: '#6692FF', nationality: '🇫🇷', points: 0 },
  // Haas
  { id: 17, name: 'Esteban Ocon', number: 31, team: 'Haas', teamColor: '#B6BABD', nationality: '🇫🇷', points: 0 },
  { id: 18, name: 'Oliver Bearman', number: 87, team: 'Haas', teamColor: '#B6BABD', nationality: '🇬🇧', points: 0 },
  // Sauber (futuro Audi)
  { id: 19, name: 'Nico Hülkenberg', number: 27, team: 'Kick Sauber', teamColor: '#52E252', nationality: '🇩🇪', points: 0 },
  { id: 20, name: 'Gabriel Bortoleto', number: 5, team: 'Kick Sauber', teamColor: '#52E252', nationality: '🇧🇷', points: 0 }
];

export const f1Teams = [
  { id: 'mclaren', name: 'McLaren F1 Team', color: '#FF8700', points: 0, shortName: 'McLaren' },
  { id: 'ferrari', name: 'Scuderia Ferrari', color: '#DC143C', points: 0, shortName: 'Ferrari' },
  { id: 'redbull', name: 'Oracle Red Bull Racing', color: '#3671C6', points: 0, shortName: 'Red Bull' },
  { id: 'mercedes', name: 'Mercedes-AMG Petronas F1 Team', color: '#27F4D2', points: 0, shortName: 'Mercedes' },
  { id: 'astonmartin', name: 'Aston Martin Aramco F1 Team', color: '#229971', points: 0, shortName: 'Aston Martin' },
  { id: 'alpine', name: 'BWT Alpine F1 Team', color: '#FF87BC', points: 0, shortName: 'Alpine' },
  { id: 'haas', name: 'MoneyGram Haas F1 Team', color: '#B6BABD', points: 0, shortName: 'Haas' },
  { id: 'rb', name: 'Visa Cash App RB F1 Team', color: '#6692FF', points: 0, shortName: 'RB' },
  { id: 'williams', name: 'Williams Racing', color: '#64C4FF', points: 0, shortName: 'Williams' },
  { id: 'sauber', name: 'Stake F1 Team Kick Sauber', color: '#52E252', points: 0, shortName: 'Kick Sauber' }
];

// Dados organizados para as tabelas
// Nota: A temporada 2025 ainda não começou, então os pontos estão zerados
// Os dados serão atualizados conforme a temporada progride
export const f1DriversStandings = f1Drivers.map((driver, index) => ({
  position: index + 1,
  driver: driver.name,
  team: driver.team,
  points: driver.points,
  nationality: driver.nationality,
  number: driver.number
}));

export const f1ConstructorsStandings = f1Teams.map((team, index) => ({
  position: index + 1,
  team: team.shortName,
  fullName: team.name,
  points: team.points,
  color: team.color,
  id: team.id
}));

export const f1Circuits = [
  { 
    id: 'interlagos', 
    name: 'Autódromo José Carlos Pace', 
    location: 'São Paulo, Brasil', 
    lapRecord: '1:10.540',
    length: '4.309 km',
    turns: 15
  },
  { 
    id: 'monaco', 
    name: 'Circuit de Monaco', 
    location: 'Monte Carlo, Monaco', 
    lapRecord: '1:12.909',
    length: '3.337 km',
    turns: 19
  },
  { 
    id: 'silverstone', 
    name: 'Silverstone Circuit', 
    location: 'Silverstone, Reino Unido', 
    lapRecord: '1:27.097',
    length: '5.891 km',
    turns: 18
  },
  { 
    id: 'spa', 
    name: 'Circuit de Spa-Francorchamps', 
    location: 'Spa, Bélgica', 
    lapRecord: '1:46.286',
    length: '7.004 km',
    turns: 20
  }
];

export const f1Schedule2025 = [
  {
    id: 1,
    round: 1,
    raceName: 'Grande Prêmio do Bahrein',
    circuit: 'Bahrain International Circuit',
    location: 'Sakhir, Bahrein',
    date: '2025-03-02',
    laps: 57,
    distance: '308.238 km',
    lapRecord: '1:31.447',
    expectedWeather: 'Ensolarado, 28°C',
    expectedPole: 'Max Verstappen',
    expectedTyres: 'C2-C3-C4',
    sessions: {
      practice1: { date: '2025-02-28', time: '11:30' },
      practice2: { date: '2025-02-28', time: '15:00' },
      practice3: { date: '2025-03-01', time: '11:30' },
      qualifying: { date: '2025-03-01', time: '15:00' },
      race: { date: '2025-03-02', time: '15:00' }
    }
  },
  {
    id: 2,
    round: 2,
    raceName: 'Grande Prêmio da Arábia Saudita',
    circuit: 'Jeddah Corniche Circuit',
    location: 'Jeddah, Arábia Saudita',
    date: '2025-03-09',
    laps: 50,
    distance: '308.450 km',
    lapRecord: '1:30.734',
    expectedWeather: 'Claro, 26°C',
    expectedPole: 'Charles Leclerc',
    expectedTyres: 'C3-C4-C5',
    sessions: {
      practice1: { date: '2025-03-07', time: '13:30' },
      practice2: { date: '2025-03-07', time: '17:00' },
      practice3: { date: '2025-03-08', time: '13:30' },
      qualifying: { date: '2025-03-08', time: '17:00' },
      race: { date: '2025-03-09', time: '17:00' }
    }
  },
  {
    id: 3,
    round: 3,
    raceName: 'Grande Prêmio da Austrália',
    circuit: 'Albert Park Circuit',
    location: 'Melbourne, Austrália',
    date: '2025-03-16',
    sessions: {
      practice1: { date: '2025-03-14', time: '03:30' },
      practice2: { date: '2025-03-14', time: '07:00' },
      practice3: { date: '2025-03-15', time: '03:30' },
      qualifying: { date: '2025-03-15', time: '07:00' },
      race: { date: '2025-03-16', time: '06:00' }
    }
  },
  {
    id: 4,
    round: 4,
    raceName: 'Grande Prêmio do Japão',
    circuit: 'Suzuka Circuit',
    location: 'Suzuka, Japão',
    date: '2025-04-13',
    sessions: {
      practice1: { date: '2025-04-11', time: '03:30' },
      practice2: { date: '2025-04-11', time: '07:00' },
      practice3: { date: '2025-04-12', time: '03:30' },
      qualifying: { date: '2025-04-12', time: '07:00' },
      race: { date: '2025-04-13', time: '06:00' }
    }
  },
  {
    id: 5,
    round: 5,
    raceName: 'Grande Prêmio da China',
    circuit: 'Shanghai International Circuit',
    location: 'Shanghai, China',
    date: '2025-04-20',
    laps: 56,
    distance: '305.066 km',
    lapRecord: '1:32.238',
    expectedWeather: 'Nublado, 22°C',
    expectedPole: 'Oscar Piastri',
    expectedTyres: 'C2-C3-C4',
    sessions: {
      practice1: { date: '2025-04-18', time: '05:30' },
      sprintShootout: { date: '2025-04-18', time: '09:30' },
      sprintRace: { date: '2025-04-19', time: '05:00' },
      qualifying: { date: '2025-04-19', time: '09:00' },
      race: { date: '2025-04-20', time: '08:00' }
    }
  },
  {
    id: 6,
    round: 6,
    raceName: 'Grande Prêmio de Miami',
    circuit: 'Miami International Autodrome',
    location: 'Miami, EUA',
    date: '2025-05-04',
    sessions: {
      practice1: { date: '2025-05-02', time: '16:30' },
      sprintQualifying: { date: '2025-05-02', time: '20:30' },
      sprintRace: { date: '2025-05-03', time: '16:00' },
      qualifying: { date: '2025-05-03', time: '20:00' },
      race: { date: '2025-05-04', time: '20:00' }
    }
  },
  {
    id: 7,
    round: 7,
    raceName: 'Grande Prêmio da Emília-Romanha',
    circuit: 'Autodromo Enzo e Dino Ferrari',
    location: 'Imola, Itália',
    date: '2025-05-18',
    sessions: {
      practice1: { date: '2025-05-16', time: '09:30' },
      practice2: { date: '2025-05-16', time: '13:00' },
      practice3: { date: '2025-05-17', time: '08:30' },
      qualifying: { date: '2025-05-17', time: '12:00' },
      race: { date: '2025-05-18', time: '09:00' }
    }
  },
  {
    id: 8,
    round: 8,
    raceName: 'Grande Prêmio de Monaco',
    circuit: 'Circuit de Monaco',
    location: 'Monte Carlo, Monaco',
    date: '2025-05-25',
    laps: 78,
    distance: '260.286 km',
    lapRecord: '1:12.909',
    expectedWeather: 'Ensolarado, 24°C',
    expectedPole: 'Charles Leclerc',
    expectedTyres: 'C3-C4-C5',
    sessions: {
      practice1: { date: '2025-05-23', time: '09:30' },
      practice2: { date: '2025-05-23', time: '13:00' },
      practice3: { date: '2025-05-24', time: '08:30' },
      qualifying: { date: '2025-05-24', time: '12:00' },
      race: { date: '2025-05-25', time: '09:00' }
    }
  },
  {
    id: 9,
    round: 9,
    raceName: 'Grande Prêmio do Canadá',
    circuit: 'Circuit Gilles Villeneuve',
    location: 'Montreal, Canadá',
    date: '2025-06-08',
    laps: 70,
    distance: '305.270 km',
    lapRecord: '1:13.078',
    expectedWeather: 'Nublado, 21°C',
    expectedPole: 'Max Verstappen',
    expectedTyres: 'C3-C4-C5',
    sessions: {
      practice1: { date: '2025-06-06', time: '14:30' },
      practice2: { date: '2025-06-06', time: '18:00' },
      practice3: { date: '2025-06-07', time: '13:30' },
      qualifying: { date: '2025-06-07', time: '17:00' },
      race: { date: '2025-06-08', time: '15:00' }
    }
  },
  {
    id: 10,
    round: 10,
    raceName: 'Grande Prêmio da Espanha',
    circuit: 'Circuit de Barcelona-Catalunya',
    location: 'Barcelona, Espanha',
    date: '2025-06-15',
    laps: 66,
    distance: '307.236 km',
    lapRecord: '1:16.330',
    expectedWeather: 'Ensolarado, 28°C',
    expectedPole: 'Lando Norris',
    expectedTyres: 'C2-C3-C4',
    sessions: {
      practice1: { date: '2025-06-13', time: '09:30' },
      practice2: { date: '2025-06-13', time: '13:00' },
      practice3: { date: '2025-06-14', time: '08:30' },
      qualifying: { date: '2025-06-14', time: '12:00' },
      race: { date: '2025-06-15', time: '09:00' }
    }
  },
  {
    id: 11,
    round: 11,
    raceName: 'Grande Prêmio da Áustria',
    circuit: 'Red Bull Ring',
    location: 'Spielberg, Áustria',
    date: '2025-06-29',
    laps: 71,
    distance: '306.452 km',
    lapRecord: '1:05.619',
    expectedWeather: 'Parcialmente nublado, 25°C',
    expectedPole: 'Max Verstappen',
    expectedTyres: 'C3-C4-C5',
    sessions: {
      practice1: { date: '2025-06-27', time: '09:30' },
      sprintShootout: { date: '2025-06-27', time: '13:30' },
      sprintRace: { date: '2025-06-28', time: '08:00' },
      qualifying: { date: '2025-06-28', time: '12:00' },
      race: { date: '2025-06-29', time: '09:00' }
    }
  },
  {
    id: 12,
    round: 12,
    raceName: 'Grande Prêmio da Grã-Bretanha',
    circuit: 'Silverstone Circuit',
    location: 'Silverstone, Reino Unido',
    date: '2025-07-06',
    laps: 52,
    distance: '306.198 km',
    lapRecord: '1:27.097',
    expectedWeather: 'Nublado, 19°C - possível chuva',
    expectedPole: 'Lewis Hamilton',
    expectedTyres: 'C1-C2-C3',
    sessions: {
      practice1: { date: '2025-07-04', time: '09:30' },
      practice2: { date: '2025-07-04', time: '13:00' },
      practice3: { date: '2025-07-05', time: '08:30' },
      qualifying: { date: '2025-07-05', time: '12:00' },
      race: { date: '2025-07-06', time: '10:00' }
    }
  },
  {
    id: 13,
    round: 13,
    raceName: 'Grande Prêmio da Hungria',
    circuit: 'Hungaroring',
    location: 'Budapeste, Hungria',
    date: '2025-07-20',
    laps: 70,
    distance: '306.630 km',
    lapRecord: '1:16.627',
    expectedWeather: 'Ensolarado, 32°C',
    expectedPole: 'Oscar Piastri',
    expectedTyres: 'C2-C3-C4',
    sessions: {
      practice1: { date: '2025-07-18', time: '09:30' },
      practice2: { date: '2025-07-18', time: '13:00' },
      practice3: { date: '2025-07-19', time: '08:30' },
      qualifying: { date: '2025-07-19', time: '12:00' },
      race: { date: '2025-07-20', time: '09:00' }
    }
  },
  {
    id: 14,
    round: 14,
    raceName: 'Grande Prêmio da Bélgica',
    circuit: 'Circuit de Spa-Francorchamps',
    location: 'Spa, Bélgica',
    date: '2025-07-27',
    laps: 44,
    distance: '308.052 km',
    lapRecord: '1:46.286',
    expectedWeather: 'Chuva intermitente, 18°C',
    expectedPole: 'Max Verstappen',
    expectedTyres: 'C2-C3-C4',
    sessions: {
      practice1: { date: '2025-07-25', time: '09:30' },
      practice2: { date: '2025-07-25', time: '13:00' },
      practice3: { date: '2025-07-26', time: '08:30' },
      qualifying: { date: '2025-07-26', time: '12:00' },
      race: { date: '2025-07-27', time: '09:00' }
    }
  },
  {
    id: 15,
    round: 15,
    raceName: 'Grande Prêmio da Holanda',
    circuit: 'Circuit Zandvoort',
    location: 'Zandvoort, Holanda',
    date: '2025-08-31',
    laps: 72,
    distance: '306.587 km',
    lapRecord: '1:11.097',
    expectedWeather: 'Ventoso, 22°C',
    expectedPole: 'Max Verstappen',
    expectedTyres: 'C1-C2-C3',
    sessions: {
      practice1: { date: '2025-08-29', time: '08:30' },
      practice2: { date: '2025-08-29', time: '12:00' },
      practice3: { date: '2025-08-30', time: '07:30' },
      qualifying: { date: '2025-08-30', time: '11:00' },
      race: { date: '2025-08-31', time: '09:00' }
    }
  },
  {
    id: 16,
    round: 16,
    raceName: 'Grande Prêmio da Itália',
    circuit: 'Autodromo Nazionale di Monza',
    location: 'Monza, Itália',
    date: '2025-09-07',
    laps: 53,
    distance: '306.720 km',
    lapRecord: '1:21.046',
    expectedWeather: 'Ensolarado, 27°C',
    expectedPole: 'Charles Leclerc',
    expectedTyres: 'C3-C4-C5',
    sessions: {
      practice1: { date: '2025-09-05', time: '09:30' },
      practice2: { date: '2025-09-05', time: '13:00' },
      practice3: { date: '2025-09-06', time: '08:30' },
      qualifying: { date: '2025-09-06', time: '12:00' },
      race: { date: '2025-09-07', time: '09:00' }
    }
  },
  {
    id: 17,
    round: 17,
    raceName: 'Grande Prêmio do Azerbaijão',
    circuit: 'Baku City Circuit',
    location: 'Baku, Azerbaijão',
    date: '2025-09-21',
    laps: 51,
    distance: '306.049 km',
    lapRecord: '1:43.009',
    expectedWeather: 'Claro, 29°C',
    expectedPole: 'Charles Leclerc',
    expectedTyres: 'C3-C4-C5',
    sessions: {
      practice1: { date: '2025-09-19', time: '09:30' },
      practice2: { date: '2025-09-19', time: '13:00' },
      practice3: { date: '2025-09-20', time: '08:30' },
      qualifying: { date: '2025-09-20', time: '12:00' },
      race: { date: '2025-09-21', time: '09:00' }
    }
  },
  {
    id: 18,
    round: 18,
    raceName: 'Grande Prêmio de Singapura',
    circuit: 'Marina Bay Street Circuit',
    location: 'Singapura',
    date: '2025-10-05',
    laps: 62,
    distance: '306.143 km',
    lapRecord: '1:35.867',
    expectedWeather: 'Úmido, 30°C',
    expectedPole: 'Lando Norris',
    expectedTyres: 'C3-C4-C5',
    sessions: {
      practice1: { date: '2025-10-03', time: '13:30' },
      practice2: { date: '2025-10-03', time: '17:00' },
      practice3: { date: '2025-10-04', time: '13:30' },
      qualifying: { date: '2025-10-04', time: '17:00' },
      race: { date: '2025-10-05', time: '16:00' }
    }
  },
  {
    id: 19,
    round: 19,
    raceName: 'Grande Prêmio dos Estados Unidos',
    circuit: 'Circuit of The Americas',
    location: 'Austin, Texas, EUA',
    date: '2025-10-19',
    laps: 56,
    distance: '308.405 km',
    lapRecord: '1:36.169',
    expectedWeather: 'Ensolarado, 26°C',
    expectedPole: 'Max Verstappen',
    expectedTyres: 'C2-C3-C4',
    sessions: {
      practice1: { date: '2025-10-17', time: '15:30' },
      sprintShootout: { date: '2025-10-17', time: '19:30' },
      sprintRace: { date: '2025-10-18', time: '15:00' },
      qualifying: { date: '2025-10-18', time: '19:00' },
      race: { date: '2025-10-19', time: '16:00' }
    }
  },
  {
    id: 20,
    round: 20,
    raceName: 'Grande Prêmio do México',
    circuit: 'Autódromo Hermanos Rodríguez',
    location: 'Cidade do México, México',
    date: '2025-10-26',
    laps: 71,
    distance: '305.354 km',
    lapRecord: '1:17.774',
    expectedWeather: 'Parcialmente nublado, 24°C',
    expectedPole: 'Oscar Piastri',
    expectedTyres: 'C3-C4-C5',
    sessions: {
      practice1: { date: '2025-10-24', time: '15:30' },
      practice2: { date: '2025-10-24', time: '19:00' },
      practice3: { date: '2025-10-25', time: '14:30' },
      qualifying: { date: '2025-10-25', time: '18:00' },
      race: { date: '2025-10-26', time: '16:00' }
    }
  },
  {
    id: 21,
    round: 21,
    raceName: 'Grande Prêmio do Brasil',
    circuit: 'Autódromo José Carlos Pace',
    location: 'São Paulo, Brasil',
    date: '2025-11-09',
    laps: 71,
    distance: '305.909 km',
    lapRecord: '1:10.540',
    expectedWeather: 'Parcialmente nublado, 24°C - possibilidade de chuva',
    expectedPole: 'Lando Norris',
    expectedTyres: 'C3-C4-C5',
    sessions: {
      practice1: { date: '2025-11-07', time: '11:30' },
      sprintShootout: { date: '2025-11-07', time: '15:30' },
      sprintRace: { date: '2025-11-08', time: '11:00' },
      qualifying: { date: '2025-11-08', time: '15:00' },
      race: { date: '2025-11-09', time: '14:00' }
    }
  },
  {
    id: 22,
    round: 22,
    raceName: 'Grande Prêmio de Las Vegas',
    circuit: 'Las Vegas Street Circuit',
    location: 'Las Vegas, Nevada, EUA',
    date: '2025-11-22',
    laps: 50,
    distance: '305.775 km',
    lapRecord: '1:35.490',
    expectedWeather: 'Frio, 15°C',
    expectedPole: 'Charles Leclerc',
    expectedTyres: 'C3-C4-C5',
    sessions: {
      practice1: { date: '2025-11-20', time: '22:30' },
      practice2: { date: '2025-11-21', time: '02:00' },
      practice3: { date: '2025-11-21', time: '22:30' },
      qualifying: { date: '2025-11-22', time: '02:00' },
      race: { date: '2025-11-23', time: '02:00' }
    }
  },
  {
    id: 23,
    round: 23,
    raceName: 'Grande Prêmio do Qatar',
    circuit: 'Lusail International Circuit',
    location: 'Lusail, Qatar',
    date: '2025-11-30',
    laps: 57,
    distance: '308.611 km',
    lapRecord: '1:24.319',
    expectedWeather: 'Claro, 27°C',
    expectedPole: 'Max Verstappen',
    expectedTyres: 'C2-C3-C4',
    sessions: {
      practice1: { date: '2025-11-28', time: '13:30' },
      sprintShootout: { date: '2025-11-28', time: '17:30' },
      sprintRace: { date: '2025-11-29', time: '13:00' },
      qualifying: { date: '2025-11-29', time: '17:00' },
      race: { date: '2025-11-30', time: '16:00' }
    }
  },
  {
    id: 24,
    round: 24,
    raceName: 'Grande Prêmio de Abu Dhabi',
    circuit: 'Yas Marina Circuit',
    location: 'Abu Dhabi, Emirados Árabes Unidos',
    date: '2025-12-07',
    laps: 58,
    distance: '306.183 km',
    lapRecord: '1:26.103',
    expectedWeather: 'Ensolarado, 28°C',
    expectedPole: 'Lando Norris',
    expectedTyres: 'C3-C4-C5',
    sessions: {
      practice1: { date: '2025-12-05', time: '10:30' },
      practice2: { date: '2025-12-05', time: '14:00' },
      practice3: { date: '2025-12-06', time: '11:30' },
      qualifying: { date: '2025-12-06', time: '15:00' },
      race: { date: '2025-12-07', time: '14:00' }
    }
  }
];

// Função para simular dados de uma corrida específica
export const getRaceResults = (raceId: number) => {
  const mockResults = [
    { position: 1, driver: 'Max Verstappen', team: 'Red Bull Racing Honda RBPT', time: '1:32:07.988', points: 25, fastestLap: false },
    { position: 2, driver: 'Lando Norris', team: 'McLaren F1 Team', time: '+7.225', points: 18, fastestLap: true },
    { position: 3, driver: 'Charles Leclerc', team: 'Scuderia Ferrari', time: '+19.649', points: 15, fastestLap: false },
    { position: 4, driver: 'Lewis Hamilton', team: 'Mercedes AMG Petronas F1 Team', time: '+23.491', points: 12, fastestLap: false },
    { position: 5, driver: 'Oscar Piastri', team: 'McLaren F1 Team', time: '+31.327', points: 10, fastestLap: false }
  ];
  return mockResults;
};

// Função para buscar próximas corridas (simulada)
export const getUpcomingRaces = (fromDate: Date) => {
  return f1Schedule2025.filter(race => new Date(race.date) >= fromDate);
};

// Estrutura para futura integração com API real
export const F1_API_CONFIG = {
  // Ergast API (gratuita, mas com dados até 2023)
  ergast: {
    baseUrl: 'https://ergast.com/api/f1',
    endpoints: {
      currentSeason: '/current.json',
      drivers: '/current/drivers.json',
      constructors: '/current/constructors.json',
      races: '/current/races.json'
    }
  },
  // OpenF1 API (mais recente, mas pode requerer autenticação)
  openF1: {
    baseUrl: 'https://api.openf1.org/v1',
    endpoints: {
      sessions: '/sessions',
      drivers: '/drivers',
      meetings: '/meetings'
    }
  }
};

// Função template para integração futura com API real
export const fetchF1Data = async (endpoint: string) => {
  try {
    // Aqui você integraria com a API real
    // const response = await fetch(`${F1_API_CONFIG.ergast.baseUrl}${endpoint}`);
    // const data = await response.json();
    // return data;
    
    // Por enquanto, retorna dados mock
    console.log('Fetching F1 data from:', endpoint);
    return null;
  } catch (error) {
    console.error('Erro ao buscar dados da F1:', error);
    return null;
  }
};