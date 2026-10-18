import React, { useState } from "react";
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
  CloudRain,
  CloudSun,
  Thermometer,
  Wind,
} from "lucide-react";
import { toast } from "sonner";
import { LiveMatchCard } from "./LiveMatchCard";
import { motion } from "motion/react";
import { getStreamingOptions } from "../services/streamingService";
import { CountryFlag } from "./CountryFlag";
import { CircuitMap } from "./CircuitMap";

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
  // Todas as sessões ficam na mesma aba; a hierarquia visual diferencia cada tipo.
  const visibleGames = scheduledGames;

  return (
    <div className="flex w-full min-w-0 flex-col gap-6">
      {showAll && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-700/80 bg-slate-950/80 px-4 py-3 shadow-xl shadow-black/20">
          <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-200">Fim de semana de corrida</span>
          <span className="h-2 w-2 rounded-full bg-red-500" />
          <span className="text-xs font-semibold text-slate-300">Corridas em destaque</span>
          <span className="h-2 w-2 rounded-full bg-amber-400" />
          <span className="text-xs font-semibold text-slate-300">Classificação</span>
          <span className="h-2 w-2 rounded-full bg-slate-500" />
          <span className="text-xs font-semibold text-slate-300">Treinos reunidos</span>
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
                  className={`w-full min-w-0 hover:shadow-2xl transition-all duration-300 border-l-[6px] bg-gradient-to-br from-slate-900 via-slate-850 to-slate-900 overflow-hidden relative group border-2 ${
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
                  
                  <CardContent className="relative z-10 w-full min-w-0 p-3 sm:p-5">
                    <div className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
                      <div className="flex w-full min-w-0 items-start gap-3 sm:gap-4">
                        <motion.div 
                          className={`flex size-12 shrink-0 items-center justify-center rounded-xl shadow-xl relative overflow-hidden transition-transform duration-300 sm:size-16 sm:rounded-2xl group-hover:scale-110 ${
                            game.sport === 'f1' ? 'bg-gradient-to-br from-red-500 to-red-700' :
                            game.sport === 'nba' ? 'bg-gradient-to-br from-blue-500 to-blue-700' :
                            'bg-gradient-to-br from-purple-500 to-purple-700'
                          }`}
                          whileHover={{ rotate: 5 }}
                        >
                          {/* Círculo de fundo */}
                          <div className="absolute inset-0 bg-white/20 rounded-full blur-xl" />
                        </motion.div>

                        <div className="min-w-0 flex-1">
                          <div className="mb-3 flex flex-wrap items-center gap-2">
                            <h3 className="flex min-w-0 items-center gap-2 text-base font-bold text-white sm:text-lg">
                              {game.session === "Race" && game.country && (
                                <CountryFlag nationality={game.country} size="lg" />
                              )}
                              {game.title}
                            </h3>
                            {game.status !== "Agendado" && (
                              <Badge
                                className={`${getStatusColor(game.status)} shadow-md`}
                              >
                                {game.status}
                              </Badge>
                            )}
                            {game.sessionType && (
                              <Badge
                                variant="outline"
                                className="text-xs font-semibold border-2 bg-slate-800/50 text-slate-300 border-slate-600"
                              >
                                {game.sessionType}
                              </Badge>
                            )}
                          </div>

                          <div className="mb-4 flex min-w-0 flex-wrap items-stretch gap-2">
                            <div className={`min-w-0 flex-1 rounded-xl border px-3 py-2.5 sm:px-4 ${game.session === 'Race' ? 'border-red-400/50 bg-red-600 text-white' : 'border-slate-600 bg-slate-800 text-white'}`}>
                              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-300">Data e horário</p>
                              <p className="break-words text-sm font-black capitalize text-white sm:text-base">{formatEventDate(game.date)} · {game.time}</p>
                            </div>
                            <Button
                              onClick={() => handleReminder(game)}
                              variant="outline"
                              size="sm"
                              className="h-auto min-h-full shrink-0 self-stretch border-2 border-slate-600 bg-slate-800/80 px-4 font-semibold text-slate-200 shadow-md hover:border-slate-500 hover:bg-slate-700/80 hover:shadow-lg"
                            >
                              <Bell className="mr-1 h-4 w-4" />
                              Avisar
                            </Button>
                          </div>

                          {getGameStreamingOptions(game).length > 0 && (
                            <div className="mb-4 rounded-xl border border-slate-700/60 bg-slate-800/50 p-3">
                              <div className="mb-2 flex items-center gap-2">
                                <span className="text-sm font-bold text-white">Onde assistir</span>
                              </div>
                              <div className="flex flex-wrap gap-2">
                                {getGameStreamingOptions(game).map((option, idx) => (
                                  <a
                                    key={idx}
                                    href={option.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-all hover:scale-105 hover:shadow-xl ${
                                      option.isPaid
                                        ? 'bg-orange-500 text-white hover:bg-orange-400 shadow-orange-500/30 shadow-lg'
                                        : 'bg-green-500 text-white hover:bg-green-400 shadow-green-500/30 shadow-lg'
                                    }`}
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                    {option.name}
                                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                      option.isPaid ? 'bg-orange-700 text-orange-100' : 'bg-green-700 text-green-100'
                                    }`}>
                                      {option.isPaid ? 'PAGO' : 'GRÁTIS'}
                                    </span>
                                  </a>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-2 sm:gap-3">
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
                            <div className="mt-3 grid min-w-0 grid-cols-1 gap-3 rounded-xl border-2 border-red-800/50 bg-gradient-to-br from-red-950/40 via-orange-950/40 to-red-950/40 p-3 text-xs shadow-inner backdrop-blur-sm sm:p-4 lg:grid-cols-[minmax(0,1fr)_minmax(280px,0.82fr)] lg:items-start">
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

                              <div className="flex min-w-0 items-center justify-between gap-3 rounded-xl border border-sky-700/70 bg-gradient-to-r from-sky-950/90 via-slate-900/90 to-indigo-950/80 px-3 py-3 text-sky-50 shadow-lg shadow-sky-950/20 lg:col-start-2 lg:row-start-2" aria-label="Previsão do tempo">
                                <div className="flex min-w-0 items-center gap-3">
                                  {/(chuva|chuvoso|trovoada|tempestade|rain|storm)/i.test(game.weather || "") ? (
                                    <CloudRain className="h-7 w-7 shrink-0 text-sky-300" aria-hidden="true" />
                                  ) : (
                                    <CloudSun className="h-7 w-7 shrink-0 text-amber-300" aria-hidden="true" />
                                  )}
                                  <div className="min-w-0">
                                    <span className="block text-[10px] font-black uppercase tracking-[0.16em] !text-sky-300">Previsão do tempo</span>
                                    <span className="mt-0.5 block truncate text-sm font-semibold !text-white">{game.weather || "Dados meteorológicos em breve"}</span>
                                  </div>
                                </div>
                                <div className="flex shrink-0 items-center gap-1 text-white" aria-label="Temperatura prevista">
                                  <Thermometer className="h-4 w-4 text-amber-300" aria-hidden="true" />
                                  <span className="text-lg font-black">{game.weather ? "—°C" : "Aguardando"}</span>
                                </div>
                              </div>

                              {game.tyreStrategy && (
                                <div className="text-slate-300 bg-slate-900/60 px-2 py-1.5 rounded border border-red-900/30">
                                  <span className="mr-1">🏎️</span>
                                  <span className="font-medium">
                                    {game.tyreStrategy}
                                  </span>
                                </div>
                              )}

                              {game.circuit && (
                                <div className="mt-2 border-t border-red-800/50 pt-2">
                                  <span className="text-[10px] font-black uppercase tracking-[0.16em] text-red-300">Circuito</span>
                                  <p className="font-bold text-white">{game.circuit}</p>
                                </div>
                              )}
                              {game.session === "Race" && game.circuitId && (
                                <div className="mt-1 min-w-0 lg:col-start-2 lg:row-start-1 lg:row-span-1 lg:mt-0">
                                  <CircuitMap circuitId={game.circuitId} circuitName={game.circuit} />
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

                    </div>

                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
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
