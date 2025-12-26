'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { getProducts } from '@/lib/services/products';
import { getCategories } from '@/lib/services/categories';
import { Product, Category } from '@/types';
import AddToCart from '@/components/AddToCart';

const CatalogContent: React.FC = () => {
    const searchParams = useSearchParams();
    const categoryFromUrl = searchParams.get('category');

    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(categoryFromUrl);

    useEffect(() => {
        if (categoryFromUrl) {
            setSelectedCategory(categoryFromUrl);
        }
    }, [categoryFromUrl]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsData, categoriesData] = await Promise.all([
                    getProducts(),
                    getCategories()
                ]);
                setProducts(productsData);
                setCategories(categoriesData);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const filteredProducts = selectedCategory
        ? products.filter(p => p.categoryId === selectedCategory)
        : products;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50/30">
            {/* Hero Section - Mejorado */}
            <div className="relative bg-gradient-to-br from-primary/5 via-white to-amber-50/50 overflow-hidden">
                {/* Decorative Elements */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.1),transparent_50%)]"></div>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(251,146,60,0.08),transparent_50%)]"></div>

                <div className="relative max-w-7xl mx-auto px-4 py-12 sm:py-20 sm:px-6 lg:px-8 flex flex-col items-center text-center">
                    {/* Badge mejorado */}
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/20 to-amber-500/20 backdrop-blur-sm border border-primary/20 text-primary font-bold text-xs mb-4 tracking-wide uppercase shadow-lg shadow-primary/10">
                        <span className="size-2 bg-primary rounded-full animate-pulse"></span>
                        Sabor Auténtico
                    </span>

                    {/* Título mejorado */}
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-slate-900 tracking-tight mb-4 sm:mb-5 leading-tight">
                        Descubre Nuestros{' '}
                        <span className="relative inline-block">
                            <span className="relative z-10 bg-gradient-to-r from-primary via-amber-500 to-orange-500 bg-clip-text text-transparent">
                                Sabores
                            </span>
                            {/* Underline decorativo */}
                            <svg className="absolute w-full h-3 sm:h-4 -bottom-1 left-0 text-primary/30 -z-0" viewBox="0 0 100 12" preserveAspectRatio="none">
                                <path d="M0 6 Q 25 12, 50 6 T 100 6 L 100 12 L 0 12 Z" fill="currentColor" />
                            </svg>
                        </span>
                    </h1>

                    {/* Descripción mejorada */}
                    <p className="max-w-2xl text-base sm:text-lg text-slate-600 px-4 leading-relaxed">
                        Preparados con <span className="font-semibold text-slate-700">ingredientes frescos</span> y el toque tradicional que nos caracteriza.
                        <br className="hidden sm:block" />
                        <span className="text-primary font-semibold">¡Pide ahora y disfruta en casa!</span>
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Filtros de Categorías - Rediseñados */}
                <div className="mb-6">
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`flex-none px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200
                                ${selectedCategory === null
                                    ? 'bg-slate-900 text-white shadow-md'
                                    : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                                }`}
                        >
                            Todos
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`flex-none px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-200 whitespace-nowrap
                                    ${selectedCategory === cat.id
                                        ? 'bg-primary text-white shadow-md'
                                        : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Grid de Productos - Mejorado */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="flex flex-col items-center gap-4">
                            <div className="relative">
                                <div className="animate-spin rounded-full h-14 w-14 border-4 border-primary/20 border-t-primary"></div>
                                <div className="absolute inset-0 rounded-full bg-primary/5 animate-pulse"></div>
                            </div>
                            <p className="text-sm font-semibold text-slate-600 animate-pulse">Cargando delicias...</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 animate-in fade-in duration-500">
                        {filteredProducts.map((prod, index) => {
                            const isOutOfStock = prod.stock <= 0 || prod.inStock === false;

                            return (
                                <div
                                    key={prod.id}
                                    className={`group relative bg-white rounded-3xl border border-slate-200/60 shadow-md hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 flex flex-col overflow-hidden hover:-translate-y-2 ${isOutOfStock ? 'opacity-60 grayscale' : ''}`}
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    {/* Imagen del Producto */}
                                    <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-slate-100 to-slate-50">
                                        <Image
                                            fill
                                            className={`object-cover transition-all duration-700 ${!isOutOfStock && 'group-hover:scale-110 group-hover:rotate-1'}`}
                                            src={prod.image}
                                            alt={prod.name}
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            priority={index < 4}
                                        />
                                        <Link href={`/product/${prod.id}`} className="absolute inset-0 z-10" aria-label={`Ver ${prod.name}`} />

                                        {/* Overlay gradiente en hover */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                        {/* Badges mejorados */}
                                        <div className="absolute top-3 right-3 flex flex-col gap-2 pointer-events-none z-20">
                                            {isOutOfStock && (
                                                <span className="bg-gradient-to-r from-red-500 to-red-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg shadow-red-500/50 tracking-wide uppercase flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-[14px]">block</span>
                                                    Agotado
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Contenido de la Tarjeta */}
                                    <div className="p-3 sm:p-5 flex flex-col flex-1 bg-gradient-to-b from-white to-slate-50/50">
                                        <div className="flex-1">
                                            {/* Nombre y Precio */}
                                            <div className="flex flex-col gap-1 sm:gap-2 mb-2 sm:mb-3">
                                                <Link href={`/product/${prod.id}`} className="hover:text-primary transition-colors">
                                                    <h3 className="font-bold text-slate-900 text-sm sm:text-base md:text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                                                        {prod.name}
                                                    </h3>
                                                </Link>
                                                <span className="font-black text-base sm:text-lg bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">
                                                    ${prod.price.toLocaleString()}
                                                </span>
                                            </div>

                                            {/* Descripción */}
                                            <p
                                                className="hidden sm:block text-slate-500 text-xs mb-3 overflow-hidden"
                                                style={{
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    lineHeight: '1.4em',
                                                    maxHeight: '2.8em'
                                                }}
                                            >
                                                {prod.description}
                                            </p>
                                        </div>

                                        {/* Botón de Acción */}
                                        <div className="pt-2 sm:pt-4 border-t border-slate-100 flex items-center justify-between gap-2 sm:gap-4">
                                            {isOutOfStock ? (
                                                <button
                                                    disabled
                                                    className="w-full py-2 sm:py-3 bg-slate-100 text-slate-400 font-bold rounded-xl sm:rounded-2xl text-xs sm:text-sm cursor-not-allowed border border-slate-200 flex items-center justify-center gap-1 sm:gap-2 transition-all"
                                                >
                                                    <span className="material-symbols-outlined text-[16px] sm:text-[18px]">block</span>
                                                    <span className="hidden xs:inline">No disponible</span>
                                                    <span className="xs:hidden">Agotado</span>
                                                </button>
                                            ) : (
                                                <div className="w-full">
                                                    <AddToCart product={prod} wrapperClassName="z-10 relative" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Efecto de brillo en hover */}
                                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                                        <div className="absolute inset-0 rounded-3xl ring-1 ring-primary/20"></div>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Estado Vacío */}
                        {filteredProducts.length === 0 && (
                            <div className="col-span-full py-24 flex flex-col items-center justify-center text-center">
                                <div className="size-24 bg-gradient-to-br from-slate-100 to-slate-50 rounded-3xl flex items-center justify-center mb-5 shadow-lg">
                                    <span className="material-symbols-outlined text-5xl text-slate-400">restaurant_menu</span>
                                </div>
                                <h3 className="text-xl font-bold text-slate-900 mb-2">Sin resultados</h3>
                                <p className="text-slate-500 mb-6">No encontramos productos en esta categoría.</p>
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className="px-6 py-3 bg-gradient-to-r from-primary to-amber-500 text-white font-bold rounded-2xl hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105"
                                >
                                    Ver todo el menú
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default function Catalog() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/20 border-t-primary"></div></div>}>
            <CatalogContent />
        </Suspense>
    );
}
