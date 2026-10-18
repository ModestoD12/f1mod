export const nbaTeams = [
  // Eastern Conference - Atlantic Division
  { id: 'bos', name: 'Boston Celtics', city: 'Boston', conference: 'Eastern', division: 'Atlantic' },
  { id: 'bkn', name: 'Brooklyn Nets', city: 'Brooklyn', conference: 'Eastern', division: 'Atlantic' },
  { id: 'nyk', name: 'New York Knicks', city: 'New York', conference: 'Eastern', division: 'Atlantic' },
  { id: 'phi', name: 'Philadelphia 76ers', city: 'Philadelphia', conference: 'Eastern', division: 'Atlantic' },
  { id: 'tor', name: 'Toronto Raptors', city: 'Toronto', conference: 'Eastern', division: 'Atlantic' },
  
  // Eastern Conference - Central Division
  { id: 'chi', name: 'Chicago Bulls', city: 'Chicago', conference: 'Eastern', division: 'Central' },
  { id: 'cle', name: 'Cleveland Cavaliers', city: 'Cleveland', conference: 'Eastern', division: 'Central' },
  { id: 'det', name: 'Detroit Pistons', city: 'Detroit', conference: 'Eastern', division: 'Central' },
  { id: 'ind', name: 'Indiana Pacers', city: 'Indiana', conference: 'Eastern', division: 'Central' },
  { id: 'mil', name: 'Milwaukee Bucks', city: 'Milwaukee', conference: 'Eastern', division: 'Central' },
  
  // Eastern Conference - Southeast Division
  { id: 'atl', name: 'Atlanta Hawks', city: 'Atlanta', conference: 'Eastern', division: 'Southeast' },
  { id: 'cha', name: 'Charlotte Hornets', city: 'Charlotte', conference: 'Eastern', division: 'Southeast' },
  { id: 'mia', name: 'Miami Heat', city: 'Miami', conference: 'Eastern', division: 'Southeast' },
  { id: 'orl', name: 'Orlando Magic', city: 'Orlando', conference: 'Eastern', division: 'Southeast' },
  { id: 'was', name: 'Washington Wizards', city: 'Washington', conference: 'Eastern', division: 'Southeast' },
  
  // Western Conference - Northwest Division
  { id: 'den', name: 'Denver Nuggets', city: 'Denver', conference: 'Western', division: 'Northwest' },
  { id: 'min', name: 'Minnesota Timberwolves', city: 'Minnesota', conference: 'Western', division: 'Northwest' },
  { id: 'okc', name: 'Oklahoma City Thunder', city: 'Oklahoma City', conference: 'Western', division: 'Northwest' },
  { id: 'por', name: 'Portland Trail Blazers', city: 'Portland', conference: 'Western', division: 'Northwest' },
  { id: 'uta', name: 'Utah Jazz', city: 'Utah', conference: 'Western', division: 'Northwest' },
  
  // Western Conference - Pacific Division
  { id: 'gsw', name: 'Golden State Warriors', city: 'Golden State', conference: 'Western', division: 'Pacific' },
  { id: 'lac', name: 'LA Clippers', city: 'Los Angeles', conference: 'Western', division: 'Pacific' },
  { id: 'lal', name: 'Los Angeles Lakers', city: 'Los Angeles', conference: 'Western', division: 'Pacific' },
  { id: 'phx', name: 'Phoenix Suns', city: 'Phoenix', conference: 'Western', division: 'Pacific' },
  { id: 'sac', name: 'Sacramento Kings', city: 'Sacramento', conference: 'Western', division: 'Pacific' },
  
  // Western Conference - Southwest Division
  { id: 'dal', name: 'Dallas Mavericks', city: 'Dallas', conference: 'Western', division: 'Southwest' },
  { id: 'hou', name: 'Houston Rockets', city: 'Houston', conference: 'Western', division: 'Southwest' },
  { id: 'mem', name: 'Memphis Grizzlies', city: 'Memphis', conference: 'Western', division: 'Southwest' },
  { id: 'nop', name: 'New Orleans Pelicans', city: 'New Orleans', conference: 'Western', division: 'Southwest' },
  { id: 'sas', name: 'San Antonio Spurs', city: 'San Antonio', conference: 'Western', division: 'Southwest' }
];

export const nbaSchedule2025 = [
  {
    id: 1,
    homeTeam: 'Los Angeles Lakers',
    awayTeam: 'Golden State Warriors',
    date: '2025-08-17',
    time: '22:00',
    venue: 'Crypto.com Arena',
    city: 'Los Angeles'
  },
  {
    id: 2,
    homeTeam: 'Boston Celtics',
    awayTeam: 'Miami Heat',
    date: '2025-08-20',
    time: '21:30',
    venue: 'TD Garden',
    city: 'Boston'
  },
  {
    id: 3,
    homeTeam: 'Phoenix Suns',
    awayTeam: 'Denver Nuggets',
    date: '2025-08-25',
    time: '23:00',
    venue: 'Footprint Center',
    city: 'Phoenix'
  },
  {
    id: 4,
    homeTeam: 'Milwaukee Bucks',
    awayTeam: 'Philadelphia 76ers',
    date: '2025-08-22',
    time: '20:00',
    venue: 'Fiserv Forum',
    city: 'Milwaukee'
  },
  {
    id: 5,
    homeTeam: 'Dallas Mavericks',
    awayTeam: 'LA Clippers',
    date: '2025-08-28',
    time: '21:00',
    venue: 'American Airlines Center',
    city: 'Dallas'
  }
];

export const nbaStandings = {
  eastern: [
    { position: 1, team: 'Boston Celtics', wins: 64, losses: 18, winPercentage: 0.780, gamesBack: '-' },
    { position: 2, team: 'New York Knicks', wins: 50, losses: 32, winPercentage: 0.610, gamesBack: '14' },
    { position: 3, team: 'Milwaukee Bucks', wins: 49, losses: 33, winPercentage: 0.598, gamesBack: '15' },
    { position: 4, team: 'Cleveland Cavaliers', wins: 48, losses: 34, winPercentage: 0.585, gamesBack: '16' },
    { position: 5, team: 'Orlando Magic', wins: 47, losses: 35, winPercentage: 0.573, gamesBack: '17' },
    { position: 6, team: 'Indiana Pacers', wins: 47, losses: 35, winPercentage: 0.573, gamesBack: '17' },
    { position: 7, team: 'Philadelphia 76ers', wins: 47, losses: 35, winPercentage: 0.573, gamesBack: '17' },
    { position: 8, team: 'Miami Heat', wins: 46, losses: 36, winPercentage: 0.561, gamesBack: '18' }
  ],
  western: [
    { position: 1, team: 'Denver Nuggets', wins: 57, losses: 25, winPercentage: 0.695, gamesBack: '-' },
    { position: 2, team: 'Oklahoma City Thunder', wins: 57, losses: 25, winPercentage: 0.695, gamesBack: '-' },
    { position: 3, team: 'Minnesota Timberwolves', wins: 56, losses: 26, winPercentage: 0.683, gamesBack: '1' },
    { position: 4, team: 'LA Clippers', wins: 51, losses: 31, winPercentage: 0.622, gamesBack: '6' },
    { position: 5, team: 'Dallas Mavericks', wins: 50, losses: 32, winPercentage: 0.610, gamesBack: '7' },
    { position: 6, team: 'Phoenix Suns', wins: 49, losses: 33, winPercentage: 0.598, gamesBack: '8' },
    { position: 7, team: 'New Orleans Pelicans', wins: 49, losses: 33, winPercentage: 0.598, gamesBack: '8' },
    { position: 8, team: 'Los Angeles Lakers', wins: 47, losses: 35, winPercentage: 0.573, gamesBack: '10' }
  ]
};