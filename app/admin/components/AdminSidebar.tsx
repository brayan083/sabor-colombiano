"use client";

import { useAuth } from '@/lib/auth/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const AdminSidebar: React.FC = () => {
    const pathname = usePathname();
    const { user, signOut } = useAuth();

    const isActive = (path: string) => pathname === path;

    return (
        <aside className="w-64 shrink-0 bg-white border-r border-gray-200 p-4 flex flex-col justify-between h-full">
            <div className="flex flex-col gap-8">
                <div className="flex items-center gap-2 px-2">
                    <span className="material-symbols-outlined text-primary-admin text-3xl">restaurant_menu</span>
                    <h1 className="text-slate-900 text-xl font-bold">ColFood</h1>
                </div>
                {/* ... links unchanged ... */}
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <Link 
                            href="/admin" 
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isActive('/admin') ? 'bg-primary-admin/10 text-primary-admin' : 'text-slate-600 hover:bg-gray-100'}`}
                        >
                            <span className="material-symbols-outlined">dashboard</span>
                            <p className="text-sm font-medium leading-normal">Dashboard</p>
                        </Link>
                        <Link 
                            href="/admin/orders" 
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isActive('/admin/orders') ? 'bg-primary-admin/10 text-primary-admin' : 'text-slate-600 hover:bg-gray-100'}`}
                        >
                            <span className="material-symbols-outlined">shopping_cart</span>
                            <p className="text-sm font-medium leading-normal">Pedidos</p>
                        </Link>
                        <Link 
                            href="/admin/products" 
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isActive('/admin/products') ? 'bg-primary-admin/10 text-primary-admin' : 'text-slate-600 hover:bg-gray-100'}`}
                        >
                            <span className="material-symbols-outlined">inventory_2</span>
                            <p className="text-sm font-medium leading-normal">Productos</p>
                        </Link>
                        <Link 
                            href="/admin/categories" 
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isActive('/admin/categories') ? 'bg-primary-admin/10 text-primary-admin' : 'text-slate-600 hover:bg-gray-100'}`}
                        >
                            <span className="material-symbols-outlined">category</span>
                            <p className="text-sm font-medium leading-normal">Categorías</p>
                        </Link>
                        <Link 
                            href="/admin/customers" 
                            className={`flex items-center gap-3 px-3 py-2 rounded-lg ${isActive('/admin/customers') ? 'bg-primary-admin/10 text-primary-admin' : 'text-slate-600 hover:bg-gray-100'}`}
                        >
                            <span className="material-symbols-outlined">group</span>
                            <p className="text-sm font-medium leading-normal">Clientes</p>
                        </Link>
                    </div>
                </div>
            </div>
            <div className="flex flex-col gap-4">
                <div className="border-t pt-4">
                    <div className="flex gap-3 items-center">
                        <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 bg-gray-100 flex items-center justify-center overflow-hidden">
                             {user?.photoURL ? (
                                <img src={user.photoURL} alt="User" width={40} height={40} />
                             ) : (
                                <span className="material-symbols-outlined text-slate-400">person</span>
                             )}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <h1 className="text-slate-900 text-sm font-medium leading-normal truncate max-w-[100px]">{user?.displayName || 'Admin'}</h1>
                            <p className="text-slate-500 text-xs font-normal leading-normal truncate max-w-[100px]">{user?.email}</p>
                        </div>
                        <button onClick={signOut} className="ml-auto text-xs text-primary-admin hover:underline" title="Cerrar Sesión">
                            <span className="material-symbols-outlined">logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default AdminSidebar;
