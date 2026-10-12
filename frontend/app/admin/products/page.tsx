'use client';

import React, { useState, useMemo } from 'react';
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
} from 'lucide-react';
import { AdminSidebar } from '../../../components/layout/AdminSidebar';
import { AdminHeader } from '../../../components/layout/AdminHeader';
import { useAdminData } from '../../../hooks/AdminContext';
import { Product } from '../../../types/product';
import { formatCurrency } from '../../../utils/formatCurrency';

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

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    price: 18500,
    comparePrice: 22000,
    categoryName: 'Baby Clothing',
    categorySlug: 'baby-clothing',
    imageUrl: '/images/products/organic-onesie.jpg',
    stockQuantity: 25,
    isBestSeller: false,
    isFeatured: true,
    isNewArrival: true,
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      slug: '',
      description: '',
      price: 15000,
      comparePrice: 18000,
      categoryName: 'Baby Clothing',
      categorySlug: 'baby-clothing',
      imageUrl: '/images/products/organic-onesie.jpg',
      stockQuantity: 25,
      isBestSeller: false,
      isFeatured: true,
      isNewArrival: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: p.price,
      comparePrice: p.comparePrice || p.price,
      categoryName: p.category.name,
      categorySlug: p.category.slug,
      imageUrl: p.images[0]?.url || '/images/products/organic-onesie.jpg',
      stockQuantity: p.variants[0]?.stockQuantity || 20,
      isBestSeller: Boolean(p.isBestSeller),
      isFeatured: p.isFeatured,
      isNewArrival: p.isNewArrival,
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const slug =
      formData.slug.trim() ||
      formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (editingProduct) {
      // Update
      const updated: Product = {
        ...editingProduct,
        name: formData.name,
        slug,
        description: formData.description,
        price: Number(formData.price),
        comparePrice: formData.comparePrice ? Number(formData.comparePrice) : undefined,
        isBestSeller: formData.isBestSeller,
        isFeatured: formData.isFeatured,
        isNewArrival: formData.isNewArrival,
        category: {
          id: editingProduct.category.id || `cat-${Date.now()}`,
          name: formData.categoryName,
          slug: formData.categorySlug,
        },
        images: [
          {
            id: editingProduct.images[0]?.id || `img-${Date.now()}`,
            url: formData.imageUrl || '/images/products/organic-onesie.jpg',
            alt: formData.name,
            position: 1,
          },
          ...(editingProduct.images.slice(1) || []),
        ],
        variants: editingProduct.variants.map((v, i) =>
          i === 0
            ? { ...v, price: Number(formData.price), stockQuantity: Number(formData.stockQuantity) }
            : v
        ),
      };
      updateProduct(updated);
      showToast(`Updated "${formData.name}" successfully! ✨`);
    } else {
      // Add
      addProduct({
        name: formData.name,
        slug,
        description: formData.description,
        price: Number(formData.price),
        comparePrice: formData.comparePrice ? Number(formData.comparePrice) : undefined,
        isBestSeller: formData.isBestSeller,
        isFeatured: formData.isFeatured,
        isNewArrival: formData.isNewArrival,
        category: {
          id: `cat-${Date.now()}`,
          name: formData.categoryName,
          slug: formData.categorySlug,
        },
        rating: 5.0,
        reviewCount: 1,
        images: [
          { id: `img-${Date.now()}`, url: formData.imageUrl, alt: formData.name, position: 1 },
        ],
        variants: [
          {
            id: `var-${Date.now()}`,
            sku: `${slug.substring(0, 4).toUpperCase()}-STD`,
            price: Number(formData.price),
            stockQuantity: Number(formData.stockQuantity),
            size: 'Standard',
            color: 'Natural',
          },
        ],
      });
      showToast(`Added new item "${formData.name}"! 🌸`);
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string, name: string) => {
    deleteProduct(id);
    setDeleteConfirmId(null);
    showToast(`Deleted item "${name}".`);
  };

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.slug.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        selectedCategory === 'ALL' ||
        p.category.name.toLowerCase() === selectedCategory.toLowerCase() ||
        p.category.slug.toLowerCase() === selectedCategory.toLowerCase();

      const matchesBestSeller = !filterBestSellerOnly || Boolean(p.isBestSeller);

      return matchesSearch && matchesCat && matchesBestSeller;
    });
  }, [products, searchQuery, selectedCategory, filterBestSellerOnly]);

  const categoriesList = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category.name));
    return Array.from(set);
  }, [products]);

  const bestSellerCount = useMemo(() => {
    return products.filter((p) => p.isBestSeller).length;
  }, [products]);

  return (
    <div className="flex min-h-screen bg-[#F8F7F4]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Products & Best Sellers Management"
          subtitle="Manage inventory items, pricing, images, and mark items as Best Sellers for the storefront"
          actions={
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition-all hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Item</span>
            </button>
          }
        />

        {/* Toast Alert */}
        {toastMessage && (
          <div className="fixed top-20 right-8 z-50 bg-stone-900 text-amber-400 border border-amber-500/30 px-5 py-3 rounded-2xl shadow-xl flex items-center space-x-2.5 text-xs font-bold animate-fadeIn">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        <main className="p-6 lg:p-8 space-y-6 max-w-7xl">
          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">Total Products</p>
                <p className="text-2xl font-black text-stone-900 mt-1">{products.length}</p>
                <p className="text-[10px] text-stone-400 mt-0.5">Active items in catalog</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 flex items-center justify-center font-bold">
                <Package className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider">🌿 Best Sellers</p>
                <p className="text-2xl font-black text-stone-900 mt-1">{bestSellerCount}</p>
                <p className="text-[10px] text-stone-400 mt-0.5">Featured on Homepage</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center font-bold">
                <Star className="w-6 h-6 fill-emerald-600" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-pink-600 uppercase tracking-wider">✨ New Arrivals</p>
                <p className="text-2xl font-black text-stone-900 mt-1">
                  {products.filter((p) => p.isNewArrival).length}
                </p>
                <p className="text-[10px] text-stone-400 mt-0.5">Marked with NEW badge</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-200 text-pink-700 flex items-center justify-center font-bold">
                <Sparkles className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">Categories</p>
                <p className="text-2xl font-black text-stone-900 mt-1">{categoriesList.length}</p>
                <p className="text-[10px] text-stone-400 mt-0.5">Taxonomy departments</p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 text-sky-700 flex items-center justify-center font-bold">
                <Layers className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Search, Filter & Action Toolbar */}
          <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-1 items-center space-x-3 flex-wrap gap-y-2">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search by name, category, slug..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:border-amber-500 focus:outline-none transition-all font-medium"
                />
              </div>

              {/* Category Dropdown */}
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

              {/* Best Seller Quick Toggle Pill */}
              <button
                type="button"
                onClick={() => setFilterBestSellerOnly(!filterBestSellerOnly)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  filterBestSellerOnly
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-stone-50 text-stone-600 hover:bg-stone-100 border border-stone-200'
                }`}
              >
                <Star className="w-3.5 h-3.5" />
                <span>Best Sellers Only ({bestSellerCount})</span>
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={resetProductsToDefault}
                className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 border border-stone-200 text-xs font-semibold transition-all"
                title="Reset catalog to initial demo products"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset Defaults</span>
              </button>
            </div>
          </div>

          {/* Product Items Table */}
          <div className="bg-white rounded-2xl border border-stone-200/80 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-[#FAF9F6] border-b border-stone-200 text-stone-600 uppercase text-[10px] tracking-wider font-extrabold select-none">
                  <tr>
                    <th className="p-4">Item & Image</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4 text-center">Best Seller</th>
                    <th className="p-4 text-center">New Arrival</th>
                    <th className="p-4 text-center">Featured</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-stone-400">
                        No items found matching your filters.
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((p) => {
                      const mainImg = p.images[0]?.url || '/images/products/organic-onesie.jpg';
                      const isBS = Boolean(p.isBestSeller);
                      const totalStock = p.variants.reduce((acc, v) => acc + (v.stockQuantity || 0), 0);

                      return (
                        <tr key={p.id} className="hover:bg-amber-50/30 transition-colors">
                          {/* Image & Name */}
                          <td className="p-4">
                            <div className="flex items-center space-x-3.5">
                              <div className="w-12 h-14 rounded-xl overflow-hidden relative bg-stone-100 border border-stone-200 flex-shrink-0 shadow-2xs">
                                <Image
                                  src={mainImg}
                                  alt={p.name}
                                  fill
                                  sizes="48px"
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
                                  <ExternalLink className="w-3 h-3 text-stone-400 flex-shrink-0 inline" />
                                </Link>
                                <span className="text-[10px] text-stone-400 truncate block mt-0.5">
                                  SKU: {p.variants[0]?.sku || p.slug}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="p-4">
                            <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 text-[10px] font-bold border border-stone-200">
                              {p.category.name}
                            </span>
                          </td>

                          {/* Price */}
                          <td className="p-4 font-bold text-stone-900">
                            <div>{formatCurrency(p.price)}</div>
                            {p.comparePrice && (
                              <div className="text-[10px] text-stone-400 line-through font-normal">
                                {formatCurrency(p.comparePrice)}
                              </div>
                            )}
                          </td>

                          {/* Stock */}
                          <td className="p-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
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

                          {/* BEST SELLER TOGGLE (1-Click) */}
                          <td className="p-4 text-center">
                            <button
                              type="button"
                              onClick={() => {
                                toggleBestSeller(p.id);
                                showToast(
                                  !isBS
                                    ? `Marked "${p.name}" as Best Seller! 🌿`
                                    : `Removed Best Seller tag from "${p.name}".`
                                );
                              }}
                              className={`px-3 py-1.5 rounded-full text-[11px] font-extrabold transition-all cursor-pointer shadow-2xs hover:scale-105 active:scale-95 ${
                                isBS
                                  ? 'bg-emerald-500 text-white shadow-emerald-500/20'
                                  : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                              }`}
                              title="Click to toggle Best Seller status on the Homepage"
                            >
                              {isBS ? '🌿 YES (Active)' : 'OFF'}
                            </button>
                          </td>

                          {/* NEW ARRIVAL TOGGLE */}
                          <td className="p-4 text-center">
                            <button
                              type="button"
                              onClick={() => toggleNewArrival(p.id)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                                p.isNewArrival
                                  ? 'bg-pink-100 text-pink-700 border border-pink-200'
                                  : 'bg-stone-100 text-stone-400'
                              }`}
                            >
                              {p.isNewArrival ? '✨ NEW' : 'NO'}
                            </button>
                          </td>

                          {/* FEATURED TOGGLE */}
                          <td className="p-4 text-center">
                            <button
                              type="button"
                              onClick={() => toggleFeatured(p.id)}
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                                p.isFeatured
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-stone-100 text-stone-400'
                              }`}
                            >
                              {p.isFeatured ? 'YES' : 'NO'}
                            </button>
                          </td>

                          {/* Actions */}
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end space-x-1.5">
                              <button
                                onClick={() => handleOpenEditModal(p)}
                                className="p-2 text-stone-600 hover:text-amber-800 hover:bg-amber-100/60 rounded-lg transition-colors"
                                title="Edit Item Details"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(p.id)}
                                className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                title="Delete Item"
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

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-6">
            <div className="flex items-center justify-between border-b border-stone-100 pb-4">
              <div>
                <h3 className="text-lg font-bold font-heading text-stone-900">
                  {editingProduct ? 'Edit Item Details' : 'Add New Boutique Item'}
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Set prices, images, description, and storefront badges
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs font-semibold">
              {/* Product Name */}
              <div>
                <label className="block text-stone-700 mb-1">Item Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aurelia Organic Cashmere Romper"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none text-stone-900"
                />
              </div>

              {/* Price & Compare-At Price */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-700 mb-1">Selling Price (LKR) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none text-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 mb-1">Compare-At / Regular Price (LKR)</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.comparePrice}
                    onChange={(e) => setFormData({ ...formData, comparePrice: Number(e.target.value) })}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none text-stone-900"
                  />
                </div>
              </div>

              {/* Category & Stock */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-stone-700 mb-1">Category Name</label>
                  <select
                    value={formData.categoryName}
                    onChange={(e) => {
                      const name = e.target.value;
                      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
                      setFormData({ ...formData, categoryName: name, categorySlug: slug });
                    }}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none text-stone-900"
                  >
                    <option value="Baby Clothing">Baby Clothing</option>
                    <option value="Nursery & Toys">Nursery & Toys</option>
                    <option value="Bedding & Swaddles">Bedding & Swaddles</option>
                    <option value="Baby Gear & Travel">Baby Gear & Travel</option>
                    <option value="Dresses">Dresses</option>
                    <option value="Rompers">Rompers</option>
                  </select>
                </div>
                <div>
                  <label className="block text-stone-700 mb-1">Inventory Quantity</label>
                  <input
                    type="number"
                    min={0}
                    value={formData.stockQuantity}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                    className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none text-stone-900"
                  />
                </div>
              </div>

              {/* Image URL & Preview */}
              <div>
                <label className="block text-stone-700 mb-1">Item Image URL / Path</label>
                <div className="flex space-x-3 items-center">
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="/images/products/organic-onesie.jpg or https://..."
                    className="flex-1 p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none text-stone-900"
                  />
                  <div className="w-12 h-12 rounded-xl border border-stone-200 overflow-hidden relative bg-stone-100 flex-shrink-0">
                    <Image
                      src={formData.imageUrl || '/images/products/organic-onesie.jpg'}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-[10px] text-stone-400">Quick presets:</span>
                  {[
                    '/images/products/organic-onesie.jpg',
                    '/images/products/baby-girl-fashion.jpg',
                    '/images/products/baby-boy-fashion.jpg',
                    '/images/products/wooden-gym.jpg',
                    '/images/products/editorial-baby-lifestyle.jpg',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: preset })}
                      className="text-[10px] text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded border border-amber-200"
                    >
                      {preset.split('/').pop()}
                    </button>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-stone-700 mb-1">Item Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Crafted from pure organic Mongolian cashmere..."
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:bg-white focus:border-amber-500 focus:outline-none text-stone-900"
                />
              </div>

              {/* Badges & Flags Toggles */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-3">
                <p className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                  Storefront Badges & Showcase
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center space-x-2.5 p-2 rounded-xl bg-white border border-stone-200 cursor-pointer hover:bg-emerald-50/50">
                    <input
                      type="checkbox"
                      checked={formData.isBestSeller}
                      onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                      className="w-4 h-4 text-emerald-600 rounded"
                    />
                    <span className="text-xs font-bold text-emerald-800">🌿 Best Seller</span>
                  </label>

                  <label className="flex items-center space-x-2.5 p-2 rounded-xl bg-white border border-stone-200 cursor-pointer hover:bg-pink-50/50">
                    <input
                      type="checkbox"
                      checked={formData.isNewArrival}
                      onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })}
                      className="w-4 h-4 text-pink-600 rounded"
                    />
                    <span className="text-xs font-bold text-pink-700">✨ New Arrival</span>
                  </label>

                  <label className="flex items-center space-x-2.5 p-2 rounded-xl bg-white border border-stone-200 cursor-pointer hover:bg-amber-50/50">
                    <input
                      type="checkbox"
                      checked={formData.isFeatured}
                      onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                      className="w-4 h-4 text-amber-600 rounded"
                    />
                    <span className="text-xs font-bold text-amber-800">Featured Item</span>
                  </label>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl border border-stone-200 text-stone-600 hover:bg-stone-100 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shadow-md shadow-amber-600/20"
                >
                  {editingProduct ? 'Save Changes' : 'Create Item'}
                </button>
              </div>
            </form>
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
            <h4 className="text-base font-bold text-stone-900 font-heading">Delete Product?</h4>
            <p className="text-xs text-stone-500">
              Are you sure you want to remove this item from the store? This action will remove it from the catalog.
            </p>
            <div className="flex items-center justify-center space-x-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 text-xs font-bold hover:bg-stone-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const target = products.find((p) => p.id === deleteConfirmId);
                  if (target) handleDelete(target.id, target.name);
                }}
                className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-600/20"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
