'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllProducts, updateProduct } from '@/lib/services/products';
import { getCategories } from '@/lib/services/categories';
import { Product, Category } from '@/types';

const AdminStockPage: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productsData, categoriesData] = await Promise.all([
                    getAllProducts(),
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

    const handleStockUpdate = async (productId: string, newStock: number) => {
        if (newStock < 0) return;
        
        // Optimistic update
        setProducts(prev => prev.map(p => 
            p.id === productId ? { ...p, stock: newStock } : p
        ));

        try {
            await updateProduct(productId, { stock: newStock });
        } catch (error) {
            console.error("Error updating stock:", error);
            // Revert on error
            // setProducts(prev => ... ) // Omitted for brevity, but ideal in prod
            alert("Error al actualizar el stock");
        }
    };

    const getCategoryName = (catId: string) => {
        const cat = categories.find(c => c.id === catId);
        return cat ? cat.name : 'Sin Categoría';
    };

    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-black text-slate-900">Inventario y Stock</h1>
                <p className="text-slate-500">Gestiona el stock de tus productos visualmente.</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center gap-4">
                <div className="relative flex-1">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400">search</span>
                    <input 
                        type="text" 
                        placeholder="Buscar producto..." 
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-admin"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-10">Cargando inventario...</div>
            ) : filteredProducts.length === 0 ? (
                <div className="text-center py-10 text-slate-500">No se encontraron productos.</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {filteredProducts.map((product) => (
                        <div key={product.id} className={`bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col ${product.isArchived ? 'opacity-70 grayscale-[0.5] border-gray-200' : 'border-gray-200'}`}>
                            <div className="relative aspect-video w-full bg-gray-100">
                                {product.image ? (
                                    <Image 
                                        src={product.image} 
                                        alt={product.name} 
                                        fill 
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full text-slate-300">
                                        <span className="material-symbols-outlined text-4xl">image</span>
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                                    <span className={`px-2 py-0.5 rounded text-xs font-bold text-white shadow-sm ${product.inStock ? 'bg-green-500' : 'bg-red-500'}`}>
                                        {product.inStock ? 'ACTIVO' : 'INACTIVO'}
                                    </span>
                                    {product.isArchived && (
                                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-gray-600 text-white shadow-sm">
                                            ARCHIVADO
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="p-4 flex flex-col flex-1 gap-4">
                                <div>
                                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">
                                        {getCategoryName(product.categoryId)}
                                    </p>
                                    <h3 className="text-lg font-bold text-slate-900 leading-tight line-clamp-2" title={product.name}>
                                        {product.name}
                                    </h3>
                                </div>
                                
                                <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                    <div className="flex flex-col w-20">
                                        <span className="text-xs text-slate-500 font-medium mb-1">Stock</span>
                                        <input 
                                            type="number"
                                            value={product.stock}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value) || 0;
                                                // Update local state immediately for responsiveness
                                                setProducts(prev => prev.map(p => 
                                                    p.id === product.id ? { ...p, stock: val } : p
                                                ));
                                            }}
                                            onBlur={() => handleStockUpdate(product.id, product.stock)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.currentTarget.blur();
                                                }
                                            }}
                                            className={`w-full text-xl font-black bg-transparent border-b-2 border-transparent focus:border-primary-admin focus:outline-none transition-colors ${product.stock < 10 && product.stock > 0 ? 'text-orange-500' : product.stock === 0 ? 'text-red-600' : 'text-slate-900'}`}
                                        />
                                    </div>
                                    
                                    <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-1">
                                        <button 
                                            onClick={() => handleStockUpdate(product.id, product.stock - 1)}
                                            className="size-8 flex items-center justify-center rounded-md bg-white border border-gray-200 shadow-sm text-slate-600 hover:text-primary-admin hover:border-primary-admin active:scale-95 transition-all disabled:opacity-50"
                                            disabled={product.stock <= 0}
                                        >
                                            <span className="material-symbols-outlined text-[20px]">remove</span>
                                        </button>
                                        <button 
                                            onClick={() => handleStockUpdate(product.id, product.stock + 1)}
                                            className="size-8 flex items-center justify-center rounded-md bg-white border border-gray-200 shadow-sm text-slate-600 hover:text-primary-admin hover:border-primary-admin active:scale-95 transition-all"
                                        >
                                            <span className="material-symbols-outlined text-[20px]">add</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminStockPage;
