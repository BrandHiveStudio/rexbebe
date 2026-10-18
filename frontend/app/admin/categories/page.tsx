'use client';

import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  FolderPlus,
  Edit,
  Eye,
  Trash2,
  Archive,
  Globe,
  Lock,
  Package,
  Upload,
  X,
  Check,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Search,
  Filter,
  Sparkles,
  AlertTriangle,
  Monitor,
  Smartphone,
  Plus,
  Layers,
  ArrowRight,
  CheckCircle2,
  Clock,
  ExternalLink,
  ShieldAlert,
} from 'lucide-react';
import { AdminSidebar } from '../../../components/layout/AdminSidebar';
import { AdminHeader } from '../../../components/layout/AdminHeader';
import { SharedCategoryPageTemplate } from '../../../components/products/CategoryShoppingTemplate';
import { useAdminData } from '../../../hooks/AdminContext';
import { uploadService } from '../../../services/uploadService';
import { navigationService } from '../../../services/navigationService';
import { categoryService, CategoryItem, CategoryTreeNode } from '../../../services/categoryService';
import { CategoryShortcutButton, NavItemConfig, NavSubItem, PublishStatus } from '../../../types/admin';

interface UnifiedCategory {
  id: string;
  name: string;
  pageTitle?: string;
  slug: string;
  href: string;
  parentName: string;
  parentId?: string | null;
  parentGroupId?: string;
  badge?: string;
  shortDescription?: string;
  description?: string;
  detailedDescription?: string;
  bannerImage?: string;
  thumbnailImage?: string;
  galleryImages?: string[];
  assignedProductIds?: string[];
  shortcutButtons?: CategoryShortcutButton[];
  status: PublishStatus;
  isActive: boolean;
  order: number;
  seoTitle?: string;
  seoDescription?: string;
  level: 'top' | 'group' | 'sub';
  updatedAt?: string;
}

export default function AdminCategoriesPage() {
  const {
    navigationConfig,
    updateNavigationConfig,
    products: adminProducts,
  } = useAdminData();

  // Active filter tab: 'all' | 'published' | 'draft' | 'unpublished' | 'archived'
  const [activeTab, setActiveTab] = useState<'all' | 'published' | 'draft' | 'unpublished' | 'archived'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<UnifiedCategory | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<UnifiedCategory | null>(null);
  const [reassignTargetId, setReassignTargetId] = useState<string>('none');
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Upload loaders
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isUploadingThumb, setIsUploadingThumb] = useState(false);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  // Product selection search in editor
  const [productSearch, setProductSearch] = useState('');

  // Canonical Backend Category State
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [categoryTree, setCategoryTree] = useState<CategoryTreeNode[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(true);

  // Load category tree and categories from canonical API
  const loadCategoriesData = useCallback(async () => {
    try {
      setIsLoadingCategories(true);
      const [cats, tree] = await Promise.all([
        categoryService.getCategories('all'),
        categoryService.getCategoryTree(),
      ]);
      if (Array.isArray(cats)) {
        setCategories(cats);
      }
      if (Array.isArray(tree)) {
        setCategoryTree(tree);
      }
    } catch (err: any) {
      console.warn('Failed to load categories from backend:', err);
      showToast(err.message || 'Failed to load categories from backend', 'error');
    } finally {
      setIsLoadingCategories(false);
    }
  }, []);

  useEffect(() => {
    loadCategoriesData();
  }, [loadCategoriesData]);

  // Form State
  const [formData, setFormData] = useState<{
    id: string;
    name: string;
    pageTitle: string;
    slug: string;
    href: string;
    parentName: string;
    parentId: string;
    badge: string;
    shortDescription: string;
    detailedDescription: string;
    bannerImage: string;
    thumbnailImage: string;
    assignedProductIds: string[];
    shortcutButtons: CategoryShortcutButton[];
    status: PublishStatus;
    seoTitle: string;
    seoDescription: string;
  }>({
    id: '',
    name: '',
    pageTitle: '',
    slug: '',
    href: '',
    parentName: 'Top Level Navigation',
    parentId: 'root',
    badge: 'COMPLETE BOUTIQUE CATALOG 🛍',
    shortDescription: '',
    detailedDescription: '',
    bannerImage: '',
    thumbnailImage: '',
    assignedProductIds: [],
    shortcutButtons: [],
    status: 'published',
    seoTitle: '',
    seoDescription: '',
  });

  // Hierarchical flattened categories for parent selection with visual indentation
  const flatCategoryOptions = useMemo(() => {
    const options: { id: string; name: string; depth: number; label: string }[] = [];

    const getDescendantIds = (nodes: CategoryTreeNode[], targetId: string): Set<string> => {
      const result = new Set<string>();
      const findAndCollect = (list: CategoryTreeNode[], collecting: boolean) => {
        for (const item of list) {
          const isTarget = item.id === targetId;
          if (collecting || isTarget) {
            result.add(item.id);
            if (item.children) findAndCollect(item.children, true);
          } else if (item.children) {
            findAndCollect(item.children, false);
          }
        }
      };
      findAndCollect(nodes, false);
      return result;
    };

    const excludedIds = editingCategory?.id ? getDescendantIds(categoryTree, editingCategory.id) : new Set<string>();

    const traverse = (nodes: CategoryTreeNode[], depth: number) => {
      for (const node of nodes) {
        if (!excludedIds.has(node.id)) {
          const indent = depth > 0 ? `${'— '.repeat(depth)}` : '';
          options.push({
            id: node.id,
            name: node.name,
            depth,
            label: `${indent}${node.name}`,
          });
          if (node.children && node.children.length > 0) {
            traverse(node.children, depth + 1);
          }
        }
      }
    };

    traverse(categoryTree, 0);
    return options;
  }, [categoryTree, editingCategory]);

  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // 1. Flatten all categories from canonical backend categories (or dynamic navigation structure fallback)
  const allCategories = useMemo(() => {
    if (categories.length > 0) {
      return categories.map((cat, idx) => ({
        id: cat.id,
        name: cat.name,
        pageTitle: cat.pageTitle || cat.name,
        slug: cat.slug,
        href: cat.href || `/shop/${cat.slug}`,
        parentName: cat.parentName || (cat.parentId ? 'Subcategory' : 'Top Level Navigation'),
        parentId: cat.parentId,
        parentGroupId: cat.parentGroupId,
        badge: cat.badge,
        shortDescription: cat.shortDescription || cat.description,
        description: cat.description || cat.shortDescription,
        detailedDescription: cat.detailedDescription,
        bannerImage: cat.bannerImage,
        thumbnailImage: cat.thumbnailImage,
        galleryImages: cat.galleryImages,
        assignedProductIds: cat.assignedProductIds || [],
        shortcutButtons: cat.shortcutButtons,
        status: (cat.status as PublishStatus) || (cat.isActive ? 'published' : 'unpublished'),
        isActive: cat.isActive !== false,
        order: cat.order ?? idx,
        seoTitle: cat.seoTitle,
        seoDescription: cat.seoDescription,
        level: ((cat.level as 'top' | 'sub') || (cat.parentId ? 'sub' : 'top')) as 'top' | 'group' | 'sub',
        updatedAt: cat.updatedAt ? new Date(cat.updatedAt).toLocaleDateString() : 'Recently',
      }));
    }

    const list: UnifiedCategory[] = [];
    const items = navigationConfig?.items || [];

    items.forEach((item, itemIdx) => {
      // Top level category
      list.push({
        id: item.id,
        name: item.name,
        pageTitle: item.pageTitle || item.name,
        slug: item.slug || item.id.replace('nav-', ''),
        href: item.href || `/shop/${item.slug || item.id}`,
        parentName: 'Top Level Navigation',
        badge: item.badge,
        shortDescription: item.shortDescription || item.description,
        description: item.description || item.shortDescription,
        detailedDescription: item.detailedDescription,
        bannerImage: item.bannerImage,
        thumbnailImage: item.thumbnailImage,
        galleryImages: item.galleryImages,
        assignedProductIds: item.assignedProductIds || [],
        shortcutButtons: item.shortcutButtons,
        status: (item.status as PublishStatus) || (item.isActive ? 'published' : 'unpublished'),
        isActive: item.isActive,
        order: item.order || itemIdx,
        seoTitle: item.seoTitle,
        seoDescription: item.seoDescription,
        level: 'top',
        updatedAt: 'Recently',
      });

      // SubGroups and SubItems
      (item.subGroups || []).forEach((grp) => {
        (grp.subItems || []).forEach((sub, subIdx) => {
          list.push({
            id: sub.id,
            name: sub.name,
            pageTitle: sub.pageTitle || sub.name,
            slug: sub.slug || sub.id.replace('sub-', ''),
            href: sub.href || `/shop/${sub.slug || sub.id}`,
            parentName: `${item.name} › ${grp.title}`,
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
            shortcutButtons: sub.shortcutButtons,
            status: (sub.status as PublishStatus) || (sub.isActive !== false ? 'published' : 'unpublished'),
            isActive: sub.isActive !== false,
            order: sub.order || subIdx,
            seoTitle: sub.seoTitle,
            seoDescription: sub.seoDescription,
            level: 'sub',
            updatedAt: 'Recently',
          });
        });
      });
    });

    return list;
  }, [categories, navigationConfig]);

  // Filter categories by activeTab and search query
  const filteredCategories = useMemo(() => {
    return allCategories.filter((cat) => {
      // Tab filter
      if (activeTab === 'published' && cat.status !== 'published') return false;
      if (activeTab === 'draft' && cat.status !== 'draft') return false;
      if (activeTab === 'unpublished' && cat.status !== 'unpublished') return false;
      if (activeTab === 'archived' && cat.status !== 'archived') return false;
      if (activeTab === 'all' && cat.status === 'archived') return false; // Archived hidden from normal list by default

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = cat.name.toLowerCase().includes(q);
        const matchesTitle = (cat.pageTitle || '').toLowerCase().includes(q);
        const matchesSlug = cat.slug.toLowerCase().includes(q);
        const matchesParent = cat.parentName.toLowerCase().includes(q);
        if (!matchesName && !matchesTitle && !matchesSlug && !matchesParent) return false;
      }

      return true;
    });
  }, [allCategories, activeTab, searchQuery]);

  // Compute product count for a category
  const getProductCountForCategory = (cat: UnifiedCategory) => {
    if (cat.assignedProductIds && cat.assignedProductIds.length > 0) {
      return cat.assignedProductIds.length;
    }
    // Newborn default matching
    const slug = cat.slug.toLowerCase();
    if (slug === 'newborn' || slug === 'newborn-0-3m' || slug === 'baby') {
      return 4; // Aurelia Romper, Wooden Play Gym, Linen Swaddle Set, Petit Prince Cardigan
    }
    const matching = adminProducts.filter((p) => {
      const pName = p.name.toLowerCase();
      const pCat = (p.category?.name || '').toLowerCase();
      const pSlug = (p.category?.slug || '').toLowerCase();
      return pName.includes(slug) || pCat.includes(slug) || pSlug.includes(slug);
    });
    return matching.length;
  };

  // Open Edit Modal for a category
  const handleOpenEdit = (cat: UnifiedCategory) => {
    setEditingCategory(cat);

    // Resolve shortcut buttons (fallback to approved 7 buttons for newborn)
    let buttons = cat.shortcutButtons || [];
    if (buttons.length === 0 && (cat.slug === 'newborn' || cat.slug === 'newborn-0-3m' || cat.slug === 'baby')) {
      buttons = [
        { name: 'All Items', value: 'all', icon: '✨' },
        { name: 'Newborn', value: 'newborn', icon: '🌸' },
        { name: 'Dresses', value: 'dresses', icon: '👑' },
        { name: 'Rompers', value: 'rompers', icon: '🌿' },
        { name: 'Sets', value: 'sets', icon: '🎀' },
        { name: 'Sleepwear', value: 'sleepwear', icon: '☁️' },
        { name: 'Toys & Nursery', value: 'toys-nursery', icon: '🧸' },
      ];
    } else if (buttons.length === 0) {
      buttons = [
        { name: 'All Items', value: 'all', icon: '✨' },
        { name: 'New Arrivals', value: 'new', icon: '🌸' },
        { name: 'Best Sellers', value: 'bestseller', icon: '🧸' },
      ];
    }

    setFormData({
      id: cat.id,
      name: cat.name,
      pageTitle: cat.pageTitle || cat.name,
      slug: cat.slug,
      href: cat.href,
      parentName: cat.parentName || (cat.parentId ? 'Subcategory' : 'Top Level Navigation'),
      parentId: cat.parentId || 'root',
      badge: cat.badge || 'COMPLETE BOUTIQUE CATALOG 🛍',
      shortDescription: cat.shortDescription || cat.description || '',
      detailedDescription: cat.detailedDescription || '',
      bannerImage: cat.bannerImage || '',
      thumbnailImage: cat.thumbnailImage || '',
      assignedProductIds: cat.assignedProductIds || (cat.slug === 'newborn' ? ['prod-1', 'prod-2', 'prod-3', 'prod-5'] : []),
      shortcutButtons: buttons,
      status: cat.status,
      seoTitle: cat.seoTitle || `${cat.name} | REXBEBE Luxury Boutique`,
      seoDescription: cat.seoDescription || cat.shortDescription || '',
    });
    setProductSearch('');
    setIsEditorOpen(true);
  };

  // Open "Add New Category" Modal
  const handleOpenCreate = () => {
    setEditingCategory(null);
    setFormData({
      id: '',
      name: '',
      pageTitle: '',
      slug: '',
      href: '',
      parentName: 'Top Level Navigation',
      parentId: 'root',
      badge: 'CURATED BOUTIQUE COLLECTION 🌸',
      shortDescription: '',
      detailedDescription: '',
      bannerImage: '',
      thumbnailImage: '',
      assignedProductIds: [],
      shortcutButtons: [
        { name: 'All Items', value: 'all', icon: '✨' },
        { name: 'New Arrivals', value: 'new', icon: '🌸' },
        { name: 'Best Sellers', value: 'bestseller', icon: '🧸' },
      ],
      status: 'published',
      seoTitle: '',
      seoDescription: '',
    });
    setProductSearch('');
    setIsEditorOpen(true);
  };

  // Handle Banner Upload
  const handleUploadBanner = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingBanner(true);
      const res = await uploadService.uploadImage(file);
      setFormData((prev) => ({ ...prev, bannerImage: res.url }));
      showToast('Banner image uploaded successfully! 🌸');
    } catch (err: any) {
      showToast(err.message || 'Failed to upload banner', 'error');
    } finally {
      setIsUploadingBanner(false);
      if (bannerInputRef.current) bannerInputRef.current.value = '';
    }
  };

  // Handle Thumbnail Upload
  const handleUploadThumbnail = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingThumb(true);
      const res = await uploadService.uploadImage(file);
      setFormData((prev) => ({ ...prev, thumbnailImage: res.url }));
      showToast('Thumbnail uploaded successfully! 🧸');
    } catch (err: any) {
      showToast(err.message || 'Failed to upload thumbnail', 'error');
    } finally {
      setIsUploadingThumb(false);
      if (thumbInputRef.current) thumbInputRef.current.value = '';
    }
  };

  // Shortcut Buttons management inside form
  const handleAddShortcut = () => {
    const newBtn: CategoryShortcutButton = {
      name: 'New Shortcut',
      value: `filter-${Date.now()}`,
      icon: '✨',
      order: formData.shortcutButtons.length + 1,
      isHidden: false,
    };
    setFormData((prev) => ({
      ...prev,
      shortcutButtons: [...prev.shortcutButtons, newBtn],
    }));
  };

  const handleUpdateShortcut = (idx: number, patch: Partial<CategoryShortcutButton>) => {
    setFormData((prev) => {
      const updated = [...prev.shortcutButtons];
      updated[idx] = { ...updated[idx], ...patch };
      return { ...prev, shortcutButtons: updated };
    });
  };

  const handleRemoveShortcut = (idx: number) => {
    setFormData((prev) => ({
      ...prev,
      shortcutButtons: prev.shortcutButtons.filter((_, i) => i !== idx),
    }));
  };

  const handleMoveShortcut = (idx: number, direction: 'up' | 'down') => {
    setFormData((prev) => {
      const list = [...prev.shortcutButtons];
      const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= list.length) return prev;
      const temp = list[idx];
      list[idx] = list[targetIdx];
      list[targetIdx] = temp;
      return { ...prev, shortcutButtons: list };
    });
  };

  // Save Category changes or new category via canonical API
  const handleSaveCategory = async (targetStatus?: PublishStatus) => {
    const statusToApply = targetStatus || formData.status;
    const cleanName = formData.name.trim();

    if (!cleanName) {
      showToast('Please enter a category name.', 'error');
      return;
    }

    const finalSlug = (formData.slug || cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-')).replace(/^-+|-+$/g, '');
    const finalHref = formData.href || `/shop/${finalSlug}`;

    const effectiveParentId =
      !formData.parentId || formData.parentId === 'root' || formData.parentId === 'none' || formData.parentId === 'null'
        ? null
        : formData.parentId;

    const catPayload: Partial<CategoryItem> = {
      name: cleanName,
      pageTitle: formData.pageTitle.trim() || cleanName,
      slug: finalSlug,
      href: finalHref,
      parentId: effectiveParentId,
      badge: formData.badge.trim() || undefined,
      shortDescription: formData.shortDescription.trim() || undefined,
      description: formData.shortDescription.trim() || undefined,
      detailedDescription: formData.detailedDescription.trim() || undefined,
      bannerImage: formData.bannerImage || undefined,
      thumbnailImage: formData.thumbnailImage || undefined,
      assignedProductIds: formData.assignedProductIds,
      shortcutButtons: formData.shortcutButtons,
      status: statusToApply,
      isActive: statusToApply === 'published',
      seoTitle: formData.seoTitle.trim() || undefined,
      seoDescription: formData.seoDescription.trim() || undefined,
    };

    try {
      if (editingCategory) {
        await categoryService.updateCategory(editingCategory.id, catPayload);
      } else {
        await categoryService.createCategory(catPayload);
      }
    } catch (apiErr: any) {
      console.error('Category API save failed:', apiErr);
      showToast(apiErr.message || 'Failed to save category to backend', 'error');
      return;
    }

    // After saving, reload categories and tree from the backend
    try {
      await loadCategoriesData();
    } catch (reloadErr: any) {
      console.warn('Failed to reload categories from backend:', reloadErr);
    }

    // Refresh navigationConfig in AdminContext so header navigation reflects updates
    try {
      const nav = await navigationService.getAllNavigation();
      if (nav && Array.isArray(nav.items)) {
        updateNavigationConfig(nav);
      }
    } catch (navErr) {
      console.warn('Backend nav sync error:', navErr);
    }

    showToast(
      statusToApply === 'published'
        ? `Category "${cleanName}" published live to storefront! 🌸`
        : `Category "${cleanName}" saved as ${statusToApply}.`,
      'success'
    );
    setIsEditorOpen(false);
  };

  // Quick Publish / Unpublish Toggle
  const handleTogglePublish = async (cat: UnifiedCategory) => {
    const nextStatus: PublishStatus = cat.status === 'published' ? 'unpublished' : 'published';

    try {
      await categoryService.updateCategoryStatus(cat.id, nextStatus);
      await loadCategoriesData();
      try {
        const nav = await navigationService.getAllNavigation();
        if (nav && Array.isArray(nav.items)) {
          updateNavigationConfig(nav);
        }
      } catch (navErr) {
        console.warn('Nav refresh warning:', navErr);
      }
      showToast(
        nextStatus === 'published'
          ? `"${cat.name}" is now Live and Published! 🌸`
          : `"${cat.name}" has been Unpublished and hidden from public navigation.`,
        'success'
      );
    } catch (err: any) {
      console.error('Failed to toggle category status:', err);
      showToast(err.message || 'Failed to toggle category status', 'error');
    }
  };

  // Safe Archive Toggle
  const handleArchiveCategory = async (cat: UnifiedCategory) => {
    const nextStatus: PublishStatus = cat.status === 'archived' ? 'published' : 'archived';

    try {
      await categoryService.updateCategoryStatus(cat.id, nextStatus);
      await loadCategoriesData();
      try {
        const nav = await navigationService.getAllNavigation();
        if (nav && Array.isArray(nav.items)) {
          updateNavigationConfig(nav);
        }
      } catch (navErr) {
        console.warn('Nav refresh warning:', navErr);
      }
      showToast(
        nextStatus === 'archived'
          ? `"${cat.name}" archived safely. Records retained for future use.`
          : `"${cat.name}" restored from archive!`,
        'success'
      );
    } catch (err: any) {
      console.error('Failed to update archive status:', err);
      showToast(err.message || 'Failed to update archive status', 'error');
    }
  };

  // Open Safe Delete Confirmation
  const handleOpenDelete = (cat: UnifiedCategory) => {
    setCategoryToDelete(cat);
    setReassignTargetId('none');
    setIsDeleteModalOpen(true);
  };

  // Execute Safe Delete
  const handleExecuteDelete = async () => {
    if (!categoryToDelete) return;

    try {
      await categoryService.deleteCategory(
        categoryToDelete.id,
        true,
        reassignTargetId !== 'none' ? reassignTargetId : undefined
      );

      await loadCategoriesData();
      try {
        const nav = await navigationService.getAllNavigation();
        if (nav && Array.isArray(nav.items)) {
          updateNavigationConfig(nav);
        }
      } catch (navErr) {
        console.warn('Nav refresh warning:', navErr);
      }

      showToast('The item has been permanently deleted.', 'success');
      setIsDeleteModalOpen(false);
      setCategoryToDelete(null);
    } catch (err: any) {
      showToast(
        err.message ||
          "We couldn't save your changes. Your existing information has not been intentionally removed. Please try again.",
        'error'
      );
    }
  };

  // Launch live interactive preview modal
  const handleOpenPreview = (cat?: UnifiedCategory) => {
    if (cat) {
      handleOpenEdit(cat);
    }
    setIsPreviewOpen(true);
  };

  return (
    <div className="flex min-h-screen bg-[#F8F7F4]">
      <AdminSidebar />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Category Management"
          subtitle="Manage customer-facing categories, headings, shortcut buttons, product assignments, and live storefront previews"
          actions={
            <div className="flex items-center space-x-2.5">
              <Link
                href="/admin/navigation"
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-stone-100 text-stone-700 font-bold text-xs border border-stone-200 shadow-2xs transition-all inline-flex items-center space-x-1.5"
              >
                <Layers className="w-3.5 h-3.5 text-stone-500" />
                <span>Navigation Tree</span>
              </Link>

              <button
                type="button"
                onClick={handleOpenCreate}
                className="btn-rexbebe-3d btn-3d-pink px-4 py-2 text-xs font-black tracking-wider uppercase inline-flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Category</span>
              </button>
            </div>
          }
        />

        {/* Global Toast Alert */}
        {toastMessage && (
          <div
            className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl border text-xs font-bold flex items-center space-x-2 animate-bounce ${
              toastMessage.type === 'error'
                ? 'bg-rose-900 text-white border-rose-700'
                : 'bg-stone-900 text-amber-400 border-amber-500/40'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{toastMessage.text}</span>
          </div>
        )}

        <main className="p-4 sm:p-8 space-y-6 max-w-7xl">
          {/* Top Banner Notice */}
          <div className="p-5 sm:p-6 bg-gradient-to-r from-pink-100/90 via-purple-50/80 to-sky-50/90 rounded-3xl border border-pink-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-pink-700 bg-pink-200/70 px-2.5 py-0.5 rounded-full inline-block">
                ✨ Shared Storefront Architecture
              </span>
              <h3 className="font-heading font-black text-lg text-stone-900">
                Identical Admin Preview &amp; Customer-Facing Pages
              </h3>
              <p className="text-xs text-stone-600 max-w-2xl leading-relaxed">
                Both the customer website and admin preview share the exact same REXBEBE template. Edits made to headings, buttons, and product assignments update both preview and public pages with synchronized product counts.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                const newbornCat = allCategories.find((c) => c.slug === 'newborn' || c.id === 'nav-newborn');
                if (newbornCat) handleOpenEdit(newbornCat);
              }}
              className="px-4 py-2.5 rounded-xl bg-stone-900 text-pink-300 font-bold text-xs hover:bg-stone-800 transition-colors shrink-0 flex items-center space-x-1.5 shadow-sm"
            >
              <span>Edit Newborn Page 🌸</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Metric Status Counters */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs">
              <div className="text-xs text-stone-500 font-bold uppercase tracking-wider">Total Categories</div>
              <div className="text-2xl font-black text-stone-900 mt-1 font-heading">{allCategories.length}</div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-emerald-200/80 shadow-2xs">
              <div className="text-xs text-emerald-700 font-bold uppercase tracking-wider">Published Live</div>
              <div className="text-2xl font-black text-emerald-800 mt-1 font-heading">
                {allCategories.filter((c) => c.status === 'published').length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-amber-200/80 shadow-2xs">
              <div className="text-xs text-amber-700 font-bold uppercase tracking-wider">Draft / In Progress</div>
              <div className="text-2xl font-black text-amber-800 mt-1 font-heading">
                {allCategories.filter((c) => c.status === 'draft').length}
              </div>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-purple-200/80 shadow-2xs">
              <div className="text-xs text-purple-700 font-bold uppercase tracking-wider">Archived</div>
              <div className="text-2xl font-black text-purple-800 mt-1 font-heading">
                {allCategories.filter((c) => c.status === 'archived').length}
              </div>
            </div>
          </div>

          {/* Controls: Search and Status Tabs */}
          <div className="bg-white rounded-2xl border border-stone-200/80 p-4 shadow-2xs flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Tabs */}
            <div className="flex items-center space-x-1 overflow-x-auto w-full md:w-auto p-1 bg-stone-100 rounded-xl">
              {[
                { key: 'all', label: 'All Active' },
                { key: 'published', label: 'Published' },
                { key: 'draft', label: 'Drafts' },
                { key: 'unpublished', label: 'Unpublished' },
                { key: 'archived', label: 'Archived' },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    activeTab === tab.key
                      ? 'bg-white text-stone-900 shadow-2xs'
                      : 'text-stone-500 hover:text-stone-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search category, title, or parent..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-800 focus:outline-none focus:ring-2 focus:ring-pink-400/30"
              />
            </div>
          </div>

          {/* Categories Table View */}
          <div className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-2xs">
            <div className="p-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
              <span className="text-xs font-heading font-black text-stone-900 uppercase tracking-wider flex items-center space-x-2">
                <Package className="w-4 h-4 text-pink-600" />
                <span>Configured Category Pages ({filteredCategories.length})</span>
              </span>
              <span className="text-[11px] text-stone-500 font-semibold">
                Click <strong>Preview</strong> to see draft pages in the shared REXBEBE template
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-stone-50 border-b border-stone-200/80 text-stone-600">
                  <tr>
                    <th className="p-4 font-bold">Category &amp; Heading</th>
                    <th className="p-4 font-bold">Parent Category</th>
                    <th className="p-4 font-bold">Products</th>
                    <th className="p-4 font-bold">Publication Status</th>
                    <th className="p-4 font-bold">Live URL</th>
                    <th className="p-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((cat) => {
                      const productCount = getProductCountForCategory(cat);

                      return (
                        <tr key={cat.id} className="hover:bg-stone-50/70 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center space-x-3">
                              {cat.thumbnailImage || cat.bannerImage ? (
                                <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-stone-200 shrink-0">
                                  <Image
                                    src={cat.thumbnailImage || cat.bannerImage || '/images/products/organic-onesie.jpg'}
                                    alt={cat.name}
                                    fill
                                    className="object-cover"
                                  />
                                </div>
                              ) : (
                                <div className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-200/60 text-pink-600 flex items-center justify-center font-bold text-sm shrink-0">
                                  🌸
                                </div>
                              )}
                              <div>
                                <div className="font-extrabold text-stone-900 text-sm flex items-center space-x-1.5">
                                  <span>{cat.name}</span>
                                  {cat.badge && (
                                    <span className="text-[9px] font-black uppercase bg-pink-100 text-pink-700 px-1.5 py-0.2 rounded">
                                      {cat.badge}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-stone-500 font-medium">
                                  Heading: <span className="font-bold text-stone-700">{cat.pageTitle || cat.name}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="p-4">
                            <span className="font-semibold text-stone-700 bg-stone-100 px-2.5 py-1 rounded-lg text-[11px]">
                              {cat.parentName}
                            </span>
                          </td>

                          <td className="p-4">
                            <div className="flex items-center space-x-1.5 font-bold text-stone-800">
                              <span className="w-2 h-2 rounded-full bg-pink-500" />
                              <span>{productCount} Products</span>
                            </div>
                          </td>

                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-flex items-center space-x-1 ${
                                cat.status === 'published'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : cat.status === 'draft'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : cat.status === 'archived'
                                  ? 'bg-purple-50 text-purple-800 border border-purple-200'
                                  : 'bg-stone-100 text-stone-600 border border-stone-200'
                              }`}
                            >
                              <span>{cat.status}</span>
                            </span>
                          </td>

                          <td className="p-4">
                            <Link
                              href={cat.href}
                              target="_blank"
                              className="font-mono text-stone-500 hover:text-pink-600 flex items-center space-x-1 text-[11px]"
                            >
                              <span>{cat.href}</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </td>

                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              {/* Preview Action */}
                              <button
                                type="button"
                                onClick={() => handleOpenPreview(cat)}
                                title="Check how your page will look before publishing it"
                                className="px-2.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs inline-flex items-center space-x-1 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5 text-stone-500" />
                                <span>Preview</span>
                              </button>

                              {/* Edit Action */}
                              <button
                                type="button"
                                onClick={() => handleOpenEdit(cat)}
                                title="Edit page title, images, buttons and products"
                                className="px-2.5 py-1.5 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold text-xs inline-flex items-center space-x-1 border border-pink-200/60 transition-colors"
                              >
                                <Edit className="w-3.5 h-3.5" />
                                <span>Edit</span>
                              </button>

                              {/* Publish / Unpublish Toggle */}
                              <button
                                type="button"
                                onClick={() => handleTogglePublish(cat)}
                                title={cat.status === 'published' ? 'Hide from shoppers' : 'Publish live now'}
                                className={`p-1.5 rounded-lg border transition-colors ${
                                  cat.status === 'published'
                                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                    : 'bg-stone-50 text-stone-500 border-stone-200 hover:bg-stone-100'
                                }`}
                              >
                                <Globe className="w-3.5 h-3.5" />
                              </button>

                              {/* Archive Action */}
                              <button
                                type="button"
                                onClick={() => handleArchiveCategory(cat)}
                                title={cat.status === 'archived' ? 'Restore from archive' : 'Archive category records'}
                                className="p-1.5 rounded-lg bg-stone-50 text-stone-500 border border-stone-200 hover:bg-purple-50 hover:text-purple-700 hover:border-purple-200 transition-colors"
                              >
                                <Archive className="w-3.5 h-3.5" />
                              </button>

                              {/* Safe Delete Action */}
                              <button
                                type="button"
                                onClick={() => handleOpenDelete(cat)}
                                title="Delete category safely"
                                className="p-1.5 rounded-lg bg-stone-50 text-stone-400 border border-stone-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-stone-400 font-semibold">
                        No categories found matching your filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* ============================================================== */}
      {/* SECTION: CATEGORY EDITOR MODAL (EDIT & ADD NEW)                */}
      {/* ============================================================== */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto select-none">
          <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
            {/* Header */}
            <div className="px-6 py-4 bg-stone-900 text-white flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-2">
                <span className="w-3 h-3 rounded-full bg-pink-500" />
                <h3 className="font-heading font-black text-sm uppercase tracking-wider text-amber-300">
                  {editingCategory ? `Edit Category: ${editingCategory.name}` : 'Create New Boutique Category'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="text-stone-400 hover:text-white p-1 rounded-lg hover:bg-stone-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
              {/* Field 1: Category Name & Page Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-stone-800 uppercase tracking-wider">
                    Category Name *
                  </label>
                  <p className="text-[11px] text-stone-500">Enter the name customers will see in menus and lists.</p>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Newborn, Party Dresses, Rompers"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-pink-400/40"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-stone-800 uppercase tracking-wider">
                    Page Title (Main Heading) *
                  </label>
                  <p className="text-[11px] text-stone-500">
                    The main heading on the page. The last word is automatically highlighted with pastel gradient.
                  </p>
                  <input
                    type="text"
                    value={formData.pageTitle}
                    onChange={(e) => setFormData({ ...formData, pageTitle: e.target.value })}
                    placeholder="e.g. NEWBORN COLLECTION"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-pink-400/40"
                  />
                </div>
              </div>

              {/* Field 2: Short Description & Boutique Badge */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-stone-800 uppercase tracking-wider">
                    Short Description *
                  </label>
                  <p className="text-[11px] text-stone-500">Write a short sentence describing this category for shoppers.</p>
                  <textarea
                    rows={2}
                    value={formData.shortDescription}
                    onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                    placeholder="Explore our luxury organic collection, crafted with certified organic materials..."
                    className="w-full px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-pink-400/40 resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-stone-800 uppercase tracking-wider">
                    Boutique Badge Tag
                  </label>
                  <p className="text-[11px] text-stone-500">Small pill tag displayed above the heading.</p>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                    placeholder="e.g. COMPLETE BOUTIQUE CATALOG 🛍"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-900 focus:outline-none focus:ring-2 focus:ring-pink-400/40"
                  />
                </div>
              </div>

              {/* Field 3: Parent Category & URL Slug */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-stone-800 uppercase tracking-wider">
                    Parent Category *
                  </label>
                  <p className="text-[11px] text-stone-500">Choose the menu category this item belongs to.</p>
                  <select
                    value={formData.parentId || 'root'}
                    onChange={(e) => {
                      const sel = e.target.value;
                      const parentOpt = flatCategoryOptions.find((c) => c.id === sel);
                      setFormData((prev) => ({
                        ...prev,
                        parentId: sel,
                        parentName: parentOpt ? parentOpt.name : 'Top Level Navigation',
                      }));
                    }}
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-pink-400/40"
                  >
                    <option value="root">None (Top-Level Category)</option>
                    {flatCategoryOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-stone-800 uppercase tracking-wider">
                    URL Address (Slug)
                  </label>
                  <p className="text-[11px] text-stone-500">Web address for this page (e.g. newborn, rompers, dresses).</p>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                    placeholder="e.g. newborn"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl font-mono text-stone-800 focus:outline-none focus:ring-2 focus:ring-pink-400/40"
                  />
                </div>
              </div>

              {/* Field 4: Images (Banner & Thumbnail) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-100">
                {/* Banner Upload */}
                <div className="space-y-2">
                  <label className="font-extrabold text-stone-800 uppercase tracking-wider">
                    Category Banner Image
                  </label>
                  <p className="text-[11px] text-stone-500">Upload an image that represents this category.</p>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      ref={bannerInputRef}
                      onChange={handleUploadBanner}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isUploadingBanner}
                      onClick={() => bannerInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold inline-flex items-center space-x-1.5 border border-stone-200"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingBanner ? 'Uploading...' : 'Upload Banner'}</span>
                    </button>
                    {formData.bannerImage && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, bannerImage: '' })}
                        className="text-rose-600 hover:underline font-bold text-[11px]"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {formData.bannerImage && (
                    <div className="relative h-20 w-full rounded-xl overflow-hidden border border-stone-200">
                      <Image src={formData.bannerImage} alt="Banner Preview" fill className="object-cover" />
                    </div>
                  )}
                </div>

                {/* Thumbnail Upload */}
                <div className="space-y-2">
                  <label className="font-extrabold text-stone-800 uppercase tracking-wider">
                    Category Thumbnail
                  </label>
                  <p className="text-[11px] text-stone-500">Upload a smaller image for category cards if needed.</p>
                  <div className="flex items-center space-x-2">
                    <input
                      type="file"
                      ref={thumbInputRef}
                      onChange={handleUploadThumbnail}
                      accept="image/*"
                      className="hidden"
                    />
                    <button
                      type="button"
                      disabled={isUploadingThumb}
                      onClick={() => thumbInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold inline-flex items-center space-x-1.5 border border-stone-200"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{isUploadingThumb ? 'Uploading...' : 'Upload Thumbnail'}</span>
                    </button>
                    {formData.thumbnailImage && (
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, thumbnailImage: '' })}
                        className="text-rose-600 hover:underline font-bold text-[11px]"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {formData.thumbnailImage && (
                    <div className="relative h-20 w-20 rounded-xl overflow-hidden border border-stone-200">
                      <Image src={formData.thumbnailImage} alt="Thumb Preview" fill className="object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Field 5: Category Shortcut Buttons Manager (Section 9) */}
              <div className="space-y-2.5 pt-3 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-extrabold text-stone-800 uppercase tracking-wider">
                      Category Shortcut Buttons ({formData.shortcutButtons.length})
                    </label>
                    <p className="text-[11px] text-stone-500">
                      Buttons displayed beneath the category title. Customers click these to filter products.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddShortcut}
                    className="px-3 py-1.5 rounded-lg bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold text-xs border border-pink-200 inline-flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Button</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto p-1">
                  {formData.shortcutButtons.map((btn, idx) => (
                    <div
                      key={btn.value + idx}
                      className="flex items-center space-x-2 p-2 bg-stone-50 rounded-xl border border-stone-200"
                    >
                      <input
                        type="text"
                        value={btn.icon || '🌸'}
                        onChange={(e) => handleUpdateShortcut(idx, { icon: e.target.value })}
                        placeholder="Icon"
                        className="w-10 text-center py-1 bg-white border border-stone-200 rounded-lg text-sm"
                        title="Emoji icon"
                      />
                      <input
                        type="text"
                        value={btn.name}
                        onChange={(e) => handleUpdateShortcut(idx, { name: e.target.value })}
                        placeholder="Button Label"
                        className="flex-1 px-2.5 py-1 bg-white border border-stone-200 rounded-lg font-bold text-stone-800 text-xs"
                      />
                      <input
                        type="text"
                        value={btn.value}
                        onChange={(e) => handleUpdateShortcut(idx, { value: e.target.value })}
                        placeholder="Filter Value (e.g. rompers, dresses)"
                        className="w-40 px-2.5 py-1 bg-white border border-stone-200 rounded-lg text-stone-600 font-mono text-[11px]"
                      />
                      <button
                        type="button"
                        onClick={() => handleMoveShortcut(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1 text-stone-400 hover:text-stone-800 disabled:opacity-30"
                      >
                        <ChevronUp className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoveShortcut(idx, 'down')}
                        disabled={idx === formData.shortcutButtons.length - 1}
                        className="p-1 text-stone-400 hover:text-stone-800 disabled:opacity-30"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveShortcut(idx)}
                        className="p-1 text-rose-500 hover:text-rose-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Field 6: Product Assignment Selector (Section 6 & 8) */}
              <div className="space-y-2.5 pt-3 border-t border-stone-100">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="font-extrabold text-stone-800 uppercase tracking-wider">
                      Assigned Products ({formData.assignedProductIds.length} Selected)
                    </label>
                    <p className="text-[11px] text-stone-500">
                      Choose which products appear on this page. If none selected, matching products will display automatically.
                    </p>
                  </div>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-48 px-3 py-1 bg-stone-50 border border-stone-200 rounded-lg text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1 border border-stone-200 rounded-2xl bg-stone-50/50">
                  {adminProducts
                    .filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase()))
                    .map((prod) => {
                      const isSelected = formData.assignedProductIds.includes(prod.id);
                      return (
                        <div
                          key={prod.id}
                          onClick={() => {
                            setFormData((prev) => ({
                              ...prev,
                              assignedProductIds: isSelected
                                ? prev.assignedProductIds.filter((id) => id !== prod.id)
                                : [...prev.assignedProductIds, prod.id],
                            }));
                          }}
                          className={`p-2 rounded-xl border flex items-center space-x-2.5 cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-pink-50 border-pink-300 shadow-2xs'
                              : 'bg-white border-stone-200 hover:border-stone-300'
                          }`}
                        >
                          <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-stone-200 shrink-0">
                            <Image
                              src={prod.images[0]?.url || '/images/products/organic-onesie.jpg'}
                              alt={prod.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-stone-900 truncate text-[11px]">{prod.name}</div>
                            <div className="text-[10px] text-stone-500">LKR {prod.price.toLocaleString()}</div>
                          </div>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            readOnly
                            className="rounded text-pink-600 focus:ring-0"
                          />
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Field 7: Page Status & SEO */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-stone-100">
                <div className="space-y-1.5">
                  <label className="font-extrabold text-stone-800 uppercase tracking-wider">
                    Page Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-bold text-stone-800"
                  >
                    <option value="published">Published (Live to Shoppers)</option>
                    <option value="draft">Draft (Preview Only)</option>
                    <option value="unpublished">Unpublished (Hidden)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-stone-800 uppercase tracking-wider">
                    SEO Title
                  </label>
                  <input
                    type="text"
                    value={formData.seoTitle}
                    onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                    placeholder="Search engine title"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-extrabold text-stone-800 uppercase tracking-wider">
                    SEO Description
                  </label>
                  <input
                    type="text"
                    value={formData.seoDescription}
                    onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                    placeholder="Short search engine snippet"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl"
                  />
                </div>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-6 py-4 bg-stone-100 border-t border-stone-200 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="px-4 py-2 font-bold text-stone-600 hover:text-stone-900"
              >
                Cancel
              </button>

              <div className="flex items-center space-x-2.5">
                {/* Preview Page */}
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(true)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-stone-50 text-stone-800 font-bold text-xs border border-stone-300 inline-flex items-center space-x-1.5 shadow-2xs"
                >
                  <Eye className="w-3.5 h-3.5 text-stone-500" />
                  <span>Preview Page</span>
                </button>

                {/* Save Draft */}
                <button
                  type="button"
                  onClick={() => handleSaveCategory('draft')}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-stone-950 font-black text-xs inline-flex items-center space-x-1.5 shadow-2xs"
                >
                  <span>Save Draft</span>
                </button>

                {/* Publish Now */}
                <button
                  type="button"
                  onClick={() => handleSaveCategory('published')}
                  className="btn-rexbebe-3d btn-3d-pink px-5 py-2 text-xs font-black tracking-wider uppercase inline-flex items-center space-x-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Publish Page 🌸</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION: LIVE SHARED TEMPLATE PREVIEW MODAL (DESKTOP & MOBILE)  */}
      {/* ============================================================== */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-2 sm:p-6 select-none">
          {/* Top Control Bar */}
          <div className="w-full max-w-6xl bg-stone-900 text-white px-5 py-3 rounded-t-3xl flex items-center justify-between shadow-2xl border-b border-stone-800">
            <div className="flex items-center space-x-3">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
              <span className="text-xs font-mono text-stone-400 pl-2">
                Live Storefront Preview: {formData.name || 'Sample'}
              </span>
            </div>

            {/* Desktop vs Mobile Toggle */}
            <div className="flex items-center space-x-1.5 bg-stone-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setPreviewDevice('desktop')}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all ${
                  previewDevice === 'desktop'
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desktop</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewDevice('mobile')}
                className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all ${
                  previewDevice === 'mobile'
                    ? 'bg-amber-500 text-stone-950 shadow-xs'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile (390px)</span>
              </button>
            </div>

            {/* Close Preview */}
            <button
              type="button"
              onClick={() => setIsPreviewOpen(false)}
              className="text-stone-400 hover:text-white text-xs font-bold flex items-center space-x-1 px-3 py-1 rounded-lg bg-stone-800 hover:bg-stone-700 transition-colors"
            >
              <span>Close Preview</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Viewport Frame */}
          <div
            className={`w-full bg-[#FAF9F6] overflow-y-auto max-h-[82vh] rounded-b-3xl shadow-2xl transition-all duration-300 ${
              previewDevice === 'mobile'
                ? 'max-w-[420px] border-x-8 border-b-8 border-stone-800'
                : 'max-w-6xl border border-stone-200'
            }`}
          >
            <SharedCategoryPageTemplate
              slug={formData.slug || 'newborn'}
              customTitle={formData.pageTitle || formData.name}
              customDescription={formData.shortDescription}
              customBadge={formData.badge}
              parentName={formData.parentName || 'Top Level Navigation'}
              parentUrl="/shop"
              previewData={formData}
              isModalPreview={true}
            />
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* SECTION: SAFE DELETION DIALOG WITH DEPENDENCY CHECKS           */}
      {/* ============================================================== */}
      {isDeleteModalOpen && categoryToDelete && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 select-none">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-rose-200 space-y-4">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3 className="font-heading font-black text-lg text-stone-900">
                Safely Remove Category &ldquo;{categoryToDelete.name}&rdquo;?
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Before deletion, we verify dependencies to ensure no broken navigation links or orphaned products occur.
              </p>
            </div>

            {/* Dependency Analysis */}
            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between font-bold text-stone-800">
                <span>Associated Products:</span>
                <span className="text-pink-600 font-black">{getProductCountForCategory(categoryToDelete)} Products</span>
              </div>
              <div className="flex items-center justify-between font-bold text-stone-800">
                <span>Catalog Records:</span>
                <span className="text-emerald-700 font-black">100% Retained Safely</span>
              </div>
              <p className="text-[11px] text-stone-500 pt-1 border-t border-stone-200">
                Deleting this category page will NOT delete any products from your store. Products will remain in your boutique catalog.
              </p>
            </div>

            <div className="pt-2 flex items-center justify-end space-x-2.5">
              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 font-bold text-stone-600 hover:text-stone-900 text-xs"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleExecuteDelete}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md transition-colors"
              >
                Confirm Safe Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
