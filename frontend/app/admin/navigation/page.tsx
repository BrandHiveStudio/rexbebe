'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Compass,
  Plus,
  Trash2,
  Edit2,
  Save,
  RotateCcw,
  Sparkles,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Layers,
  Check,
  Eye,
  ArrowUpDown,
  MoveUp,
  MoveDown,
} from 'lucide-react';
import { AdminSidebar } from '../../../components/layout/AdminSidebar';
import { AdminHeader } from '../../../components/layout/AdminHeader';
import { useAdminData } from '../../../hooks/AdminContext';
import { NavItemConfig, NavSubGroup, NavSubItem } from '../../../types/admin';

export default function AdminNavigationPage() {
  const {
    navigationConfig,
    updateNavigationConfig,
    addNavItem,
    updateNavItem,
    deleteNavItem,
    resetNavigationConfig,
  } = useAdminData();

  const [expandedItemId, setExpandedItemId] = useState<string | null>('nav-shop');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modal for adding/editing main nav item
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NavItemConfig | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    href: '',
    badge: '',
    order: 1,
    isActive: true,
  });

  // Modal for adding a sub-navigation link
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [subTargetNavId, setSubTargetNavId] = useState<string | null>(null);
  const [subTargetGroupId, setSubTargetGroupId] = useState<string | null>(null);
  const [subFormData, setSubFormData] = useState({
    name: '',
    href: '',
    badge: '',
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOpenAddMain = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      href: '/',
      badge: '',
      order: navigationConfig.items.length + 1,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEditMain = (item: NavItemConfig) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      href: item.href,
      badge: item.badge || '',
      order: item.order,
      isActive: item.isActive,
    });
    setIsModalOpen(true);
  };

  const handleSaveMain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingItem) {
      updateNavItem({
        ...editingItem,
        name: formData.name.toUpperCase(),
        href: formData.href,
        badge: formData.badge.trim() || undefined,
        order: Number(formData.order),
        isActive: formData.isActive,
      });
      showToast(`Updated navigation item "${formData.name.toUpperCase()}"! ✨`);
    } else {
      addNavItem({
        name: formData.name.toUpperCase(),
        href: formData.href,
        badge: formData.badge.trim() || undefined,
        order: Number(formData.order),
        isActive: formData.isActive,
        subGroups: [],
      });
      showToast(`Added navigation item "${formData.name.toUpperCase()}"! 🌸`);
    }

    setIsModalOpen(false);
  };

  const handleToggleActive = (item: NavItemConfig) => {
    updateNavItem({ ...item, isActive: !item.isActive });
    showToast(
      !item.isActive
        ? `Enabled "${item.name}" on the navbar.`
        : `Disabled "${item.name}" from the navbar.`
    );
  };

  // Move item up or down in order
  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    const items = [...navigationConfig.items];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= items.length) return;

    const temp = items[index];
    items[index] = items[targetIdx];
    items[targetIdx] = temp;

    // Reassign order indices
    const updated = items.map((it, idx) => ({ ...it, order: idx + 1 }));
    updateNavigationConfig({ items: updated });
    showToast('Reordered navigation items! 🧭');
  };

  // Sub-Navigation Operations
  const handleOpenAddSub = (navId: string, groupId: string) => {
    setSubTargetNavId(navId);
    setSubTargetGroupId(groupId);
    setSubFormData({ name: '', href: '/shop', badge: '' });
    setIsSubModalOpen(true);
  };

  const handleSaveSubItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subTargetNavId || !subTargetGroupId || !subFormData.name.trim()) return;

    const navItem = navigationConfig.items.find((it) => it.id === subTargetNavId);
    if (!navItem) return;

    const newSubItem: NavSubItem = {
      id: `sub-${Date.now()}`,
      name: subFormData.name,
      href: subFormData.href,
      badge: subFormData.badge || undefined,
    };

    const updatedSubGroups = (navItem.subGroups || []).map((grp) => {
      if (grp.id === subTargetGroupId) {
        return {
          ...grp,
          subItems: [...grp.subItems, newSubItem],
        };
      }
      return grp;
    });

    updateNavItem({
      ...navItem,
      subGroups: updatedSubGroups,
    });

    setIsSubModalOpen(false);
    showToast(`Added sub-item "${subFormData.name}"! 🎀`);
  };

  const handleDeleteSubItem = (navId: string, groupId: string, subItemId: string) => {
    const navItem = navigationConfig.items.find((it) => it.id === navId);
    if (!navItem) return;

    const updatedSubGroups = (navItem.subGroups || []).map((grp) => {
      if (grp.id === groupId) {
        return {
          ...grp,
          subItems: grp.subItems.filter((s) => s.id !== subItemId),
        };
      }
      return grp;
    });

    updateNavItem({
      ...navItem,
      subGroups: updatedSubGroups,
    });

    showToast('Deleted sub-navigation link.');
  };

  return (
    <div className="flex min-h-screen bg-[#F8F7F4]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader
          title="Navbar & Sub-Navigation Studio"
          subtitle="Add, delete, update storefront navbar links, badges, and hierarchical sub-navigation menus"
          actions={
            <div className="flex items-center space-x-2">
              <button
                onClick={() => {
                  if (confirm('Reset navigation to default brand structure?')) {
                    resetNavigationConfig();
                    showToast('Navigation reset to defaults! 🌸');
                  }
                }}
                className="inline-flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-stone-600 hover:text-stone-900 bg-white hover:bg-stone-100 border border-stone-200 text-xs font-bold transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset Defaults</span>
              </button>
              <button
                onClick={handleOpenAddMain}
                className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-xs shadow-md shadow-amber-600/20 transition-all hover:scale-105 active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>Add Nav Link</span>
              </button>
            </div>
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
          {/* Live Floating Capsule Navbar Preview */}
          <div className="bg-white p-6 rounded-3xl border border-stone-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-stone-500 flex items-center space-x-1.5">
                <Eye className="w-4 h-4 text-amber-600" />
                <span>Live Navbar Capsule Preview (Desktop View)</span>
              </span>
              <span className="text-[10px] text-stone-400">
                {navigationConfig.items.filter((i) => i.isActive).length} active items
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FAF9F6] via-[#FDF2F8]/40 to-[#FAF9F6] border border-stone-200 flex items-center justify-center overflow-x-auto">
              <div className="bg-[#f0ece5]/90 backdrop-blur-md p-1.5 rounded-full border border-white/80 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.06)] flex items-center space-x-1">
                {navigationConfig.items
                  .filter((i) => i.isActive)
                  .map((item) => (
                    <div
                      key={item.id}
                      className="relative px-3.5 py-1.5 rounded-full text-[11px] font-heading font-extrabold tracking-wider uppercase text-stone-800 bg-white/40 border border-white/60 shadow-2xs flex items-center space-x-1"
                    >
                      <span>{item.name}</span>
                      {item.badge && (
                        <span className="bg-[#C68A4C] text-white text-[7px] font-black px-1 rounded">
                          {item.badge}
                        </span>
                      )}
                      {(item.dropdownType || (item.subGroups && item.subGroups.length > 0)) && (
                        <ChevronDown className="w-3 h-3 text-stone-500" />
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Navigation Items Manager */}
          <div className="bg-white rounded-3xl border border-stone-200/80 overflow-hidden shadow-xs">
            <div className="p-6 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900 font-heading">
                  Storefront Navigation Links
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Click on an item to expand and manage its sub-navigation parts & categories
                </p>
              </div>
            </div>

            <div className="divide-y divide-stone-100">
              {navigationConfig.items.map((item, index) => {
                const isExpanded = expandedItemId === item.id;
                const subGroupCount = item.subGroups?.length || 0;
                const totalSubItems =
                  item.subGroups?.reduce((acc, g) => acc + g.subItems.length, 0) || 0;

                return (
                  <div key={item.id} className="transition-colors hover:bg-stone-50/50">
                    {/* Main Nav Item Row */}
                    <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center space-x-3.5 flex-1">
                        {/* Order Reorder buttons */}
                        <div className="flex items-center space-x-1">
                          <button
                            type="button"
                            disabled={index === 0}
                            onClick={() => handleMoveOrder(index, 'up')}
                            className="p-1 text-stone-400 hover:text-stone-800 disabled:opacity-20"
                            title="Move Up"
                          >
                            <MoveUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            disabled={index === navigationConfig.items.length - 1}
                            onClick={() => handleMoveOrder(index, 'down')}
                            className="p-1 text-stone-400 hover:text-stone-800 disabled:opacity-20"
                            title="Move Down"
                          >
                            <MoveDown className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Title & Badge */}
                        <div className="flex items-center space-x-2.5">
                          <span className="font-heading font-black text-sm text-stone-900 tracking-wider">
                            {item.name}
                          </span>
                          {item.badge && (
                            <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-500 text-stone-950">
                              {item.badge}
                            </span>
                          )}
                          <span className="text-xs text-stone-400 font-mono">({item.href})</span>
                        </div>

                        {/* Sub menu indicator */}
                        {subGroupCount > 0 && (
                          <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                            {totalSubItems} sub-items ({subGroupCount} groups)
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2.5 self-end sm:self-center">
                        {/* Active toggle */}
                        <button
                          type="button"
                          onClick={() => handleToggleActive(item)}
                          className={`px-3 py-1 rounded-full text-[10px] font-extrabold transition-all ${
                            item.isActive
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-stone-100 text-stone-400'
                          }`}
                        >
                          {item.isActive ? 'ACTIVE (Visible)' : 'HIDDEN'}
                        </button>

                        {/* Expand / Sub-menu toggle */}
                        {item.subGroups && item.subGroups.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                            className="inline-flex items-center space-x-1 px-3 py-1 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold transition-colors"
                          >
                            <span>Sub-menus</span>
                            {isExpanded ? (
                              <ChevronDown className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronRight className="w-3.5 h-3.5" />
                            )}
                          </button>
                        )}

                        {/* Edit & Delete */}
                        <button
                          onClick={() => handleOpenEditMain(item)}
                          className="p-1.5 text-stone-500 hover:text-amber-800 hover:bg-amber-100/60 rounded-lg transition-colors"
                          title="Edit Link"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Delete "${item.name}" from navigation?`)) {
                              deleteNavItem(item.id);
                              showToast(`Deleted "${item.name}".`);
                            }
                          }}
                          className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Delete Link"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* EXPANDED SUB-NAVIGATION SECTION */}
                    {isExpanded && item.subGroups && item.subGroups.length > 0 && (
                      <div className="p-6 bg-stone-50/70 border-t border-stone-100 space-y-6">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center space-x-2">
                            <Layers className="w-4 h-4 text-amber-600" />
                            <span>Sub-Navigation Categories for "{item.name}"</span>
                          </h4>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {item.subGroups.map((group) => (
                            <div
                              key={group.id}
                              className="p-4 bg-white rounded-2xl border border-stone-200 space-y-3 shadow-2xs"
                            >
                              <div className="flex items-center justify-between border-b border-stone-100 pb-2">
                                <span className="font-heading font-black text-xs text-amber-900 tracking-wider uppercase">
                                  {group.title}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleOpenAddSub(item.id, group.id)}
                                  className="text-[10px] font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 px-2 py-0.5 rounded border border-amber-200 flex items-center space-x-1"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Add Link</span>
                                </button>
                              </div>

                              <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                                {group.subItems.map((sub) => (
                                  <div
                                    key={sub.id}
                                    className="p-2 rounded-xl bg-stone-50 hover:bg-amber-50/50 border border-stone-100 flex items-center justify-between text-xs group"
                                  >
                                    <div>
                                      <p className="font-bold text-stone-800 text-[11px]">{sub.name}</p>
                                      <p className="text-[10px] text-stone-400 font-mono">{sub.href}</p>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteSubItem(item.id, group.id, sub.id)}
                                      className="p-1 text-stone-300 group-hover:text-rose-500 rounded hover:bg-rose-50"
                                      title="Remove sub-item"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      {/* Main Nav Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-200 space-y-4">
            <h3 className="text-base font-bold font-heading text-stone-900">
              {editingItem ? 'Edit Navigation Link' : 'Add New Navigation Link'}
            </h3>

            <form onSubmit={handleSaveMain} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-stone-700 mb-1">Navigation Label (e.g. GIFTS, NEWBORN) *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900 uppercase"
                  placeholder="e.g. GIFTS"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1">Target Route / URL (Href) *</label>
                <input
                  type="text"
                  required
                  value={formData.href}
                  onChange={(e) => setFormData({ ...formData, href: e.target.value })}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900"
                  placeholder="/shop or /collections"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1">Highlight Badge (Optional)</label>
                <input
                  type="text"
                  value={formData.badge}
                  onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900"
                  placeholder="e.g. NEW, SALE, HOT"
                />
              </div>

              <div className="flex items-center space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 text-amber-600 rounded"
                />
                <label htmlFor="isActiveToggle" className="text-stone-700 cursor-pointer">
                  Visible in Storefront Navbar
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  Save Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Sub Item Modal */}
      {isSubModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200 space-y-4">
            <h3 className="text-base font-bold font-heading text-stone-900">
              Add Sub-Navigation Link
            </h3>

            <form onSubmit={handleSaveSubItem} className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-stone-700 mb-1">Link Name *</label>
                <input
                  type="text"
                  required
                  value={subFormData.name}
                  onChange={(e) => setSubFormData({ ...subFormData, name: e.target.value })}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900"
                  placeholder="e.g. Cashmere Blankets"
                />
              </div>

              <div>
                <label className="block text-stone-700 mb-1">URL (Href) *</label>
                <input
                  type="text"
                  required
                  value={subFormData.href}
                  onChange={(e) => setSubFormData({ ...subFormData, href: e.target.value })}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-stone-900"
                  placeholder="/shop?category=blankets"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsSubModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-200 text-stone-600 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold"
                >
                  Add Sub-Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
