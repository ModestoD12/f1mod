export const nflTeams = [
  // AFC East
  { id: 'buf', name: 'Buffalo Bills', city: 'Buffalo', conference: 'AFC', division: 'East' },
  { id: 'mia', name: 'Miami Dolphins', city: 'Miami', conference: 'AFC', division: 'East' },
  { id: 'ne', name: 'New England Patriots', city: 'New England', conference: 'AFC', division: 'East' },
  { id: 'nyj', name: 'New York Jets', city: 'New York', conference: 'AFC', division: 'East' },
  
  // AFC North
  { id: 'bal', name: 'Baltimore Ravens', city: 'Baltimore', conference: 'AFC', division: 'North' },
  { id: 'cin', name: 'Cincinnati Bengals', city: 'Cincinnati', conference: 'AFC', division: 'North' },
  { id: 'cle', name: 'Cleveland Browns', city: 'Cleveland', conference: 'AFC', division: 'North' },
  { id: 'pit', name: 'Pittsburgh Steelers', city: 'Pittsburgh', conference: 'AFC', division: 'North' },
  
  // AFC South
  { id: 'hou', name: 'Houston Texans', city: 'Houston', conference: 'AFC', division: 'South' },
  { id: 'ind', name: 'Indianapolis Colts', city: 'Indianapolis', conference: 'AFC', division: 'South' },
  { id: 'jax', name: 'Jacksonville Jaguars', city: 'Jacksonville', conference: 'AFC', division: 'South' },
  { id: 'ten', name: 'Tennessee Titans', city: 'Tennessee', conference: 'AFC', division: 'South' },
  
  // AFC West
  { id: 'den', name: 'Denver Broncos', city: 'Denver', conference: 'AFC', division: 'West' },
  { id: 'kc', name: 'Kansas City Chiefs', city: 'Kansas City', conference: 'AFC', division: 'West' },
  { id: 'lv', name: 'Las Vegas Raiders', city: 'Las Vegas', conference: 'AFC', division: 'West' },
  { id: 'lac', name: 'Los Angeles Chargers', city: 'Los Angeles', conference: 'AFC', division: 'West' },
  
  // NFC East
  { id: 'dal', name: 'Dallas Cowboys', city: 'Dallas', conference: 'NFC', division: 'East' },
  { id: 'nyg', name: 'New York Giants', city: 'New York', conference: 'NFC', division: 'East' },
  { id: 'phi', name: 'Philadelphia Eagles', city: 'Philadelphia', conference: 'NFC', division: 'East' },
  { id: 'was', name: 'Washington Commanders', city: 'Washington', conference: 'NFC', division: 'East' },
  
  // NFC North
  { id: 'chi', name: 'Chicago Bears', city: 'Chicago', conference: 'NFC', division: 'North' },
  { id: 'det', name: 'Detroit Lions', city: 'Detroit', conference: 'NFC', division: 'North' },
  { id: 'gb', name: 'Green Bay Packers', city: 'Green Bay', conference: 'NFC', division: 'North' },
  { id: 'min', name: 'Minnesota Vikings', city: 'Minnesota', conference: 'NFC', division: 'North' },
  
  // NFC South
  { id: 'atl', name: 'Atlanta Falcons', city: 'Atlanta', conference: 'NFC', division: 'South' },
  { id: 'car', name: 'Carolina Panthers', city: 'Carolina', conference: 'NFC', division: 'South' },
  { id: 'no', name: 'New Orleans Saints', city: 'New Orleans', conference: 'NFC', division: 'South' },
  { id: 'tb', name: 'Tampa Bay Buccaneers', city: 'Tampa Bay', conference: 'NFC', division: 'South' },
  
  // NFC West
  { id: 'ari', name: 'Arizona Cardinals', city: 'Arizona', conference: 'NFC', division: 'West' },
  { id: 'lar', name: 'Los Angeles Rams', city: 'Los Angeles', conference: 'NFC', division: 'West' },
  { id: 'sf', name: 'San Francisco 49ers', city: 'San Francisco', conference: 'NFC', division: 'West' },
  { id: 'sea', name: 'Seattle Seahawks', city: 'Seattle', conference: 'NFC', division: 'West' }
];

export const nflSchedule2025 = [
  {
    id: 1,
    homeTeam: 'Kansas City Chiefs',
    awayTeam: 'Buffalo Bills',
    date: '2025-08-18',
    time: '18:30',
    venue: 'Arrowhead Stadium',
    city: 'Kansas City',
    week: 1
  },
  {
    id: 2,
    homeTeam: 'Dallas Cowboys',
    awayTeam: 'Philadelphia Eagles',
    date: '2025-08-25',
    time: '19:00',
    venue: 'AT&T Stadium',
    city: 'Dallas',
    week: 2
  },
  {
    id: 3,
    homeTeam: 'San Francisco 49ers',
    awayTeam: 'Green Bay Packers',
    date: '2025-08-24',
    time: '17:00',
    venue: 'Levi\'s Stadium',
    city: 'San Francisco',
    week: 2
  },
  {
    id: 4,
    homeTeam: 'Miami Dolphins',
    awayTeam: 'New York Jets',
    date: '2025-08-31',
    time: '16:00',
    venue: 'Hard Rock Stadium',
    city: 'Miami',
    week: 3
  },
  {
    id: 5,
    homeTeam: 'Los Angeles Rams',
    awayTeam: 'Seattle Seahawks',
    date: '2025-09-01',
    time: '20:20',
    venue: 'SoFi Stadium',
    city: 'Los Angeles',
    week: 3
  }
];

export const nflStandings = {
  afc: [
    { position: 1, team: 'Kansas City Chiefs', wins: 14, losses: 3, winPercentage: 0.824, division: 'West' },
    { position: 2, team: 'Buffalo Bills', wins: 13, losses: 4, winPercentage: 0.765, division: 'East' },
    { position: 3, team: 'Baltimore Ravens', wins: 13, losses: 4, winPercentage: 0.765, division: 'North' },
    { position: 4, team: 'Houston Texans', wins: 10, losses: 7, winPercentage: 0.588, division: 'South' },
    { position: 5, team: 'Pittsburgh Steelers', wins: 10, losses: 7, winPercentage: 0.588, division: 'North' },
    { position: 6, team: 'Los Angeles Chargers', wins: 10, losses: 7, winPercentage: 0.588, division: 'West' },
    { position: 7, team: 'Denver Broncos', wins: 9, losses: 8, winPercentage: 0.529, division: 'West' },
    { position: 8, team: 'Indianapolis Colts', wins: 9, losses: 8, winPercentage: 0.529, division: 'South' }
  ],
  nfc: [
    { position: 1, team: 'Detroit Lions', wins: 15, losses: 2, winPercentage: 0.882, division: 'North' },
    { position: 2, team: 'Philadelphia Eagles', wins: 14, losses: 3, winPercentage: 0.824, division: 'East' },
    { position: 3, team: 'Minnesota Vikings', wins: 14, losses: 3, winPercentage: 0.824, division: 'North' },
    { position: 4, team: 'Los Angeles Rams', wins: 10, losses: 7, winPercentage: 0.588, division: 'West' },
    { position: 5, team: 'Atlanta Falcons', wins: 9, losses: 8, winPercentage: 0.529, division: 'South' },
    { position: 6, team: 'Washington Commanders', wins: 12, losses: 5, winPercentage: 0.706, division: 'East' },
    { position: 7, team: 'Green Bay Packers', wins: 11, losses: 6, winPercentage: 0.647, division: 'North' },
    { position: 8, team: 'Tampa Bay Buccaneers', wins: 10, losses: 7, winPercentage: 0.588, division: 'South' }
  ]
};