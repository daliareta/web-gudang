import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ArrowRightLeft, 
  Settings, 
  Menu, 
  X,
  Box,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onLogout: () => void;
}

const Sidebar = ({ activeTab, setActiveTab, isOpen, setIsOpen, onLogout }: SidebarProps) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventaris', icon: Package },
    { id: 'transactions', label: 'Transaksi', icon: ArrowRightLeft },
    { id: 'categories', label: 'Kategori', icon: Box },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 left-0 bottom-0 w-72 bg-slate-900 border-r border-slate-800 z-50 transition-transform duration-300 lg:translate-x-0 lg:static",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-20 flex items-center px-8 border-b border-slate-800/50">
          <div className="flex items-center gap-3 font-bold text-2xl text-indigo-400 tracking-tight">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg shadow-indigo-500/20">
              <Box className="w-6 h-6" />
            </div>
            <span>GudangSWY</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="ml-auto lg:hidden text-slate-500 p-2 hover:bg-slate-800 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        <nav className="p-6 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-200",
                  activeTab === item.id 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
                )}
              >
                <Icon size={20} className={cn(activeTab === item.id ? "text-white" : "text-slate-500")} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl text-sm font-semibold text-rose-400 hover:bg-rose-500/10 hover:text-rose-300 transition-all duration-200 group"
          >
            <LogOut size={20} className="text-rose-500 group-hover:scale-110 transition-transform" />
            Keluar Sistem
          </button>

          <div className="p-4 bg-slate-950/50 rounded-2xl border border-slate-800 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-indigo-400 shadow-inner">
              A
            </div>
            <div className="min-w-0">
              <p className="font-bold text-slate-100 truncate">Admin Gudang</p>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Administrator</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
