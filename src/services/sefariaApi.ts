/**
 * Sefaria API Service
 * Complete integration with all Sefaria API endpoints
 * API Documentation: https://developers.sefaria.org/
 */

const BASE_URL = 'https://www.sefaria.org/api';
const DEFAULT_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

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

// ============ Helper Functions ============

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(url: string, timeout: number = DEFAULT_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}

/**
 * Fetch with retry logic
 */
async function fetchWithRetry(
  url: string,
  retries: number = MAX_RETRIES,
  delay: number = RETRY_DELAY
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url);

      // If successful response, return it
      if (response.ok) {
        return response;
      }

      // If client error (4xx), don't retry
      if (response.status >= 400 && response.status < 500) {
        throw new Error(`API error ${response.status}: ${response.statusText}`);
      }

      // For server errors (5xx), retry
      lastError = new Error(`Server error ${response.status}: ${response.statusText}`);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // If it's a client error or last attempt, throw immediately
      if (attempt === retries || (error instanceof Error && error.message.includes('API error'))) {
        throw lastError;
      }

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay * (attempt + 1)));
    }
  }

  throw lastError || new Error('Unknown error during fetch');
}

/**
 * Validate API response
 */
function validateResponse<T>(data: any, requiredFields: string[]): T {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid API response: not an object');
  }

  for (const field of requiredFields) {
    if (!(field in data)) {
      console.warn(`API response missing expected field: ${field}`);
    }
  }

  return data as T;
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
  if (!ref || ref.trim() === '') {
    throw new Error('Text reference is required');
  }

  const params = new URLSearchParams();
  if (options.lang) params.append('lang', options.lang);
  if (options.context) params.append('context', options.context.toString());
  if (options.pad !== undefined) params.append('pad', options.pad ? '1' : '0');
  if (options.wrapLinks !== undefined) params.append('wrapLinks', options.wrapLinks ? '1' : '0');

  const url = `${BASE_URL}/texts/${encodeURIComponent(ref)}${params.toString() ? '?' + params.toString() : ''}`;
  console.log('API: Fetching text:', url);

  try {
    const response = await fetchWithRetry(url);
    const data = await response.json();

    // Validate response has required fields
    return validateResponse<SefariaTextResponse>(data, ['ref', 'text', 'he']);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to fetch text:', errorMessage);
    throw new Error(`Failed to fetch text "${ref}": ${errorMessage}`);
  }
}

/**
 * Fetch index/metadata for a book
 * @param title - Book title (e.g., "Genesis", "Berakhot")
 */
export async function getIndex(title: string): Promise<SefariaIndexResponse> {
  if (!title || title.trim() === '') {
    throw new Error('Book title is required');
  }

  const url = `${BASE_URL}/index/${encodeURIComponent(title)}`;
  console.log('API: Fetching index:', url);

  try {
    const response = await fetchWithRetry(url);
    const data = await response.json();

    // Validate response has required fields
    return validateResponse<SefariaIndexResponse>(data, ['title']);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to fetch index:', errorMessage);
    throw new Error(`Failed to fetch index for "${title}": ${errorMessage}`);
  }
}

/**
 * Fetch the complete library structure (all categories and books)
 */
export async function getLibrary(): Promise<LibraryCategory[]> {
  const url = `${BASE_URL}/index`;
  console.log('API: Fetching library:', url);

  try {
    const response = await fetchWithRetry(url);
    const data = await response.json();

    // Validate response is an array
    if (!Array.isArray(data)) {
      throw new Error('Invalid API response: expected array');
    }

    return data as LibraryCategory[];
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to fetch library:', errorMessage);
    throw new Error(`Failed to fetch library: ${errorMessage}`);
  }
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
  if (!query || query.trim() === '') {
    throw new Error('Search query is required');
  }

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

  try {
    const response = await fetchWithRetry(url);
    const data = await response.json();

    // Validate search response structure
    return validateResponse<SefariaSearchResult>(data, ['hits']);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Search failed:', errorMessage);
    throw new Error(`Search failed for "${query}": ${errorMessage}`);
  }
}

/**
 * Get links/connections for a text reference
 * @param ref - Text reference
 */
export async function getLinks(ref: string): Promise<any[]> {
  if (!ref || ref.trim() === '') {
    throw new Error('Text reference is required');
  }

  const url = `${BASE_URL}/links/${encodeURIComponent(ref)}`;
  console.log('API: Fetching links:', url);

  try {
    const response = await fetchWithRetry(url);
    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error('Invalid API response: expected array');
    }

    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to fetch links:', errorMessage);
    throw new Error(`Failed to fetch links for "${ref}": ${errorMessage}`);
  }
}

/**
 * Get related texts for a reference
 * @param ref - Text reference
 */
export async function getRelated(ref: string): Promise<any> {
  if (!ref || ref.trim() === '') {
    throw new Error('Text reference is required');
  }

  const url = `${BASE_URL}/related/${encodeURIComponent(ref)}`;
  console.log('API: Fetching related:', url);

  try {
    const response = await fetchWithRetry(url);
    return response.json();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to fetch related:', errorMessage);
    throw new Error(`Failed to fetch related texts for "${ref}": ${errorMessage}`);
  }
}

/**
 * Get today's calendar readings (Daf Yomi, Parasha, etc.)
 */
export async function getCalendars(): Promise<SefariaCalendarResponse> {
  const url = `${BASE_URL}/calendars`;
  console.log('API: Fetching calendars:', url);

  try {
    const response = await fetchWithRetry(url);
    const data = await response.json();

    return validateResponse<SefariaCalendarResponse>(data, ['calendar_items']);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to fetch calendars:', errorMessage);
    throw new Error(`Failed to fetch calendars: ${errorMessage}`);
  }
}

/**
 * Name autocomplete/lookup
 * @param name - Partial name to complete
 */
export async function getName(name: string): Promise<SefariaNameResponse> {
  if (!name || name.trim() === '') {
    throw new Error('Name is required');
  }

  const url = `${BASE_URL}/name/${encodeURIComponent(name)}`;
  console.log('API: Fetching name:', url);

  try {
    const response = await fetchWithRetry(url);
    const data = await response.json();

    return validateResponse<SefariaNameResponse>(data, ['completions']);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to fetch name:', errorMessage);
    throw new Error(`Failed to fetch name completion for "${name}": ${errorMessage}`);
  }
}

/**
 * Get word/section counts for a book
 * @param title - Book title
 */
export async function getCounts(title: string): Promise<any> {
  if (!title || title.trim() === '') {
    throw new Error('Book title is required');
  }

  const url = `${BASE_URL}/counts/${encodeURIComponent(title)}`;
  console.log('API: Fetching counts:', url);

  try {
    const response = await fetchWithRetry(url);
    return response.json();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to fetch counts:', errorMessage);
    throw new Error(`Failed to fetch counts for "${title}": ${errorMessage}`);
  }
}

/**
 * Get shape/structure of a book (sections and chapters)
 * @param title - Book title
 */
export async function getShape(title: string): Promise<any> {
  if (!title || title.trim() === '') {
    throw new Error('Book title is required');
  }

  const url = `${BASE_URL}/shape/${encodeURIComponent(title)}`;
  console.log('API: Fetching shape:', url);

  try {
    const response = await fetchWithRetry(url);
    return response.json();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to fetch shape:', errorMessage);
    throw new Error(`Failed to fetch shape for "${title}": ${errorMessage}`);
  }
}

/**
 * Get available text versions for a book
 * @param title - Book title
 */
export async function getVersions(title: string): Promise<any[]> {
  if (!title || title.trim() === '') {
    throw new Error('Book title is required');
  }

  const url = `${BASE_URL}/texts/versions/${encodeURIComponent(title)}`;
  console.log('API: Fetching versions:', url);

  try {
    const response = await fetchWithRetry(url);
    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error('Invalid API response: expected array');
    }

    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to fetch versions:', errorMessage);
    throw new Error(`Failed to fetch versions for "${title}": ${errorMessage}`);
  }
}

/**
 * Get all terms (shared titles)
 */
export async function getTerms(): Promise<any> {
  const url = `${BASE_URL}/terms`;
  console.log('API: Fetching terms:', url);

  try {
    const response = await fetchWithRetry(url);
    return response.json();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Failed to fetch terms:', errorMessage);
    throw new Error(`Failed to fetch terms: ${errorMessage}`);
  }
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
