import React, { useState } from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Plus } from 'lucide-react';

interface AddSportDialogProps {
  onAddSport: (sport: { name: string; icon: string }) => void;
  children?: React.ReactNode;
}

const sportsEmojis = ['⚽', '🏀', '🏈', '🎾', '🏐', '🏓', '🏒', '🏑', '🥊', '🤸', '🏊', '🚴', '🏃', '⛷️', '🏄', '🚣', '🏇', '🤾', '🤺', '🏹', '🎯', '🏆', '🥇', '🥈', '🥉'];

export function AddSportDialog({ onAddSport, children }: AddSportDialogProps) {
  const [open, setOpen] = useState(false);
  const [sportName, setSportName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('⚽');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sportName.trim()) return;

    setIsSubmitting(true);
    
    try {
      onAddSport({
        name: sportName.trim(),
        icon: selectedIcon
      });
      
      // Reset form
      setSportName('');
      setSelectedIcon('⚽');
      setOpen(false);
    } catch (error) {
      console.error('Erro ao adicionar esporte:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            Adicionar esporte
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Novo Esporte</DialogTitle>
          <DialogDescription>
            Crie um novo esporte personalizado para acompanhar na sua central.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nome
              </Label>
              <Input
                id="name"
                value={sportName}
                onChange={(e) => setSportName(e.target.value)}
                className="col-span-3"
                placeholder="Ex: Basquete, Natação..."
                required
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label className="text-right pt-2">
                Ícone
              </Label>
              <div className="col-span-3">
                <div className="grid grid-cols-8 gap-2 max-h-32 overflow-y-auto p-2 border rounded-md">
                  {sportsEmojis.map((emoji, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setSelectedIcon(emoji)}
                      className={`p-2 text-lg rounded hover:bg-accent transition-colors ${
                        selectedIcon === emoji ? 'bg-primary text-primary-foreground' : 'bg-background'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Selecionado: <span className="text-lg">{selectedIcon}</span>
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setOpen(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !sportName.trim()}>
              {isSubmitting ? 'Adicionando...' : 'Adicionar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}