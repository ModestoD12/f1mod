import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Plus, X } from 'lucide-react';
import { AddSportDialog } from './AddSportDialog';

interface Sport {
  id: string;
  name: string;
  icon: string;
}

interface SportButtonsProps {
  sports: Sport[];
  selectedSports: string[];
  onSportsChange: (sportIds: string[]) => void;
  onAddSport: (sport: { name: string; icon: string }) => void;
  onRemoveSport: (sportId: string) => void;
}

export function SportButtons({ 
  sports, 
  selectedSports, 
  onSportsChange, 
  onAddSport,
  onRemoveSport 
}: SportButtonsProps) {
  const toggleSport = (sportId: string) => {
    if (selectedSports.includes(sportId)) {
      onSportsChange(selectedSports.filter(id => id !== sportId));
    } else {
      onSportsChange([...selectedSports, sportId]);
    }
  };

  const handleRightClick = (e: React.MouseEvent, sportId: string) => {
    e.preventDefault();
    if (window.confirm('Deseja remover este esporte da lista?')) {
      onRemoveSport(sportId);
    }
  };

  const clearAllSelection = () => {
    onSportsChange([]);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle>Esportes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {sports.map((sport) => (
            <Button
              key={sport.id}
              variant={selectedSports.includes(sport.id) ? "default" : "outline"}
              className={`h-auto py-2 px-3 flex items-center gap-2 ${
                selectedSports.includes(sport.id) 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-background hover:bg-accent'
              }`}
              onClick={() => toggleSport(sport.id)}
              onContextMenu={(e) => handleRightClick(e, sport.id)}
            >
              <span className="text-base">{sport.icon}</span>
              <span className="text-sm">{sport.name}</span>
            </Button>
          ))}
        </div>

        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={clearAllSelection}
            className="flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Limpar seleção
          </Button>
          
          <AddSportDialog onAddSport={onAddSport}>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <Plus className="h-3 w-3" />
              Adicionar
            </Button>
          </AddSportDialog>
        </div>
      </CardContent>
    </Card>
  );
}