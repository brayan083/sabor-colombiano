'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getCategories, deleteCategory } from '@/lib/services/categories';
import { Category } from '@/types';

const AdminCategories: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await getCategories();
            setCategories(data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleDelete = async (id: string) => {
        if (confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
            try {
                await deleteCategory(id);
                setCategories(categories.filter(c => c.id !== id));
            } catch (error) {
                alert('Error al eliminar categoría');
            }
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <p className="text-slate-900 text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">Administración de Categorías</p>
                <div className="flex gap-2">
                    <Link href="/admin/categories/new" className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg px-5 bg-primary-admin text-white hover:opacity-90 transition-opacity">
                        <span className="material-symbols-outlined">add</span>
                        <p className="text-sm font-bold leading-normal">Nueva Categoría</p>
                    </Link>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                   <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                             <span className="material-symbols-outlined text-[20px]">search</span>
                        </span>
                        <input className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-admin focus:border-transparent min-w-[300px]" placeholder="Buscar categorías..." />
                   </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Categoría</th>
                                <th className="px-6 py-3">Slug (ID)</th>
                                <th className="px-6 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-4 text-center">Cargando categorías...</td>
                                </tr>
                            ) : categories.length === 0 ? (
                                <tr>
                                    <td colSpan={3} className="px-6 py-4 text-center">No hay categorías encontradas.</td>
                                </tr>
                            ) : categories.map((cat) => (
                                <tr key={cat.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className="relative h-12 w-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                                                {cat.image && (
                                                    <Image 
                                                        fill
                                                        className="object-cover" 
                                                        src={cat.image} 
                                                        alt={cat.name} 
                                                    />
                                                )}
                                            </div>
                                            <div className="font-medium text-slate-900">{cat.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{cat.slug}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/admin/categories/${cat.id}`} className="text-slate-400 hover:text-primary-admin" title="Editar">
                                                <span className="material-symbols-outlined text-[20px]">edit</span>
                                            </Link>
                                            <button onClick={() => handleDelete(cat.id)} className="text-slate-400 hover:text-red-600" title="Eliminar">
                                                <span className="material-symbols-outlined text-[20px]">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminCategories;
