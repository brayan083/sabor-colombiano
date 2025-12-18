'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getProducts } from '@/lib/services/products';
import { getCategories } from '@/lib/services/categories';
import { Product, Category } from '@/types';
import AddToCart from '@/components/AddToCart';

const Catalog: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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
        <div className="min-h-screen bg-gray-50/50">
            {/* Hero Section */}
            <div className="relative bg-white overflow-hidden">
                <div className="absolute inset-0 bg-primary/5 pattern-grid-lg opacity-20"></div>
                <div className="relative max-w-7xl mx-auto px-4 py-10 sm:py-16 sm:px-6 lg:px-8 flex flex-col items-center text-center">
                    <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary font-bold text-[10px] sm:text-xs mb-3 tracking-wide uppercase">
                        Sabor Auténtico
                    </span>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-3 sm:mb-4 leading-tight">
                        Descubre Nuestros <span className="text-primary relative inline-block">Sabores
                            <svg className="absolute w-full h-2 sm:h-3 bottom-1 left-0 text-primary/20 -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5 L 100 10 L 0 10 Z" fill="currentColor" />
                            </svg>
                        </span>
                    </h1>
                    <p className="max-w-2xl text-base sm:text-lg text-slate-600 px-4">
                        Preparados con ingredientes frescos y el toque tradicional que nos caracteriza.
                        ¡Pide ahora y disfruta en casa!
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Horizontal Category Filters */}
                <div className="sticky top-[72px] z-30 bg-gray-50/95 backdrop-blur-sm pt-2 pb-6 -mx-4 px-4 sm:mx-0 sm:px-0">
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x">
                        <button
                            onClick={() => setSelectedCategory(null)}
                            className={`flex-none snap-start px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm
                                ${selectedCategory === null
                                    ? 'bg-slate-900 text-white shadow-slate-900/20 scale-105'
                                    : 'bg-white text-slate-600 hover:bg-white/80 border border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            Todos
                        </button>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={`flex-none snap-start px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm whitespace-nowrap
                                    ${selectedCategory === cat.id
                                        ? 'bg-primary text-white shadow-primary/25 scale-105'
                                        : 'bg-white text-slate-600 hover:bg-white/80 border border-gray-200 hover:border-gray-300'
                                    }`}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="flex flex-col items-center gap-4">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            <p className="text-sm font-medium text-slate-500 animate-pulse">Cargando delicias...</p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-in fade-in duration-500">
                        {filteredProducts.map((prod, index) => {
                            const isOutOfStock = prod.stock <= 0 || prod.inStock === false;

                            return (
                                <div key={prod.id} className={`group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1 ${isOutOfStock ? 'opacity-75 grayscale-[0.8]' : ''}`}>
                                    {/* Image Container */}
                                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
                                        <Image
                                            fill
                                            className={`object-cover transition-transform duration-700 ${!isOutOfStock && 'group-hover:scale-110'}`}
                                            src={prod.image}
                                            alt={prod.name}
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            priority={index < 4}
                                        />
                                        <Link href={`/product/${prod.id}`} className="absolute inset-0 z-10" aria-label={`Ver ${prod.name}`} />

                                        {/* Badges/Status */}
                                        <div className="absolute top-3 right-3 flex flex-col gap-2 pointer-events-none z-20">
                                            {isOutOfStock && (
                                                <span className="bg-red-500 text-white text-[10px] font-black px-2 py-1 rounded shadow-sm tracking-wide uppercase">
                                                    Agotado
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-4 sm:p-5 flex flex-col flex-1">
                                        <div className="flex-1">
                                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2 mb-2">
                                                <Link href={`/product/${prod.id}`} className="hover:text-primary transition-colors">
                                                    <h3 className="font-bold text-slate-900 text-base sm:text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                                                        {prod.name}
                                                    </h3>
                                                </Link>
                                                <span className="font-black text-base sm:text-lg text-primary shrink-0">
                                                    ${prod.price.toLocaleString()}
                                                </span>
                                            </div>
                                            <p className="text-slate-500 text-xs sm:text-sm line-clamp-2 mb-4 leading-relaxed min-h-[2.5em]">
                                                {prod.description}
                                            </p>
                                        </div>

                                        <div className="pt-4 border-t border-gray-50 flex items-center justify-between gap-4">
                                            {isOutOfStock ? (
                                                <button
                                                    disabled
                                                    className="w-full py-2.5 bg-gray-100 text-gray-400 font-bold rounded-xl text-sm cursor-not-allowed border border-gray-200 flex items-center justify-center gap-2"
                                                >
                                                    <span className="material-symbols-outlined text-[18px]">block</span>
                                                    No disponible
                                                </button>
                                            ) : (
                                                <div className="w-full">
                                                    <AddToCart product={prod} wrapperClassName="z-10 relative" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}

                        {filteredProducts.length === 0 && (
                            <div className="col-span-full py-20 flex flex-col items-center justify-center text-center">
                                <div className="size-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                    <span className="material-symbols-outlined text-4xl text-gray-400">restaurant_menu</span>
                                </div>
                                <h3 className="text-lg font-bold text-slate-900 mb-1">Sin resultados</h3>
                                <p className="text-slate-500">No encontramos productos en esta categoría.</p>
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className="mt-6 text-primary font-bold hover:underline"
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

export default Catalog;
