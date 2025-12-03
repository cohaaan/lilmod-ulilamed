import React, { useState, useEffect } from 'react';
import TextDisplay from './components/TextDisplay';
import { getLibrary, LibraryCategory } from './services/sefariaApi';

// Category colors
const categoryColors: { [key: string]: string } = {
  'Tanakh': 'border-s-teal-600', 'Torah': 'border-s-teal-600', 'Prophets': 'border-s-teal-500', 'Writings': 'border-s-teal-400',
  'Talmud': 'border-s-yellow-500', 'Bavli': 'border-s-yellow-500', 'Yerushalmi': 'border-s-yellow-400',
  'Mishnah': 'border-s-indigo-700', 'Midrash': 'border-s-orange-600',
  'Halakhah': 'border-s-red-700', 'Kabbalah': 'border-s-purple-600',
  'Liturgy': 'border-s-pink-500', 'Jewish Thought': 'border-s-blue-700',
  'Chasidut': 'border-s-emerald-600', 'Musar': 'border-s-violet-600',
  'Responsa': 'border-s-rose-600', 'Reference': 'border-s-slate-600',
  'Tosefta': 'border-s-cyan-600', 'Second Temple': 'border-s-gray-500',
};

// Category descriptions
const categoryDescs: { [key: string]: string } = {
  'Tanakh': 'Torah, Prophets, and Writings - the Hebrew Bible.',
  'Torah': 'The Five Books of Moses.',
  'Prophets': 'Historical and prophetic books.',
  'Writings': 'Psalms, Proverbs, and other sacred writings.',
  'Talmud': 'Rabbinic debates about law, ethics, and Bible.',
  'Bavli': 'The Babylonian Talmud.',
  'Yerushalmi': 'The Jerusalem Talmud.',
  'Mishnah': 'First major work of rabbinic literature.',
  'Midrash': 'Interpretations of biblical texts.',
  'Halakhah': 'Legal works guiding Jewish life.',
  'Kabbalah': 'Mystical works.',
  'Liturgy': 'Prayers and ritual texts.',
  'Jewish Thought': 'Philosophy and theology.',
  'Chasidut': 'Spiritual teachings.',
  'Musar': 'Ethical literature.',
  'Responsa': 'Rabbinic legal answers.',
  'Reference': 'Dictionaries and encyclopedias.',
};

const App: React.FC = () => {
  const [lang, setLang] = useState<'en' | 'he'>('en');
  const [library, setLibrary] = useState<LibraryCategory[]>([]);
  const [navigationPath, setNavigationPath] = useState<LibraryCategory[]>([]);
  const [currentItems, setCurrentItems] = useState<LibraryCategory[]>([]);
  const [selectedRef, setSelectedRef] = useState<string | null>(null);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>(['Genesis 1', 'Psalms 23']);
  const [loading, setLoading] = useState(true);
  const [chapters, setChapters] = useState<number[]>([]);
  const [selectedBook, setSelectedBook] = useState<string | null>(null);

  // Load library on mount
  useEffect(() => {
    getLibrary().then(data => {
      setLibrary(data);
      setCurrentItems(data);
      setLoading(false);
    }).catch(err => {
      console.error('Failed to load library:', err);
      setLoading(false);
    });
  }, []);

  const toggleLanguage = () => {
    const newLang = lang === 'en' ? 'he' : 'en';
    setLang(newLang);
    document.documentElement.lang = newLang;
    document.documentElement.dir = newLang === 'he' ? 'rtl' : 'ltr';
  };

  const handleCategoryClick = async (item: LibraryCategory) => {
    // If it has contents, drill down
    if (item.contents && item.contents.length > 0) {
      setNavigationPath([...navigationPath, item]);
      setCurrentItems(item.contents);
      setChapters([]);
      setSelectedBook(null);
    } 
    // If it's a book (has title), load chapters
    else if (item.title) {
      const bookTitle = item.title;
      setSelectedBook(bookTitle);
      setLoading(true);
      
      try {
        // Use the index API to get chapter count - it returns lengths array
        const response = await fetch(`https://www.sefaria.org/api/index/${encodeURIComponent(bookTitle)}`);
        const indexData = await response.json();
        
        // lengths is an array where first element is chapter/section count
        const lengths = indexData.schema?.lengths || indexData.lengths;
        let chapterCount = 1;
        
        if (lengths && Array.isArray(lengths) && lengths.length > 0) {
          chapterCount = parseInt(lengths[0]) || 50;
        } else if (indexData.schema?.nodes) {
          // Complex book with multiple sections
          chapterCount = indexData.schema.nodes.length;
        }
        
        console.log(`${bookTitle}: ${chapterCount} chapters`);
        
        if (chapterCount > 0) {
          setChapters(Array.from({ length: chapterCount }, (_, i) => i + 1));
        } else {
          openText(`${bookTitle} 1`);
        }
      } catch (err) {
        console.error('Error loading book structure:', err);
        // Fallback: try to open chapter 1 directly
        openText(`${bookTitle} 1`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleChapterClick = (chapter: number) => {
    if (selectedBook) {
      openText(`${selectedBook} ${chapter}`);
    }
  };

  const openText = (ref: string) => {
    setSelectedRef(ref);
    if (!recentlyViewed.includes(ref)) {
      setRecentlyViewed(prev => [ref, ...prev].slice(0, 5));
    }
  };

  const goBack = () => {
    if (chapters.length > 0) {
      setChapters([]);
      setSelectedBook(null);
    } else if (navigationPath.length > 0) {
      const newPath = [...navigationPath];
      newPath.pop();
      setNavigationPath(newPath);
      if (newPath.length === 0) {
        setCurrentItems(library);
      } else {
        setCurrentItems(newPath[newPath.length - 1].contents || []);
      }
    }
  };

  const goHome = () => {
    setNavigationPath([]);
    setCurrentItems(library);
    setChapters([]);
    setSelectedBook(null);
    setSelectedRef(null);
  };

  const getTitle = (item: LibraryCategory): string => {
    if (lang === 'he') {
      return item.heTitle || item.heCategory || item.title || item.category || item.name || '';
    }
    return item.title || item.category || item.name || '';
  };

  const getColor = (item: LibraryCategory): string => {
    const name = item.category || item.title || item.name || '';
    return categoryColors[name] || 'border-s-gray-400';
  };

  // Text reader view
  if (selectedRef) {
    return (
      <div className="bg-background-light min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button 
            onClick={goHome}
            className="mb-6 px-4 py-2 text-sm font-medium text-accent-blue hover:text-primary-teal flex items-center gap-2"
          >
            <span>←</span> {lang === 'en' ? 'Back to Library' : 'חזרה לספרייה'}
          </button>
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <TextDisplay
              textRef={selectedRef}
              language="bilingual"
              onTextLoad={() => {}}
              onError={(err) => console.error(err)}
            />
          </div>
        </div>
      </div>
    );
  }

  // Chapter selection view
  if ((chapters.length > 0 || loading) && selectedBook) {
    return (
      <div className="bg-background-light min-h-screen text-text-dark">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <button onClick={goBack} className="mb-6 text-sm text-accent-blue hover:underline flex items-center gap-2">
            <span>←</span> Back
          </button>
          <h1 className="text-3xl font-bold mb-4">{selectedBook}</h1>
          <p className="text-gray-600 mb-6">
            {loading ? 'Loading chapters...' : `${chapters.length} chapters available. Select one to read:`}
          </p>
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading...</div>
          ) : (
            <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-3">
              {chapters.map(ch => (
                <button
                  key={ch}
                  onClick={() => handleChapterClick(ch)}
                  className="aspect-square flex items-center justify-center bg-white border border-gray-200 rounded-lg text-lg font-medium hover:bg-primary-teal hover:text-white hover:border-primary-teal transition shadow-sm"
                >
                  {ch}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main library/category view
  return (
    <div className="bg-background-light min-h-screen text-text-dark antialiased">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Categories */}
          <div className="lg:col-span-2">
            {/* Header with breadcrumb */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <button onClick={goHome} className="hover:text-accent-blue">Library</button>
                {navigationPath.map((item, i) => (
                  <span key={i} className="flex items-center gap-2">
                    <span>/</span>
                    <span>{getTitle(item)}</span>
                  </span>
                ))}
              </div>
              <div className="aleph-icon text-gray-300" onClick={toggleLanguage} title="Switch Language">
                {lang === 'en' ? 'א' : 'A'}
              </div>
            </div>

            <div className="flex justify-between items-center mb-8 pb-2 border-b border-gray-200">
              <h1 className="text-3xl font-extrabold text-text-dark tracking-tight">
                {navigationPath.length > 0 ? getTitle(navigationPath[navigationPath.length - 1]) : (lang === 'en' ? 'Browse the Library' : 'לסייר בספרייה')}
              </h1>
              {navigationPath.length > 0 && (
                <button onClick={goBack} className="text-sm text-accent-blue hover:underline">← Back</button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-12 text-gray-500">Loading library...</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentItems.map((item, i) => (
                  <button
                    key={i}
                    onClick={() => handleCategoryClick(item)}
                    className={`category-card bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col text-left border-s-4 ${getColor(item)} hover:cursor-pointer`}
                  >
                    <h2 className="text-lg font-bold text-gray-900 mb-1">{getTitle(item)}</h2>
                    {categoryDescs[item.category || item.title || ''] && (
                      <p className="text-sm text-gray-500">{categoryDescs[item.category || item.title || '']}</p>
                    )}
                    {item.contents && (
                      <p className="text-xs text-gray-400 mt-2">{item.contents.length} items →</p>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Right Column: Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Recently Viewed */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">
                {lang === 'en' ? 'Recently Viewed' : 'נצפו לאחרונה'}
              </h3>
              <div className="space-y-2">
                {recentlyViewed.map((ref, i) => (
                  <button
                    key={i}
                    onClick={() => openText(ref)}
                    className="block text-sm text-accent-blue font-medium hover:underline"
                  >
                    {ref}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Access */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Quick Access</h3>
              <div className="space-y-2">
                <button onClick={() => openText('Genesis 1')} className="block text-sm text-accent-blue hover:underline">Genesis 1</button>
                <button onClick={() => openText('Psalms 23')} className="block text-sm text-accent-blue hover:underline">Psalms 23</button>
                <button onClick={() => openText('Proverbs 1')} className="block text-sm text-accent-blue hover:underline">Proverbs 1</button>
                <button onClick={() => openText('Exodus 20')} className="block text-sm text-accent-blue hover:underline">Exodus 20 (Ten Commandments)</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
