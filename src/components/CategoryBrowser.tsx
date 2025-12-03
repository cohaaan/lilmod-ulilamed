import React, { useState, useEffect, memo } from 'react';
import { getLibrary, LibraryCategory } from '../services/sefariaApi';
import { CategoryBrowserProps, CategoryNodeProps, CategoryNode } from '../types/category';
import './CategoryBrowser.css';

// Transform library data into category tree structure
const transformToTree = (items: LibraryCategory[], path: string[] = []): CategoryNode[] => {
  return items.map((item: LibraryCategory) => {
    const currentPath = [...path, item.category || item.title || 'Unknown'];
    const children = item.contents ? transformToTree(item.contents, currentPath) : [];
    
    const node: CategoryNode = {
      title: item.title || item.category || item.name || 'Unknown',
      heTitle: item.heTitle || item.heCategory,
      category: item.category || item.title || item.name || 'Unknown',
      heCategory: item.heCategory || item.heTitle,
      enDesc: item.enDesc,
      heDesc: item.heDesc,
      enShortDesc: undefined,
      heShortDesc: undefined,
      order: item.order || 0,
      isLeaf: children.length === 0,
      path: currentPath,
      children: children,
      originalData: item as any  // Type assertion for compatibility
    };
    node.children.sort((a, b) => a.order - b.order);
    return node;
  }).sort((a, b) => a.order - b.order);
};

// Memoized category node to prevent unnecessary re-renders
const CategoryNodeComponent: React.FC<CategoryNodeProps> = memo(({ 
  node, 
  level, 
  onTextSelect, 
  onCategorySelect, 
  expandedNodes, 
  onToggle,
  maxDepth = 4 
}) => {
  const isExpanded = expandedNodes.has(node.path.join('/'));
  const hasChildren = node.children.length > 0;
  const isMaxDepth = level >= maxDepth;
  const indent = level * 20;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (hasChildren && !isMaxDepth) {
      onToggle(node.path.join('/'));
    }
  };

  const handleCategoryClick = () => {
    if (onCategorySelect) {
      onCategorySelect(node.path);
    }
  };

  const handleTextClick = () => {
    if (node.isLeaf) {
      // For leaf nodes, construct a proper reference from the title
      // Use the title (like "Genesis") rather than the full path
      const ref = node.title;
      onTextSelect(ref);
    }
  };

  return (
    <div className="category-node">
      <div 
        className={`category-item ${level === 0 ? 'top-level' : ''} ${node.isLeaf ? 'leaf' : 'category'}`}
        style={{ paddingLeft: `${indent}px` }}
        onClick={node.isLeaf ? handleTextClick : handleCategoryClick}
      >
        <div className="category-content">
          {hasChildren && !isMaxDepth && (
            <button 
              className={`expand-button ${isExpanded ? 'expanded' : 'collapsed'}`}
              onClick={handleToggle}
              aria-label={isExpanded ? 'Collapse' : 'Expand'}
            >
              {isExpanded ? '▼' : '▶'}
            </button>
          )}
          {!hasChildren && (
            <span className="leaf-indicator">📄</span>
          )}
          
          <div className="category-text">
            <span className="category-title">{node.title}</span>
            {node.heTitle && (
              <span className="category-he-title" dir="rtl">{node.heTitle}</span>
            )}
            {(node.enShortDesc || node.heShortDesc) && (
              <div className="category-description">
                {node.enShortDesc && (
                  <span className="en-desc">{node.enShortDesc}</span>
                )}
                {node.heShortDesc && (
                  <span className="he-desc" dir="rtl">{node.heShortDesc}</span>
                )}
              </div>
            )}
          </div>
          
          {node.isLeaf && (
            <span className="text-indicator">Text</span>
          )}
        </div>
      </div>
      
      {hasChildren && isExpanded && !isMaxDepth && (
        <div className="category-children">
          {node.children.map((child, index) => (
            <CategoryNodeComponent
              key={`${child.path.join('/')}-${index}`}
              node={child}
              level={level + 1}
              onTextSelect={onTextSelect}
              onCategorySelect={onCategorySelect}
              expandedNodes={expandedNodes}
              onToggle={onToggle}
              maxDepth={maxDepth}
            />
          ))}
        </div>
      )}
    </div>
  );
});

CategoryNodeComponent.displayName = 'CategoryNodeComponent';

const CategoryBrowser: React.FC<CategoryBrowserProps> = ({ 
  onTextSelect, 
  onCategorySelect,
  initialExpandedCategories = [],
  maxDepth = 4 
}) => {
  const [categoryTree, setCategoryTree] = useState<CategoryNode[]>([]);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(initialExpandedCategories));
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLibraryData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        console.log('Loading library data...');
        const data = await getLibrary();
        console.log('Library data received:', data.length, 'items');
        
        const tree = transformToTree(data);
        console.log('Tree transformed:', tree.length, 'top-level categories');
        setCategoryTree(tree);
        
        // Auto-expand first level categories
        const topLevelPaths = tree.map((node: CategoryNode) => node.path.join('/'));
        setExpandedNodes(new Set(topLevelPaths));
        
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load library data';
        console.error('Error loading library data:', errorMessage);
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadLibraryData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  const handleToggle = (path: string) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(path)) {
        newSet.delete(path);
      } else {
        newSet.add(path);
      }
      return newSet;
    });
  };

  const handleExpandAll = () => {
    const allPaths: string[] = [];
    const collectPaths = (nodes: CategoryNode[]) => {
      nodes.forEach(node => {
        if (node.children.length > 0) {
          allPaths.push(node.path.join('/'));
          collectPaths(node.children);
        }
      });
    };
    collectPaths(categoryTree);
    setExpandedNodes(new Set(allPaths));
  };

  const handleCollapseAll = () => {
    // Keep only top level expanded
    const topLevelPaths = categoryTree.map(node => node.path.join('/'));
    setExpandedNodes(new Set(topLevelPaths));
  };

  if (isLoading) {
    return (
      <div className="category-browser loading">
        <div className="loading-spinner">Loading library...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="category-browser error">
        <div className="error-message">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="category-browser">
      <div className="category-browser-header">
        <h3>Library Categories</h3>
        <div className="browser-controls">
          <button 
            className="control-button"
            onClick={handleExpandAll}
            title="Expand all categories"
          >
            Expand All
          </button>
          <button 
            className="control-button"
            onClick={handleCollapseAll}
            title="Collapse to top level"
          >
            Collapse All
          </button>
        </div>
      </div>
      
      <div className="category-tree">
        {categoryTree.map((node, index) => (
          <CategoryNodeComponent
            key={`${node.path.join('/')}-${index}`}
            node={node}
            level={0}
            onTextSelect={onTextSelect}
            onCategorySelect={onCategorySelect}
            expandedNodes={expandedNodes}
            onToggle={handleToggle}
            maxDepth={maxDepth}
          />
        ))}
      </div>
      
      <div className="category-browser-footer">
        <p className="category-count">
          {categoryTree.length} top-level categories
        </p>
        <p className="browse-tip">
          Click on categories to explore, click on texts to read
        </p>
      </div>
    </div>
  );
};

export default CategoryBrowser;
