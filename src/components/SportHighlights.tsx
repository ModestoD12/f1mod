import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Play, TrendingUp, Users, Flame, Zap } from 'lucide-react';
import { motion } from 'motion/react';
import { useF1LiveSnapshot } from '../hooks/useF1LiveSnapshot';
import { f1CalendarApi } from '../services/f1CalendarService';

interface HighlightGame {
  id: string;
  sport: string;
  title: string;
  status: 'live' | 'upcoming' | 'trending';
  time: string;
  channel: string;
  viewers?: string;
  description: string;
}

interface SportNews {
  id: string;
  sport: string;
  title: string;
  summary: string;
  time: string;
  trending: boolean;
}

const getSportIcon = (sport: string) => {
  switch (sport) {
    case 'f1': return '🏎️';
    case 'nba': return '🏀';
    case 'nfl': return '🏈';
    default: return '🏆';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'live': return 'bg-red-500 text-white';
    case 'upcoming': return 'bg-blue-500 text-white';
    case 'trending': return 'bg-orange-500 text-white';
    default: return 'bg-gray-500 text-white';
  }
};

export function SportHighlights() {
  const { nextRace, lastRace, leader } = useF1LiveSnapshot();

  const highlightGames = useMemo(() => {
    const items: HighlightGame[] = [];

    if (nextRace) {
      items.push({
        id: `f1-next-${nextRace.round}`,
        sport: 'f1',
        title: nextRace.raceName,
        status: 'upcoming',
        time: f1CalendarApi.formatTime(nextRace.time),
        channel: 'Globo',
        description: `${nextRace.locality}, ${nextRace.country} • ${new Date(`${nextRace.date}T00:00:00`).toLocaleDateString('pt-BR')}`,
      });
    }

    if (lastRace?.results[0]) {
      const winner = lastRace.results[0];
      items.push({
        id: `f1-last-${lastRace.round}`,
        sport: 'f1',
        title: lastRace.raceName,
        status: 'trending',
        time: 'Resultado',
        channel: 'F1',
        description: `Vencedor: ${winner.driver.givenName} ${winner.driver.familyName} (${winner.constructorName})`,
      });
    }

    return items.slice(0, 2);
  }, [nextRace, lastRace]);

  const sportNews = useMemo(() => {
    const items: SportNews[] = [];

    if (lastRace?.results[0]) {
      const winner = lastRace.results[0];
      items.push({
        id: 'f1-result',
        sport: 'f1',
        title: `${winner.driver.familyName} vence em ${lastRace.locality}`,
        summary: `${winner.driver.givenName} ${winner.driver.familyName} faturou o ${lastRace.raceName}`,
        time: new Date(`${lastRace.date}T00:00:00`).toLocaleDateString('pt-BR'),
        trending: true,
      });
    }

    if (leader) {
      items.push({
        id: 'f1-leader',
        sport: 'f1',
        title: `${leader.driver.givenName} ${leader.driver.familyName} lidera o campeonato`,
        summary: `${leader.points} pontos • ${leader.wins} vitórias • ${leader.constructors[0]?.name || ''}`,
        time: 'Classificação ao vivo',
        trending: true,
      });
    }

    if (nextRace) {
      items.push({
        id: 'f1-next-news',
        sport: 'f1',
        title: `Próxima etapa: ${nextRace.raceName}`,
        summary: `${nextRace.circuitName} • ${nextRace.locality}`,
        time: new Date(`${nextRace.date}T00:00:00`).toLocaleDateString('pt-BR'),
        trending: false,
      });
    }

    return items.slice(0, 3);
  }, [lastRace, leader, nextRace]);

  return (
    <div className="space-y-4">
      {/* Jogos em Destaque - Super Vibrante */}
      <Card className="overflow-hidden bg-gradient-to-br from-slate-950 to-slate-900 border-2 border-slate-800 shadow-2xl">
        <CardHeader className="pb-3 bg-gradient-to-r from-red-600/20 via-blue-600/20 to-purple-600/20 border-b border-slate-800">
          <CardTitle className="flex items-center gap-2 text-base text-white">
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                filter: ["brightness(1)", "brightness(1.5)", "brightness(1)"]
              }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            >
              <Flame className="h-5 w-5 text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
            </motion.div>
            Em Alta
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 pt-4">
          {highlightGames.slice(0, 2).map((game, index) => (
            <motion.div 
              key={game.id} 
              className={`p-3 rounded-xl border-2 relative overflow-hidden group cursor-pointer ${
                game.status === 'live' 
                  ? 'bg-gradient-to-br from-red-900/30 to-red-950/30 border-red-700/50 neon-glow-red' 
                  : 'bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 hover:border-blue-600/50'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              {/* Background pattern */}
              <div className="absolute inset-0 sport-stripes opacity-10" />
              
              {game.status === 'live' && (
                <div className="absolute inset-0 speed-lines opacity-30" />
              )}
              
              <div className="relative z-10 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0 flex-1">
                    <div className={`text-2xl p-1.5 rounded-lg ${
                      game.sport === 'f1' ? 'bg-red-600/20' : 
                      game.sport === 'nba' ? 'bg-blue-600/20' : 
                      'bg-purple-600/20'
                    }`}>
                      {getSportIcon(game.sport)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-bold text-sm text-white leading-tight">{game.title}</h4>
                      <p className="text-xs text-gray-400 mt-1 line-clamp-2">{game.description}</p>
                    </div>
                  </div>
                  {game.status === 'live' && (
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <Badge className="bg-red-600 text-white text-xs px-2 py-1 shadow-lg">
                        <div className="h-1.5 w-1.5 bg-white rounded-full mr-1.5 animate-pulse" />
                        LIVE
                      </Badge>
                    </motion.div>
                  )}
                  {game.status === 'upcoming' && (
                    <Badge className="bg-blue-600 text-white text-xs px-2 py-1">
                      {game.time}
                    </Badge>
                  )}
                  {game.status === 'trending' && (
                    <Badge className="bg-orange-600 text-white text-xs px-2 py-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {game.time}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-700/50">
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="font-medium">{game.channel}</span>
                    {game.viewers && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {game.viewers}
                      </span>
                    )}
                  </div>
                  <Button 
                    size="sm" 
                    className={`h-7 px-3 text-xs font-bold shadow-lg ${
                      game.status === 'live' 
                        ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800' 
                        : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800'
                    }`}
                  >
                    <Play className="h-3 w-3 mr-1" />
                    {game.status === 'live' ? 'ASSISTIR' : 'Ver'}
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>

      {/* Notícias - Estilo Esportivo */}
      <Card className="overflow-hidden bg-gradient-to-br from-slate-950 to-slate-900 border-2 border-slate-800 shadow-2xl">
        <CardHeader className="pb-3 bg-gradient-to-r from-amber-600/20 via-orange-600/20 to-red-600/20 border-b border-slate-800">
          <CardTitle className="flex items-center gap-2 text-base text-white">
            <Zap className="h-5 w-5 text-amber-500" />
            Últimas Notícias
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 pt-4">
          {sportNews.slice(0, 3).map((news, index) => (
            <motion.div 
              key={news.id} 
              className="p-3 bg-gradient-to-r from-slate-800/40 to-slate-900/40 rounded-lg border border-slate-700/50 hover:border-amber-600/50 transition-all cursor-pointer group"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ x: 4 }}
            >
              <div className="flex items-start gap-2">
                <div className={`text-lg p-1 rounded ${
                  news.sport === 'f1' ? 'bg-red-600/20' : 
                  news.sport === 'nba' ? 'bg-blue-600/20' : 
                  'bg-purple-600/20'
                }`}>
                  {getSportIcon(news.sport)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1">
                    <h4 className="font-bold text-xs leading-tight flex-1 line-clamp-2 text-white group-hover:text-amber-400 transition-colors">
                      {news.title}
                    </h4>
                    {news.trending && (
                      <motion.div
                        animate={{ rotate: [0, -10, 10, -10, 0] }}
                        transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                      >
                        <Flame className="h-3 w-3 text-orange-500 flex-shrink-0" />
                      </motion.div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-1">{news.summary}</p>
                  <span className="text-xs text-gray-600 block mt-1">{news.time}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}