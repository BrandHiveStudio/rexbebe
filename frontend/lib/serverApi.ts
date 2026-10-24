import fs from 'fs';
import path from 'path';

// Static JSON imports to ensure 100% inclusion in Vercel serverless bundle
import defaultCategories from '../data/categories.json';
import defaultNavigation from '../data/navigation.json';
import defaultProducts from '../data/products.json';
import defaultSettings from '../data/settings.json';
import defaultDelivery from '../data/delivery_settings.json';
import defaultPages from '../data/pages.json';

// Types
export interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  pageTitle?: string;
  href?: string;
  parentId?: string | null;
  order: number;
  status: 'published' | 'draft' | 'unpublished' | 'archived';
  isActive: boolean;
  destinationType?: string;
  destinationReference?: string;
  badge?: string;
  description?: string;
  shortDescription?: string;
  detailedDescription?: string;
  bannerImage?: string;
  thumbnailImage?: string;
  galleryImages?: string[];
  assignedProductIds?: string[];
  shortcutButtons?: any[];
  seoTitle?: string;
  seoDescription?: string;
  createdAt: string;
  updatedAt: string;
  parentName?: string;
  level?: string;
  children?: CategoryRecord[];
}

export interface CategoryTreeNode extends CategoryRecord {
  children: CategoryTreeNode[];
}

export interface NavItemConfig {
  id: string;
  name: string;
  pageTitle?: string;
  slug?: string;
  href: string;
  badge?: string;
  description?: string;
  shortDescription?: string;
  detailedDescription?: string;
  bannerImage?: string;
  thumbnailImage?: string;
  galleryImages?: string[];
  assignedProductIds?: string[];
  status?: string;
  order: number;
  isActive: boolean;
  destinationType?: string;
  destinationReference?: string;
  subGroups?: any[];
}

// Storage helpers
function getFilePath(filename: string): string {
  const isVercel = process.env.VERCEL || process.env.NODE_ENV === 'production';
  const tmpPath = path.join('/tmp', filename);
  if (isVercel && fs.existsSync(tmpPath)) {
    return tmpPath;
  }
  const localDataPath = path.resolve(process.cwd(), 'data', filename);
  if (fs.existsSync(localDataPath)) {
    return localDataPath;
  }
  const frontendDataPath = path.resolve(process.cwd(), 'frontend', 'data', filename);
  if (fs.existsSync(frontendDataPath)) {
    return frontendDataPath;
  }
  return localDataPath;
}

function saveData(filename: string, data: any) {
  try {
    const isVercel = process.env.VERCEL || process.env.NODE_ENV === 'production';
    if (isVercel) {
      fs.writeFileSync(path.join('/tmp', filename), JSON.stringify(data, null, 2), 'utf-8');
    }
    const localDataPath = path.resolve(process.cwd(), 'data', filename);
    if (fs.existsSync(path.dirname(localDataPath))) {
      fs.writeFileSync(localDataPath, JSON.stringify(data, null, 2), 'utf-8');
    }
  } catch (e) {
    console.warn(`[serverApi] Notice writing ${filename}:`, e);
  }
}

function loadData<T>(filename: string, fallback: T): T {
  try {
    const filePath = getFilePath(filename);
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.warn(`[serverApi] Notice reading ${filename}:`, e);
  }
  return fallback;
}

// State Singletons
class ServerStore {
  private categories: CategoryRecord[] = [];
  private navigation: { items: NavItemConfig[] } = { items: [] };

  constructor() {
    this.reload();
  }

  public reload() {
    this.categories = loadData<CategoryRecord[]>('categories.json', (defaultCategories as unknown) as CategoryRecord[]);
    this.navigation = loadData<{ items: NavItemConfig[] }>('navigation.json', (defaultNavigation as unknown) as { items: NavItemConfig[] });
  }

  public getCategories(query?: { status?: string; parentId?: string }): CategoryRecord[] {
    let result = [...this.categories].sort((a, b) => (a.order || 0) - (b.order || 0));
    if (query?.status && query.status !== 'all') {
      result = result.filter((c) => c.status === query.status);
    }
    if (query?.parentId !== undefined) {
      const targetParent = query.parentId === 'root' || query.parentId === 'null' ? null : query.parentId;
      result = result.filter((c) => (targetParent === null ? !c.parentId || c.parentId === 'root' || c.parentId === 'none' : c.parentId === targetParent));
    }
    return result;
  }

  public getCategoryTree(): CategoryTreeNode[] {
    const all = [...this.categories].sort((a, b) => (a.order || 0) - (b.order || 0));
    const nodeMap = new Map<string, CategoryTreeNode>();
    all.forEach((c) => {
      nodeMap.set(c.id, { ...c, children: [] });
    });

    const roots: CategoryTreeNode[] = [];
    all.forEach((c) => {
      const node = nodeMap.get(c.id)!;
      if (!c.parentId || c.parentId === 'root' || c.parentId === 'none' || !nodeMap.has(c.parentId)) {
        roots.push(node);
      } else {
        const parent = nodeMap.get(c.parentId);
        if (parent) {
          parent.children.push(node);
        } else {
          roots.push(node);
        }
      }
    });

    return roots;
  }

  public findCategoryById(idOrSlug: string): CategoryRecord | null {
    const s = idOrSlug.toLowerCase();
    return this.categories.find((c) => c.id === idOrSlug || c.slug.toLowerCase() === s) || null;
  }

  public getAncestors(id: string): CategoryRecord[] {
    const ancestors: CategoryRecord[] = [];
    let current = this.findCategoryById(id);
    const visited = new Set<string>();
    while (current?.parentId && !visited.has(current.parentId)) {
      visited.add(current.parentId);
      const parent = this.findCategoryById(current.parentId);
      if (parent) {
        ancestors.unshift(parent);
        current = parent;
      } else {
        break;
      }
    }
    return ancestors;
  }

  public getDescendants(id: string): CategoryRecord[] {
    const descendants: CategoryRecord[] = [];
    const collect = (parentId: string) => {
      const children = this.categories.filter((c) => c.parentId === parentId);
      for (const child of children) {
        descendants.push(child);
        collect(child.id);
      }
    };
    collect(id);
    return descendants;
  }

  public createCategory(input: any): CategoryRecord {
    const cleanName = (input.name || '').trim();
    if (!cleanName) throw new Error('Category name is required');
    let cleanSlug = (input.slug || cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    if (!cleanSlug) cleanSlug = `cat-${Date.now()}`;

    // Normalize parentId
    let parentId = input.parentId;
    if (['root', 'none', 'null', 'nav-home', 'nav-about', 'nav-contact', ''].includes(parentId)) {
      parentId = null;
    }

    const effectiveStatus = input.status || 'published';
    const effectiveIsActive = input.isActive !== undefined ? input.isActive : effectiveStatus === 'published';

    const newCat: CategoryRecord = {
      id: input.id || `cat-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
      name: cleanName,
      pageTitle: input.pageTitle || cleanName,
      slug: cleanSlug,
      href: input.href || `/shop/${cleanSlug}`,
      parentId,
      order: input.order !== undefined ? Number(input.order) : this.categories.length + 1,
      status: effectiveStatus,
      isActive: effectiveIsActive,
      destinationType: input.destinationType || 'CATEGORY_PAGE',
      destinationReference: input.destinationReference || cleanSlug,
      badge: input.badge,
      description: input.description || input.shortDescription,
      shortDescription: input.shortDescription,
      detailedDescription: input.detailedDescription,
      bannerImage: input.bannerImage,
      thumbnailImage: input.thumbnailImage,
      galleryImages: Array.isArray(input.galleryImages) ? input.galleryImages : [],
      assignedProductIds: Array.isArray(input.assignedProductIds) ? input.assignedProductIds : [],
      shortcutButtons: Array.isArray(input.shortcutButtons) ? input.shortcutButtons : [],
      seoTitle: input.seoTitle,
      seoDescription: input.seoDescription,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.categories.push(newCat);
    saveData('categories.json', this.categories);
    this.syncCategoryWithNav(newCat, 'save');
    return newCat;
  }

  public updateCategory(idOrSlug: string, input: any): CategoryRecord {
    const existingIndex = this.categories.findIndex((c) => c.id === idOrSlug || c.slug.toLowerCase() === idOrSlug.toLowerCase());
    if (existingIndex === -1) throw new Error(`Category ${idOrSlug} not found`);

    const existing = this.categories[existingIndex];
    let parentId = input.parentId !== undefined ? input.parentId : existing.parentId;
    if (['root', 'none', 'null', 'nav-home', 'nav-about', 'nav-contact', ''].includes(parentId)) {
      parentId = null;
    }

    const updated: CategoryRecord = {
      ...existing,
      ...input,
      parentId,
      updatedAt: new Date().toISOString(),
    };

    if (input.status !== undefined && input.isActive === undefined) {
      updated.isActive = input.status === 'published';
    }

    this.categories[existingIndex] = updated;
    saveData('categories.json', this.categories);
    this.syncCategoryWithNav(updated, 'save');
    return updated;
  }

  public deleteCategory(idOrSlug: string): boolean {
    const existing = this.findCategoryById(idOrSlug);
    if (!existing) return false;

    const toDeleteIds = new Set<string>([existing.id, existing.slug]);
    const descendants = this.getDescendants(existing.id);
    descendants.forEach((d) => {
      toDeleteIds.add(d.id);
      toDeleteIds.add(d.slug);
    });

    this.categories = this.categories.filter((c) => !toDeleteIds.has(c.id));
    saveData('categories.json', this.categories);
    this.syncCategoryWithNav(existing, 'delete');
    return true;
  }

  private syncCategoryWithNav(cat: CategoryRecord, action: 'save' | 'delete') {
    let items = [...(this.navigation.items || [])];
    if (action === 'delete') {
      const delIds = new Set<string>([cat.id, cat.slug]);
      items = items.filter((i: any) => !delIds.has(i.id) && !delIds.has(i.slug));
      items.forEach((item: any) => {
        if (item.subGroups) {
          item.subGroups.forEach((grp: any) => {
            if (grp.subItems) {
              grp.subItems = grp.subItems.filter((s: any) => !delIds.has(s.id) && !delIds.has(s.slug));
            }
          });
        }
      });
      this.navigation = { items };
      saveData('navigation.json', this.navigation);
      return;
    }

    // Save action: update existing or insert into parent
    let found = false;
    for (const item of items) {
      if (item.id === cat.id || item.slug === cat.slug) {
        item.name = cat.name.toUpperCase();
        item.pageTitle = cat.pageTitle || cat.name;
        item.status = cat.status;
        item.isActive = cat.isActive !== false;
        item.destinationType = cat.destinationType;
        item.destinationReference = cat.destinationReference;
        item.galleryImages = cat.galleryImages || [];
        found = true;
        break;
      }
      for (const grp of item.subGroups || []) {
        for (const sub of grp.subItems || []) {
          if (sub.id === cat.id || sub.slug === cat.slug) {
            sub.name = cat.name;
            sub.pageTitle = cat.pageTitle || cat.name;
            sub.status = cat.status;
            sub.isActive = cat.isActive !== false;
            sub.destinationType = cat.destinationType;
            sub.destinationReference = cat.destinationReference;
            sub.galleryImages = cat.galleryImages || [];
            found = true;
            break;
          }
        }
        if (found) break;
      }
      if (found) break;
    }

    if (!found) {
      if (!cat.parentId) {
        items.push({
          id: cat.id,
          name: cat.name.toUpperCase(),
          pageTitle: cat.pageTitle || cat.name,
          slug: cat.slug,
          href: cat.href || `/shop/${cat.slug}`,
          order: cat.order || items.length + 1,
          status: cat.status,
          isActive: cat.isActive !== false,
          destinationType: cat.destinationType,
          destinationReference: cat.destinationReference,
          galleryImages: cat.galleryImages || [],
          subGroups: [],
        });
      } else {
        const parentNav = items.find((i: any) => i.id === cat.parentId || i.slug === cat.parentId);
        if (parentNav) {
          if (!parentNav.subGroups || parentNav.subGroups.length === 0) {
            parentNav.subGroups = [
              {
                id: `grp-${cat.slug}-${Date.now()}`,
                title: 'CATEGORIES',
                slug: cat.slug,
                href: `/shop/${cat.slug}`,
                subItems: [],
              },
            ];
          }
          const targetGroup = parentNav.subGroups[0];
          targetGroup.subItems = targetGroup.subItems || [];
          targetGroup.subItems.push({
            id: cat.id,
            name: cat.name,
            pageTitle: cat.pageTitle || cat.name,
            slug: cat.slug,
            href: cat.href || `/shop/${cat.slug}`,
            status: cat.status,
            isActive: cat.isActive !== false,
            parentId: cat.parentId,
            order: cat.order || 1,
            destinationType: cat.destinationType,
            destinationReference: cat.destinationReference,
            galleryImages: cat.galleryImages || [],
          });
        }
      }
    }

    this.navigation = { items };
    saveData('navigation.json', this.navigation);
  }

  public getNavigation(isPublic: boolean = true) {
    let items = [...(this.navigation.items || [])];
    if (isPublic) {
      items = items.filter((i) => i.isActive !== false && i.status !== 'draft' && i.status !== 'unpublished');
    }
    return { items };
  }

  public updateNavigation(newConfig: { items: NavItemConfig[] }) {
    if (newConfig && Array.isArray(newConfig.items)) {
      this.navigation = newConfig;
      saveData('navigation.json', this.navigation);
    }
    return this.navigation;
  }

  public getProducts() {
    return loadData<any[]>('products.json', (defaultProducts as unknown) as any[]);
  }

  public getPages() {
    return loadData<any[]>('pages.json', (defaultPages as unknown) as any[]);
  }

  public getDeliverySettings() {
    return loadData<any>('delivery_settings.json', (defaultDelivery as unknown) as any);
  }

  public getSettings() {
    return loadData<any>('settings.json', (defaultSettings as unknown) as any);
  }
}

export const serverStore = new ServerStore();
