import React from 'react';
import AdminSidebar from './components/AdminSidebar';
import AdminGuard from '@/components/AdminGuard';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AdminGuard>
      <div className="flex h-screen bg-background-light font-body">
        <AdminSidebar />
        <main className="flex-1 p-8 overflow-y-auto w-full">
          {children}
        </main>
      </div>
    </AdminGuard>
  );
}
