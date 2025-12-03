// Category types for the hierarchical navigation system

export interface LibraryItem {
  title?: string;
  heTitle?: string;
  categories: string[];
  order: number;
  primary_category?: string;
  enShortDesc?: string;
  heShortDesc?: string;
  corpus?: string;
  enDesc?: string;
  heDesc?: string;
  enComplete?: boolean;
  heComplete?: boolean;
  category?: string;
  heCategory?: string;
  collectiveTitle?: string;
  heCollectiveTitle?: string;
  dependence?: string;
  base_text_titles?: string[];
  base_text_mapping?: string;
  commentator?: string;
  heCommentator?: string;
  base_text_order?: number;
  searchRoot?: string;
  contents?: LibraryItem[];
}

export interface CategoryNode {
  title: string;
  heTitle?: string;
  category: string;
  heCategory?: string;
  enDesc?: string;
  heDesc?: string;
  enShortDesc?: string;
  heShortDesc?: string;
  order: number;
  isLeaf: boolean;
  path: string[];
  children: CategoryNode[];
  originalData: LibraryItem;
}

export interface CategoryBrowserProps {
  onTextSelect: (ref: string) => void;
  onCategorySelect?: (category: string[]) => void;
  initialExpandedCategories?: string[];
  maxDepth?: number;
}

export interface CategoryNodeProps {
  node: CategoryNode;
  level: number;
  onTextSelect: (ref: string) => void;
  onCategorySelect?: (category: string[]) => void;
  expandedNodes: Set<string>;
  onToggle: (path: string) => void;
  maxDepth?: number;
}
