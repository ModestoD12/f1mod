import React, { useState } from 'react';
import { Card, CardContent } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Trophy, Calendar, Table, Zap, Lock } from 'lucide-react';
import { AccountMenu } from './components/AccountMenu';
import { Toaster } from './components/ui/sonner';
import { GameSchedule } from './components/GameSchedule';
import { LeagueTable } from './components/LeagueTable';
import { OpenF1Dashboard } from './components/OpenF1Dashboard';
import { F1CalendarWrapper } from './components/F1CalendarWrapper';
import { f1Drivers, f1Teams, f1Schedule2025, f1DriversStandings, f1ConstructorsStandings } from './data/f1Data';
import { nbaTeams, nbaSchedule2025, nbaStandings } from './data/nbaData';
import { nflTeams, nflSchedule2025, nflStandings } from './data/nflData';

// Dados dos esportes fixos
  const availableSports = [
    { id: 'f1', name: 'Fórmula 1', icon: '🏎️', enabled: true }
  ];

// Função para gerar jogos baseados nos dados reais da F1
const generateF1Events = () => {
  const events = [];

  f1Schedule2025.forEach((race) => {
    const raceWeekend = {
      raceId: race.id,
      raceName: race.raceName,
      circuit: race.circuit,
      location: race.location,
      round: race.round,
      laps: race.laps || 'TBD',
      distance: race.distance || 'TBD',
      weather: race.expectedWeather || 'Variável'
    };

    // Treino Livre 1
    if (race.sessions.practice1) {
      events.push({
        id: `f1-fp1-${race.id}`,
        sport: 'f1',
        title: `${race.raceName} - Treino Livre 1`,
        date: race.sessions.practice1.date,
        time: race.sessions.practice1.time,
        teams: ['Todos os 20 pilotos'],
        channel: 'sportv',
        status: 'Agendado',
        session: 'FP1',
        sessionType: 'Treino Livre',
        duration: '90 minutos',
        ...raceWeekend,
        description: `Primeira sessão de treinos livres - Configuração inicial dos carros`
      });
    }

    // Treino Livre 2
    if (race.sessions.practice2) {
      events.push({
        id: `f1-fp2-${race.id}`,
        sport: 'f1',
        title: `${race.raceName} - Treino Livre 2`,
        date: race.sessions.practice2.date,
        time: race.sessions.practice2.time,
        teams: ['Todos os 20 pilotos'],
        channel: 'sportv',
        status: 'Agendado',
        session: 'FP2',
        sessionType: 'Treino Livre',
        duration: '90 minutos',
        ...raceWeekend,
        description: `Segunda sessão de treinos - Simulações de corrida e qualificação`
      });
    }

    // Treino Livre 3
    if (race.sessions.practice3) {
      events.push({
        id: `f1-fp3-${race.id}`,
        sport: 'f1',
        title: `${race.raceName} - Treino Livre 3`,
        date: race.sessions.practice3.date,
        time: race.sessions.practice3.time,
        teams: ['Todos os 20 pilotos'],
        channel: 'sportv',
        status: 'Agendado',
        session: 'FP3',
        sessionType: 'Treino Livre',
        duration: '60 minutos',
        ...raceWeekend,
        description: `Preparação final para a classificação`
      });
    }

    // Sprint Shootout (se for fim de semana de sprint)
    if (race.sessions.sprintShootout) {
      events.push({
        id: `f1-sprint-shootout-${race.id}`,
        sport: 'f1',
        title: `${race.raceName} - Sprint Shootout`,
        date: race.sessions.sprintShootout.date,
        time: race.sessions.sprintShootout.time,
        teams: ['Top pilotos'],
        channel: 'Globo',
        status: 'Agendado',
        session: 'Sprint Shootout',
        sessionType: 'Classificação Sprint',
        duration: '60 minutos',
        ...raceWeekend,
        description: `Classificação para definir grid da Sprint`
      });
    }

    // Classificação
    if (race.sessions.qualifying) {
      events.push({
        id: `f1-quali-${race.id}`,
        sport: 'f1',
        title: `${race.raceName} - Classificação`,
        date: race.sessions.qualifying.date,
        time: race.sessions.qualifying.time,
        teams: ['Todos os 20 pilotos'],
        channel: 'Globo',
        status: 'Agendado',
        session: 'Qualifying',
        sessionType: 'Classificação',
        duration: '60 minutos (Q1-Q2-Q3)',
        ...raceWeekend,
        description: `Definição do grid de largada - Q1: 18 min, Q2: 15 min, Q3: 12 min`
      });
    }

    // Sprint (se houver)
    if (race.sessions.sprintRace) {
      events.push({
        id: `f1-sprint-${race.id}`,
        sport: 'f1',
        title: `${race.raceName} - Sprint`,
        date: race.sessions.sprintRace.date,
        time: race.sessions.sprintRace.time,
        teams: ['Max Verstappen', 'Lando Norris', 'Charles Leclerc'],
        channel: 'Globo',
        status: 'Agendado',
        session: 'Sprint',
        sessionType: 'Corrida Sprint',
        duration: '100km ou 30 minutos',
        ...raceWeekend,
        description: `Corrida curta - Pontos para os 8 primeiros (8-7-6-5-4-3-2-1)`
      });
    }

    // Corrida Principal
    events.push({
      id: `f1-race-${race.id}`,
      sport: 'f1',
      title: race.raceName,
      date: race.date,
      time: race.sessions.race.time,
      teams: ['Max Verstappen', 'Lando Norris', 'Charles Leclerc', 'Oscar Piastri', 'Carlos Sainz'],
      channel: 'Globo',
      status: race.date === '2025-08-17' ? 'Ao vivo' : 'Agendado',
      session: 'Race',
      sessionType: 'Grande Prêmio',
      duration: `${race.laps || '50-70'} voltas ou 2h máximo`,
      ...raceWeekend,
      description: `Grande Prêmio - ${race.distance || '300km'} de distância total`,
      pole: race.expectedPole || 'TBD',
      fastestLap: race.lapRecord || 'TBD',
      tyreStrategy: race.expectedTyres || 'Compound médio/duro esperado'
    });
  });

  return events;
};

// Função para gerar jogos da NBA
const generateNBAEvents = () => {
  return nbaSchedule2025.map((game) => ({
    id: `nba-${game.id}`,
    sport: 'nba',
    title: `${game.awayTeam} vs ${game.homeTeam}`,
    date: game.date,
    time: game.time,
    teams: [game.homeTeam, game.awayTeam],
    channel: 'ESPN',
    status: 'Agendado',
    venue: game.venue,
    city: game.city
  }));
};

// Função para gerar jogos da NFL
const generateNFLEvents = () => {
  return nflSchedule2025.map((game) => ({
    id: `nfl-${game.id}`,
    sport: 'nfl',
    title: `${game.awayTeam} vs ${game.homeTeam}`,
    date: game.date,
    time: game.time,
    teams: [game.homeTeam, game.awayTeam],
    channel: 'ESPN',
    status: 'Agendado',
    venue: game.venue,
    city: game.city,
    week: game.week
  }));
};

const allGames = [
  ...generateF1Events(),
  ...generateNBAEvents(),
  ...generateNFLEvents()
];

const leagueTables = {
  f1: {
    drivers: f1DriversStandings,
    constructors: f1ConstructorsStandings
  },
  nba: {
    eastern: nbaStandings.eastern,
    western: nbaStandings.western
  },
  nfl: {
    afc: nflStandings.afc,
    nfc: nflStandings.nfc
  }
};

export default function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('schedule');
  const [activeSport, setActiveSport] = useState('f1');

  // Filtrar jogos pelo esporte ativo
  const filteredGames = allGames.filter(game => game.sport === activeSport);

  return (
    <div className="prndl min-h-screen bg-[#0b0b0f]">
      <Toaster position="top-right" />
      
      {/* Header Esportivo Super Dinâmico */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b0b0f]">
        <div className="container mx-auto flex items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            <div className="prndl-mark">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl text-white sm:text-2xl">Sportcenter</h1>
              <p className="mt-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[#b8b8c2]">
                F1 · NBA em breve · NFL em breve
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="prndl-season">
              <Zap className="h-4 w-4 text-[#ff2b2b]" />
              <span>{new Date().getFullYear()}</span>
            </div>
            <AccountMenu />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 py-4 sm:px-6 sm:py-6">
        <div className="grid min-w-0 grid-cols-1 gap-4 md:grid-cols-5 md:gap-6">
          {/* Conteúdo principal */}
          <div className="md:col-span-5">
            <Card className="border-white/10 bg-[#121218]">
              <CardContent className="bg-[#121218] p-0">
                {/* Abas dos esportes */}
                <Tabs
                  value={activeSport}
                  onValueChange={(value) => {
                    const sport = availableSports.find((item) => item.id === value);
                    if (sport?.enabled) setActiveSport(value);
                  }}
                  className="w-full"
                >
                  <div className="border-b border-white/10 bg-[#0b0b0f]">
                    <TabsList className="w-full justify-start rounded-none bg-transparent p-0 h-auto">
                      {availableSports.map((sport) => (
                          <TabsTrigger 
                            key={sport.id}
                            value={sport.id}
                            disabled={!sport.enabled}
                            title={!sport.enabled ? 'Em breve' : undefined}
                            className={`relative flex min-w-0 items-center gap-2 rounded-none border-b-2 border-transparent px-4 py-4 text-[#b8b8c2] data-[state=active]:text-white ${
                                sport.enabled
                                  ? 'hover:text-white'
                                  : 'cursor-not-allowed text-[#6d6d78] opacity-50'
                            }`}
                          >
                            <span className={`relative z-10 text-xl ${!sport.enabled ? 'grayscale' : ''}`}>{sport.icon}</span>
                            <span className="relative z-10 hidden font-bold sm:inline">{sport.name}</span>
                            {!sport.enabled && (
                              <span className="relative z-10 hidden items-center gap-1 text-[10px] uppercase tracking-wider text-[#6d6d78] md:inline-flex">
                                <Lock className="h-3 w-3" />
                                Em breve
                              </span>
                            )}
                          </TabsTrigger>
                      ))}
                    </TabsList>
                  </div>

                  {/* Abas de conteúdo (Programação/Tabela) */}
                  <div className="border-b border-white/10">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="prndl-section-nav" aria-label="Seções do campeonato">
                        <TabsTrigger value="schedule">
                          <Calendar className="h-4 w-4" />
                          Programação
                        </TabsTrigger>
                        <TabsTrigger value="tables">
                          <Table className="h-4 w-4" />
                          Tabela
                        </TabsTrigger>
                        {activeSport === 'f1' && (
                          <TabsTrigger value="livedata">
                            <Zap className="h-4 w-4" />
                            Live Data
                          </TabsTrigger>
                        )}
                      </TabsList>

                      <div className="p-3 sm:p-6">
                        <TabsContent value="schedule" className="mt-0">
                          {activeSport === 'f1' ? (
                            <F1CalendarWrapper
                              currentDate={currentDate}
                              onDateSelect={setCurrentDate}
                            />
                          ) : (
                            <GameSchedule
                              games={filteredGames}
                              sports={availableSports}
                              currentDate={currentDate}
                            />
                          )}
                        </TabsContent>

                        <TabsContent value="tables" className="mt-0">
                          <LeagueTable
                            tables={leagueTables}
                            selectedSports={[activeSport]}
                            sports={availableSports}
                          />
                        </TabsContent>

                        {activeSport === 'f1' && (
                          <TabsContent value="livedata" className="mt-0">
                            <OpenF1Dashboard />
                          </TabsContent>
                        )}
                      </div>
                    </Tabs>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
