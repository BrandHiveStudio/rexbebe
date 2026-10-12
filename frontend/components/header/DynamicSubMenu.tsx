'use client';

import React from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { NavSubGroup } from '../../types/admin';

interface DynamicSubMenuProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subGroups?: NavSubGroup[];
  align?: 'left' | 'right';
}

export function DynamicSubMenu({
  isOpen,
  onClose,
  title,
  subGroups,
  align = 'left',
}: DynamicSubMenuProps) {
  if (!subGroups || subGroups.length === 0) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.98 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          onMouseLeave={onClose}
          className={`absolute top-[calc(100%+8px)] ${
            align === 'right' ? 'right-0 left-auto' : 'left-0 right-auto'
          } z-50 flex items-start select-none`}
        >
          <div className="min-w-[280px] max-w-[500px] bg-[#e4e0d9]/95 backdrop-blur-2xl rounded-[32px] border border-white/70 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.18)] relative">
            <div className="text-[11px] font-bold tracking-[0.2em] uppercase text-amber-900 border-b border-amber-900/15 pb-2 mb-4 flex items-center justify-between">
              <span>{title}</span>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-white/60 text-amber-950 font-bold">Menu</span>
            </div>

            <div className={`grid ${subGroups.length > 1 ? 'grid-cols-2 gap-6' : 'grid-cols-1 gap-2'}`}>
              {subGroups.map((group) => (
                <div key={group.id} className="space-y-2">
                  <div className="text-[10px] font-extrabold tracking-widest uppercase text-stone-500 px-2">
                    {group.title}
                  </div>
                  <div className="space-y-1">
                    {group.subItems.map((subItem) => (
                      <Link
                        key={subItem.id}
                        href={subItem.href}
                        onClick={onClose}
                        className="flex items-center justify-between text-[12px] font-extrabold tracking-wider uppercase text-stone-900 hover:text-amber-900 hover:bg-white/40 px-3 py-1.5 rounded-xl transition-all"
                      >
                        <span>{subItem.name}</span>
                        {subItem.badge && (
                          <span className="text-[8px] bg-[#C68A4C] text-white px-1.5 py-0.2 rounded font-bold">
                            {subItem.badge}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
