import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import CardGrid from '@/components/cards/CardGrid';
import CardFilters from '@/components/cards/CardFilters';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import debounce from 'lodash/debounce';

export default function Cards() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [selectedSet, setSelectedSet] = useState('');
  const [selectedRarity, setSelectedRarity] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [allCards, setAllCards] = useState([]);
  const [filteredCards, setFilteredCards] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const CARDS_PER_PAGE = 50;
  const MAX_CARDS = 1000;

  // Debounce search
  const debouncedSetSearch = useCallback(
    debounce((value) => setDebouncedSearch(value), 300),
    []
  );

  useEffect(() => {
    debouncedSetSearch(searchQuery);
  }, [searchQuery, debouncedSetSearch]);

  // Fetch sets for filter
  const { data: sets = [] } = useQuery({
    queryKey: ['tcgdex-sets'],
    queryFn: async () => {
      const response = await fetch('https://api.tcgdex.net/v2/en/sets');
      return response.json();
    },
    staleTime: 1000 * 60 * 60, // 1 hour
  });

  // Fetch cards
  useEffect(() => {
    const fetchCards = async () => {
      setLoading(true);
      try {
        // Fetch from multiple popular sets to get 1000 cards
        const popularSets = ['swsh1', 'swsh2', 'swsh3', 'swsh4', 'swsh5', 'sm1', 'sm2', 'sm3', 'xy1', 'bw1'];
        const allFetchedCards = [];

        for (const setId of popularSets) {
          if (allFetchedCards.length >= MAX_CARDS) break;
          
          try {
            const response = await fetch(`https://api.tcgdex.net/v2/en/sets/${setId}`);
            const set = await response.json();
            
            if (set.cards) {
              const cardsWithSet = set.cards.map(card => ({
                ...card,
                id: card.id || `${setId}-${card.localId}`, // Ensure proper ID format
                set: { id: setId, name: set.name }
              }));
              allFetchedCards.push(...cardsWithSet);
            }
          } catch (e) {
            console.error(`Error fetching set ${setId}:`, e);
          }
        }

        setAllCards(allFetchedCards.slice(0, MAX_CARDS));
      } catch (error) {
        console.error('Error fetching cards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCards();
  }, []);

  // Filter cards
  useEffect(() => {
    let filtered = [...allCards];

    // Search filter
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(card => 
        card.name?.toLowerCase().includes(query) ||
        card.id?.toLowerCase().includes(query)
      );
    }

    // Set filter
    if (selectedSet && selectedSet !== 'all') {
      filtered = filtered.filter(card => card.set?.id === selectedSet);
    }

    // Rarity filter
    if (selectedRarity && selectedRarity !== 'all') {
      filtered = filtered.filter(card => card.rarity === selectedRarity);
    }

    setFilteredCards(filtered);
    setCurrentPage(1);
  }, [allCards, debouncedSearch, selectedSet, selectedRarity]);

  // Pagination
  const totalPages = Math.ceil(filteredCards.length / CARDS_PER_PAGE);
  const startIndex = (currentPage - 1) * CARDS_PER_PAGE;
  const paginatedCards = filteredCards.slice(startIndex, startIndex + CARDS_PER_PAGE);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSet('');
    setSelectedRarity('');
  };

  return (
    <div className="min-h-screen bg-zinc-950 py-8">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Card Catalog</h1>
          <p className="text-zinc-400">
            Browse our collection of {allCards.length.toLocaleString()} Pokémon cards
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8">
          <CardFilters
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            selectedSet={selectedSet}
            setSelectedSet={setSelectedSet}
            selectedRarity={selectedRarity}
            setSelectedRarity={setSelectedRarity}
            sets={sets}
            onClear={clearFilters}
          />
        </div>

        {/* Results info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-zinc-500">
            Showing {startIndex + 1}-{Math.min(startIndex + CARDS_PER_PAGE, filteredCards.length)} of {filteredCards.length} cards
          </p>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-amber-500 mb-4" />
            <p className="text-zinc-400">Loading cards...</p>
          </div>
        ) : paginatedCards.length > 0 ? (
          <CardGrid cards={paginatedCards} loading={false} />
        ) : (
          <div className="text-center py-24">
            <p className="text-zinc-400 text-lg">No cards found matching your filters</p>
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="mt-4 border-zinc-700 text-zinc-400 hover:text-white"
            >
              Clear Filters
            </Button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-12">
            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="border-zinc-700 text-zinc-400 hover:text-white disabled:opacity-50"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? "default" : "outline"}
                    onClick={() => setCurrentPage(pageNum)}
                    className={currentPage === pageNum 
                      ? "bg-amber-500 text-black hover:bg-amber-400" 
                      : "border-zinc-700 text-zinc-400 hover:text-white"
                    }
                    size="sm"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="border-zinc-700 text-zinc-400 hover:text-white disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}