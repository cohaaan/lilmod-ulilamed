import React, { useState, useEffect } from 'react';
import { getText, SefariaTextResponse } from '../services/sefariaApi';
import './TextDisplay.css';

interface TextDisplayProps {
  textRef: string;
  language: 'english' | 'hebrew' | 'bilingual';
  onTextLoad?: (text: SefariaTextResponse) => void;
  onError?: (error: string) => void;
}

type LayoutMode = 'stacked' | 'sideBySide' | 'hebrewOnly' | 'englishOnly';

const TextDisplay: React.FC<TextDisplayProps> = ({ 
  textRef, 
  language, 
  onTextLoad, 
  onError 
}) => {
  const [text, setText] = useState<SefariaTextResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVerse, setSelectedVerse] = useState<number | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [layoutMode, setLayoutMode] = useState<LayoutMode>('stacked');
  const [showVowels, setShowVowels] = useState(true);
  const [fontSize, setFontSize] = useState(18);

  useEffect(() => {
    const loadText = async () => {
      if (!textRef) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const data = await getText(textRef, { lang: 'bi' });
        setText(data);
        onTextLoad?.(data);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load text';
        console.error('Error loading text:', errorMessage);
        setError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadText();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textRef]);

  const handleVerseClick = (index: number) => {
    setSelectedVerse(selectedVerse === index ? null : index);
  };

  // Process Hebrew text - optionally remove vowels and clean up HTML
  const processHebrew = (text: string): string => {
    let processed = text;
    
    // Remove HTML footnote markers and small tags that cause display issues
    processed = processed.replace(/<small[^>]*>.*?<\/small>/gi, '');
    processed = processed.replace(/<sup[^>]*>.*?<\/sup>/gi, '');
    processed = processed.replace(/<sub[^>]*>.*?<\/sub>/gi, '');
    
    if (!showVowels) {
      // Remove Hebrew vowel points (nikud) and cantillation marks (taamim)
      processed = processed.replace(/[\u0591-\u05C7]/g, '');
    }
    
    return processed;
  };
  
  // Process English text - clean up HTML artifacts
  const processEnglish = (text: string): string => {
    let processed = text;
    // Remove footnote markers
    processed = processed.replace(/<small[^>]*>.*?<\/small>/gi, '');
    processed = processed.replace(/<sup[^>]*>.*?<\/sup>/gi, '');
    return processed;
  };

  const renderInterleavedVerses = () => {
    if (!text) return null;

    const hebrewVerses = Array.isArray(text.he) ? text.he : [text.he || ''];
    const englishVerses = Array.isArray(text.text) ? text.text : [text.text || ''];
    const maxLength = Math.max(hebrewVerses.length, englishVerses.length);

    return (
      <div className="interleaved-text">
        {Array.from({ length: maxLength }).map((_, index) => {
          const hebrewVerse = hebrewVerses[index] || '';
          const englishVerse = englishVerses[index] || '';
          const isSelected = selectedVerse === index;

          return (
            <div 
              key={index} 
              className={`verse-pair ${isSelected ? 'selected' : ''}`}
              onClick={() => handleVerseClick(index)}
            >
              <div className="verse-number">{index + 1}</div>
              <div className="verse-content">
                {(layoutMode === 'stacked' || layoutMode === 'hebrewOnly') && (
                  <div 
                    className="hebrew-verse"
                    dir="rtl"
                    style={{ fontSize: `${fontSize + 4}px` }}
                    dangerouslySetInnerHTML={{ __html: processHebrew(hebrewVerse) }}
                  />
                )}
                {(layoutMode === 'stacked' || layoutMode === 'englishOnly') && (
                  <div 
                    className="english-verse"
                    style={{ fontSize: `${fontSize}px` }}
                    dangerouslySetInnerHTML={{ __html: processEnglish(englishVerse) }}
                  />
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderSideBySide = () => {
    if (!text) return null;

    const hebrewVerses = Array.isArray(text.he) ? text.he : [text.he || ''];
    const englishVerses = Array.isArray(text.text) ? text.text : [text.text || ''];

    return (
      <div className="side-by-side-text">
        <div className="column hebrew-column">
          {hebrewVerses.map((verse, index) => (
            <div 
              key={index}
              className={`verse hebrew-verse ${selectedVerse === index ? 'selected' : ''}`}
              dir="rtl"
              style={{ fontSize: `${fontSize + 4}px` }}
              onClick={() => handleVerseClick(index)}
              dangerouslySetInnerHTML={{ __html: processHebrew(verse) }}
            />
          ))}
        </div>
        <div className="column english-column">
          {englishVerses.map((verse, index) => (
            <div 
              key={index}
              className={`verse english-verse ${selectedVerse === index ? 'selected' : ''}`}
              style={{ fontSize: `${fontSize}px` }}
              onClick={() => handleVerseClick(index)}
              dangerouslySetInnerHTML={{ __html: processEnglish(verse) }}
            />
          ))}
        </div>
      </div>
    );
  };

  const renderSettings = () => (
    <div className={`settings-panel ${showSettings ? 'open' : ''}`}>
      <div className="settings-header">
        <h3>Display Settings</h3>
        <button className="close-settings" onClick={() => setShowSettings(false)}>×</button>
      </div>
      
      <div className="settings-section">
        <label>Layout</label>
        <div className="layout-options">
          <button 
            className={layoutMode === 'hebrewOnly' ? 'active' : ''}
            onClick={() => setLayoutMode('hebrewOnly')}
          >
            Source
          </button>
          <button 
            className={layoutMode === 'englishOnly' ? 'active' : ''}
            onClick={() => setLayoutMode('englishOnly')}
          >
            Translation
          </button>
          <button 
            className={layoutMode === 'stacked' ? 'active' : ''}
            onClick={() => setLayoutMode('stacked')}
          >
            Source + Translation
          </button>
          <button 
            className={layoutMode === 'sideBySide' ? 'active' : ''}
            onClick={() => setLayoutMode('sideBySide')}
          >
            Side by Side
          </button>
        </div>
      </div>

      <div className="settings-section">
        <label>Font Size</label>
        <div className="font-size-control">
          <button onClick={() => setFontSize(s => Math.max(12, s - 2))}>−</button>
          <span>{fontSize}px</span>
          <button onClick={() => setFontSize(s => Math.min(32, s + 2))}>+</button>
        </div>
      </div>

      <div className="settings-section">
        <label className="toggle-label">
          <span>Vowels (Nikud)</span>
          <input 
            type="checkbox" 
            checked={showVowels} 
            onChange={(e) => setShowVowels(e.target.checked)}
          />
          <span className="toggle-slider"></span>
        </label>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="text-display loading">
        <div className="loading-spinner">Loading {textRef}...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-display error">
        <div className="error-message">Error: {error}</div>
      </div>
    );
  }

  if (!text) {
    return (
      <div className="text-display empty">
        <div className="empty-message">Select a text to begin reading</div>
      </div>
    );
  }

  return (
    <div className="text-display">
      <div className="text-header">
        <div className="header-left">
          <h2 className="text-title">{text.indexTitle || 'Text'}</h2>
          <div className="text-ref">{text.ref}</div>
          {text.categories && text.categories.length > 0 && (
            <div className="text-categories">
              {text.categories.join(' › ')}
            </div>
          )}
        </div>
        <div className="header-right">
          <button 
            className="settings-toggle"
            onClick={() => setShowSettings(!showSettings)}
          >
            ⚙️ Settings
          </button>
        </div>
      </div>

      {renderSettings()}
      
      <div className="text-body">
        {layoutMode === 'sideBySide' ? renderSideBySide() : renderInterleavedVerses()}
      </div>

      {selectedVerse !== null && layoutMode === 'hebrewOnly' && text && (
        <div className="translation-popup">
          <div className="popup-header">
            <span>Verse {selectedVerse + 1} Translation</span>
            <button onClick={() => setSelectedVerse(null)}>×</button>
          </div>
          <div
            className="popup-content"
            dangerouslySetInnerHTML={{
              __html: Array.isArray(text.text)
                ? (text.text[selectedVerse] || '')
                : (text.text || '')
            }}
          />
        </div>
      )}
    </div>
  );
};

export default TextDisplay;
