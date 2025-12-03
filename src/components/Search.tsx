import React, { useState, useRef, useEffect } from 'react';
import { useSefariaAPI } from '../services/sefariaApi';
import { SearchProps } from '../types/sefaria';
import './Search.css';

interface SearchResult {
  ref: string;
  title: string;
  categories: string[];
  snippet?: string;
}

const Search: React.FC<SearchProps> = ({ 
  onSearchResult, 
  placeholder = "Search for texts..." 
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);
  const { search } = useSefariaAPI();
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = async (searchQuery: string) => {
    console.log('Mock searching for:', searchQuery);
    
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Mock search with hardcoded popular texts
      const mockTexts = [
        { ref: 'Genesis 1:1', title: 'Genesis', categories: ['Torah', 'Genesis'] },
        { ref: 'Genesis 1:2', title: 'Genesis', categories: ['Torah', 'Genesis'] },
        { ref: 'Genesis 1:3', title: 'Genesis', categories: ['Torah', 'Genesis'] },
        { ref: 'Genesis 2:1', title: 'Genesis', categories: ['Torah', 'Genesis'] },
        { ref: 'Genesis 2:2', title: 'Genesis', categories: ['Torah', 'Genesis'] },
        { ref: 'Genesis 2:3', title: 'Genesis', categories: ['Torah', 'Genesis'] },
        { ref: 'Genesis 2:4', title: 'Genesis', categories: ['Torah', 'Genesis'] },
        { ref: 'Genesis 3:1', title: 'Genesis', categories: ['Torah', 'Genesis'] },
        { ref: 'Genesis 3:2', title: 'Genesis', categories: ['Torah', 'Genesis'] },
        { ref: 'Genesis 3:3', title: 'Genesis', categories: ['Torah', 'Genesis'] },
        { ref: 'Exodus 1:1', title: 'Exodus', categories: ['Torah', 'Exodus'] },
        { ref: 'Exodus 20:1', title: 'Exodus', categories: ['Torah', 'Exodus'] },
        { ref: 'Exodus 20:2', title: 'Exodus', categories: ['Torah', 'Exodus'] },
        { ref: 'Exodus 20:3', title: 'Exodus', categories: ['Torah', 'Exodus'] },
        { ref: 'Leviticus 1:1', title: 'Leviticus', categories: ['Torah', 'Leviticus'] },
        { ref: 'Numbers 1:1', title: 'Numbers', categories: ['Torah', 'Numbers'] },
        { ref: 'Deuteronomy 1:1', title: 'Deuteronomy', categories: ['Torah', 'Deuteronomy'] },
        { ref: 'Deuteronomy 6:4', title: 'Deuteronomy', categories: ['Torah', 'Deuteronomy'] },
        { ref: 'Psalms 1:1', title: 'Psalms', categories: ['Ketuvim', 'Psalms'] },
        { ref: 'Psalms 23:1', title: 'Psalms', categories: ['Ketuvim', 'Psalms'] },
        { ref: 'Psalms 23:2', title: 'Psalms', categories: ['Ketuvim', 'Psalms'] },
        { ref: 'Psalms 23:3', title: 'Psalms', categories: ['Ketuvim', 'Psalms'] },
        { ref: 'Psalms 23:4', title: 'Psalms', categories: ['Ketuvim', 'Psalms'] },
        { ref: 'Psalms 23:5', title: 'Psalms', categories: ['Ketuvim', 'Psalms'] },
        { ref: 'Psalms 23:6', title: 'Psalms', categories: ['Ketuvim', 'Psalms'] },
        { ref: 'Proverbs 1:1', title: 'Proverbs', categories: ['Ketuvim', 'Proverbs'] },
        { ref: 'Proverbs 1:2', title: 'Proverbs', categories: ['Ketuvim', 'Proverbs'] },
        { ref: 'Proverbs 1:3', title: 'Proverbs', categories: ['Ketuvim', 'Proverbs'] },
        { ref: 'Proverbs 1:4', title: 'Proverbs', categories: ['Ketuvim', 'Proverbs'] },
        { ref: 'Proverbs 1:5', title: 'Proverbs', categories: ['Ketuvim', 'Proverbs'] },
        { ref: 'Proverbs 1:6', title: 'Proverbs', categories: ['Ketuvim', 'Proverbs'] },
        { ref: 'Proverbs 1:7', title: 'Proverbs', categories: ['Ketuvim', 'Proverbs'] },
        { ref: 'Song of Songs 1:1', title: 'Song of Songs', categories: ['Ketuvim', 'Song of Songs'] },
        { ref: 'Song of Songs 1:2', title: 'Song of Songs', categories: ['Ketuvim', 'Song of Songs'] },
        { ref: 'Isaiah 1:1', title: 'Isaiah', categories: ['Neviim', 'Isaiah'] },
        { ref: 'Jeremiah 1:1', title: 'Jeremiah', categories: ['Neviim', 'Jeremiah'] },
        { ref: 'Ezekiel 1:1', title: 'Ezekiel', categories: ['Neviim', 'Ezekiel'] },
        { ref: 'Ruth 1:1', title: 'Ruth', categories: ['Ketuvim', 'Ruth'] },
        { ref: 'Esther 1:1', title: 'Esther', categories: ['Ketuvim', 'Esther'] },
        { ref: 'Daniel 1:1', title: 'Daniel', categories: ['Ketuvim', 'Daniel'] },
      ];

      // Filter results based on query
      const searchQueryLower = searchQuery.toLowerCase();
      const filteredResults = mockTexts.filter(text => 
        text.ref.toLowerCase().includes(searchQueryLower) ||
        text.title.toLowerCase().includes(searchQueryLower) ||
        text.categories.some(cat => cat.toLowerCase().includes(searchQueryLower))
      ).map(text => ({
        ...text,
        snippet: `Mock result for ${text.ref} - This would normally show actual text content from the search.`
      }));

      console.log('Mock search results:', filteredResults);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300));
      
      setResults(filteredResults);
      setShowResults(true);
    } catch (err) {
      console.error('Mock search error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Search failed';
      setError(errorMessage);
      setResults([]);
      setShowResults(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    
    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
    
    // Set new timeout for debounced search
    debounceTimeoutRef.current = setTimeout(() => {
      handleSearch(value);
    }, 300);
  };

  const handleResultClick = (result: SearchResult) => {
    onSearchResult(result.ref);
    setShowResults(false);
    setQuery('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowResults(false);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const renderSearchResult = (result: SearchResult, index: number) => {
    return (
      <div
        key={`${result.ref}-${index}`}
        className="search-result"
        onClick={() => handleResultClick(result)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleResultClick(result);
          }
        }}
      >
        <div className="result-title">
          {result.title}
        </div>
        <div className="result-ref">
          {result.ref}
        </div>
        {result.categories && result.categories.length > 0 && (
          <div className="result-categories">
            {result.categories.join(' > ')}
          </div>
        )}
        {result.snippet && (
          <div className="result-snippet">
            {result.snippet}
          </div>
        )}
      </div>
    );
  };

  const renderQuickSearches = () => {
    const quickSearches = [
      { query: 'Genesis 1:1', label: 'Genesis 1:1 - Creation' },
      { query: 'Exodus 20:1', label: 'Exodus 20:1 - Ten Commandments' },
      { query: 'Psalms 23', label: 'Psalms 23 - The Lord is my Shepherd' },
      { query: 'Proverbs 1:1', label: 'Proverbs 1:1 - Wisdom' },
      { query: 'Shema Yisrael', label: 'Shema Yisrael' },
    ];

    return (
      <div className="quick-searches">
        <h4>Quick Searches</h4>
        <div className="quick-search-buttons">
          {quickSearches.map((item) => (
            <button
              key={item.query}
              className="quick-search-button"
              onClick={() => {
                setQuery(item.query);
                handleSearch(item.query);
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="search">
      <div className="search-header">
        <h3>Search Texts</h3>
      </div>
      
      <div className="search-input-container">
        <input
          type="text"
          className="search-input"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus
        />
        {isLoading && (
          <div className="search-loading">
            <div className="loading-spinner"></div>
          </div>
        )}
      </div>

      {showResults && (
        <div className="search-results-container">
          {error && (
            <div className="search-error">
              Error: {error}
            </div>
          )}
          
          {results.length > 0 ? (
            <div className="search-results">
              <div className="results-header">
                Found {results.length} results
              </div>
              {results.map(renderSearchResult)}
            </div>
          ) : !error && query.trim() && (
            <div className="no-results">
              No results found for "{query}"
            </div>
          )}
        </div>
      )}

      {!showResults && (
        <div className="search-content">
          {renderQuickSearches()}
        </div>
      )}
    </div>
  );
};

export default Search;
