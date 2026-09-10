'use client';
import { useState } from 'react';
import { getData } from 'country-list';
import { Popover, PopoverContent, PopoverTrigger, } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
export default function CountryCombobox({ value, onChange, placeholder = 'Select Country', }: {
    value: string;
    onChange: (code: string) => void;
    placeholder?: string;
}) {
    const [open, setOpen] = useState(false);
    const countries = getData();
    return (<Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline" className="w-full justify-between font-normal">
          {value ? countries.find((c) => c.code === value)?.name : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search country..."/>
          <CommandList>
            <CommandEmpty>No country found.</CommandEmpty>
            <CommandGroup>
              {countries.map((c) => (<CommandItem key={c.code} value={c.name} onSelect={() => {
                onChange(c.code);
                setOpen(false);
            }}>
                  {c.name}
                </CommandItem>))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>);
}
