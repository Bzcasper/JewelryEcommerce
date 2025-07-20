import { useState, useEffect, useRef } from 'react';
import { Search, X } from 'lucide-react';
import { searchProducts } from '@/lib/algolia';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';

interface SearchResult {
  objectID: string;
  title: string;
  description?: string;
  price: number;
  mainImageUrl?: string;
  category?: string;
  brand?: string;
  _highlightResult?: {
    title?: { value: string };
    description?: { value: string };
  };
}

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.trim().length > 1) {
        setIsLoading(true);
        try {
          const searchResults = await searchProducts(query);
          setResults(searchResults.hits as SearchResult[]);
          setShowResults(true);
        } catch (error) {
          console.error('Search error:', error);
          setResults([]);
        } finally {
          setIsLoading(false);
        }
      } else {
        setResults([]);
        setShowResults(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const handleProductClick = (productId: string) => {
    setShowResults(false);
    setQuery('');
    setLocation(`/products?productId=${productId}`);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
  };

  const renderHighlightedText = (text: string) => {
    return <span dangerouslySetInnerHTML={{ __html: text }} />;
  };

  return (
    <div ref={searchRef} className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-warm-tan-dark" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search luxury jewelry..."
          className={cn(
            "w-full pl-10 pr-10 py-2 rounded-lg",
            "bg-white/90 backdrop-blur-sm",
            "border border-warm-tan/20 focus:border-deep-red/50",
            "text-charcoal placeholder:text-warm-tan-dark",
            "transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-deep-red/20"
          )}
        />
        {query && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-warm-tan-dark hover:text-charcoal transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-warm-tan/20 max-h-96 overflow-y-auto z-50">
          {isLoading ? (
            <div className="p-4 text-center text-warm-tan-dark">
              <div className="inline-block w-4 h-4 border-2 border-deep-red border-t-transparent rounded-full animate-spin" />
              <span className="ml-2">Searching...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="divide-y divide-warm-tan/10">
              {results.map((result) => (
                <button
                  key={result.objectID}
                  onClick={() => handleProductClick(result.objectID)}
                  className="w-full p-4 hover:bg-pearl transition-colors flex items-start gap-3 text-left"
                >
                  {result.mainImageUrl && (
                    <img
                      src={result.mainImageUrl}
                      alt={result.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-charcoal truncate">
                      {result._highlightResult?.title?.value ? (
                        renderHighlightedText(result._highlightResult.title.value)
                      ) : (
                        result.title
                      )}
                    </h4>
                    {result.brand && (
                      <p className="text-sm text-warm-tan-dark">{result.brand}</p>
                    )}
                    <p className="text-deep-red font-semibold">${result.price}</p>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="p-4 text-center text-warm-tan-dark">
              No results found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
}