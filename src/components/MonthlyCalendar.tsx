import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Flag, Trophy, Zap, Users, Target } from 'lucide-react';

interface CalendarEvent {
  id: string;
  sport: string;
  title: string;
  time: string;
  teams?: string[];
  channel?: string;
  status?: string;
  session?: string;
  circuit?: string;
  location?: string;
}

interface MonthlyCalendarProps {
  selectedSports: string[];
  games: Array<{
    id: string;
    sport: string;
    title: string;
    date: string;
    time: string;
    teams?: string[];
    channel?: string;
    status?: string;
    session?: string;
    circuit?: string;
    location?: string;
  }>;
  sports: Array<{ id: string; name: string; icon: string }>;
  onDateSelect?: (date: Date) => void;
  onViewModeChange?: (mode: 'daily' | 'monthly') => void;
}

export function MonthlyCalendar({ selectedSports, games, sports, onDateSelect, onViewModeChange }: MonthlyCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Processar todos os jogos para o calendário
  const getEventsForMonth = (month: Date) => {
    const events: { [key: string]: CalendarEvent[] } = {};
    
    games.forEach((game) => {
      const gameDate = new Date(game.date);
      if (gameDate.getMonth() === month.getMonth() && gameDate.getFullYear() === month.getFullYear()) {
        const dateStr = game.date;
        if (!events[dateStr]) events[dateStr] = [];
        
        events[dateStr].push({
          id: game.id,
          sport: game.sport,
          title: game.title,
          time: game.time,
          teams: game.teams,
          channel: game.channel,
          status: game.status,
          session: game.session,
          circuit: game.circuit,
          location: game.location
        });
      }
    });

    return events;
  };

  const getSportIcon = (sport: string, session?: string) => {
    if (sport === 'f1') {
      if (session === 'FP1' || session === 'FP2' || session === 'FP3') {
        return <Clock className="h-3 w-3" />;
      } else if (session === 'Qualifying') {
        return <Zap className="h-3 w-3" />;
      } else if (session === 'Sprint') {
        return <Flag className="h-3 w-3" />;
      } else {
        return <Trophy className="h-3 w-3" />;
      }
    }
    
    const sportData = sports.find(s => s.id === sport);
    if (sportData) {
      return <span className="text-xs">{sportData.icon}</span>;
    }
    
    // Ícones padrão para outros esportes
    switch (sport) {
      case 'nba':
        return <Target className="h-3 w-3" />;
      case 'nfl':
        return <Users className="h-3 w-3" />;
      case 'soccer':
        return <Trophy className="h-3 w-3" />;
      case 'tennis':
        return <Target className="h-3 w-3" />;
      case 'volleyball':
        return <Trophy className="h-3 w-3" />;
      default:
        return <CalendarIcon className="h-3 w-3" />;
    }
  };

  const getSportColor = (sport: string, session?: string) => {
    if (sport === 'f1') {
      if (session === 'FP1' || session === 'FP2' || session === 'FP3') {
        return 'bg-blue-900/70 text-blue-200 border border-blue-700/50';
      } else if (session === 'Qualifying') {
        return 'bg-yellow-900/70 text-yellow-200 border border-yellow-700/50';
      } else if (session === 'Sprint') {
        return 'bg-purple-900/70 text-purple-200 border border-purple-700/50';
      } else {
        return 'bg-red-900/70 text-red-200 border border-red-700/50';
      }
    }

    // Cores específicas para cada esporte
    switch (sport) {
      case 'nba':
        return 'bg-orange-900/70 text-orange-200 border border-orange-700/50';
      case 'nfl':
        return 'bg-green-900/70 text-green-200 border border-green-700/50';
      case 'soccer':
        return 'bg-emerald-900/70 text-emerald-200 border border-emerald-700/50';
      case 'tennis':
        return 'bg-pink-900/70 text-pink-200 border border-pink-700/50';
      case 'volleyball':
        return 'bg-cyan-900/70 text-cyan-200 border border-cyan-700/50';
      default:
        return 'bg-gray-800/70 text-gray-200 border border-gray-700/50';
    }
  };

  // Gerar dias do calendário
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();
    
    const days = [];
    const events = getEventsForMonth(currentMonth);

    // Dias vazios do mês anterior
    for (let i = 0; i < firstDayWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-24"></div>);
    }

    // Dias do mês atual
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const dayEvents = events[dateStr] || [];
      const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

      days.push(
        <div
          key={day}
          className={`h-24 border border-slate-700 bg-slate-900/50 p-1 cursor-pointer hover:bg-slate-800/70 transition-colors ${
            isToday ? 'bg-blue-950/50 border-blue-700 ring-2 ring-blue-700/50' : ''
          }`}
          onClick={() => {
            if (onDateSelect) onDateSelect(new Date(year, month, day));
            if (dayEvents.length > 0 && onViewModeChange) {
              onViewModeChange('daily');
            }
          }}
        >
          <div className={`text-sm ${isToday ? 'font-semibold text-blue-400' : 'text-slate-300'}`}>
            {day}
          </div>
          <div className="space-y-1 mt-1">
            {dayEvents.slice(0, 3).map((event) => (
              <div
                key={event.id}
                className={`text-xs px-1 py-0.5 rounded flex items-center gap-1 ${getSportColor(event.sport, event.session)}`}
                title={`${event.title} - ${event.time}`}
              >
                {getSportIcon(event.sport, event.session)}
                <span className="truncate">
                  {event.session || event.title.split(' vs ')[0] || event.title.substring(0, 8)}
                </span>
              </div>
            ))}
            {dayEvents.length > 3 && (
              <div className="text-xs text-slate-400">+{dayEvents.length - 3} mais</div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentMonth(prev => {
      const newMonth = new Date(prev);
      if (direction === 'prev') {
        newMonth.setMonth(prev.getMonth() - 1);
      } else {
        newMonth.setMonth(prev.getMonth() + 1);
      }
      return newMonth;
    });
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Determinar o esporte ativo
  const activeSport = selectedSports[0];
  const sportData = sports.find(s => s.id === activeSport);

  if (!activeSport || !sportData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <CalendarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Calendário de Esportes</h3>
            <p className="text-muted-foreground">
              Selecione um esporte para ver o calendário mensal.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader className="bg-slate-900/50 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-white">
            <span className="text-xl">{sportData.icon}</span>
            Calendário {sportData.name} - {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')} className="bg-slate-800/50 border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigateMonth('next')} className="bg-slate-800/50 border-slate-600 text-slate-200 hover:bg-slate-700 hover:text-white">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="bg-slate-900/30">
        {/* Legenda específica por esporte */}
        <div className="flex flex-wrap gap-2 mb-4 p-3 bg-slate-800/50 rounded-lg border border-slate-700">
          {activeSport === 'f1' ? (
            <>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-blue-400" />
                <span className="text-xs text-slate-300">Treino</span>
              </div>
              <div className="flex items-center gap-1">
                <Zap className="h-3 w-3 text-yellow-400" />
                <span className="text-xs text-slate-300">Classificação</span>
              </div>
              <div className="flex items-center gap-1">
                <Flag className="h-3 w-3 text-purple-400" />
                <span className="text-xs text-slate-300">Sprint</span>
              </div>
              <div className="flex items-center gap-1">
                <Trophy className="h-3 w-3 text-red-400" />
                <span className="text-xs text-slate-300">Corrida</span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-lg">{sportData.icon}</span>
              <span className="text-sm font-medium text-slate-200">{sportData.name}</span>
              <span className="text-xs text-slate-400">- Jogos e eventos</span>
            </div>
          )}
        </div>

        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 mb-2">
          {weekDays.map(day => (
            <div key={day} className="p-2 text-center font-medium text-slate-400 border-b border-slate-700">
              {day}
            </div>
          ))}
        </div>

        {/* Grade do calendário */}
        <div className="grid grid-cols-7 gap-0 border border-slate-700">
          {generateCalendarDays()}
        </div>
      </CardContent>
    </Card>
  );
}