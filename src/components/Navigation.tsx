import React, { useState, useEffect } from 'react';
import { getText, getIndex, SefariaIndexResponse } from '../services/sefariaApi';
import './Navigation.css';

interface NavigationProps {
  currentRef: string;
  onNavigate: (ref: string) => void;
  availableTexts?: string[];
}

const Navigation: React.FC<NavigationProps> = ({ 
  currentRef, 
  onNavigate, 
  availableTexts 
}) => {
  const [nextRef, setNextRef] = useState<string | null>(null);
  const [prevRef, setPrevRef] = useState<string | null>(null);
  const [currentIndexData, setCurrentIndexData] = useState<SefariaIndexResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadNavigation = async () => {
      if (!currentRef) return;

      setIsLoading(true);
      
      try {
        // Load text to get next/prev references
        const textData = await getText(currentRef);
        setNextRef(textData.next || null);
        setPrevRef(textData.prev || null);

        // Extract book title from reference (e.g., "Genesis 1:1" -> "Genesis")
        const bookTitle = currentRef.split(' ')[0];
        if (bookTitle) {
          try {
            const index = await getIndex(bookTitle);
            setCurrentIndexData(index);
          } catch (error) {
            console.warn('Could not load index for navigation:', error);
          }
        }
      } catch (error) {
        console.error('Error loading navigation:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadNavigation();
  }, [currentRef]);

  const handleNavigate = (ref: string) => {
    if (ref && ref !== currentRef) {
      onNavigate(ref);
    }
  };

  const handleQuickNavigate = (direction: 'next' | 'prev') => {
    const ref = direction === 'next' ? nextRef : prevRef;
    if (ref) {
      handleNavigate(ref);
    }
  };

  const renderChapterNavigation = () => {
    if (!currentIndexData) return null;

    // Extract current chapter from reference
    const refParts = currentRef.match(/([^:]+):?(\d+)?/);
    if (!refParts) return null;

    const bookTitle = refParts[1];
    const currentChapter = parseInt(refParts[2]) || 1;

    const chapters = [];
    const maxChapters = 50; // Reasonable limit for most books

    for (let i = 1; i <= maxChapters; i++) {
      chapters.push(
        <button
          key={i}
          className={`chapter-button ${i === currentChapter ? 'active' : ''}`}
          onClick={() => handleNavigate(`${bookTitle} ${i}`)}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="chapter-navigation">
        <h4>Chapters</h4>
        <div className="chapter-grid">
          {chapters}
        </div>
      </div>
    );
  };

  const renderPopularTexts = () => {
    const popularTexts = [
      { ref: 'Genesis 1:1', title: 'Genesis' },
      { ref: 'Exodus 1:1', title: 'Exodus' },
      { ref: 'Leviticus 1:1', title: 'Leviticus' },
      { ref: 'Numbers 1:1', title: 'Numbers' },
      { ref: 'Deuteronomy 1:1', title: 'Deuteronomy' },
      { ref: 'Psalms 1:1', title: 'Psalms' },
      { ref: 'Proverbs 1:1', title: 'Proverbs' },
      { ref: 'Song of Songs 1:1', title: 'Song of Songs' },
    ];

    return (
      <div className="popular-texts">
        <h4>Popular Texts</h4>
        <div className="text-list">
          {popularTexts.map((text) => (
            <button
              key={text.ref}
              className="text-button"
              onClick={() => handleNavigate(text.ref)}
            >
              {text.title}
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="navigation">
      <div className="navigation-header">
        <h3>Navigation</h3>
        <div className="current-ref">
          <strong>Current:</strong> {currentRef}
        </div>
      </div>

      <div className="navigation-controls">
        <div className="prev-next-controls">
          <button
            className="nav-button prev-button"
            onClick={() => handleQuickNavigate('prev')}
            disabled={!prevRef || isLoading}
          >
            ← Previous
          </button>
          <button
            className="nav-button next-button"
            onClick={() => handleQuickNavigate('next')}
            disabled={!nextRef || isLoading}
          >
            Next →
          </button>
        </div>

        {(prevRef || nextRef) && (
          <div className="navigation-info">
            {prevRef && <div className="nav-info prev-info">Previous: {prevRef}</div>}
            {nextRef && <div className="nav-info next-info">Next: {nextRef}</div>}
          </div>
        )}
      </div>

      <div className="navigation-content">
        {renderPopularTexts()}
        {renderChapterNavigation()}
      </div>

      {isLoading && (
        <div className="navigation-loading">
          Loading navigation...
        </div>
      )}
    </div>
  );
};

export default Navigation;
