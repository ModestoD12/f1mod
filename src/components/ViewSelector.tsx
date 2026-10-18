import React from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

interface ViewSelectorProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
  selectedSports?: string[];
}

export function ViewSelector({ 
  currentDate, 
  onDateChange, 
  selectedSports = []
}: ViewSelectorProps) {
  const navigateDate = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction);
    onDateChange(newDate);
  };

  const getDisplayText = () => {
    return currentDate.toLocaleDateString('pt-BR', { 
      weekday: 'long',
      day: '2-digit', 
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <span className="font-medium">Navegação</span>
        </div>

        {/* Navegação de data */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDate(-1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="text-center font-medium text-sm px-2">
            {getDisplayText()}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigateDate(1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Botão para hoje */}
        <div className="mt-3 text-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDateChange(new Date())}
            className="text-xs"
          >
            Hoje
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}