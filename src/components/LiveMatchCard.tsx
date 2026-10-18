import React from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ExternalLink, Bell, Radio, MapPin } from "lucide-react";
import { ChannelBadge } from "./ChannelBadge";
import { FavoriteButton } from "./FavoriteButton";
import { motion } from "motion/react";
import { getStreamingOptions } from "../services/streamingService";

interface LiveMatchCardProps {
  game: any;
  sport: any;
  onReminder: (game: any) => void;
  key?: string | number;
}

export function LiveMatchCard({ game, sport, onReminder }: LiveMatchCardProps) {
  const streamingOptions = getStreamingOptions(game.sport, game.session);
  const getSportColor = (sportId: string) => {
    const colors = {
      f1: "from-red-600 via-red-700 to-red-900",
      nba: "from-blue-600 via-blue-700 to-blue-900",
      nfl: "from-purple-600 via-purple-700 to-purple-900",
    };
    return colors[sportId as keyof typeof colors] || "from-gray-600 to-gray-700";
  };

  const getSportAccent = (sportId: string) => {
    const accents = {
      f1: "border-red-500 bg-red-50",
      nba: "border-blue-500 bg-blue-50",
      nfl: "border-purple-500 bg-purple-50",
    };
    return accents[sportId as keyof typeof accents] || "border-gray-500 bg-gray-50";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="overflow-hidden border-0 shadow-2xl neon-glow-red live-pulse relative">
        {/* Background pattern esportivo */}
        <div className="absolute inset-0 sport-stripes opacity-10" />
        
        {/* Header com gradiente do esporte */}
        <div className={`bg-gradient-to-br ${getSportColor(game.sport)} p-5 text-white relative overflow-hidden`}>
          {/* Linhas de velocidade animadas */}
          <div className="absolute inset-0 speed-lines" />
          
          {/* Círculos decorativos */}
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-white/5 blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-white/5 blur-2xl" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="h-3 w-3 bg-white rounded-full shadow-lg shadow-white/50"
                />
                <Badge className="bg-white/20 text-white border-white/30 backdrop-blur-sm px-4 py-1.5 shadow-lg uppercase tracking-wider">
                  <Radio className="h-3 w-3 mr-1.5 animate-pulse" />
                  AO VIVO
                </Badge>
                <div className="px-3 py-1 bg-black/20 rounded-full backdrop-blur-sm">
                  <span className="text-xs font-mono">{game.time}</span>
                </div>
              </div>
              <FavoriteButton id={game.id} name={game.title} type="event" variant="icon" />
            </div>
            
            <div className="flex items-center gap-3 text-white">
              <div className="text-4xl">{sport?.icon}</div>
              <div>
                <h3 className="text-2xl sport-text-shadow mb-1">{game.title}</h3>
                {game.sessionType && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-white/10 border-white/30 text-white text-xs">
                      {game.sessionType}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <CardContent className="p-5 bg-gradient-to-br from-slate-900 to-slate-850">
          {/* Informações principais */}
          <div className="space-y-4 mb-5">
            <div className={`flex items-center gap-4 p-4 rounded-xl border-2 backdrop-blur-sm ${
              game.sport === 'f1' ? 'bg-red-950/30 border-red-800/50' : 
              game.sport === 'nba' ? 'bg-blue-950/30 border-blue-800/50' : 
              'bg-purple-950/30 border-purple-800/50'
            } shadow-md`}>
              <div className="flex items-center gap-3 flex-1">
                <ChannelBadge channel={game.channel} />
                {game.location && (
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <MapPin className="h-4 w-4" />
                    <span className="font-medium">{game.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Informações específicas por esporte */}
            {game.sport === "f1" && game.session && (
              <div className="p-4 bg-gradient-to-br from-red-950/40 to-orange-950/40 rounded-xl border border-red-800/50 backdrop-blur-sm">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  {game.circuit && (
                    <div>
                      <span className="text-xs text-slate-400 block mb-1">Circuito</span>
                      <span className="font-semibold text-red-300">{game.circuit}</span>
                    </div>
                  )}
                  {game.laps && (
                    <div>
                      <span className="text-xs text-slate-400 block mb-1">Voltas</span>
                      <span className="font-semibold text-red-300">{game.laps}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Times/participantes */}
            {game.teams && game.teams.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {game.teams.slice(0, 5).map((team: string, index: number) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className={`px-4 py-2 rounded-lg font-medium text-sm shadow-sm border ${
                      game.sport === 'f1' ? 'bg-gradient-to-br from-red-900/50 to-red-800/50 border-red-700/50 text-red-200' :
                      game.sport === 'nba' ? 'bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-700/50 text-blue-200' :
                      'bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-700/50 text-purple-200'
                    }`}
                  >
                    {team}
                  </motion.span>
                ))}
                {game.teams.length > 5 && (
                  <span className="px-4 py-2 bg-slate-800/50 rounded-lg text-sm text-slate-400 border border-slate-700">
                    +{game.teams.length - 5}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Links de Streaming */}
          {streamingOptions.length > 0 && (
            <div className="mb-4 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-base font-bold text-white">📺 Assistir ao vivo</span>
              </div>
              <div className="flex flex-wrap gap-3">
                {streamingOptions.map((option, idx) => (
                  <a
                    key={idx}
                    href={option.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all hover:scale-105 ${
                      option.isPaid
                        ? 'bg-orange-500 text-white hover:bg-orange-400 shadow-orange-500/40 shadow-xl'
                        : 'bg-green-500 text-white hover:bg-green-400 shadow-green-500/40 shadow-xl'
                    }`}
                  >
                    <ExternalLink className="w-4 h-4" />
                    {option.name}
                    <span className={`text-[10px] px-2 py-1 rounded-full font-bold ${
                      option.isPaid ? 'bg-orange-700 text-orange-100' : 'bg-green-700 text-green-100'
                    }`}>
                      {option.isPaid ? 'PAGO' : 'GRÁTIS'}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex gap-3">
            <Button
              onClick={() => onReminder(game)}
              variant="outline"
              className="flex-1 shadow-md bg-slate-800/50 text-slate-200 border-slate-600 hover:bg-slate-700/50 hover:border-slate-500 py-5"
            >
              <Bell className="h-5 w-5 mr-2" />
              Lembrar
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}