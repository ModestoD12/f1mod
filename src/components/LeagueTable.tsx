import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Trophy, Medal, Award, User, Users, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'motion/react';
import { F1StandingsTable } from './F1StandingsTable';

interface F1Driver {
  position: number;
  driver: string;
  team: string;
  points: number;
  nationality?: string;
  number?: number;
}

interface F1Constructor {
  position: number;
  team: string;
  fullName: string;
  points: number;
  color: string;
  id: string;
}

interface F1Data {
  drivers: F1Driver[];
  constructors: F1Constructor[];
}

interface TeamRecord {
  position: number;
  team: string;
  wins: number;
  losses: number;
  percentage?: number;
  winPercentage?: number;
  gamesBack?: string;
  division?: string;
}

interface ConferenceData {
  eastern?: TeamRecord[];
  western?: TeamRecord[];
  afc?: TeamRecord[];
  nfc?: TeamRecord[];
}

interface LeagueTableProps {
  tables: {
    f1?: F1Data;
    nba?: ConferenceData;
    nfl?: ConferenceData;
  };
  selectedSports: string[];
  sports: Array<{ id: string; name: string; icon: string }>;
}

export function LeagueTable({ tables, selectedSports, sports }: LeagueTableProps) {
  const [activeLeague, setActiveLeague] = useState(selectedSports[0] || 'f1');
  const [f1Championship, setF1Championship] = useState<'drivers' | 'constructors'>('drivers');

  // Sincronizar o estado interno com o esporte selecionado
  useEffect(() => {
    if (selectedSports[0] && selectedSports[0] !== activeLeague) {
      setActiveLeague(selectedSports[0]);
      if (selectedSports[0] === 'f1') {
        setF1Championship('drivers');
      }
    }
  }, [selectedSports, activeLeague]);

  // Reset F1 championship selection when switching sports
  const handleLeagueChange = (sportId: string) => {
    setActiveLeague(sportId);
    if (sportId === 'f1') {
      setF1Championship('drivers');
    }
  };

  const getSportById = (id: string) => sports.find(sport => sport.id === id);

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-medium text-slate-400">{position}</span>;
    }
  };

  const getPositionBadge = (position: number) => {
    if (position === 1) {
      return "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg";
    } else if (position === 2) {
      return "bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg";
    } else if (position === 3) {
      return "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg";
    } else if (position <= 5) {
      return "bg-gradient-to-r from-green-900 to-green-800 text-green-200 border border-green-700";
    } else if (position <= 10) {
      return "bg-gradient-to-r from-blue-900 to-blue-800 text-blue-200 border border-blue-700";
    }
    return "bg-gradient-to-r from-slate-800 to-slate-700 text-slate-300 border border-slate-600";
  };

  const renderF1DriversTable = (drivers: F1Driver[]) => (
    <div className="overflow-hidden rounded-lg border border-slate-700">
      <Table>
        <TableHeader className="bg-gradient-to-r from-red-950 to-red-900 border-b border-red-800">
          <TableRow>
            <TableHead className="w-16 text-red-200">Pos</TableHead>
            <TableHead className="w-16 text-red-200">#</TableHead>
            <TableHead className="text-red-200">Piloto</TableHead>
            <TableHead className="text-red-200">Equipe</TableHead>
            <TableHead className="w-24 text-red-200">País</TableHead>
            <TableHead className="text-right w-24 text-red-200">Pontos</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {drivers.map((driver, index) => (
            <motion.tr
              key={driver.position}
              className={`hover:bg-red-950/30 transition-colors border-b border-slate-800 ${
                driver.position <= 3 ? 'bg-gradient-to-r from-amber-950/30 to-transparent' : 'bg-slate-900/50'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
            >
              <TableCell>
                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${getPositionBadge(driver.position)}`}>
                  {driver.position <= 3 ? (
                    getPositionIcon(driver.position)
                  ) : (
                    <span className="text-sm font-bold">{driver.position}</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-center">
                <Badge variant="outline" className="font-mono bg-slate-800/50 text-slate-300 border-slate-600">
                  {driver.number}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-200">{driver.driver}</span>
                  {driver.position === 1 && (
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  )}
                </div>
              </TableCell>
              <TableCell className="text-sm text-slate-400">{driver.team}</TableCell>
              <TableCell className="text-center">
                <span className="text-xl">{driver.nationality}</span>
              </TableCell>
              <TableCell className="text-right">
                <span className="font-bold text-lg text-red-400">{driver.points}</span>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const renderF1ConstructorsTable = (constructors: F1Constructor[]) => (
    <div className="overflow-hidden rounded-lg border border-slate-700">
      <Table>
        <TableHeader className="bg-gradient-to-r from-red-950 to-red-900 border-b border-red-800">
          <TableRow>
            <TableHead className="w-16 text-red-200">Pos</TableHead>
            <TableHead className="text-red-200">Equipe</TableHead>
            <TableHead className="text-right w-32 text-red-200">Pontos</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {constructors.map((constructor, index) => (
            <motion.tr
              key={constructor.position}
              className={`hover:bg-red-950/30 transition-colors border-b border-slate-800 ${
                constructor.position <= 3 ? 'bg-gradient-to-r from-amber-950/30 to-transparent' : 'bg-slate-900/50'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.03 }}
            >
              <TableCell>
                <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${getPositionBadge(constructor.position)}`}>
                  {constructor.position <= 3 ? (
                    getPositionIcon(constructor.position)
                  ) : (
                    <span className="text-sm font-bold">{constructor.position}</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full ring-2 ring-slate-600 shadow-md"
                    style={{ backgroundColor: constructor.color }}
                  />
                  <span className="font-semibold text-slate-200">{constructor.team}</span>
                </div>
              </TableCell>
              <TableCell className="text-right">
                <span className="font-bold text-lg text-red-400">{constructor.points}</span>
              </TableCell>
            </motion.tr>
          ))}
        </TableBody>
      </Table>
    </div>
  );

  const renderTeamTable = (teams: TeamRecord[], sport: string, conference?: string) => {
    const sportColor = sport === 'nba' ? 'blue' : 'purple';
    const bgGradient = sport === 'nba' 
      ? 'from-blue-950 to-blue-900' 
      : 'from-purple-950 to-purple-900';
    
    return (
      <div className="space-y-4">
        {conference && (
          <div className={`flex items-center gap-2 p-3 rounded-lg bg-gradient-to-r ${bgGradient} border ${sport === 'nba' ? 'border-blue-800' : 'border-purple-800'}`}>
            <span className="text-2xl">{sport === 'nba' ? '🏀' : '🏈'}</span>
            <h4 className="font-semibold text-white">{conference}</h4>
          </div>
        )}
        <div className="overflow-hidden rounded-lg border border-slate-700">
          <Table>
            <TableHeader className={`bg-gradient-to-r ${bgGradient} border-b ${sport === 'nba' ? 'border-blue-800' : 'border-purple-800'}`}>
              <TableRow>
                <TableHead className={`w-16 ${sport === 'nba' ? 'text-blue-200' : 'text-purple-200'}`}>Pos</TableHead>
                <TableHead className={sport === 'nba' ? 'text-blue-200' : 'text-purple-200'}>Time</TableHead>
                <TableHead className={`text-center w-20 ${sport === 'nba' ? 'text-blue-200' : 'text-purple-200'}`}>V</TableHead>
                <TableHead className={`text-center w-20 ${sport === 'nba' ? 'text-blue-200' : 'text-purple-200'}`}>D</TableHead>
                <TableHead className={`text-right w-24 ${sport === 'nba' ? 'text-blue-200' : 'text-purple-200'}`}>%</TableHead>
                {teams[0]?.gamesBack && <TableHead className={`text-center w-20 ${sport === 'nba' ? 'text-blue-200' : 'text-purple-200'}`}>JA</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {teams.map((team, index) => (
                <motion.tr
                  key={team.position}
                  className={`hover:bg-${sportColor}-950/30 transition-colors border-b border-slate-800 ${
                    team.position <= 3 ? 'bg-gradient-to-r from-amber-950/30 to-transparent' : 'bg-slate-900/50'
                  }`}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                >
                  <TableCell>
                    <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${getPositionBadge(team.position)}`}>
                      {team.position <= 3 ? (
                        getPositionIcon(team.position)
                      ) : (
                        <span className="text-sm font-bold">{team.position}</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-semibold text-slate-200">{team.team}</TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-green-900/70 text-green-200 hover:bg-green-900/90 border border-green-700">
                      {team.wins}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge className="bg-red-900/70 text-red-200 hover:bg-red-900/90 border border-red-700">
                      {team.losses}
                    </Badge>
                  </TableCell>
                  <TableCell className={`text-right font-bold text-lg ${sport === 'nba' ? 'text-blue-400' : 'text-purple-400'}`}>
                    {((team.percentage || team.winPercentage || 0) * 100).toFixed(1)}%
                  </TableCell>
                  {team.gamesBack && (
                    <TableCell className="text-center text-sm text-slate-400 font-medium">
                      {team.gamesBack}
                    </TableCell>
                  )}
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  // Se for F1, usar o componente com dados da API
  if (selectedSports[0] === 'f1') {
    return <F1StandingsTable />;
  }

  const availableSports = selectedSports.filter(sportId => {
    const tableData = tables[sportId as keyof typeof tables];
    if (sportId === 'f1') {
      return tableData && typeof tableData === 'object' && 'drivers' in tableData && 'constructors' in tableData;
    }
    if (sportId === 'nba') {
      return tableData && typeof tableData === 'object' && ('eastern' in tableData || 'western' in tableData);
    }
    if (sportId === 'nfl') {
      return tableData && typeof tableData === 'object' && ('afc' in tableData || 'nfc' in tableData);
    }
    return tableData && typeof tableData === 'object';
  });

  if (availableSports.length === 0) {
    return (
      <Card className="bg-slate-900 border-slate-700">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2 text-slate-300">Nenhuma tabela disponível</h3>
            <p className="text-slate-500">
              Selecione esportes para ver as tabelas dos campeonatos.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Como agora trabalhamos apenas com um esporte por vez, renderizamos diretamente
  const currentSport = availableSports[0];
  const sport = getSportById(currentSport);
  const tableData = tables[currentSport as keyof typeof tables];

  if (!currentSport || !sport || !tableData) {
    return (
      <Card className="bg-slate-900 border-slate-700">
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <Trophy className="h-12 w-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2 text-slate-300">Nenhuma tabela disponível</h3>
            <p className="text-slate-500">
              Dados de classificação não encontrados para este esporte.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader className="bg-slate-900/50 border-b border-slate-700">
        <CardTitle className="flex items-center gap-2 text-white">
          <span className="text-xl">{sport.icon}</span>
          Classificação - {sport.name}
        </CardTitle>
        <CardDescription className="text-slate-400">
          {currentSport === 'f1' ? 
            `Campeonato de ${f1Championship === 'drivers' ? 'Pilotos' : 'Construtores'}` : 
            'Temporada Regular 2024-25'
          }
        </CardDescription>
        
        {/* F1 Championship Toggle */}
        {currentSport === 'f1' && (
          <div className="flex gap-2 mt-2">
            <Button
              variant={f1Championship === 'drivers' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setF1Championship('drivers')}
              className={`flex items-center gap-1 ${f1Championship === 'drivers' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white'}`}
            >
              <User className="h-3 w-3" />
              Pilotos
            </Button>
            <Button
              variant={f1Championship === 'constructors' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setF1Championship('constructors')}
              className={`flex items-center gap-1 ${f1Championship === 'constructors' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white'}`}
            >
              <Users className="h-3 w-3" />
              Equipes
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent className="bg-slate-900/30">
        {currentSport === 'f1' && tableData ? (
          f1Championship === 'drivers' ? 
            renderF1DriversTable((tableData as F1Data).drivers) :
            renderF1ConstructorsTable((tableData as F1Data).constructors)
        ) : currentSport === 'nba' && tableData ? (
          <div className="space-y-6">
            {(tableData as ConferenceData).eastern && 
              renderTeamTable((tableData as ConferenceData).eastern!, currentSport, 'Conferência Leste')
            }
            {(tableData as ConferenceData).western && 
              renderTeamTable((tableData as ConferenceData).western!, currentSport, 'Conferência Oeste')
            }
          </div>
        ) : currentSport === 'nfl' && tableData ? (
          <div className="space-y-6">
            {(tableData as ConferenceData).afc && 
              renderTeamTable((tableData as ConferenceData).afc!, currentSport, 'Conferência AFC')
            }
            {(tableData as ConferenceData).nfc && 
              renderTeamTable((tableData as ConferenceData).nfc!, currentSport, 'Conferência NFC')
            }
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}