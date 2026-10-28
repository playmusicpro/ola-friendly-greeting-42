import { useState } from 'react';
import { Check, ChevronsUpDown, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { formatCurrency } from '@/lib/calculations';
import type { SavedMusician } from '@/types';

interface MusicianComboboxProps {
  id?: string;
  value: string;
  suggestions: SavedMusician[];
  onChange: (name: string) => void;
  onPick: (musician: SavedMusician) => void;
}

/**
 * Autocomplete de músicos salvos: digitar filtra a lista; escolher um item
 * preenche nome, instrumento e cachê padrão. Nomes novos seguem como texto livre.
 */
export function MusicianCombobox({ id, value, suggestions, onChange, onPick }: MusicianComboboxProps) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen} modal>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Nome do músico"
          className="w-full justify-between font-normal"
        >
          <span className={value ? 'truncate' : 'truncate text-muted-foreground'}>{value || 'Digite ou escolha um músico'}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Buscar ou digitar novo nome…"
            value={value}
            onValueChange={onChange}
          />
          <CommandList>
            <CommandEmpty>
              <span className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <UserPlus className="h-3.5 w-3.5" />
                Novo músico: será salvo ao concluir o show
              </span>
            </CommandEmpty>
            <CommandGroup heading="Músicos salvos">
              {suggestions.map(musician => (
                <CommandItem
                  key={musician.id}
                  value={musician.name}
                  onSelect={() => { onPick(musician); setOpen(false); }}
                >
                  <Check className={`mr-2 h-4 w-4 ${value === musician.name ? 'opacity-100' : 'opacity-0'}`} />
                  <span className="min-w-0 flex-1 truncate">{musician.name}</span>
                  <span className="ml-2 shrink-0 text-xs text-muted-foreground">
                    {musician.instrument || 'Músico'}{musician.defaultFee > 0 ? ` · ${formatCurrency(musician.defaultFee)}` : ''}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
