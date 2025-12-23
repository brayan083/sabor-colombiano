'use client';

import React, { useState } from 'react';
import AdminSidebar from './components/AdminSidebar';
import AdminGuard from '@/components/AdminGuard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <AdminGuard>
      <div className="flex h-screen bg-background-light font-body">
        {/* Mobile Overlay */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar - Hidden on mobile, slides in when open */}
        <div
          className={`
            fixed lg:static inset-y-0 left-0 z-50 lg:z-auto
            transform transition-transform duration-300 ease-in-out
            ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
          `}
        >
          <AdminSidebar onClose={() => setIsSidebarOpen(false)} />
        </div>

        {/* Main Content */}
        <main className="flex-1 flex flex-col overflow-hidden w-full">
          {/* Mobile Header with Hamburger */}
          <div className="lg:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 shadow-sm">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="flex items-center justify-center size-10 rounded-lg hover:bg-slate-100 transition-colors text-slate-700"
              aria-label="Abrir menú"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <h1 className="text-lg font-bold text-slate-900">Panel Admin</h1>
            <div className="size-10" /> {/* Spacer for centering */}
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </AdminGuard>
  );
}
