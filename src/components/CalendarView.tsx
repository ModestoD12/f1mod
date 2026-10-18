import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface CalendarViewProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  selectedSports: string[];
  sports: Array<{ id: string; name: string; icon: string }>;
  onDayClick: (date: Date) => void;
}

export function CalendarView({ currentDate, onDateChange, selectedSports, sports, onDayClick }: CalendarViewProps) {
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Dias vazios no início
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Dias do mês
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    
    return days;
  };

  const changeMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    onDateChange(newDate);
  };

  const getSportsForDay = (date: Date) => {
    // Mock data - aqui você conectaria com seus dados reais
    const dayOfWeek = date.getDay();
    const mockSports = [];
    
    if (dayOfWeek === 0 || dayOfWeek === 6) { // Fins de semana
      mockSports.push(sports.find(s => s.id === 'f1'));
    }
    if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Dias úteis
      mockSports.push(sports.find(s => s.id === 'nba'));
    }
    
    return mockSports.filter(Boolean);
  };

  const days = getDaysInMonth(currentDate);
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">
            {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </h3>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => changeMonth(-1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => changeMonth(1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day) => (
            <div key={day} className="p-2 text-center text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <div
              key={index}
              className={`aspect-square p-1 ${day ? 'cursor-pointer hover:bg-accent rounded-md' : ''}`}
              onClick={() => day && onDayClick(day)}
            >
              {day && (
                <div className="w-full h-full flex flex-col items-center justify-center relative">
                  <span className="text-sm mb-1">{day.getDate()}</span>
                  <div className="flex gap-0.5 flex-wrap justify-center">
                    {getSportsForDay(day)
                      .filter(sport => selectedSports.includes(sport.id))
                      .slice(0, 2)
                      .map((sport) => (
                        <span key={sport.id} className="text-xs">
                          {sport.icon}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}