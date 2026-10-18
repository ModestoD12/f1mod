import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Star } from 'lucide-react';
import { AddSportDialog } from './AddSportDialog';

interface Sport {
  id: string;
  name: string;
  icon: string;
}

interface SportSelectorProps {
  sports: Sport[];
  selectedSports: string[];
  onSportsChange: (sportIds: string[]) => void;
  onAddSport: (sport: { name: string; icon: string }) => void;
}

export function SportSelector({ sports, selectedSports, onSportsChange, onAddSport }: SportSelectorProps) {
  const toggleSport = (sportId: string) => {
    if (selectedSports.includes(sportId)) {
      onSportsChange(selectedSports.filter(id => id !== sportId));
    } else {
      onSportsChange([...selectedSports, sportId]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Seus Esportes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary">
            {selectedSports.length} selecionados
          </Badge>
          <Badge variant="outline">
            {sports.length} disponíveis
          </Badge>
        </div>
        
        <div className="space-y-3">
          {sports.map((sport) => (
            <div key={sport.id} className="flex items-center space-x-3">
              <Checkbox
                id={sport.id}
                checked={selectedSports.includes(sport.id)}
                onCheckedChange={() => toggleSport(sport.id)}
              />
              <label
                htmlFor={sport.id}
                className="flex items-center gap-2 cursor-pointer flex-1"
              >
                <span className="text-lg">{sport.icon}</span>
                <span>{sport.name}</span>
              </label>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t space-y-3">
          <div className="flex gap-2">
            <button
              onClick={() => onSportsChange(sports.map(s => s.id))}
              className="text-xs text-primary hover:underline"
            >
              Selecionar todos
            </button>
            <span className="text-xs text-muted-foreground">•</span>
            <button
              onClick={() => onSportsChange([])}
              className="text-xs text-primary hover:underline"
            >
              Limpar seleção
            </button>
          </div>
          
          <AddSportDialog onAddSport={onAddSport} />
        </div>
      </CardContent>
    </Card>
  );
}