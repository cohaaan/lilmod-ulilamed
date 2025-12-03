/**
 * Sefaria API Service
 * Complete integration with all Sefaria API endpoints
 * API Documentation: https://developers.sefaria.org/
 */

const BASE_URL = 'https://www.sefaria.org/api';

// ============ Types ============
export interface SefariaTextResponse {
  ref: string;
  heRef: string;
  he: string | string[];
  text: string | string[];  // English text
  versions?: any[];
  next?: string;
  prev?: string;
  indexTitle: string;
  categories: string[];
  sectionRef?: string;
  book?: string;
  type?: string;
}

export interface SefariaIndexResponse {
  title: string;
  heTitle: string;
  categories: string[];
  schema?: any;
  order?: number[];
  lengths?: number[];
  sectionNames?: string[];
}

export interface SefariaSearchResult {
  hits: {
    total: number;
    hits: Array<{
      _source: {
        ref: string;
        heRef: string;
        version: string;
        lang: string;
        exact?: string;
        naive_lemmatizer?: string;
      };
      highlight?: {
        exact?: string[];
        naive_lemmatizer?: string[];
      };
    }>;
  };
}

export interface SefariaCalendarResponse {
  calendar_items: Array<{
    title: { en: string; he: string };
    displayValue: { en: string; he: string };
    url: string;
    ref: string;
    order: number;
    category: string;
  }>;
  date: string;
}

export interface SefariaNameResponse {
  lang: string;
  is_ref: boolean;
  completions: string[];
  object_types?: string[];
}

export interface LibraryCategory {
  name: string;
  heCategory?: string;
  category: string;
  heDesc?: string;
  enDesc?: string;
  contents?: LibraryCategory[];
  order?: number;
  primary_category?: string;
  heTitle?: string;
  title?: string;
}

// ============ API Functions ============

/**
 * Fetch text content by reference
 * @param ref - Text reference (e.g., "Genesis 1", "Berakhot 2a")
 * @param options - Optional parameters
 */
export async function getText(
  ref: string,
  options: {
    lang?: 'en' | 'he' | 'bi';
    context?: number;
    pad?: boolean;
    wrapLinks?: boolean;
  } = {}
): Promise<SefariaTextResponse> {
  const params = new URLSearchParams();
  if (options.lang) params.append('lang', options.lang);
  if (options.context) params.append('context', options.context.toString());
  if (options.pad !== undefined) params.append('pad', options.pad ? '1' : '0');
  if (options.wrapLinks !== undefined) params.append('wrapLinks', options.wrapLinks ? '1' : '0');

  const url = `${BASE_URL}/texts/${encodeURIComponent(ref)}${params.toString() ? '?' + params.toString() : ''}`;
  console.log('API: Fetching text:', url);
  
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch text: ${response.statusText}`);
  
  return response.json();
}

/**
 * Fetch index/metadata for a book
 * @param title - Book title (e.g., "Genesis", "Berakhot")
 */
export async function getIndex(title: string): Promise<SefariaIndexResponse> {
  const url = `${BASE_URL}/index/${encodeURIComponent(title)}`;
  console.log('API: Fetching index:', url);
  
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch index: ${response.statusText}`);
  
  return response.json();
}

/**
 * Fetch the complete library structure (all categories and books)
 */
export async function getLibrary(): Promise<LibraryCategory[]> {
  const url = `${BASE_URL}/index`;
  console.log('API: Fetching library:', url);
  
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch library: ${response.statusText}`);
  
  return response.json();
}

/**
 * Search texts
 * @param query - Search query
 * @param options - Search options
 */
export async function search(
  query: string,
  options: {
    type?: 'text' | 'sheet';
    field?: 'exact' | 'naive_lemmatizer';
    slop?: number;
    filters?: string[];
    size?: number;
    from?: number;
  } = {}
): Promise<SefariaSearchResult> {
  const params = new URLSearchParams();
  params.append('q', query);
  if (options.type) params.append('type', options.type);
  if (options.field) params.append('field', options.field);
  if (options.slop !== undefined) params.append('slop', options.slop.toString());
  if (options.size !== undefined) params.append('size', options.size.toString());
  if (options.from !== undefined) params.append('from', options.from.toString());
  if (options.filters) {
    options.filters.forEach(f => params.append('filters[]', f));
  }

  const url = `${BASE_URL}/search-wrapper?${params.toString()}`;
  console.log('API: Searching:', url);
  
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Search failed: ${response.statusText}`);
  
  return response.json();
}

/**
 * Get links/connections for a text reference
 * @param ref - Text reference
 */
export async function getLinks(ref: string): Promise<any[]> {
  const url = `${BASE_URL}/links/${encodeURIComponent(ref)}`;
  console.log('API: Fetching links:', url);
  
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch links: ${response.statusText}`);
  
  return response.json();
}

/**
 * Get related texts for a reference
 * @param ref - Text reference
 */
export async function getRelated(ref: string): Promise<any> {
  const url = `${BASE_URL}/related/${encodeURIComponent(ref)}`;
  console.log('API: Fetching related:', url);
  
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch related: ${response.statusText}`);
  
  return response.json();
}

/**
 * Get today's calendar readings (Daf Yomi, Parasha, etc.)
 */
export async function getCalendars(): Promise<SefariaCalendarResponse> {
  const url = `${BASE_URL}/calendars`;
  console.log('API: Fetching calendars:', url);
  
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch calendars: ${response.statusText}`);
  
  return response.json();
}

/**
 * Name autocomplete/lookup
 * @param name - Partial name to complete
 */
export async function getName(name: string): Promise<SefariaNameResponse> {
  const url = `${BASE_URL}/name/${encodeURIComponent(name)}`;
  console.log('API: Fetching name:', url);
  
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch name: ${response.statusText}`);
  
  return response.json();
}

/**
 * Get word/section counts for a book
 * @param title - Book title
 */
export async function getCounts(title: string): Promise<any> {
  const url = `${BASE_URL}/counts/${encodeURIComponent(title)}`;
  console.log('API: Fetching counts:', url);
  
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch counts: ${response.statusText}`);
  
  return response.json();
}

/**
 * Get shape/structure of a book (sections and chapters)
 * @param title - Book title
 */
export async function getShape(title: string): Promise<any> {
  const url = `${BASE_URL}/shape/${encodeURIComponent(title)}`;
  console.log('API: Fetching shape:', url);
  
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch shape: ${response.statusText}`);
  
  return response.json();
}

/**
 * Get available text versions for a book
 * @param title - Book title
 */
export async function getVersions(title: string): Promise<any[]> {
  const url = `${BASE_URL}/texts/versions/${encodeURIComponent(title)}`;
  console.log('API: Fetching versions:', url);
  
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch versions: ${response.statusText}`);
  
  return response.json();
}

/**
 * Get all terms (shared titles)
 */
export async function getTerms(): Promise<any> {
  const url = `${BASE_URL}/terms`;
  console.log('API: Fetching terms:', url);
  
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch terms: ${response.statusText}`);
  
  return response.json();
}

// ============ React Hook ============

export function useSefariaAPI() {
  return {
    getText,
    getIndex,
    getLibrary,
    search,
    getLinks,
    getRelated,
    getCalendars,
    getName,
    getCounts,
    getShape,
    getVersions,
    getTerms,
  };
}

// ============ Default Export ============
const SefariaAPI = {
  getText,
  getIndex,
  getLibrary,
  search,
  getLinks,
  getRelated,
  getCalendars,
  getName,
  getCounts,
  getShape,
  getVersions,
  getTerms,
};

export default SefariaAPI;
