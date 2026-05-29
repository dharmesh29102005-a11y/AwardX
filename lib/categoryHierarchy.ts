import type { Category } from '../services/models';

/** Sentinel bucket for top-level / orphaned categories (never a real category id). */
export const CATEGORY_TREE_ROOT_KEY = '__category_tree_root__';

/** Parent bucket key for grouping children under a parent. */
export function getCategoryParentKey(
  category: Category,
  categoryIds: Set<string>,
): string {
  const pid = category.parentId;
  if (!pid || !categoryIds.has(pid)) return CATEGORY_TREE_ROOT_KEY;
  return pid;
}

export function buildChildrenByParent(categories: Category[]): Map<string, Category[]> {
  const ids = new Set(categories.map((c) => c.id));
  const map = new Map<string, Category[]>();

  for (const cat of categories) {
    const key = getCategoryParentKey(cat, ids);
    const list = map.get(key) ?? [];
    list.push(cat);
    map.set(key, list);
  }

  return map;
}

export function getRootCategories(categories: Category[]): Category[] {
  const ids = new Set(categories.map((c) => c.id));
  return categories.filter((c) => getCategoryParentKey(c, ids) === CATEGORY_TREE_ROOT_KEY);
}

export function getChildCategories(categories: Category[], parentId: string): Category[] {
  return categories.filter((c) => c.parentId === parentId);
}

export interface CategoryLayoutNode {
  id: string;
  x: number;
  y: number;
  data: Category;
}

export interface CategoryLayoutEdge {
  id: string;
  source: string;
  target: string;
}

export function layoutCategoryTree(
  categories: Category[],
  options?: {
    levelHeight?: number;
    levelWidth?: number;
    rootStartX?: number;
    rootTreeSpacing?: number;
  },
): { nodes: CategoryLayoutNode[]; edges: CategoryLayoutEdge[] } {
  const levelHeight = options?.levelHeight ?? 150;
  const levelWidth = options?.levelWidth ?? 350;
  const rootStartX = options?.rootStartX ?? 100;
  const rootTreeSpacing = options?.rootTreeSpacing ?? 350;

  const nodes: CategoryLayoutNode[] = [];
  const edges: CategoryLayoutEdge[] = [];
  const hierarchy = buildChildrenByParent(categories);

  const visited = new Set<string>();

  const processNode = (cat: Category, x: number, y: number) => {
    if (visited.has(cat.id)) return;
    visited.add(cat.id);

    nodes.push({ id: cat.id, x, y, data: cat });

    const children = hierarchy.get(cat.id) ?? [];
    if (children.length === 0) return;

    const childrenTotalHeight = children.length * levelHeight;
    let currentChildY = y - childrenTotalHeight / 2 + levelHeight / 2;

    for (const child of children) {
      edges.push({
        id: `${cat.id}-${child.id}`,
        source: cat.id,
        target: child.id,
      });
      processNode(child, x + levelWidth, currentChildY);
      currentChildY += levelHeight;
    }
  };

  const roots = hierarchy.get(CATEGORY_TREE_ROOT_KEY) ?? [];
  let rootY = 0;
  for (const root of roots) {
    processNode(root, rootStartX, rootY);
    rootY += rootTreeSpacing;
  }

  return { nodes, edges };
}
