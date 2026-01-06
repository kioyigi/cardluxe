import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
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
  
  const CARDS_PER_PAGE = 50;

  // Debounce search
  const debouncedSetSearch = useCallback(
    debounce((value) => setDebouncedSearch(value), 300),
    []
  );

  useEffect(() => {
    debouncedSetSearch(searchQuery);
  }, [searchQuery, debouncedSetSearch]);

  // Fetch cards from eBay
  const { data: ebayData, isLoading: loading } = useQuery({
    queryKey: ['ebay-cards'],
    queryFn: async () => {
      const response = await base44.functions.invoke('fetchEbayCards');
      return response.data;
    },
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  useEffect(() => {
    if (ebayData?.cards) {
      setAllCards(ebayData.cards);
    }
  }, [ebayData]);

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

    // Condition filter (replacing set filter for eBay)
    if (selectedSet && selectedSet !== 'all') {
      filtered = filtered.filter(card => card.condition === selectedSet);
    }

    // Price range filter (replacing rarity filter for eBay)
    if (selectedRarity && selectedRarity !== 'all') {
      if (selectedRarity === 'high') {
        filtered = filtered.filter(card => card.price >= 100);
      } else if (selectedRarity === 'medium') {
        filtered = filtered.filter(card => card.price >= 20 && card.price < 100);
      } else if (selectedRarity === 'low') {
        filtered = filtered.filter(card => card.price < 20);
      }
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
            sets={[
              { id: 'NEW', name: 'New' },
              { id: 'LIKE_NEW', name: 'Like New' },
              { id: 'VERY_GOOD', name: 'Very Good' },
              { id: 'GOOD', name: 'Good' }
            ]}
            onClear={clearFilters}
            isEbay={true}
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