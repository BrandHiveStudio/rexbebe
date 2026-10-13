'use client';

import React, { useState, useMemo, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Sparkles,
  Star,
  Check,
  X,
  Package,
  Layers,
  ArrowUpDown,
  RotateCcw,
  ExternalLink,
  Eye,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Tag,
  Monitor,
  Smartphone,
  ArrowRight,
} from 'lucide-react';
import { AdminSidebar } from '../../../components/layout/AdminSidebar';
import { AdminHeader } from '../../../components/layout/AdminHeader';
import { useAdminData } from '../../../hooks/AdminContext';
import { Product } from '../../../types/product';
import { uploadService } from '../../../services/uploadService';
import { formatCurrency } from '../../../utils/formatCurrency';

const AVAILABLE_SIZES = [
  'Newborn (0–3M)',
  '3–6 Months',
  '6–12 Months',
  '1–2 Years',
  '2–3 Years',
  '3–4 Years',
  '4–6 Years',
];

const AVAILABLE_COLOURS = [
  'Ivory Cream',
  'Blush Pink',
  'Sage Green',
  'Oat Honey',
  'Sky Mist',
  'Warm Mocha',
  'Pure White',
];

export default function AdminProductsPage() {
  const {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    toggleBestSeller,
    toggleFeatured,
    toggleNewArrival,
    resetProductsToDefault,
  } = useAdminData();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [filterBestSellerOnly, setFilterBestSellerOnly] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Wizard / Drawer States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeWizardStep, setActiveWizardStep] = useState<
    'details' | 'photos' | 'pricing' | 'variants' | 'publish'
  >('details');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Live Preview Modal State
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    shortDescription: '',
    description: '',
    price: 18500,
    comparePrice: 22000,
    categoryName: 'Baby Clothing',
    categorySlug: 'baby-clothing',
    images: ['/images/products/organic-onesie.jpg'] as string[],
    selectedSizes: ['0–3 Months', '3–6 Months'] as string[],
    selectedColours: ['Ivory Cream', 'Oat Honey'] as string[],
    stockQuantity: 25,
    isBestSeller: false,
    isFeatured: true,
    isNewArrival: true,
    status: 'published' as 'published' | 'draft',
  });

  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const imageFileInputRef = useRef<HTMLInputElement | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category?.name) set.add(p.category.name);
    });
    return Array.from(set);
  }, [products]);

  const bestSellerCount = useMemo(() => {
    return products.filter((p) => p.isBestSeller).length;
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const q = searchQuery.toLowerCase();
      const matchSearch =
        p.name.toLowerCase().includes(q) ||
        p.category?.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q);

      const matchCategory =
        selectedCategory === 'ALL' || p.category?.name === selectedCategory;

      const matchBestSeller = !filterBestSellerOnly || p.isBestSeller;

      return matchSearch && matchCategory && matchBestSeller;
    });
  }, [products, searchQuery, selectedCategory, filterBestSellerOnly]);

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      shortDescription: '',
      description: '',
      price: 15000,
      comparePrice: 18000,
      categoryName: 'Baby Clothing',
      categorySlug: 'baby-clothing',
      images: ['/images/products/organic-onesie.jpg'],
      selectedSizes: ['Newborn (0–3M)', '3–6 Months'],
      selectedColours: ['Ivory Cream'],
      stockQuantity: 20,
      isBestSeller: false,
      isFeatured: true,
      isNewArrival: true,
      status: 'published',
    });
    setActiveWizardStep('details');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    const existingImages: string[] = p.images?.map((img) => img.url) || ['/images/products/organic-onesie.jpg'];
    const existingSizes: string[] = (p.variants || [])
      .map((v) => v.size)
      .filter((s): s is string => Boolean(s));
    const existingColours: string[] = (p.variants || [])
      .map((v) => v.color)
      .filter((c): c is string => Boolean(c));

    setFormData({
      name: p.name,
      slug: p.slug,
      shortDescription: p.description?.slice(0, 100) || '',
      description: p.description || '',
      price: p.price,
      comparePrice: p.comparePrice || p.price,
      categoryName: p.category.name,
      categorySlug: p.category.slug,
      images: existingImages.length > 0 ? existingImages : ['/images/products/organic-onesie.jpg'],
      selectedSizes: Array.from(new Set(existingSizes)),
      selectedColours: Array.from(new Set(existingColours)),
      stockQuantity: p.variants?.reduce((sum, v) => sum + (v.stockQuantity || 0), 0) || 20,
      isBestSeller: Boolean(p.isBestSeller),
      isFeatured: Boolean(p.isFeatured),
      isNewArrival: Boolean(p.isNewArrival),
      status: 'published',
    });
    setActiveWizardStep('details');
    setIsModalOpen(true);
  };

  const handleUploadImageFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingImage(true);

    try {
      const uploadedUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const res = await uploadService.uploadImage(files[i]);
        uploadedUrls.push(res.url);
      }
      setFormData((prev) => ({
        ...prev,
        images: [...uploadedUrls, ...prev.images],
      }));
      showToast(`${files.length} photo(s) uploaded successfully! 📸`);
    } catch (err: any) {
      showToast(err.message || 'Image upload failed');
    } finally {
      setIsUploadingImage(false);
      if (imageFileInputRef.current) imageFileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (indexToRemove: number) => {
    if (formData.images.length <= 1) {
      showToast('A product needs at least one photo.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, idx) => idx !== indexToRemove),
    }));
  };

  const handleSetMainImage = (indexToMain: number) => {
    const chosen = formData.images[indexToMain];
    const rest = formData.images.filter((_, idx) => idx !== indexToMain);
    setFormData((prev) => ({
      ...prev,
      images: [chosen, ...rest],
    }));
    showToast('Main product image updated.');
  };

  const handleToggleSize = (size: string) => {
    setFormData((prev) => {
      const exists = prev.selectedSizes.includes(size);
      return {
        ...prev,
        selectedSizes: exists
          ? prev.selectedSizes.filter((s) => s !== size)
          : [...prev.selectedSizes, size],
      };
    });
  };

  const handleToggleColour = (colour: string) => {
    setFormData((prev) => {
      const exists = prev.selectedColours.includes(colour);
      return {
        ...prev,
        selectedColours: exists
          ? prev.selectedColours.filter((c) => c !== colour)
          : [...prev.selectedColours, colour],
      };
    });
  };

  const handleSaveProduct = (saveStatus: 'published' | 'draft' = 'published') => {
    if (!formData.name.trim()) {
      showToast('Please enter a product name first.');
      setActiveWizardStep('details');
      return;
    }

    if (formData.price <= 0) {
      showToast('Selling price must be greater than 0.');
      setActiveWizardStep('pricing');
      return;
    }

    const cleanSlug =
      formData.slug.trim() ||
      formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const productImages = formData.images.map((url, idx) => ({
      id: `img-${Date.now()}-${idx}`,
      url,
      alt: formData.name,
      position: idx + 1,
    }));

    const productVariants = formData.selectedSizes.map((size, idx) => ({
      id: `var-${Date.now()}-${idx}`,
      sku: `${cleanSlug.toUpperCase()}-${size.replace(/[^A-Z0-9]/gi, '')}`,
      size,
      color: formData.selectedColours[0] || 'Ivory Cream',
      price: Number(formData.price),
      stockQuantity: Math.round(Number(formData.stockQuantity) / formData.selectedSizes.length) || 5,
    }));

    if (editingProduct) {
      // Update
      const updated: Product = {
        ...editingProduct,
        name: formData.name,
        slug: cleanSlug,
        description: formData.description,
        price: Number(formData.price),
        comparePrice:
          formData.comparePrice && Number(formData.comparePrice) > Number(formData.price)
            ? Number(formData.comparePrice)
            : undefined,
        isBestSeller: formData.isBestSeller,
        isFeatured: formData.isFeatured,
        isNewArrival: formData.isNewArrival,
        category: {
          id: editingProduct.category?.id || `cat-${Date.now()}`,
          name: formData.categoryName,
          slug: formData.categorySlug,
        },
        images: productImages,
        variants: productVariants.length > 0 ? productVariants : editingProduct.variants,
      };
      updateProduct(updated);
      showToast(saveStatus === 'published' ? 'Product updated and published! 🌸' : 'Product draft saved!');
    } else {
      // Create
      const newProduct: Omit<Product, 'id'> = {
        name: formData.name,
        slug: cleanSlug,
        description: formData.description,
        price: Number(formData.price),
        comparePrice:
          formData.comparePrice && Number(formData.comparePrice) > Number(formData.price)
            ? Number(formData.comparePrice)
            : undefined,
        rating: 5.0,
        reviewCount: 1,
        isBestSeller: formData.isBestSeller,
        isFeatured: formData.isFeatured,
        isNewArrival: formData.isNewArrival,
        category: {
          id: `cat-${Date.now()}`,
          name: formData.categoryName,
          slug: formData.categorySlug,
        },
        images: productImages,
        variants: productVariants,
      };
      addProduct(newProduct);
      showToast(saveStatus === 'published' ? 'New product created and published! 🌸' : 'New product draft saved!');
    }

    setIsModalOpen(false);
  };

  const handleDeleteProduct = (id: string) => {
    deleteProduct(id);
    setDeleteConfirmId(null);
    showToast('Product removed from catalog.');
  };

  return (
    <div className="flex min-h-screen bg-[#FBF9F5]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Products"
          subtitle="Add new baby clothes, update prices, upload photos and choose where products appear on your website."
          actions={
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={resetProductsToDefault}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-100 border border-stone-200 text-xs font-bold transition-all shadow-2xs"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset Defaults</span>
              </button>

              <button
                type="button"
                onClick={handleOpenAddModal}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 rounded-2xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs shadow-md shadow-amber-900/10 transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Baby Outfit</span>
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
          {/* Search, Filter & Quick Toggles */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-1 items-center space-x-3 flex-wrap gap-y-2">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search baby outfit name or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40 font-medium text-stone-900"
                />
              </div>

              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-stone-700 focus:bg-white focus:outline-none"
              >
                <option value="ALL">All Categories</option>
                {categoriesList.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setFilterBestSellerOnly(!filterBestSellerOnly)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  filterBestSellerOnly
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                <Star className="w-3.5 h-3.5" />
                <span>Best Sellers ({bestSellerCount})</span>
              </button>
            </div>
          </div>

          {/* Product Items Table */}
          <div className="bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#FAF9F6] border-b border-stone-200 text-stone-600 uppercase text-[10px] tracking-wider font-extrabold select-none">
                  <tr>
                    <th className="p-4">Outfit & Image</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4 text-center">Best Seller</th>
                    <th className="p-4 text-center">New Arrival</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-stone-400">
                        No products found matching your search.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const mainImg = p.images[0]?.url || '/images/products/organic-onesie.jpg';
                      const totalStock = p.variants?.reduce(
                        (acc, v) => acc + (v.stockQuantity || 0),
                        0
                      ) || 0;

                      return (
                        <tr key={p.id} className="hover:bg-amber-50/20 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center space-x-3.5">
                              <div className="w-12 h-14 rounded-xl overflow-hidden relative bg-stone-100 border border-stone-200 shrink-0">
                                <Image
                                  src={mainImg}
                                  alt={p.name}
                                  fill
                                  className="object-cover"
                                />
                              </div>
                              <div className="min-w-0 max-w-xs">
                                <Link
                                  href={`/products/${p.slug}`}
                                  target="_blank"
                                  className="font-bold text-stone-900 hover:text-amber-800 transition-colors block truncate flex items-center space-x-1"
                                >
                                  <span>{p.name}</span>
                                  <ExternalLink className="w-3 h-3 text-stone-400 inline shrink-0" />
                                </Link>
                                <span className="text-[10px] text-stone-400 block mt-0.5">
                                  SKU: {p.slug}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-[10px] font-bold border border-stone-200">
                              {p.category.name}
                            </span>
                          </td>

                          <td className="p-4 font-bold text-stone-900">
                            <div>{formatCurrency(p.price)}</div>
                            {p.comparePrice && p.comparePrice > p.price && (
                              <div className="text-[10px] text-stone-400 line-through">
                                {formatCurrency(p.comparePrice)}
                              </div>
                            )}
                          </td>

                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                totalStock > 10
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : totalStock > 0
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : 'bg-rose-50 text-rose-800 border border-rose-200'
                              }`}
                            >
                              {totalStock} in stock
                            </span>
                          </td>

                          <td className="p-4 text-center">
                            <button
                              type="button"
                              onClick={() => toggleBestSeller(p.id)}
                              className={`p-1.5 rounded-xl transition-all ${
                                p.isBestSeller
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : 'bg-stone-100 text-stone-400 hover:text-stone-700'
                              }`}
                              title="Toggle Best Seller on homepage"
                            >
                              <Star className="w-4 h-4" />
                            </button>
                          </td>

                          <td className="p-4 text-center">
                            <button
                              type="button"
                              onClick={() => toggleNewArrival(p.id)}
                              className={`p-1.5 rounded-xl transition-all ${
                                p.isNewArrival
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                  : 'bg-stone-100 text-stone-400 hover:text-stone-700'
                              }`}
                              title="Toggle New In status"
                            >
                              <Sparkles className="w-4 h-4" />
                            </button>
                          </td>

                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                type="button"
                                onClick={() => handleOpenEditModal(p)}
                                className="p-2 rounded-xl text-stone-500 hover:text-amber-800 hover:bg-stone-100"
                                title="Edit outfit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteConfirmId(p.id)}
                                className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50"
                                title="Delete outfit"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Guided Add/Edit Product Drawer (Sections 9, 10, 11, 12, 13) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col animate-slideLeft overflow-hidden">
            {/* Header */}
            <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-[#FAF9F6]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                  Product Studio
                </span>
                <h3 className="text-lg font-heading font-black text-stone-900">
                  {editingProduct ? `Edit: ${editingProduct.name}` : '+ Add New Baby Outfit'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Wizard Tabs */}
            <div className="flex items-center space-x-1.5 border-b border-stone-100 px-6 py-2 overflow-x-auto text-xs font-bold bg-white">
              {[
                { id: 'details', label: '1. Basic Info' },
                { id: 'photos', label: '2. Photos' },
                { id: 'pricing', label: '3. Pricing & Stock' },
                { id: 'variants', label: '4. Sizes & Badges' },
              ].map((step) => (
                <button
                  key={step.id}
                  type="button"
                  onClick={() => setActiveWizardStep(step.id as any)}
                  className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                    activeWizardStep === step.id
                      ? 'bg-amber-800 text-white shadow-2xs'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  {step.label}
                </button>
              ))}
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs font-semibold">
              {/* STEP 1: BASIC INFORMATION */}
              {activeWizardStep === 'details' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-stone-700 font-bold block">
                      Product Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Aurelia Organic Cashmere Romper"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-bold text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    />
                    <p className="text-[11px] text-stone-500 font-normal">
                      The name parents see on the website and product cards.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-stone-700 font-bold block">Category</label>
                    <select
                      value={formData.categoryName}
                      onChange={(e) => {
                        const name = e.target.value;
                        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                        setFormData({ ...formData, categoryName: name, categorySlug: slug });
                      }}
                      className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-semibold"
                    >
                      <option value="Baby Clothing">Baby Clothing</option>
                      <option value="Dresses">Dresses</option>
                      <option value="Rompers">Rompers</option>
                      <option value="Nursery & Toys">Nursery & Toys</option>
                      <option value="Bedding & Swaddles">Bedding & Swaddles</option>
                      <option value="Baby Gear & Travel">Baby Gear & Travel</option>
                    </select>
                    <p className="text-[11px] text-stone-500 font-normal">
                      Choose which shopping category this outfit belongs to.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-stone-700 font-bold block">Product Description</label>
                    <textarea
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe the fabric, gentle comfort, and special details of this baby outfit..."
                      className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 leading-relaxed font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    />
                    <p className="text-[11px] text-stone-500 font-normal">
                      Use simple everyday English. Explain softness, washing instructions, and fit.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 2: PRODUCT PHOTOS (Section 10) */}
              {activeWizardStep === 'photos' && (
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-stone-50 border border-stone-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-stone-900 text-xs">
                          Upload Product Images
                        </h4>
                        <p className="text-[11px] text-stone-500 font-normal">
                          Choose images from your computer. These images will be displayed on your product page.
                        </p>
                      </div>
                      <input
                        type="file"
                        ref={imageFileInputRef}
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleUploadImageFile}
                      />
                      <button
                        type="button"
                        disabled={isUploadingImage}
                        onClick={() => imageFileInputRef.current?.click()}
                        className="px-4 py-2 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs shadow-2xs transition-colors flex items-center space-x-1.5"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>{isUploadingImage ? 'Uploading...' : 'Choose Images'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Photo Gallery Grid */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-stone-700 block">
                      Uploaded Photos ({formData.images.length}) — First photo is the main card image:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                      {formData.images.map((url, idx) => (
                        <div
                          key={idx}
                          className={`relative rounded-2xl overflow-hidden border p-1 bg-white space-y-1.5 shadow-2xs ${
                            idx === 0 ? 'border-amber-500 ring-2 ring-amber-300/50' : 'border-stone-200'
                          }`}
                        >
                          <div className="h-36 relative rounded-xl overflow-hidden bg-stone-100">
                            <Image src={url} alt="Product Photo" fill className="object-cover" />
                            {idx === 0 && (
                              <span className="absolute top-2 left-2 bg-amber-800 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-2xs">
                                ★ MAIN IMAGE
                              </span>
                            )}
                          </div>
                          <div className="flex items-center justify-between px-1">
                            {idx !== 0 ? (
                              <button
                                type="button"
                                onClick={() => handleSetMainImage(idx)}
                                className="text-[10px] text-amber-800 font-bold hover:underline"
                              >
                                Set as Main
                              </button>
                            ) : (
                              <span className="text-[10px] text-stone-400 font-bold">Main Photo</span>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(idx)}
                              className="text-[10px] text-rose-600 font-bold hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: PRICING & INVENTORY (Section 11) */}
              {activeWizardStep === 'pricing' && (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-stone-700 font-bold block">
                      Selling Price (LKR) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 font-bold text-base focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    />
                    <p className="text-[11px] text-stone-500 font-normal">
                      Enter the price customers will pay.
                    </p>
                  </div>

                  <div className="space-y-1">
                    <label className="text-stone-700 font-bold block">
                      Original Price (LKR)
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.comparePrice}
                      onChange={(e) =>
                        setFormData({ ...formData, comparePrice: Number(e.target.value) })
                      }
                      className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/40"
                    />
                    <p className="text-[11px] text-stone-500 font-normal">
                      Enter the previous price if this product is on sale. Leave blank or equal to selling price if there is no discount.
                    </p>
                  </div>

                  {formData.comparePrice > formData.price && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold flex items-center justify-between">
                      <span>Automatic Sale Badge:</span>
                      <span>
                        {Math.round(
                          ((formData.comparePrice - formData.price) / formData.comparePrice) * 100
                        )}
                        % OFF
                      </span>
                    </div>
                  )}

                  <div className="space-y-1 pt-2">
                    <label className="text-stone-700 font-bold block">Total Available Stock</label>
                    <input
                      type="number"
                      min={0}
                      value={formData.stockQuantity}
                      onChange={(e) =>
                        setFormData({ ...formData, stockQuantity: Number(e.target.value) })
                      }
                      className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 text-sm"
                    />
                    <p className="text-[11px] text-stone-500 font-normal">
                      Number of outfits currently ready for delivery in your boutique.
                    </p>
                  </div>
                </div>
              )}

              {/* STEP 4: SIZES, COLOURS & BADGES (Section 9) */}
              {activeWizardStep === 'variants' && (
                <div className="space-y-5">
                  {/* Sizes */}
                  <div className="space-y-2">
                    <label className="text-stone-800 font-bold block">
                      Available Sizes (Check all that apply)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_SIZES.map((sz) => {
                        const isChecked = formData.selectedSizes.includes(sz);
                        return (
                          <button
                            key={sz}
                            type="button"
                            onClick={() => handleToggleSize(sz)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                              isChecked
                                ? 'bg-amber-800 text-white border-amber-900 shadow-2xs'
                                : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                            }`}
                          >
                            {sz}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Colours */}
                  <div className="space-y-2">
                    <label className="text-stone-800 font-bold block">
                      Available Colours (Check all that apply)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {AVAILABLE_COLOURS.map((col) => {
                        const isChecked = formData.selectedColours.includes(col);
                        return (
                          <button
                            key={col}
                            type="button"
                            onClick={() => handleToggleColour(col)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                              isChecked
                                ? 'bg-amber-800 text-white border-amber-900 shadow-2xs'
                                : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                            }`}
                          >
                            {col}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                    <p className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                      Storefront Labels & Badges
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                      <label className="flex items-center space-x-2 p-2.5 rounded-xl bg-white border border-stone-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isBestSeller}
                          onChange={(e) =>
                            setFormData({ ...formData, isBestSeller: e.target.checked })
                          }
                          className="rounded text-emerald-600 focus:ring-emerald-500"
                        />
                        <span className="text-xs font-bold text-emerald-800">★ Best Seller</span>
                      </label>

                      <label className="flex items-center space-x-2 p-2.5 rounded-xl bg-white border border-stone-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isNewArrival}
                          onChange={(e) =>
                            setFormData({ ...formData, isNewArrival: e.target.checked })
                          }
                          className="rounded text-pink-600 focus:ring-pink-500"
                        />
                        <span className="text-xs font-bold text-pink-700">✨ New Arrival</span>
                      </label>

                      <label className="flex items-center space-x-2 p-2.5 rounded-xl bg-white border border-stone-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.isFeatured}
                          onChange={(e) =>
                            setFormData({ ...formData, isFeatured: e.target.checked })
                          }
                          className="rounded text-amber-600 focus:ring-amber-500"
                        />
                        <span className="text-xs font-bold text-amber-800">Featured Item</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-stone-100 bg-[#FAF9F6] flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-colors flex items-center space-x-1.5"
              >
                <Eye className="w-4 h-4 text-stone-600" />
                <span>Preview Outfit</span>
              </button>

              <div className="flex items-center space-x-2">
                {activeWizardStep !== 'details' && (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeWizardStep === 'photos') setActiveWizardStep('details');
                      else if (activeWizardStep === 'pricing') setActiveWizardStep('photos');
                      else if (activeWizardStep === 'variants') setActiveWizardStep('pricing');
                    }}
                    className="px-3.5 py-2 rounded-xl text-stone-600 hover:text-stone-900 bg-stone-100 font-bold text-xs"
                  >
                    ← Back
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleSaveProduct('draft')}
                  className="px-4 py-2.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs transition-colors"
                >
                  Save Draft
                </button>

                {activeWizardStep !== 'variants' ? (
                  <button
                    type="button"
                    onClick={() => {
                      if (activeWizardStep === 'details') {
                        if (!formData.name.trim()) {
                          showToast('Please enter a product name first.');
                          return;
                        }
                        setActiveWizardStep('photos');
                      } else if (activeWizardStep === 'photos') {
                        setActiveWizardStep('pricing');
                      } else if (activeWizardStep === 'pricing') {
                        setActiveWizardStep('variants');
                      }
                    }}
                    className="px-4 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs transition-colors flex items-center space-x-1"
                  >
                    <span>Continue →</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSaveProduct('published')}
                    className="px-5 py-2.5 rounded-xl bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs shadow-md transition-all flex items-center space-x-1.5"
                  >
                    <Check className="w-4 h-4" />
                    <span>Publish Outfit</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Product Live Preview Modal (Section 13) */}
      {isPreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex flex-col items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-stone-300">
            <div className="p-4 bg-stone-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-xs font-bold">
                  Previewing Outfit: {formData.name || 'Untitled Baby Outfit'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setPreviewDevice('desktop')}
                  className={`p-1.5 rounded-lg text-xs font-bold ${
                    previewDevice === 'desktop' ? 'bg-amber-700 text-white' : 'text-stone-400'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewDevice('mobile')}
                  className={`p-1.5 rounded-lg text-xs font-bold ${
                    previewDevice === 'mobile' ? 'bg-amber-700 text-white' : 'text-stone-400'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsPreviewOpen(false)}
                  className="ml-4 text-stone-400 hover:text-white font-bold text-xs"
                >
                  ✕ Close
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 sm:p-10 bg-[#FAF9F6]">
              <div
                className={`mx-auto bg-white rounded-2xl shadow-sm border border-stone-200 p-6 transition-all ${
                  previewDevice === 'mobile' ? 'max-w-xs' : 'max-w-2xl'
                }`}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                  <div className="h-72 relative rounded-2xl overflow-hidden bg-stone-100 border border-stone-200">
                    <Image
                      src={formData.images[0] || '/images/products/organic-onesie.jpg'}
                      alt={formData.name || 'Preview'}
                      fill
                      className="object-cover"
                    />
                  </div>

                  <div className="space-y-3">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 inline-block">
                      {formData.categoryName}
                    </span>
                    <h3 className="text-lg font-heading font-black text-stone-900 leading-snug">
                      {formData.name || 'Aurelia Organic Cashmere Romper'}
                    </h3>

                    <div className="flex items-baseline space-x-2">
                      <span className="text-xl font-black text-amber-900">
                        {formatCurrency(formData.price)}
                      </span>
                      {formData.comparePrice > formData.price && (
                        <span className="text-xs text-stone-400 line-through">
                          {formatCurrency(formData.comparePrice)}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                      {formData.description ||
                        'Crafted from 100% certified organic fibres for tender baby skin.'}
                    </p>

                    <div className="space-y-1 pt-1">
                      <span className="text-[10px] font-bold text-stone-500 uppercase">Sizes:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {formData.selectedSizes.map((s) => (
                          <span
                            key={s}
                            className="text-[10px] px-2 py-0.5 bg-stone-100 rounded-lg text-stone-800 font-bold"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2">
                      <div className="w-full py-2.5 rounded-xl bg-amber-800 text-white font-bold text-xs text-center shadow-xs">
                        Add to Cart • {formatCurrency(formData.price)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-stone-200 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center">
              <Trash2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-stone-900 font-heading">Delete Baby Outfit?</h4>
            <p className="text-xs text-stone-500">
              Are you sure you want to remove this baby outfit? Customers will no longer be able to
              purchase it.
            </p>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 text-xs font-bold hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleDeleteProduct(deleteConfirmId)}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs"
              >
                Yes, Delete Outfit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
