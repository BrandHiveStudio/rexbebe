import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { sendSuccess, sendError } from '../utils/response';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { navigationStorage } from '../services/navigationStorage';

const productsFilePath = path.join(__dirname, '../../data/products.json');
const auditLogsFilePath = path.join(__dirname, '../../data/audit_logs.json');

function readJson<T>(filePath: string, fallback: T): T {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  } catch (err) {
    console.error(`[Category] Error reading ${filePath}:`, err);
  }
  return fallback;
}

function writeJson<T>(filePath: string, data: T): void {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`[Category] Error writing ${filePath}:`, err);
  }
}

function recordAudit(action: string, details: string) {
  const logs = readJson<any[]>(auditLogsFilePath, []);
  logs.unshift({
    id: `log-${Date.now()}`,
    userEmail: 'admin@rexbebe.com',
    userName: 'Admin Executive',
    action,
    details,
    ip: '127.0.0.1',
    timestamp: new Date().toISOString(),
  });
  if (logs.length > 500) logs.pop();
  writeJson(auditLogsFilePath, logs);
}

// Helper to extract a flat list of categories from navigation tree
function getUnifiedCategoriesList() {
  const nav = navigationStorage.getAll();
  const list: any[] = [];

  (nav.items || []).forEach(item => {
    list.push({
      id: item.id,
      name: item.name,
      pageTitle: item.pageTitle || item.name,
      slug: item.slug || item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      href: item.href,
      parentName: 'Top Level Navigation',
      badge: item.badge,
      shortDescription: item.shortDescription || item.description,
      description: item.description || item.shortDescription,
      detailedDescription: item.detailedDescription,
      bannerImage: item.bannerImage,
      thumbnailImage: item.thumbnailImage,
      galleryImages: item.galleryImages,
      assignedProductIds: item.assignedProductIds || [],
      shortcutButtons: item.shortcutButtons || [],
      status: item.status || (item.isActive ? 'published' : 'draft'),
      isActive: item.isActive,
      order: item.order,
      seoTitle: item.seoTitle,
      seoDescription: item.seoDescription,
      level: 'top',
    });

    (item.subGroups || []).forEach(grp => {
      (grp.subItems || []).forEach(sub => {
        list.push({
          id: sub.id,
          name: sub.name,
          pageTitle: sub.pageTitle || sub.name,
          slug: sub.slug || sub.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          href: sub.href,
          parentName: item.name,
          parentId: item.id,
          parentGroupId: grp.id,
          badge: sub.badge,
          shortDescription: sub.shortDescription || sub.description,
          description: sub.description || sub.shortDescription,
          detailedDescription: sub.detailedDescription,
          bannerImage: sub.bannerImage,
          thumbnailImage: sub.thumbnailImage,
          galleryImages: sub.galleryImages,
          assignedProductIds: sub.assignedProductIds || [],
          shortcutButtons: sub.shortcutButtons || [],
          status: sub.status || (sub.isActive !== false ? 'published' : 'draft'),
          isActive: sub.isActive !== false,
          order: sub.order || 99,
          seoTitle: sub.seoTitle,
          seoDescription: sub.seoDescription,
          level: 'sub',
        });
      });
    });
  });

  return list;
}

export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const list = getUnifiedCategoriesList();
    const { status } = req.query;
    if (status && status !== 'all') {
      const filtered = list.filter(c => c.status === status);
      return sendSuccess(res, filtered, 'Categories retrieved');
    }
    return sendSuccess(res, list, 'Categories retrieved');
  } catch (err) {
    next(err);
  }
};

export const getCategoryById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const list = getUnifiedCategoriesList();
    const found = list.find(c => c.id === id || c.slug === id);
    if (!found) {
      throw new NotFoundError(`Category with identifier '${id}' not found`);
    }
    return sendSuccess(res, found, 'Category details retrieved');
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      pageTitle,
      slug,
      href,
      parentId,
      badge,
      shortDescription,
      detailedDescription,
      bannerImage,
      thumbnailImage,
      assignedProductIds,
      shortcutButtons,
      status,
      seoTitle,
      seoDescription,
    } = req.body;

    if (!name || !name.trim()) {
      throw new BadRequestError('Category name is required');
    }

    const finalSlug = (slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-')).replace(/^-+|-+$/g, '');
    const finalHref = href || `/shop/${finalSlug}`;
    const newId = req.body.id || `cat-${Date.now()}`;
    const targetStatus = status || 'published';

    const nav = navigationStorage.getAll();
    const items = JSON.parse(JSON.stringify(nav.items || []));

    const newSubItem = {
      id: newId,
      name: name.trim(),
      pageTitle: pageTitle || name.trim(),
      slug: finalSlug,
      href: finalHref,
      badge,
      shortDescription,
      description: shortDescription,
      detailedDescription,
      bannerImage,
      thumbnailImage,
      assignedProductIds: Array.isArray(assignedProductIds) ? assignedProductIds : [],
      shortcutButtons: Array.isArray(shortcutButtons) ? shortcutButtons : [],
      status: targetStatus,
      isActive: targetStatus === 'published',
      order: 99,
      seoTitle: seoTitle || `${name} | REXBEBE Luxury Boutique`,
      seoDescription: seoDescription || shortDescription || '',
    };

    const parentItem = items.find((i: any) => i.id === parentId) || items.find((i: any) => i.id === 'nav-shop') || items[0];
    if (parentItem) {
      if (!parentItem.subGroups || parentItem.subGroups.length === 0) {
        parentItem.subGroups = [
          {
            id: `grp-${finalSlug}`,
            title: name.toUpperCase(),
            slug: finalSlug,
            href: finalHref,
            subItems: [],
          },
        ];
      }
      parentItem.subGroups[0].subItems.push(newSubItem);
    } else {
      items.push({
        id: newId,
        name: name.trim(),
        href: finalHref,
        order: items.length + 1,
        isActive: targetStatus === 'published',
        status: targetStatus,
        subGroups: [],
      });
    }

    navigationStorage.updateAll({ items });
    recordAudit('CATEGORY_CREATE', `Created category "${name}" (${finalSlug})`);

    return sendSuccess(res, newSubItem, 'Category created successfully', 201);
  } catch (err) {
    next(err);
  }
};

export const updateCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const nav = navigationStorage.getAll();
    const items = JSON.parse(JSON.stringify(nav.items || []));

    const {
      name,
      pageTitle,
      slug,
      href,
      badge,
      shortDescription,
      detailedDescription,
      bannerImage,
      thumbnailImage,
      assignedProductIds,
      shortcutButtons,
      status,
      seoTitle,
      seoDescription,
    } = req.body;

    let foundItem: any = null;

    // Search top items
    for (const item of items) {
      if (item.id === id || item.slug === id) {
        foundItem = item;
        break;
      }
      for (const grp of item.subGroups || []) {
        for (const sub of grp.subItems || []) {
          if (sub.id === id || sub.slug === id) {
            foundItem = sub;
            break;
          }
        }
        if (foundItem) break;
      }
      if (foundItem) break;
    }

    if (!foundItem) {
      throw new NotFoundError(`Category with identifier '${id}' not found`);
    }

    const finalSlug = slug ? slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') : foundItem.slug;
    const finalHref = href || `/shop/${finalSlug}`;

    if (name !== undefined) foundItem.name = name.trim();
    if (pageTitle !== undefined) foundItem.pageTitle = pageTitle;
    foundItem.slug = finalSlug;
    foundItem.href = finalHref;
    if (badge !== undefined) foundItem.badge = badge;
    if (shortDescription !== undefined) {
      foundItem.shortDescription = shortDescription;
      foundItem.description = shortDescription;
    }
    if (detailedDescription !== undefined) foundItem.detailedDescription = detailedDescription;
    if (bannerImage !== undefined) foundItem.bannerImage = bannerImage;
    if (thumbnailImage !== undefined) foundItem.thumbnailImage = thumbnailImage;
    if (assignedProductIds !== undefined) foundItem.assignedProductIds = assignedProductIds;
    if (shortcutButtons !== undefined) foundItem.shortcutButtons = shortcutButtons;
    if (status !== undefined) {
      foundItem.status = status;
      foundItem.isActive = status === 'published';
    }
    if (seoTitle !== undefined) foundItem.seoTitle = seoTitle;
    if (seoDescription !== undefined) foundItem.seoDescription = seoDescription;

    navigationStorage.updateAll({ items });
    recordAudit('CATEGORY_UPDATE', `Updated category "${foundItem.name}" (${foundItem.id})`);

    return sendSuccess(res, foundItem, 'Changes saved successfully.');
  } catch (err) {
    next(err);
  }
};

export const updateCategoryStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!['published', 'draft', 'unpublished', 'archived'].includes(status)) {
      throw new BadRequestError('Invalid status value');
    }

    const nav = navigationStorage.getAll();
    const items = JSON.parse(JSON.stringify(nav.items || []));
    let found = false;

    for (const item of items) {
      if (item.id === id || item.slug === id) {
        item.status = status;
        item.isActive = status === 'published';
        found = true;
        break;
      }
      for (const grp of item.subGroups || []) {
        for (const sub of grp.subItems || []) {
          if (sub.id === id || sub.slug === id) {
            sub.status = status;
            sub.isActive = status === 'published';
            found = true;
            break;
          }
        }
        if (found) break;
      }
      if (found) break;
    }

    if (!found) {
      throw new NotFoundError(`Category with identifier '${id}' not found`);
    }

    navigationStorage.updateAll({ items });
    recordAudit('CATEGORY_STATUS_CHANGE', `Updated category status ${id} to ${status}`);

    return sendSuccess(res, { id, status }, `Category publication status updated to ${status}.`);
  } catch (err) {
    next(err);
  }
};

export const deleteCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const force = req.query.force === 'true' || req.body?.force === true;
    const reassignTargetId = req.query.reassignTargetId || req.body?.reassignTargetId;

    const list = getUnifiedCategoriesList();
    const targetCat = list.find(c => c.id === id || c.slug === id);
    if (!targetCat) {
      throw new NotFoundError(`Category with identifier '${id}' not found`);
    }

    // SAFE DELETION: Check products using this category
    const products = readJson<any[]>(productsFilePath, []);
    const matchingProducts = products.filter(p => {
      const pCatId = p.category?.id;
      const pCatSlug = p.category?.slug?.toLowerCase();
      const pSubId = p.subcategory?.id;
      const pSubSlug = p.subcategory?.slug?.toLowerCase();
      const targetSlug = targetCat.slug.toLowerCase();

      return (
        pCatId === targetCat.id ||
        pCatSlug === targetSlug ||
        pSubId === targetCat.id ||
        pSubSlug === targetSlug ||
        (targetCat.assignedProductIds && targetCat.assignedProductIds.includes(p.id))
      );
    });

    if (matchingProducts.length > 0 && !force && !reassignTargetId) {
      return res.status(409).json({
        success: false,
        requiresConfirmation: true,
        message: `This category contains ${matchingProducts.length} product${matchingProducts.length > 1 ? 's' : ''}. Choose whether to reassign those products before deleting the category.`,
        productCount: matchingProducts.length,
        categoryName: targetCat.name,
      });
    }

    // Reassign products if requested
    if (matchingProducts.length > 0) {
      if (reassignTargetId && reassignTargetId !== 'none') {
        const targetReassignCat = list.find(c => c.id === reassignTargetId || c.slug === reassignTargetId);
        if (targetReassignCat) {
          matchingProducts.forEach(p => {
            p.category = {
              id: targetReassignCat.id,
              name: targetReassignCat.name,
              slug: targetReassignCat.slug,
            };
          });
          writeJson(productsFilePath, products);
          recordAudit('CATEGORY_REASSIGN', `Reassigned ${matchingProducts.length} products to "${targetReassignCat.name}"`);
        }
      }
    }

    // Remove from navigation tree permanently
    const nav = navigationStorage.getAll();
    const items = JSON.parse(JSON.stringify(nav.items || []));

    let filteredItems = items.filter((i: any) => i.id !== targetCat.id && i.slug !== targetCat.slug);
    filteredItems.forEach((item: any) => {
      (item.subGroups || []).forEach((grp: any) => {
        grp.subItems = (grp.subItems || []).filter((sub: any) => sub.id !== targetCat.id && sub.slug !== targetCat.slug);
      });
    });

    navigationStorage.updateAll({ items: filteredItems });
    recordAudit('CATEGORY_DELETE', `Permanently deleted category "${targetCat.name}" (${targetCat.id})`);

    return sendSuccess(res, { deleted: true, id }, 'The item has been permanently deleted.');
  } catch (err) {
    next(err);
  }
};
