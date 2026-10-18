import React, { useState } from 'react';
import { Card, CardContent } from './components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Avatar, AvatarFallback } from './components/ui/avatar';
import { Trophy, User, Calendar, Table, Zap, Lock } from 'lucide-react';
import { Toaster } from './components/ui/sonner';
import { SportHighlights } from './components/SportHighlights';
import { GameSchedule } from './components/GameSchedule';
import { LeagueTable } from './components/LeagueTable';
import { OpenF1Dashboard } from './components/OpenF1Dashboard';
import { F1CalendarWrapper } from './components/F1CalendarWrapper';
import { motion } from 'motion/react';
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

  const getSportGradient = (sportId: string) => {
    const gradients = {
      f1: 'from-red-600 to-red-700',
      nba: 'from-blue-600 to-blue-700',
      nfl: 'from-purple-600 to-purple-700',
    };
    return gradients[sportId as keyof typeof gradients] || 'from-gray-600 to-gray-700';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 hex-pattern bg-[rgba(18,18,18,0.98)]">
      <Toaster position="top-right" />
      
      {/* Header Esportivo Super Dinâmico */}
      <header className="relative bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b-4 border-transparent sticky top-0 z-50 overflow-hidden"
        style={{
          borderBottomColor: activeSport === 'f1' ? '#DC2626' : activeSport === 'nba' ? '#2563EB' : '#7C3AED'
        }}
      >
        {/* Background animado com padrão esportivo */}
        <div className="absolute inset-0 sport-stripes opacity-20" />
        <div className="absolute inset-0 speed-lines opacity-30" />
        
        {/* Brilho de fundo animado */}
        <motion.div 
          className={`absolute inset-0 bg-gradient-to-r ${getSportGradient(activeSport)} opacity-10`}
          animate={{
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        <div className="container mx-auto px-6 py-5 relative z-10">
          <div className="flex items-center justify-between">
            {/* Logo e Título */}
            <motion.div 
              className="flex items-center gap-4"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="relative">
                {/* Círculos de fundo pulsantes */}
                <motion.div 
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${getSportGradient(activeSport)} blur-xl`}
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                />
                <div className={`relative p-3 rounded-2xl bg-gradient-to-br ${getSportGradient(activeSport)} shadow-2xl`}>
                  <Trophy className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl text-white sport-text-shadow tracking-tight">
                  SPORTCENTER
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <motion.div
                    className="flex items-center gap-1.5"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <div className="h-1.5 w-1.5 rounded-full bg-red-500" />
                    <span className="text-xs text-red-400 uppercase tracking-wider">F1</span>
                  </motion.div>
                  <span className="text-gray-600">•</span>
                  <span className="text-xs text-slate-500 uppercase tracking-wider">NBA em breve</span>
                  <span className="text-gray-600">•</span>
                  <span className="text-xs text-slate-500 uppercase tracking-wider">NFL em breve</span>
                </div>
              </div>
            </motion.div>

            {/* Estatísticas Rápidas / Badge */}
            <div className="flex items-center gap-4">
              <motion.div 
                className="hidden md:flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-amber-500/20 to-amber-600/20 rounded-xl border-2 border-amber-500/30 backdrop-blur-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Zap className="h-5 w-5 text-amber-400" />
                <div className="flex flex-col">
                  <span className="text-xs text-amber-200/70 uppercase tracking-wider">Temporada</span>
                  <span className="text-sm text-amber-300 font-bold">{new Date().getFullYear()}</span>
                </div>
              </motion.div>
              
              <Avatar className="h-12 w-12 ring-4 ring-white/10 shadow-xl">
                <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-800 text-white">
                  <User className="h-6 w-6" />
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>

        {/* Barra de progresso animada */}
        <motion.div 
          className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${getSportGradient(activeSport)}`}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </header>

      <div className="container mx-auto px-3 py-4 sm:px-6 sm:py-6">
        <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-5 xl:gap-6">
          {/* Sidebar esquerda compacta - Desktop */}
          <div className="hidden xl:block">
            {/* Destaques e notícias */}
            <SportHighlights />
          </div>

          {/* Conteúdo principal */}
          <div className="xl:col-span-4">
            {/* Sidebar mobile - aparece no topo em telas menores */}
            <div className="xl:hidden mb-6">
              <SportHighlights />
            </div>
            <Card className="bg-slate-900 border-slate-700">
              <CardContent className="p-0 bg-gradient-to-br from-slate-900 to-slate-850">
                {/* Abas dos esportes */}
                <Tabs
                  value={activeSport}
                  onValueChange={(value) => {
                    const sport = availableSports.find((item) => item.id === value);
                    if (sport?.enabled) setActiveSport(value);
                  }}
                  className="w-full"
                >
                  <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700">
                    <TabsList className="w-full justify-start rounded-none bg-transparent p-0 h-auto">
                      {availableSports.map((sport) => {
                        const isActive = activeSport === sport.id;
                        const gradientClass = getSportGradient(sport.id);
                        return (
                          <TabsTrigger 
                            key={sport.id}
                            value={sport.id}
                            disabled={!sport.enabled}
                            title={!sport.enabled ? 'Em breve' : undefined}
                            className={`relative flex min-w-0 items-center gap-2 overflow-hidden rounded-none border-b-4 border-transparent px-3 py-3 transition-all duration-300 data-[state=active]:text-white sm:px-6 sm:py-4 ${
                                sport.enabled
                                  ? 'text-slate-400 hover:text-slate-200'
                                  : 'text-slate-600 cursor-not-allowed opacity-50'
                            } ${isActive ? 'border-b-4' : ''}`}
                            style={{
                              borderBottomColor: isActive 
                                ? sport.id === 'f1' ? '#DC2626' 
                                : sport.id === 'nba' ? '#2563EB' 
                                : '#7C3AED'
                                : 'transparent'
                            }}
                          >
                            {isActive && (
                              <motion.div 
                                className={`absolute inset-0 bg-gradient-to-r ${gradientClass} opacity-20`}
                                layoutId="activeTab"
                                transition={{ duration: 0.3 }}
                              />
                            )}
                            <span className={`text-2xl relative z-10 ${!sport.enabled ? 'grayscale' : ''}`}>{sport.icon}</span>
                            <span className="hidden sm:inline font-medium relative z-10">{sport.name}</span>
                            {!sport.enabled && (
                              <span className="relative z-10 hidden md:inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-slate-500">
                                <Lock className="h-3 w-3" />
                                Em breve
                              </span>
                            )}
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>
                  </div>

                  {/* Abas de conteúdo (Programação/Tabela) */}
                  <div className="border-b border-slate-700">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="w-full justify-start rounded-none bg-slate-900/50 p-0 border-b border-slate-800">
                        <TabsTrigger 
                          value="schedule" 
                          className="min-w-0 rounded-none border-b-2 border-transparent px-3 text-sm data-[state=active]:border-blue-500 data-[state=active]:bg-slate-800/50 data-[state=active]:text-white text-slate-400 hover:text-slate-200 sm:px-4 sm:text-base"
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Programação
                        </TabsTrigger>
                        <TabsTrigger 
                          value="tables"
                          className="rounded-none border-b-2 border-transparent data-[state=active]:border-amber-500 data-[state=active]:bg-slate-800/50 text-slate-400 data-[state=active]:text-white hover:text-slate-200"
                        >
                          <Table className="h-4 w-4 mr-2" />
                          Tabela
                        </TabsTrigger>
                        {activeSport === 'f1' && (
                          <TabsTrigger 
                            value="livedata"
                            className="rounded-none border-b-2 border-transparent data-[state=active]:border-red-500 data-[state=active]:bg-slate-800/50 text-slate-400 data-[state=active]:text-white hover:text-slate-200"
                          >
                            <Zap className="h-4 w-4 mr-2" />
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
