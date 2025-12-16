"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getAllProducts, deleteProduct, toggleProductArchive } from '@/lib/services/products';
import { getCategories } from '@/lib/services/categories';
import { Product, Category } from '@/types';

const AdminProducts: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
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

    useEffect(() => {
        fetchData();
    }, []);

    const handleArchive = async (id: string, currentStatus: boolean | undefined) => {
        const isArchived = !!currentStatus;
        const action = isArchived ? 'restaurar' : 'archivar';
        
        if (confirm(`¿Estás seguro de que deseas ${action} este producto?`)) {
            try {
                await toggleProductArchive(id, !isArchived);
                // Optimistic update
                setProducts(products.map(p => 
                    p.id === id ? { ...p, isArchived: !isArchived } : p
                ));
            } catch (error) {
                alert(`Error al ${action} producto`);
            }
        }
    };
    
    // Keeping hard delete just in case, but hidden or renamed? 
    // For now, replacing the main delete action with archive.


    // Helper to get category name
    const getCategoryName = (catId: string) => {
        const cat = categories.find(c => c.id === catId);
        return cat ? cat.name : 'Sin Categoría';
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <p className="text-slate-900 text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">Administración de Productos</p>
                <div className="flex gap-2">
                    <Link href="/admin/products/new" className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg px-5 bg-primary-admin text-white hover:opacity-90 transition-opacity">
                        <span className="material-symbols-outlined">add</span>
                        <p className="text-sm font-bold leading-normal">Nuevo Producto</p>
                    </Link>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                   <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                             <span className="material-symbols-outlined text-[20px]">search</span>
                        </span>
                        <input className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-admin focus:border-transparent min-w-[300px]" placeholder="Buscar productos..." />
                   </div>
                   <div className="flex gap-2">
                       <button className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-slate-600 hover:bg-gray-50 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">category</span>
                            Categoría
                       </button>
                       <button className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-slate-600 hover:bg-gray-50 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">sort</span>
                            Ordenar
                       </button>
                   </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Producto</th>
                                <th className="px-6 py-3">Categoría</th>
                                <th className="px-6 py-3">Precio</th>
                                <th className="px-6 py-3">Stock</th>
                                <th className="px-6 py-3">Estado</th>
                                <th className="px-6 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center">Cargando productos...</td>
                                </tr>
                            ) : products.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center">No hay productos encontrados.</td>
                                </tr>
                            ) : products.map((product) => (
                                <tr key={product.id} className={`bg-white border-b hover:bg-gray-50 ${product.isArchived ? 'bg-gray-50/80 grayscale-[0.8] opacity-75' : ''}`}>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="relative h-12 w-12 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                                {product.image && (
                                                    <Image 
                                                        fill
                                                        className="object-cover" 
                                                        src={product.image} 
                                                        alt={product.name} 
                                                    />
                                                )}
                                            </div>
                                            <div className="font-medium text-slate-900">{product.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{getCategoryName(product.categoryId)}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900">${product.price}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <span>{product.stock}</span>
                                            {product.stock < 10 && product.stock > 0 && (
                                                <span className="flex h-2 w-2 rounded-full bg-yellow-500"></span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {product.isArchived ? 'Archivado' : (product.inStock ? 'En Stock' : 'Sin Stock')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/admin/products/${product.id}`} className="text-slate-400 hover:text-primary-admin" title="Editar">
                                                <span className="material-symbols-outlined text-[20px]">edit</span>
                                            </Link>
                                            <button 
                                                onClick={() => handleArchive(product.id, product.isArchived)} 
                                                className={`hover:text-primary-admin ${product.isArchived ? 'text-green-600' : 'text-slate-400 hover:text-red-600'}`} 
                                                title={product.isArchived ? "Restaurar" : "Archivar"}
                                            >
                                                <span className="material-symbols-outlined text-[20px]">
                                                    {product.isArchived ? 'restore_from_trash' : 'delete'}
                                                </span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-sm text-slate-500">Mostrando {products.length} productos</span>
                </div>
            </div>
        </div>
    );
};

export default AdminProducts;
