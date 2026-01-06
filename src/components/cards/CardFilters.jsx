import React from 'react';
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, SlidersHorizontal, X } from 'lucide-react';

export default function CardFilters({ 
  searchQuery, 
  setSearchQuery, 
  selectedSet, 
  setSelectedSet, 
  selectedRarity, 
  setSelectedRarity,
  sets,
  onClear 
}) {
  const rarities = [
    "Common", "Uncommon", "Rare", "Rare Holo", "Rare Holo EX", 
    "Rare Holo GX", "Rare Holo V", "Rare Ultra", "Rare Secret"
  ];

  const hasFilters = searchQuery || selectedSet || selectedRarity;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search cards..."
            className="pl-10 bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-amber-500 focus:ring-amber-500/20"
          />
        </div>

        {/* Set filter */}
        <Select value={selectedSet} onValueChange={setSelectedSet}>
          <SelectTrigger className="w-full md:w-48 bg-zinc-900 border-zinc-700 text-white">
            <SelectValue placeholder="All Sets" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700">
            <SelectItem value="all" className="text-white hover:bg-zinc-800">All Sets</SelectItem>
            {sets?.map(set => (
              <SelectItem key={set.id} value={set.id} className="text-white hover:bg-zinc-800">
                {set.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Rarity filter */}
        <Select value={selectedRarity} onValueChange={setSelectedRarity}>
          <SelectTrigger className="w-full md:w-40 bg-zinc-900 border-zinc-700 text-white">
            <SelectValue placeholder="All Rarities" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-zinc-700">
            <SelectItem value="all" className="text-white hover:bg-zinc-800">All Rarities</SelectItem>
            {rarities.map(rarity => (
              <SelectItem key={rarity} value={rarity} className="text-white hover:bg-zinc-800">
                {rarity}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Clear filters */}
        {hasFilters && (
          <Button 
            variant="outline" 
            onClick={onClear}
            className="border-zinc-700 text-zinc-400 hover:text-white hover:border-zinc-500"
          >
            <X className="h-4 w-4 mr-2" />
            Clear
          </Button>
        )}
      </div>
    </div>
  );
}