import React, { useMemo, useState } from "react";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Eye,
  ExternalLink,
  MapPin,
  Flag,
  Timer,
  Gauge,
  Bell,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import { LiveMatchCard } from "./LiveMatchCard";
import { ChannelBadge } from "./ChannelBadge";
import { FavoriteButton } from "./FavoriteButton";
import { motion } from "motion/react";
import { getStreamingOptions } from "../services/streamingService";
import { CountryFlag } from "./CountryFlag";
import { CircuitMap } from "./CircuitMap";
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs";

interface Game {
  id: string | number;
  sport: string;
  title: string;
  date: string;
  time: string;
  teams: string[];
  channel: string;
  status: string;
  streamUrl?: string;
  session?: string;
  sessionType?: string;
  duration?: string;
  circuit?: string;
  circuitId?: string;
  location?: string;
  country?: string;
  description?: string;
  laps?: string;
  distance?: string;
  weather?: string;
  pole?: string;
  fastestLap?: string;
  tyreStrategy?: string;
}

interface Sport {
  id: string;
  name: string;
  icon: string;
}

interface GameScheduleProps {
  games: Game[];
  sports: Sport[];
  currentDate: Date;
  showAll?: boolean;
}

const SESSION_ORDER: Record<string, number> = {
  Race: 0,
  Sprint: 1,
  Qualifying: 2,
  "Sprint Qualifying": 3,
  "Sprint Shootout": 3,
  FP1: 4,
  FP2: 5,
  FP3: 6,
};

function formatEventDate(date: string) {
  const [year, month, day] = date.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
  });
}

export function GameSchedule({
  games,
  sports,
  currentDate,
  showAll = false,
}: GameScheduleProps) {
  const [sessionTab, setSessionTab] = useState<"races" | "qualifying" | "practice">("races");

  const getSportById = (id: string) =>
    sports.find((sport) => sport.id === id);

  const getSportColor = (sportId: string) => {
    const colors = {
      f1: "from-red-950/50 to-red-900/50 border-red-800/50",
      nba: "from-blue-950/50 to-blue-900/50 border-blue-800/50",
      nfl: "from-purple-950/50 to-purple-900/50 border-purple-800/50",
    };
    return colors[sportId as keyof typeof colors] || "from-slate-950/50 to-slate-900/50 border-slate-800/50";
  };

  const getSportAccent = (sportId: string) => {
    const accents = {
      f1: "text-red-400",
      nba: "text-blue-400",
      nfl: "text-purple-400",
    };
    return accents[sportId as keyof typeof accents] || "text-slate-400";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ao vivo":
        return "bg-red-500 text-white animate-pulse";
      case "Agendado":
        return "bg-blue-500 text-white";
      case "Finalizado":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // Função para obter opções de streaming de um jogo
  const getGameStreamingOptions = (game: Game) => {
    return getStreamingOptions(game.sport, game.session);
  };

  const handleReminder = (game: Game) => {
    const [year, month, day] = game.date.split('-').map(Number);
    const [hours, minutes] = (game.time || '14:00').split(':').map(Number);
    const startUtc = new Date(Date.UTC(year, month - 1, day, hours + 3, minutes));
    const endUtc = new Date(startUtc.getTime() + 2 * 60 * 60000);

    const formatDateForGoogle = (date: Date) => {
      return date.toISOString().replace(/-|:|\.\d{3}/g, '');
    };

    const watchLinks = getStreamingOptions(game.sport, game.session)
      .map((option) => `${option.name}: ${option.url}`)
      .join('\n');

    const title = encodeURIComponent(game.title);
    const description = encodeURIComponent(
      [
        game.description || '',
        watchLinks ? `Onde assistir:\n${watchLinks}` : '',
        game.location ? `Local: ${game.location}` : '',
      ].filter(Boolean).join('\n\n')
    );
    const location = encodeURIComponent(game.location || game.circuit || '');
    const dates = `${formatDateForGoogle(startUtc)}/${formatDateForGoogle(endUtc)}`;

    const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${description}&location=${location}&ctz=America/Sao_Paulo`;

    window.open(googleCalendarUrl, '_blank');

    toast.success('Abrindo Google Calendar', {
      description: 'Salve o evento. Os links da transmissão estão na descrição.',
    });
  };

  // Filtrar jogos para a data selecionada (usando data local, não UTC)
  const year = currentDate.getFullYear();
  const month = String(currentDate.getMonth() + 1).padStart(2, '0');
  const day = String(currentDate.getDate()).padStart(2, '0');
  const currentDateString = `${year}-${month}-${day}`;
  
  const filteredGames = (showAll
    ? games
    : games.filter((game) => game.date === currentDateString)
  ).slice().sort((a, b) => {
    const orderA = SESSION_ORDER[a.session || ""] ?? 20;
    const orderB = SESSION_ORDER[b.session || ""] ?? 20;
    if (orderA !== orderB) return orderA - orderB;
    return `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`);
  });

  // Separar jogos ao vivo dos agendados
  const liveGames = showAll ? [] : filteredGames.filter((game) => game.status === "Ao vivo");
  const scheduledGames = showAll ? filteredGames : filteredGames.filter((game) => game.status !== "Ao vivo");
  const sessionGroups = useMemo(() => ({
    races: scheduledGames.filter((game) => game.session === "Race" || game.session === "Sprint"),
    qualifying: scheduledGames.filter((game) => game.session?.includes("Qualifying") || game.session === "Sprint Shootout"),
    practice: scheduledGames.filter((game) => ["FP1", "FP2", "FP3"].includes(game.session || "")),
  }), [scheduledGames]);
  const visibleGames = showAll ? sessionGroups[sessionTab] : scheduledGames;

  return (
    <div className="space-y-6">
      {showAll && (
        <div className="rounded-2xl border border-slate-700/80 bg-slate-950/80 p-1.5 shadow-xl shadow-black/20">
          <Tabs value={sessionTab} onValueChange={(value) => setSessionTab(value as typeof sessionTab)}>
            <TabsList className="grid h-auto w-full grid-cols-3 gap-1 bg-transparent">
              <TabsTrigger value="races" className="group rounded-xl px-3 py-3 text-left text-slate-400 data-[state=active]:bg-red-600 data-[state=active]:text-white">
                <span className="flex flex-col items-start"><span className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-70">Principal</span><span className="font-bold">Corridas</span></span>
              </TabsTrigger>
              <TabsTrigger value="qualifying" className="group rounded-xl px-3 py-3 text-left text-slate-400 data-[state=active]:bg-amber-500 data-[state=active]:text-slate-950">
                <span className="flex flex-col items-start"><span className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-70">Grid</span><span className="font-bold">Classificação</span></span>
              </TabsTrigger>
              <TabsTrigger value="practice" className="group rounded-xl px-3 py-3 text-left text-slate-400 data-[state=active]:bg-slate-700 data-[state=active]:text-slate-100">
                <span className="flex flex-col items-start"><span className="text-[10px] font-bold uppercase tracking-[0.18em] opacity-70">Sessões</span><span className="font-bold">Treinos</span></span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      {/* Jogos ao vivo em destaque */}
      {liveGames.length > 0 && (
        <div className="space-y-3">
          <h3 className="flex items-center gap-2 text-red-400 font-bold text-lg">
            <div className="h-2 w-2 bg-red-500 rounded-full animate-pulse" />
            Ao Vivo Agora
          </h3>
          {liveGames.map((game) => {
            const sport = getSportById(game.sport);
            return (
              <LiveMatchCard
                key={game.id}
                game={game}
                sport={sport}
                onReminder={handleReminder}
              />
            );
          })}
        </div>
      )}

      {/* Jogos agendados */}
      {scheduledGames.length > 0 && (
        <div className="space-y-3">
          {liveGames.length > 0 && (
            <h3 className="flex items-center gap-2 text-slate-300 font-bold text-lg">
              <Calendar className="h-5 w-5" />
              Próximos Eventos
            </h3>
          )}
          {visibleGames.map((game, index) => {
            const sport = getSportById(game.sport);
            return (
              <motion.div
                key={game.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card
                  className={`hover:shadow-2xl transition-all duration-300 border-l-[6px] bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 overflow-hidden relative group border-2 ${
                    game.session === 'Race' ? 'ring-1 ring-red-500/30 shadow-red-950/30' :
                    game.session === 'Qualifying' ? 'opacity-90 ' : 'opacity-75 '}
                    ${game.sport === 'f1' ? 'border-red-800/50 hover:border-red-700/70' : 
                    game.sport === 'nba' ? 'border-blue-800/50 hover:border-blue-700/70' : 
                    'border-purple-800/50 hover:border-purple-700/70'
                  }`}
                  style={{
                    borderLeftColor: game.sport === 'f1' ? '#DC2626' : game.sport === 'nba' ? '#2563EB' : '#7C3AED',
                  }}
                >
                  {/* Padrão de fundo esportivo */}
                  <div className="absolute inset-0 sport-stripes opacity-5 group-hover:opacity-10 transition-opacity" />
                  
                  {/* Efeito de brilho ao hover */}
                  <div className="absolute inset-0 speed-lines opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <CardContent className="p-5 relative z-10">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-4 flex-1">
                        <motion.div 
                          className={`w-16 h-16 rounded-2xl shadow-xl flex items-center justify-center flex-shrink-0 relative overflow-hidden group-hover:scale-110 transition-transform duration-300 ${
                            game.sport === 'f1' ? 'bg-gradient-to-br from-red-500 to-red-700' :
                            game.sport === 'nba' ? 'bg-gradient-to-br from-blue-500 to-blue-700' :
                            'bg-gradient-to-br from-purple-500 to-purple-700'
                          }`}
                          whileHover={{ rotate: 5 }}
                        >
                          {/* Círculo de fundo */}
                          <div className="absolute inset-0 bg-white/20 rounded-full blur-xl" />
                          <span className="text-3xl relative z-10 filter drop-shadow-lg">
                            {sport?.icon}
                          </span>
                        </motion.div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <h3 className="font-bold text-lg text-white flex items-center gap-2">
                              {game.session === "Race" && game.country && (
                                <CountryFlag nationality={game.country} size="lg" />
                              )}
                              {game.title}
                            </h3>
                            <Badge
                              className={`${getStatusColor(game.status)} shadow-md`}
                            >
                              {game.status}
                            </Badge>
                            {game.sessionType && (
                              <Badge
                                variant="outline"
                                className="text-xs font-semibold border-2 bg-slate-800/50 text-slate-300 border-slate-600"
                              >
                                {game.sessionType}
                              </Badge>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-2 mb-4">
                            <div className={`rounded-xl px-4 py-2.5 min-w-[240px] border ${game.session === 'Race' ? 'bg-red-600 text-white border-red-400/50' : 'bg-slate-800 text-slate-100 border-slate-600'}`}>
                              <p className="text-[10px] font-bold uppercase tracking-[0.16em] opacity-70">Data e horário</p>
                              <p className="text-base font-black capitalize">{formatEventDate(game.date)} · {game.time}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                            <div className="flex items-center">
                              <ChannelBadge channel={game.channel} />
                            </div>
                            {game.duration && (
                              <div className="flex items-center gap-2 bg-gradient-to-r from-slate-800/70 to-slate-800/50 px-3 py-2 rounded-lg shadow-sm border border-slate-700/50">
                                <Timer className="h-4 w-4 flex-shrink-0 text-purple-400" />
                                <span className="text-sm font-medium truncate text-slate-200">
                                  {game.duration}
                                </span>
                              </div>
                            )}
                            {game.location && (
                              <div className="flex items-center gap-2 bg-gradient-to-r from-slate-800/70 to-slate-800/50 px-3 py-2 rounded-lg shadow-sm border border-slate-700/50">
                                <MapPin className="h-4 w-4 flex-shrink-0 text-green-400" />
                                <span className="text-sm font-medium truncate text-slate-200">
                                  {game.location}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Dados específicos da F1 */}
                          {game.sport === "f1" && (
                            <div className="mt-3 p-4 bg-gradient-to-br from-red-950/40 via-orange-950/40 to-red-950/40 rounded-xl border-2 border-red-800/50 text-xs space-y-2 shadow-inner backdrop-blur-sm">
                              {game.description && (
                                <p className="text-sm font-medium text-red-300">
                                  {game.description}
                                </p>
                              )}

                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-red-800/50">
                                {game.laps && (
                                  <div className="flex items-center gap-2 bg-slate-900/60 px-2 py-1.5 rounded border border-red-900/30">
                                    <Flag className="h-3 w-3 flex-shrink-0 text-red-400" />
                                    <span className="font-semibold text-red-300">{game.laps} voltas</span>
                                  </div>
                                )}
                                {game.distance && (
                                  <div className="flex items-center gap-2 bg-slate-900/60 px-2 py-1.5 rounded border border-red-900/30">
                                    <Gauge className="h-3 w-3 flex-shrink-0 text-red-400" />
                                    <span className="font-semibold text-red-300">{game.distance}</span>
                                  </div>
                                )}
                              </div>

                              {game.weather && (
                                <div className="text-slate-300 bg-slate-900/60 px-2 py-1.5 rounded border border-red-900/30">
                                  <span className="mr-1">🌤️</span>
                                  <span className="font-medium">{game.weather}</span>
                                </div>
                              )}

                              {game.tyreStrategy && (
                                <div className="text-slate-300 bg-slate-900/60 px-2 py-1.5 rounded border border-red-900/30">
                                  <span className="mr-1">🏎️</span>
                                  <span className="font-medium">
                                    {game.tyreStrategy}
                                  </span>
                                </div>
                              )}

                              {game.circuit && (
                                <div className="text-slate-300 border-t border-red-800/50 pt-2 mt-2">
                                  <span className="font-bold text-red-400">
                                    {game.circuit}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Times/Pilotos para outros esportes */}
                          {game.sport !== "f1" && game.teams && game.teams.length > 0 && (
                            <div className="mt-3">
                              <div className="flex gap-2 flex-wrap">
                                {game.teams.map((team, teamIndex) => (
                                  <motion.span
                                    key={teamIndex}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: teamIndex * 0.05 }}
                                    className={`px-4 py-2 rounded-xl font-semibold text-sm shadow-md border-2 ${
                                      game.sport === 'nba' ? 'bg-gradient-to-br from-blue-900/50 to-blue-800/50 border-blue-600/50 text-blue-200' :
                                      'bg-gradient-to-br from-purple-900/50 to-purple-800/50 border-purple-600/50 text-purple-200'
                                    }`}
                                  >
                                    {team}
                                  </motion.span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col gap-2 flex-shrink-0">
                        <Button
                          onClick={() => handleReminder(game)}
                          variant="outline"
                          size="sm"
                          className="shadow-md hover:shadow-lg border-2 font-semibold bg-slate-800/50 text-slate-200 border-slate-600 hover:bg-slate-700/50 hover:border-slate-500"
                        >
                          <Bell className="h-4 w-4 mr-1" />
                          Avisar
                        </Button>
                        <FavoriteButton
                          id={game.id.toString()}
                          name={game.title}
                          type="event"
                          variant="icon"
                        />
                      </div>
                    </div>

                    {/* Links de Streaming */}
                    {getGameStreamingOptions(game).length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-600/50">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-sm font-bold text-white">📺 Onde assistir</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {getGameStreamingOptions(game).map((option, idx) => (
                            <a
                              key={idx}
                              href={option.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all hover:scale-105 hover:shadow-xl ${
                                option.isPaid
                                  ? 'bg-orange-500 text-white hover:bg-orange-400 shadow-orange-500/30 shadow-lg'
                                  : 'bg-green-500 text-white hover:bg-green-400 shadow-green-500/30 shadow-lg'
                              }`}
                            >
                              <ExternalLink className="w-4 h-4" />
                              {option.name}
                              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                option.isPaid ? 'bg-orange-700 text-orange-100' : 'bg-green-700 text-green-100'
                              }`}>
                                {option.isPaid ? 'PAGO' : 'GRÁTIS'}
                              </span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {showAll && filteredGames[0]?.circuitId && (
        <CircuitMap circuitId={filteredGames[0].circuitId} circuitName={filteredGames[0].circuit} />
      )}

      {filteredGames.length === 0 && (
        <Card className="bg-gradient-to-br from-slate-900 to-slate-850 border-2 border-slate-800">
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Eye className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2 text-slate-300">
                Nenhum evento encontrado
              </h3>
              <p className="text-slate-500">
                Não há eventos programados para esta data no
                esporte selecionado.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

    </div>
  );
}
