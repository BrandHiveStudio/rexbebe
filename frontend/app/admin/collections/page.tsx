'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Compass,
  Plus,
  Edit2,
  Trash2,
  Eye,
  Check,
  Upload,
  Sparkles,
  ExternalLink,
  Package,
  Search,
  CheckCircle2,
  AlertCircle,
  X,
  RotateCcw,
  Smartphone,
  Monitor,
  MoveUp,
  MoveDown,
} from 'lucide-react';
import { AdminSidebar } from '../../../components/layout/AdminSidebar';
import { AdminHeader } from '../../../components/layout/AdminHeader';
import { useAdminData } from '../../../hooks/AdminContext';
import { uploadService } from '../../../services/uploadService';
import { formatCurrency } from '../../../utils/formatCurrency';

interface CollectionItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  bannerImage: string;
  assignedProductIds: string[];
  order: number;
  status: 'published' | 'draft';
  badge?: string;
}

const DEFAULT_COLLECTIONS: CollectionItem[] = [
  {
    id: 'col-everyday',
    name: 'Everyday Essentials',
    slug: 'everyday-essentials',
    description:
      'Cloud-soft organic rompers, breathable bodysuits, and gentle swaddles crafted for daily baby comfort.',
    bannerImage: '/images/products/organic-onesie.jpg',
    assignedProductIds: ['prod-1', 'prod-2', 'prod-3'],
    order: 1,
    status: 'published',
    badge: 'ESSENTIALS',
  },
  {
    id: 'col-festive',
    name: 'Festive Collection',
    slug: 'festive-collection',
    description:
      'Charming party dresses, delicate lace details, and heirloom cashmere cardigans for milestone family moments.',
    bannerImage: '/images/products/baby-girl-fashion.jpg',
    assignedProductIds: ['prod-2', 'prod-3', 'prod-5'],
    order: 2,
    status: 'published',
    badge: 'ROYAL PARTY 👑',
  },
  {
    id: 'col-cashmere',
    name: 'Atelier Cashmere',
    slug: 'atelier-cashmere',
    description:
      'Pure Mongolian organic cashmere knits, temperature-regulating cardigans, and heirloom blankets.',
    bannerImage: '/images/products/baby-boy-fashion.jpg',
    assignedProductIds: ['prod-1', 'prod-4'],
    order: 3,
    status: 'published',
    badge: 'HEIRLOOM KNITS',
  },
  {
    id: 'col-nursery',
    name: 'Scandinavian Wooden Toys',
    slug: 'scandinavian-toys',
    description:
      'Solid beechwood activity gyms, crochet rattles, and non-toxic Montessori nursery decor.',
    bannerImage: '/images/products/wooden-gym.jpg',
    assignedProductIds: ['prod-4', 'prod-6'],
    order: 4,
    status: 'published',
    badge: 'MONTESSORI',
  },
];

const STORAGE_KEY = 'rexbebe_admin_collections';

export default function AdminCollectionsPage() {
  const { products: allProducts } = useAdminData();
  const [collections, setCollections] = useState<CollectionItem[]>(DEFAULT_COLLECTIONS);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<CollectionItem | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);

  const bannerInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setCollections(JSON.parse(saved));
      }
    } catch {
      // Use defaults
    }
  }, []);

  const saveCollections = (updated: CollectionItem[]) => {
    setCollections(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenAdd = () => {
    const newCol: CollectionItem = {
      id: `col-${Date.now()}`,
      name: '',
      slug: '',
      description: '',
      bannerImage: '/images/products/organic-onesie.jpg',
      assignedProductIds: [],
      order: collections.length + 1,
      status: 'published',
      badge: '',
    };
    setEditingCollection(newCol);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (col: CollectionItem) => {
    setEditingCollection({ ...col });
    setIsEditorOpen(true);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete the collection "${name}"?`)) {
      const updated = collections.filter((c) => c.id !== id);
      saveCollections(updated);
      showToast('Collection removed successfully');
    }
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingCollection) return;
    setIsUploadingBanner(true);
    try {
      const res = await uploadService.uploadImage(file);
      setEditingCollection({ ...editingCollection, bannerImage: res.url });
      showToast('Banner image uploaded successfully!');
    } catch (err: any) {
      showToast(err.message || 'Could not upload image');
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleToggleProduct = (productId: string) => {
    if (!editingCollection) return;
    const current = editingCollection.assignedProductIds || [];
    const exists = current.includes(productId);
    const updated = exists ? current.filter((id) => id !== productId) : [...current, productId];
    setEditingCollection({ ...editingCollection, assignedProductIds: updated });
  };

  const handleSaveCollection = (status: 'published' | 'draft') => {
    if (!editingCollection) return;
    if (!editingCollection.name.trim()) {
      showToast('Please enter a Collection Title');
      return;
    }

    const cleanSlug =
      editingCollection.slug.trim() ||
      editingCollection.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const updatedCol: CollectionItem = {
      ...editingCollection,
      slug: cleanSlug,
      status,
    };

    const exists = collections.find((c) => c.id === updatedCol.id);
    let updatedList: CollectionItem[];
    if (exists) {
      updatedList = collections.map((c) => (c.id === updatedCol.id ? updatedCol : c));
    } else {
      updatedList = [...collections, updatedCol];
    }

    saveCollections(updatedList);
    setIsEditorOpen(false);
    showToast(status === 'published' ? 'Collection published! 🌸' : 'Collection draft saved!');
  };

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return allProducts;
    const q = productSearch.toLowerCase();
    return allProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.category.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
    );
  }, [allProducts, productSearch]);

  return (
    <div className="flex min-h-screen bg-[#FBF9F5]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Collections"
          subtitle="Create groups of products that belong together, such as Everyday Essentials or Festive Collection."
          actions={
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={handleOpenAdd}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs shadow-md shadow-amber-900/10 transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add a Collection</span>
              </button>
            </div>
          }
        />

        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-20 right-8 z-50 px-5 py-3 rounded-2xl bg-stone-900 text-amber-400 border border-amber-500/30 text-xs font-bold shadow-xl animate-fadeIn flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        <main className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Introduction Card */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200/80 shadow-2xs space-y-2">
            <div className="flex items-center space-x-2 text-amber-800 text-xs font-bold">
              <Compass className="w-4 h-4" />
              <span>PRODUCT CAPSULE GROUPS</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-600 font-medium">
              Collections group matching baby clothes into beautiful themes. Each published
              collection automatically gets its own shopping page (for example:{' '}
              <code className="text-stone-800 font-bold bg-stone-100 px-1.5 py-0.5 rounded">
                /collections/everyday-essentials
              </code>
              ).
            </p>
          </div>

          {/* Collections Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {collections.map((col) => (
              <div
                key={col.id}
                className="bg-white rounded-3xl border border-stone-200/80 shadow-2xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between group"
              >
                <div>
                  <div className="h-44 w-full relative bg-stone-100 overflow-hidden">
                    <Image
                      src={col.bannerImage || '/images/products/organic-onesie.jpg'}
                      alt={col.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex items-center space-x-2">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-2xs ${
                          col.status === 'published'
                            ? 'bg-emerald-100/90 text-emerald-800 border border-emerald-300'
                            : 'bg-amber-100/90 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {col.status === 'published' ? '● Published' : '● Draft'}
                      </span>
                      {col.badge && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 text-amber-900 border border-amber-200 shadow-2xs">
                          {col.badge}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="font-heading font-black text-base text-stone-900">{col.name}</h3>
                      <Link
                        href={`/collections/${col.slug}`}
                        target="_blank"
                        className="text-[11px] font-bold text-amber-800 hover:text-amber-900 flex items-center space-x-1"
                      >
                        <span>View</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>

                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                      {col.description}
                    </p>

                    <div className="pt-2 flex items-center space-x-2 text-xs text-stone-600 font-bold">
                      <Package className="w-3.5 h-3.5 text-stone-400" />
                      <span>{col.assignedProductIds.length} Products Assigned</span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0 flex items-center justify-between border-t border-stone-100 mt-2">
                  <span className="text-[11px] font-mono font-bold text-stone-400">
                    Order #{col.order}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(col)}
                      className="px-3.5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs shadow-2xs flex items-center space-x-1"
                    >
                      <Edit2 className="w-3 h-3" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(col.id, col.name)}
                      className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete Collection"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Collection Editor Drawer */}
      {isEditorOpen && editingCollection && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-slideLeft overflow-hidden">
            <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-[#FAF9F6]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                  Collection Studio
                </span>
                <h3 className="text-lg font-heading font-black text-stone-900">
                  {editingCollection.name ? `Edit: ${editingCollection.name}` : '+ Add New Collection'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsEditorOpen(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs font-semibold">
              {/* Collection Title */}
              <div className="space-y-1">
                <label className="text-stone-700 font-bold block">
                  Collection Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editingCollection.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                    setEditingCollection({ ...editingCollection, name, slug });
                  }}
                  placeholder="e.g. Everyday Essentials, Festive Collection"
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-bold"
                />
                <p className="text-[11px] text-stone-500 font-normal">
                  The title customers will see in the collection header.
                </p>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-stone-700 font-bold block">Description</label>
                <textarea
                  rows={3}
                  value={editingCollection.description}
                  onChange={(e) =>
                    setEditingCollection({ ...editingCollection, description: e.target.value })
                  }
                  placeholder="Describe this collection in 1 or 2 friendly sentences..."
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-normal"
                />
              </div>

              {/* Banner Image */}
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-stone-800 font-bold text-xs block">
                      Banner Image
                    </label>
                    <p className="text-[11px] text-stone-500 font-normal">
                      Upload a photo that represents this collection.
                    </p>
                  </div>
                  <input
                    type="file"
                    ref={bannerInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleBannerUpload}
                  />
                  <button
                    type="button"
                    disabled={isUploadingBanner}
                    onClick={() => bannerInputRef.current?.click()}
                    className="px-3.5 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs shadow-2xs transition-colors flex items-center space-x-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isUploadingBanner ? 'Uploading...' : 'Upload Image'}</span>
                  </button>
                </div>

                {editingCollection.bannerImage && (
                  <div className="h-40 w-full relative rounded-xl overflow-hidden border border-stone-300">
                    <Image
                      src={editingCollection.bannerImage}
                      alt="Banner Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
              </div>

              {/* Display Order & Badge */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-stone-700 font-bold block">Display Order</label>
                  <input
                    type="number"
                    min={1}
                    value={editingCollection.order}
                    onChange={(e) =>
                      setEditingCollection({ ...editingCollection, order: Number(e.target.value) })
                    }
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-stone-700 font-bold block">Optional Badge</label>
                  <input
                    type="text"
                    value={editingCollection.badge || ''}
                    onChange={(e) =>
                      setEditingCollection({ ...editingCollection, badge: e.target.value })
                    }
                    placeholder="e.g. NEW, 2026 ATELIER"
                    className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-stone-900"
                  />
                </div>
              </div>

              {/* Select Products */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-stone-800 font-bold text-xs block">
                    Choose Products ({editingCollection.assignedProductIds.length} Selected)
                  </label>
                  <span className="text-[11px] text-stone-500 font-normal">
                    Select the products that appear in this collection.
                  </span>
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search baby clothes to add..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900"
                  />
                </div>

                {/* Product Checkboxes */}
                <div className="max-h-56 overflow-y-auto space-y-1.5 border border-stone-200 rounded-2xl p-2 bg-stone-50/50">
                  {filteredProducts.map((p) => {
                    const isSelected = editingCollection.assignedProductIds.includes(p.id);
                    return (
                      <div
                        key={p.id}
                        onClick={() => handleToggleProduct(p.id)}
                        className={`p-2 rounded-xl flex items-center justify-between cursor-pointer border transition-colors ${
                          isSelected
                            ? 'bg-amber-50/80 border-amber-300 text-amber-950 font-bold'
                            : 'bg-white border-stone-200 hover:bg-stone-50 text-stone-700'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5 min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => {}}
                            className="rounded border-stone-300 text-amber-800 focus:ring-amber-500"
                          />
                          <div className="w-8 h-10 relative rounded overflow-hidden bg-stone-100 shrink-0">
                            <Image
                              src={p.images[0]?.url || '/images/products/organic-onesie.jpg'}
                              alt={p.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <span className="truncate text-xs">{p.name}</span>
                        </div>
                        <span className="text-[11px] font-bold text-stone-900 ml-2 shrink-0">
                          {formatCurrency(p.price)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-stone-100 bg-[#FAF9F6] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors flex items-center space-x-1.5"
              >
                <Eye className="w-4 h-4 text-stone-600" />
                <span>Preview Collection</span>
              </button>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 text-stone-600 hover:text-stone-900 font-bold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveCollection('draft')}
                  className="px-4 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs transition-colors"
                >
                  Save Draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveCollection('published')}
                  className="px-5 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Publish Collection</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {isPreviewOpen && editingCollection && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-stone-300">
            <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold">
                  Previewing: {editingCollection.name} (/collections/{editingCollection.slug})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="text-stone-400 hover:text-white font-bold text-xs"
              >
                ✕ Close Preview
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-[#FAF9F6]">
              <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden">
                {editingCollection.bannerImage && (
                  <div className="h-56 relative w-full bg-stone-100">
                    <Image
                      src={editingCollection.bannerImage}
                      alt={editingCollection.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-6 sm:p-8 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-800">
                      COLLECTION
                    </span>
                    <h1 className="text-2xl font-heading font-black text-stone-900">
                      {editingCollection.name}
                    </h1>
                    <p className="text-xs sm:text-sm text-stone-600 font-medium">
                      {editingCollection.description}
                    </p>
                  </div>
                  <div className="pt-4 border-t border-stone-100">
                    <h4 className="text-xs font-bold text-stone-700 mb-3">
                      Products in this collection ({editingCollection.assignedProductIds.length}):
                    </h4>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {editingCollection.assignedProductIds.map((pid) => {
                        const p = allProducts.find((item) => item.id === pid);
                        if (!p) return null;
                        return (
                          <div
                            key={pid}
                            className="p-2.5 rounded-xl border border-stone-200 bg-stone-50 space-y-1.5"
                          >
                            <div className="h-28 relative rounded-lg overflow-hidden bg-white">
                              <Image
                                src={p.images[0]?.url || '/images/products/organic-onesie.jpg'}
                                alt={p.name}
                                fill
                                className="object-cover"
                              />
                            </div>
                            <p className="font-bold text-stone-900 text-[11px] truncate">{p.name}</p>
                            <p className="text-[10px] font-black text-amber-800">
                              {formatCurrency(p.price)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
