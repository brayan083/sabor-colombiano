'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getProducts } from '@/lib/services/products';
import { getCategories } from '@/lib/services/categories';
import { Product, Category } from '@/types';
import AddToCart from '@/components/AddToCart';

// Metadata cannot be exported from a client component directly in the same file if we want it SEO compliant server-side.
// For now, we will omit the metadata export or move it to a layout if strictly needed, 
// but since we are switching to 'use client', we lose the server metadata export in the page file itself.
// We can accept this tradeoff for now or handle it via a wrapper. 
// Given the user wants functionality first, we proceed with 'use client'.

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
        <div className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-between gap-4 items-center">
                <div className="flex min-w-72 flex-col gap-2">
                    <h1 className="text-4xl font-black tracking-tighter">Explora Nuestros Sabores</h1>
                    <p className="text-slate-600 text-base font-normal">Descubre la auténtica comida colombiana, preparada con los mejores ingredientes.</p>
                </div>
            </div>
            
            <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-4">
                <aside className="col-span-1 lg:pr-8">
                    <h3 className="text-lg font-bold mb-4">Filtros</h3>
                    <div className="flex flex-col gap-4">
                        <details className="flex flex-col border-b border-black/10 py-2 group" open>
                            <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-2">
                                <p className="text-sm font-medium">Categorías</p>
                                <span className="material-symbols-outlined group-open:rotate-180 transition-transform">expand_more</span>
                            </summary>
                            <div className="pt-2">
                                <label className="flex gap-x-3 py-2 items-center cursor-pointer">
                                    <input 
                                        type="radio" 
                                        name="category"
                                        className="h-5 w-5 rounded border-black/10 border-2 bg-transparent text-primary focus:ring-0 focus:ring-offset-0"
                                        checked={selectedCategory === null}
                                        onChange={() => setSelectedCategory(null)}
                                    />
                                    <p className="text-sm">Todas</p>
                                </label>
                                {categories.map((cat) => (
                                    <label key={cat.id} className="flex gap-x-3 py-2 items-center cursor-pointer">
                                        <input 
                                            type="radio" 
                                            name="category"
                                            className="h-5 w-5 rounded border-black/10 border-2 bg-transparent text-primary focus:ring-0 focus:ring-offset-0"
                                            checked={selectedCategory === cat.id}
                                            onChange={() => setSelectedCategory(cat.id)}
                                        />
                                        <p className="text-sm">{cat.name}</p>
                                    </label>
                                ))}
                            </div>
                        </details>
                    </div>
                </aside>
                
                <section className="col-span-1 lg:col-span-3">
                    {loading ? (
                        <div className="flex justify-center items-center h-64">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                            {filteredProducts.map((prod) => {
                                const isOutOfStock = prod.stock <= 0 || prod.inStock === false;
                                return (
                                    <div key={prod.id} className={`group flex flex-col overflow-hidden rounded-xl bg-white shadow-sm transition-all duration-300 ${isOutOfStock ? 'opacity-75 grayscale' : 'hover:shadow-lg'}`}>
                                        <div className="relative">
                                            <Link href={`/product/${prod.id}`} className={`block overflow-hidden rounded-xl bg-gray-200 ${isOutOfStock ? 'pointer-events-none' : ''}`}>
                                                <div className="relative aspect-[4/3] w-full">
                                                    <Image
                                                        fill
                                                        className={`object-cover transition-transform duration-500 ${!isOutOfStock && 'group-hover:scale-110'}`}
                                                        src={prod.image}
                                                        alt={prod.name}
                                                    />
                                                </div>
                                            </Link>
                                            {isOutOfStock && (
                                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-xl pointer-events-none z-10">
                                                    <span className="bg-red-600 text-white font-bold py-1 px-3 rounded-lg text-sm shadow-md">
                                                        SIN STOCK
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex flex-1 flex-col p-4">
                                            <Link href={`/product/${prod.id}`} className={`block ${isOutOfStock ? 'pointer-events-none' : ''}`}>
                                                <h4 className="text-lg font-bold text-slate-900 group-hover:text-primary transition-colors">{prod.name}</h4>
                                                <p className="mt-2 text-xl font-black text-primary">${prod.price}</p>
                                            </Link>
                                            <div className="mt-4">
                                                {isOutOfStock ? (
                                                    <button 
                                                        disabled
                                                        className="w-full py-2 bg-gray-100 text-gray-400 font-bold rounded-lg cursor-not-allowed border border-gray-200"
                                                    >
                                                        Agotado
                                                    </button>
                                                ) : (
                                                    <AddToCart product={prod} />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                            {filteredProducts.length === 0 && (
                                <div className="col-span-full text-center py-10">
                                    <p className="text-slate-500">No se encontraron productos en esta categoría.</p>
                                </div>
                            )}
                        </div>
                    )}
                </section>
            </div>
        </div>
    );
};

export default Catalog;
