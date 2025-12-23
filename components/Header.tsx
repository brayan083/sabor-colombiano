import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { useCart } from '@/lib/context/CartContext';

const Header: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();
    const { user, signOut, loading } = useAuth();
    const { totalItems } = useCart();
    const [isDropdownOpen, setIsDropdownOpen] = React.useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

    const isActive = (path: string) => pathname === path ? "text-primary font-bold" : "text-slate-700 hover:text-primary";

    const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    // Close dropdown when clicking outside
    React.useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (!target.closest('#user-menu-button') && !target.closest('#user-menu-dropdown')) {
                setIsDropdownOpen(false);
            }
        };

        if (isDropdownOpen) {
            document.addEventListener('click', handleClickOutside);
        }

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [isDropdownOpen]);

    // Close mobile menu on route change
    React.useEffect(() => {
        setIsMobileMenuOpen(false);
    }, [pathname]);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-black/10 bg-white/95 backdrop-blur-md px-4 sm:px-10 py-3 shadow-sm transition-all duration-200">
            <div className="relative flex items-center justify-between whitespace-nowrap">
                {/* Left: Logo */}
                <div className="flex items-center">
                    <Link href="/" className="flex items-center gap-3 text-slate-900 hover:opacity-80 transition-opacity">
                        <div className="relative size-14">
                            <Image src="/img/logo2.png" alt="Empalombia Logo" fill className="object-contain" priority sizes="56px" />
                        </div>
                        <h2 className="hidden sm:block text-xl font-bold leading-tight tracking-tight text-slate-900">Empalombia</h2>
                    </Link>
                </div>

                {/* Center: Navigation - Always Visible */}
                <nav className="absolute left-1/2 -translate-x-1/2 flex items-center gap-6 sm:gap-8">
                    <Link href="/catalog" className={`text-sm leading-normal transition-colors ${isActive('/catalog')}`}>Menú</Link>
                </nav>

                {/* Right: Actions */}
                <div className="flex items-center gap-4">
                    {loading ? (
                        <div className="flex items-center gap-2 animate-pulse">
                            <div className="hidden md:flex flex-col items-end mr-2 gap-1">
                                <div className="h-3 w-20 bg-slate-200 rounded"></div>
                                <div className="h-2 w-24 bg-slate-200 rounded"></div>
                            </div>
                            <div className="size-10 rounded-full bg-slate-200"></div>
                        </div>
                    ) : user ? (
                        <div className="relative">
                            <button
                                id="user-menu-button"
                                onClick={toggleDropdown}
                                className="flex items-center gap-2 p-1 rounded-full hover:bg-black/5 transition-colors group"
                            >
                                <div className="flex items-center justify-center size-9 rounded-full bg-gray-100 overflow-hidden border border-gray-200 group-hover:border-primary/50 transition-colors">
                                    {user.photoURL ? (
                                        <Image src={user.photoURL} alt="Avatar" width={36} height={36} className="object-cover" />
                                    ) : (
                                        <span className="material-symbols-outlined text-slate-600 text-[20px]">person</span>
                                    )}
                                </div>
                                <span className="material-symbols-outlined text-slate-500 text-sm group-hover:text-slate-800 transition-colors">expand_more</span>
                            </button>

                            {isDropdownOpen && (
                                <div
                                    id="user-menu-dropdown"
                                    className="absolute right-0 mt-2 w-60 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200 ring-1 ring-black/5"
                                >
                                    <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/50">
                                        <p className="text-sm font-bold text-slate-900 truncate">{user.displayName || 'Usuario'}</p>
                                        <p className="text-xs text-slate-500 truncate">{user.email}</p>
                                    </div>
                                    <div className="py-1">
                                        {user.role === 'admin' && (
                                            <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-primary/5 hover:text-primary transition-colors" onClick={() => setIsDropdownOpen(false)}>
                                                <span className="material-symbols-outlined text-[20px]">dashboard</span>
                                                Panel Admin
                                            </Link>
                                        )}
                                        <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-primary/5 hover:text-primary transition-colors" onClick={() => setIsDropdownOpen(false)}>
                                            <span className="material-symbols-outlined text-[20px]">person</span>
                                            Mi Perfil
                                        </Link>
                                        <Link href="/orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-primary/5 hover:text-primary transition-colors" onClick={() => setIsDropdownOpen(false)}>
                                            <span className="material-symbols-outlined text-[20px]">receipt_long</span>
                                            Mis Pedidos
                                        </Link>
                                    </div>
                                    <div className="border-t border-gray-100 pt-1 mt-1">
                                        <button
                                            onClick={async () => {
                                                await signOut();
                                                setIsDropdownOpen(false);
                                            }}
                                            className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 text-left transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">logout</span>
                                            Cerrar Sesión
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            {/* Desktop: Show Login/Register buttons */}
                            <div className="hidden lg:flex items-center gap-3">
                                <Link href="/auth/login" className="text-sm font-semibold text-slate-600 hover:text-primary transition-colors">
                                    Iniciar Sesión
                                </Link>
                                <Link href="/auth/register" className="px-4 py-2 rounded-full bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-all shadow-sm hover:shadow-md">
                                    Registrarse
                                </Link>
                            </div>

                            {/* Mobile: Show Hamburger Menu for Auth */}
                            <button
                                onClick={toggleMobileMenu}
                                className="lg:hidden flex items-center justify-center size-10 rounded-lg hover:bg-gray-100 transition-colors text-slate-700"
                                aria-label="Toggle auth menu"
                            >
                                <span className="material-symbols-outlined">
                                    {isMobileMenuOpen ? 'close' : 'menu'}
                                </span>
                            </button>
                        </>
                    )}
                    <Link href="/cart" className="relative flex items-center justify-center size-10 rounded-full hover:bg-gray-100 transition-colors text-slate-700 hover:text-primary">
                        <span className="material-symbols-outlined">shopping_cart</span>
                        {totalItems > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                                {totalItems}
                            </span>
                        )}
                    </Link>
                </div>
            </div>

            {/* Mobile Auth Menu - Only for non-authenticated users */}
            {!user && isMobileMenuOpen && (
                <div className="lg:hidden absolute left-0 right-0 top-full mt-0 bg-white border-t border-gray-100 shadow-lg animate-in slide-in-from-top-2 duration-200">
                    <nav className="flex flex-col py-4">
                        <Link
                            href="/auth/login"
                            className="flex items-center gap-3 px-6 py-3 text-base text-slate-700 hover:text-primary hover:bg-primary/5 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">login</span>
                            Iniciar Sesión
                        </Link>
                        <Link
                            href="/auth/register"
                            className="flex items-center gap-3 px-6 py-3 text-base text-primary font-bold hover:bg-primary/5 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">person_add</span>
                            Registrarse
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
};
export default Header;
