"use client";

import { useAuth } from '@/lib/auth/AuthContext';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

interface AdminSidebarProps {
    onClose?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ onClose }) => {
    const pathname = usePathname();
    const { user, signOut } = useAuth();

    const isActive = (path: string) => pathname === path;

    const menuItems = [
        { href: '/admin', icon: 'dashboard', label: 'Dashboard' },
        { href: '/admin/orders', icon: 'shopping_cart', label: 'Pedidos' },
        { href: '/admin/products', icon: 'inventory_2', label: 'Productos' },
        { href: '/admin/stock', icon: 'inventory', label: 'Inventario' },
        { href: '/admin/categories', icon: 'category', label: 'Categorías' },
        { href: '/admin/customers', icon: 'group', label: 'Clientes' },
    ];

    return (
        <aside className="w-64 shrink-0 bg-gradient-to-br from-slate-50 via-white to-slate-50 border-r border-slate-200/60 p-5 flex flex-col justify-between h-full shadow-sm">
            <div className="flex flex-col gap-8">
                {/* Logo Section with Close Button */}
                <div className="flex items-center justify-between px-2 py-3">
                    <div className="flex items-center gap-3">
                        <div className="relative size-10 rounded-xl bg-gradient-to-br from-primary-admin to-primary-admin/80 p-1.5 shadow-lg shadow-primary-admin/20">
                            <Image src="/img/logo2.png" alt="Empalombia" fill className="object-contain p-0.5" sizes="40px" />
                        </div>
                        <h1 className="text-slate-900 text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                            Empalombia
                        </h1>
                    </div>
                    {/* Close button - only visible on mobile */}
                    {onClose && (
                        <button
                            onClick={onClose}
                            className="lg:hidden flex items-center justify-center size-8 rounded-lg hover:bg-slate-200 transition-colors text-slate-600"
                            aria-label="Cerrar menú"
                        >
                            <span className="material-symbols-outlined text-[20px]">close</span>
                        </button>
                    )}
                </div>

                <nav className="flex flex-col gap-1.5">
                    {menuItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => onClose?.()}
                            className={`
                                group relative flex items-center gap-3 px-4 py-3 rounded-xl
                                transition-all duration-300 ease-out
                                ${isActive(item.href)
                                    ? 'bg-gradient-to-r from-primary-admin to-primary-admin/90 text-white shadow-lg shadow-primary-admin/30 scale-[1.02]'
                                    : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 hover:scale-[1.01] hover:shadow-sm'
                                }
                            `}
                        >
                            {/* Icon with background effect */}
                            <div className={`
                                relative flex items-center justify-center size-8 rounded-lg
                                transition-all duration-300
                                ${isActive(item.href)
                                    ? 'bg-white/20 shadow-inner'
                                    : 'bg-slate-100/50 group-hover:bg-slate-200/80'
                                }
                            `}>
                                <span className={`
                                    material-symbols-outlined text-[20px]
                                    ${isActive(item.href) ? 'text-white' : 'text-slate-600 group-hover:text-slate-900'}
                                `}>
                                    {item.icon}
                                </span>
                            </div>

                            {/* Label */}
                            <p className={`
                                text-sm font-semibold leading-normal
                                ${isActive(item.href) ? 'text-white' : 'text-slate-700 group-hover:text-slate-900'}
                            `}>
                                {item.label}
                            </p>

                            {/* Active indicator */}
                            {isActive(item.href) && (
                                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-white shadow-sm animate-pulse" />
                            )}
                        </Link>
                    ))}
                </nav>

                {/* Back to Store Button */}
                <div className="mt-4 pt-4 border-t border-slate-200/60">
                    <Link
                        href="/"
                        onClick={() => onClose?.()}
                        className="group flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-slate-100 to-slate-50 hover:from-primary-admin/10 hover:to-primary-admin/5 border border-slate-200/60 hover:border-primary-admin/30 transition-all duration-300 hover:scale-[1.01] hover:shadow-md"
                    >
                        <div className="flex items-center justify-center size-8 rounded-lg bg-white group-hover:bg-primary-admin/10 transition-all duration-300">
                            <span className="material-symbols-outlined text-[20px] text-slate-600 group-hover:text-primary-admin">
                                storefront
                            </span>
                        </div>
                        <p className="text-sm font-semibold text-slate-700 group-hover:text-primary-admin transition-colors">
                            Volver a la Tienda
                        </p>
                        <span className="material-symbols-outlined text-[16px] text-slate-400 group-hover:text-primary-admin ml-auto transition-all duration-300 group-hover:translate-x-0.5">
                            arrow_forward
                        </span>
                    </Link>
                </div>
            </div>

            {/* User Section */}
            <div className="flex flex-col gap-4">
                <div className="border-t border-slate-200/60 pt-4">
                    <div className="flex gap-3 items-center p-3 rounded-xl bg-gradient-to-br from-slate-100/50 to-slate-50 hover:from-slate-100 hover:to-slate-100/80 transition-all duration-300 group">
                        {/* User Avatar */}
                        <div className="relative">
                            <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-11 bg-gradient-to-br from-primary-admin/20 to-primary-admin/10 flex items-center justify-center overflow-hidden ring-2 ring-white shadow-md">
                                {user?.photoURL ? (
                                    <Image src={user.photoURL} alt="User" width={44} height={44} className="object-cover" />
                                ) : (
                                    <span className="material-symbols-outlined text-primary-admin text-[24px]">person</span>
                                )}
                            </div>
                            <div className="absolute -bottom-0.5 -right-0.5 size-3 bg-green-500 rounded-full border-2 border-white shadow-sm" />
                        </div>

                        {/* User Info */}
                        <div className="flex flex-col overflow-hidden flex-1">
                            <h1 className="text-slate-900 text-sm font-semibold leading-tight truncate">
                                {user?.displayName || 'Admin'}
                            </h1>
                            <p className="text-slate-500 text-xs font-medium leading-tight truncate mt-0.5">
                                {user?.email}
                            </p>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={signOut}
                            className="flex items-center justify-center size-9 rounded-lg bg-white text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all duration-300 shadow-sm hover:shadow group-hover:scale-105"
                            title="Cerrar Sesión"
                        >
                            <span className="material-symbols-outlined text-[20px]">logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default AdminSidebar;
