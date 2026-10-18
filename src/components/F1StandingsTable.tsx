import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Trophy, Medal, Award, User, Users, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useDriverStandings, useConstructorStandings } from '../hooks/useF1Standings';
import { f1StandingsApi } from '../services/f1StandingsService';
import { CountryFlag } from './CountryFlag';

export function F1StandingsTable() {
  const [championship, setChampionship] = useState<'drivers' | 'constructors'>('drivers');
  const { standings: driverStandings, seasonYear: driverSeason, round: driverRound, loading: driversLoading, error: driversError, refetch: refetchDrivers } = useDriverStandings();
  const { standings: constructorStandings, seasonYear: constructorSeason, round: constructorRound, loading: constructorsLoading, error: constructorsError, refetch: refetchConstructors } = useConstructorStandings();
  const seasonYear = championship === 'drivers' ? driverSeason : constructorSeason;
  const round = championship === 'drivers' ? driverRound : constructorRound;

  const loading = championship === 'drivers' ? driversLoading : constructorsLoading;
  const error = championship === 'drivers' ? driversError : constructorsError;

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-sm font-bold">{position}</span>;
    }
  };

  const getPositionBadge = (position: number) => {
    if (position === 1) return "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg";
    if (position === 2) return "bg-gradient-to-r from-gray-400 to-gray-500 text-white shadow-lg";
    if (position === 3) return "bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-lg";
    if (position <= 10) return "bg-gradient-to-r from-blue-900 to-blue-800 text-blue-200 border border-blue-700";
    return "bg-gradient-to-r from-slate-800 to-slate-700 text-slate-300 border border-slate-600";
  };

  if (loading) {
    return (
      <Card className="bg-slate-900 border-slate-700">
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-red-500" />
            <span className="ml-3 text-slate-400">Carregando classificação...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="bg-slate-900 border-slate-700">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
            <p className="text-slate-400 mb-4">{error}</p>
            <Button onClick={() => championship === 'drivers' ? refetchDrivers() : refetchConstructors()} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Tentar novamente
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader className="bg-slate-900/50 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-white">
              <span className="text-xl">🏎️</span>
              Classificação - Fórmula 1
            </CardTitle>
            <CardDescription className="text-slate-400">
              Campeonato de {championship === 'drivers' ? 'Pilotos' : 'Construtores'} {seasonYear || ''}
              {round ? ` • após a etapa ${round}` : ''}
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => championship === 'drivers' ? refetchDrivers() : refetchConstructors()}
            className="text-slate-400 hover:text-white"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex gap-2 mt-2">
          <Button
            variant={championship === 'drivers' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChampionship('drivers')}
            className={championship === 'drivers' 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white'}
          >
            <User className="h-3 w-3 mr-1" />
            Pilotos
          </Button>
          <Button
            variant={championship === 'constructors' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setChampionship('constructors')}
            className={championship === 'constructors' 
              ? 'bg-red-600 hover:bg-red-700' 
              : 'bg-slate-800/50 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white'}
          >
            <Users className="h-3 w-3 mr-1" />
            Equipes
          </Button>
        </div>
      </CardHeader>

      <CardContent className="bg-slate-900/30 p-0">
        {championship === 'drivers' ? (
          <div className="overflow-hidden rounded-lg border border-slate-700 m-4">
            <Table>
              <TableHeader className="bg-gradient-to-r from-red-950 to-red-900 border-b border-red-800">
                <TableRow>
                  <TableHead className="w-16 text-red-200">Pos</TableHead>
                  <TableHead className="w-16 text-red-200">#</TableHead>
                  <TableHead className="text-red-200">Piloto</TableHead>
                  <TableHead className="text-red-200">Equipe</TableHead>
                  <TableHead className="w-20 text-center text-red-200">Vitórias</TableHead>
                  <TableHead className="text-right w-24 text-red-200">Pontos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {driverStandings.map((standing, index) => {
                  const teamColor = standing.constructors[0] 
                    ? f1StandingsApi.getTeamColor(standing.constructors[0].constructorId) 
                    : '#666';
                  
                  return (
                    <motion.tr
                      key={standing.driver.driverId}
                      className={`hover:bg-red-950/30 transition-colors border-b border-slate-800 ${
                        standing.position <= 3 ? 'bg-gradient-to-r from-amber-950/30 to-transparent' : 'bg-slate-900/50'
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                    >
                      <TableCell>
                        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${getPositionBadge(standing.position)}`}>
                          {standing.position <= 3 ? getPositionIcon(standing.position) : <span className="text-sm font-bold">{standing.position}</span>}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="font-mono bg-slate-800/50 text-slate-300 border-slate-600">
                          {standing.driver.permanentNumber || '-'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <CountryFlag nationality={standing.driver.nationality} size="md" />
                          <div>
                            <span className="font-semibold text-slate-200">
                              {standing.driver.givenName} {standing.driver.familyName}
                            </span>
                            <span className="ml-2 text-xs text-slate-500">({standing.driver.code})</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: teamColor }}
                          />
                          <span className="text-sm text-slate-400">
                            {standing.constructors[0]?.name || '-'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={standing.wins > 0 ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/30' : 'bg-slate-800 text-slate-500'}>
                          {standing.wins}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-bold text-lg text-red-400">{standing.points}</span>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-slate-700 m-4">
            <Table>
              <TableHeader className="bg-gradient-to-r from-red-950 to-red-900 border-b border-red-800">
                <TableRow>
                  <TableHead className="w-16 text-red-200">Pos</TableHead>
                  <TableHead className="text-red-200">Equipe</TableHead>
                  <TableHead className="w-20 text-center text-red-200">Vitórias</TableHead>
                  <TableHead className="text-right w-32 text-red-200">Pontos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {constructorStandings.map((standing, index) => {
                  const teamColor = f1StandingsApi.getTeamColor(standing.constructor.constructorId);
                  
                  return (
                    <motion.tr
                      key={standing.constructor.constructorId}
                      className={`hover:bg-red-950/30 transition-colors border-b border-slate-800 ${
                        standing.position <= 3 ? 'bg-gradient-to-r from-amber-950/30 to-transparent' : 'bg-slate-900/50'
                      }`}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.03 }}
                    >
                      <TableCell>
                        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${getPositionBadge(standing.position)}`}>
                          {standing.position <= 3 ? getPositionIcon(standing.position) : <span className="text-sm font-bold">{standing.position}</span>}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full ring-2 ring-slate-600 shadow-md"
                            style={{ backgroundColor: teamColor }}
                          />
                          <CountryFlag nationality={standing.constructor.nationality} size="md" />
                          <span className="font-semibold text-slate-200">{standing.constructor.name}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge className={standing.wins > 0 ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/30' : 'bg-slate-800 text-slate-500'}>
                          {standing.wins}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="font-bold text-lg text-red-400">{standing.points}</span>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
        
      </CardContent>
    </Card>
  );
}

export default F1StandingsTable;
