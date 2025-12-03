// Core Sefaria API response types based on the public API documentation

import { LibraryItem } from './category';

export interface SefariaTextVersion {
  language: string;
  source: string;
  versionTitle: string;
  versionTitleInHebrew?: string;
  status: string;
  priority: number;
  isPrimary: boolean;
  isSource: boolean;
  versionNotes?: string;
  digitizedBySefaria: boolean;
}

export interface SefariaText {
  ref: string;
  he: string | string[];
  en: string | string[];      // Mapped from API's 'text' field
  text?: string | string[];   // Original API field name for English
  heVersion?: string;
  enVersion?: string;
  versions?: SefariaTextVersion[];
  availableVersions?: {
    he: SefariaTextVersion[];
    en: SefariaTextVersion[];
  };
  sectionRef: string;
  length?: number;
  textDepth?: number;
  indexTitle: string;
  categories: string[];
  isSpanning?: boolean;
  next?: string;
  prev?: string;
  alts?: {
    en?: {
      [key: string]: string | string[];
    };
    he?: {
      [key: string]: string | string[];
    };
  };
}

export interface SefariaIndex {
  title: string;
  titleVariants: string[];
  heTitle: string;
  heTitleVariants: string[];
  categories: string[];
  sectionNames: string[];
  heSectionNames: string[];
  order: number[][] | number;
  maps?: any[];
  customData?: any;
  schema?: SefariaSchemaNode;
  isDependent?: boolean;
  isComplex?: boolean;
  collectiveTitle?: string;
  heCollectiveTitle?: string;
  dependence?: string;
  baseTextTitles?: string[];
  baseTextMapping?: string;
  addressTypes?: string[];
  depth?: number;
  references?: string[];
  index_dependencies?: string[];
  index_dependents?: string[];
  alt_structs?: {
    [key: string]: any;
  };
  titles?: string[];
  heTitles?: string[];
  compDate?: string;
  compDateRange?: string[];
  errorMargin?: string;
  era?: string;
  pubDate?: string;
  pubPlace?: string;
  authors?: string[];
  enDesc?: string;
  heDesc?: string;
  enShortDesc?: string;
  heShortDesc?: string;
  pubDateHe?: string[];
  compDateHe?: string;
  errorMarginHe?: string;
  eraHe?: string;
  enMerger?: string;
  heMerger?: string;
  enCompComposer?: string;
  heCompComposer?: string;
  enCompPlace?: string;
  heCompPlace?: string[];
  enCompReviewer?: string;
  heCompReviewer?: string[];
  enCompEditor?: string;
  heCompEditor?: string[];
  enCompTranslator?: string;
  heCompTranslator?: string[];
  enCompCommentator?: string;
  heCompCommentator?: string[];
  enCompCommentaryPeriod?: string;
  heCompCommentaryPeriod?: string[];
  enCompCommentaryPlace?: string;
  heCompCommentaryPlace?: string[];
  enCompCommentaryLocation?: string;
  heCompCommentaryLocation?: string[];
  enCompCommentaryCitation?: string[];
  heCompCommentaryCitation?: string[];
  enCompCommentaryExternal?: string;
  heCompCommentaryExternal?: string[];
  enCompCommentaryInternal?: string;
  heCompCommentaryInternal?: string[];
  enCompNotes?: string;
  heCompNotes?: string[];
  enCompSource?: string;
  heCompSource?: string[];
  enCompCitation?: string;
  heCompCitation?: string[];
  enCompExternal?: string;
  heCompExternal?: string[];
  enCompInternal?: string;
  heCompInternal?: string[];
  enCompCommentary?: string;
  heCompCommentary?: string[];
  enCompPrinted?: string;
  heCompPrinted?: string[];
  enCompDigital?: string;
  heCompDigital?: string[];
  enCompTime?: string;
  heCompTime?: string[];
  enCompLocation?: string;
  heCompLocation?: string[];
  enCompTitle?: string;
  heCompTitle?: string[];
  enCompTitleVariants?: string[];
  heCompTitleVariants?: string[];
  enCompAlias?: string[];
  heCompAlias?: string[];
  enCompRedactor?: string;
  heCompRedactor?: string[];
  enCompTradition?: string;
  heCompTradition?: string[];
  enCompCommentaryCommentaryLocation?: string[];
  heCompCommentaryCommentaryLocation?: string[];
  enCompCommentaryCommentaryTime?: string;
  heCompCommentaryCommentaryTime?: string[];
  enCompCommentaryCommentaryTitle?: string;
  heCompCommentaryCommentaryTitle?: string[];
  enCompCommentaryCommentaryTitleVariants?: string[];
  heCompCommentaryCommentaryTitleVariants?: string[];
  enCompCommentaryCommentaryAlias?: string[];
  heCompCommentaryCommentaryAlias?: string[];
  enCompCommentaryCommentaryPrinted?: string;
  heCompCommentaryCommentaryPrinted?: string[];
  enCompCommentaryCommentaryDigital?: string;
  heCompCommentaryCommentaryDigital?: string[];
  enCompCommentaryCommentaryNotes?: string;
  heCompCommentaryCommentaryNotes?: string[];
  enCompCommentaryCommentarySource?: string;
  heCompCommentaryCommentarySource?: string[];
  enCompCommentaryCommentaryCitation?: string;
  heCompCommentaryCommentaryCitation?: string[];
  enCompCommentaryCommentaryExternal?: string;
  heCompCommentaryCommentaryExternal?: string[];
  enCompCommentaryCommentaryInternal?: string;
  heCompCommentaryCommentaryInternal?: string[];
}

export interface SefariaSchemaNode {
  nodeType: string;
  title: string;
  heTitle: string;
  key: string;
  depth: number;
  addressTypes: string[];
  sectionNames: string[];
  heSectionNames: string[];
  default?: boolean;
  isLeaf?: boolean;
  children?: SefariaSchemaNode[];
  wholeRef?: string;
  altTitles?: string[];
  heAltTitles?: string[];
  titles?: string[];
  heTitles?: string[];
  length?: number;
  lengths?: number[];
  availableVersions?: {
    he: SefariaTextVersion[];
    en: SefariaTextVersion[];
  };
  map?: string;
  mapHe?: string;
  descendants?: SefariaSchemaNode[];
  sharedTitle?: string;
  heSharedTitle?: string;
  lexicalCategories?: string[];
  heLexicalCategories?: string[];
  order?: number[][];
  heOrder?: number[][];
  isPrimary?: boolean;
  isSource?: boolean;
  digitizedBySefaria?: boolean;
  versionNotes?: string;
  versionTitle?: string;
  versionTitleInHebrew?: string;
  language?: string;
  source?: string;
  status?: string;
  priority?: number;
}

// Reuse LibraryItem from category.ts for the library index structure
export type SefariaLibraryIndex = LibraryItem[];

export interface SefariaLink {
  index_title?: string;
  sourceRef: string;
  targetRef: string;
  type: string;
  category?: string;
  language?: string;
  anchorText?: string;
  anchorTextHe?: string;
  sourceHeRef?: string;
  ref?: string;
  heRef?: string;
  enRef?: string;
  book?: string;
  collectiveTitle?: string;
  heCollectiveTitle?: string;
  commentary?: string;
  heCommentary?: string;
  commentaryAnchor?: string;
  heCommentaryAnchor?: string;
  anchorVerse?: string;
  heAnchorVerse?: string;
  anchorTextExpanded?: string;
  heAnchorTextExpanded?: string;
  context?: string;
  heContext?: string;
  text?: string;
  heText?: string;
}

export interface SefariaAPIResponse<T> {
  status?: string;
  error?: string;
  data?: T;
}

// Component Props Types
export interface TextDisplayProps {
  textRef: string;
  language: 'english' | 'hebrew' | 'bilingual';
  onTextLoad?: (text: SefariaText) => void;
  onError?: (error: string) => void;
}

export interface NavigationProps {
  currentRef: string;
  onNavigate: (ref: string) => void;
  availableTexts?: SefariaIndex[];
}

export interface SearchProps {
  onSearchResult: (ref: string) => void;
  placeholder?: string;
}

// Cache Types
export interface TextCache {
  [ref: string]: SefariaText;
}

export interface IndexCache {
  [title: string]: SefariaIndex;
}

// Panel System Types (simplified from original Sefaria)
export interface PanelState {
  id: string;
  ref: string;
  language: 'english' | 'hebrew' | 'bilingual';
  mode: 'text' | 'text-and-connections';
  text?: SefariaText;
  isLoading: boolean;
  error?: string;
}

export interface ReaderAppState {
  panels: PanelState[];
  activePanelId: string;
}

// Constants
export const SEFARIA_API_BASE = 'https://www.sefaria.org';
export const TEXT_API_ENDPOINT = '/api/v3/texts';
export const INDEX_API_ENDPOINT = '/api/v2/index';
export const LIBRARY_API_ENDPOINT = '/api/index';
export const RELATED_API_ENDPOINT = '/api/related';
export const SEARCH_API_ENDPOINT = '/api/search';
