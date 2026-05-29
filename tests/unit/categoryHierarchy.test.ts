import { describe, expect, it } from 'vitest';
import {
  getRootCategories,
  layoutCategoryTree,
} from '../../lib/categoryHierarchy';
import type { Category } from '../../services/models';

function cat(
  id: string,
  title: string,
  parentId: string | null = null,
): Category {
  return {
    id,
    title,
    programId: 'p1',
    parentId,
    entriesCount: 0,
  };
}

describe('categoryHierarchy', () => {
  it('treats orphans as roots', () => {
    const categories = [
      cat('a', 'A'),
      cat('b', 'B', 'missing-parent'),
    ];
    const roots = getRootCategories(categories);
    expect(roots.map((r) => r.id).sort()).toEqual(['a', 'b']);
  });

  it('lays out parent to the left of children', () => {
    const categories = [cat('parent-1', 'Parent'), cat('child-1', 'Child', 'parent-1')];
    const { nodes, edges } = layoutCategoryTree(categories);
    const parent = nodes.find((n) => n.id === 'parent-1')!;
    const child = nodes.find((n) => n.id === 'child-1')!;
    expect(child.x).toBeGreaterThan(parent.x);
    expect(edges).toHaveLength(1);
    expect(edges[0].source).toBe('parent-1');
    expect(edges[0].target).toBe('child-1');
  });
});
