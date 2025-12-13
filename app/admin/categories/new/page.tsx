'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createCategory } from '@/lib/services/categories';

const NewCategoryPage: React.FC = () => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        image: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await createCategory({
                name: formData.name,
                slug: formData.slug || formData.name.toLowerCase().replace(/ /g, '-'),
                image: formData.image
            });
            router.push('/admin/categories');
        } catch (error) {
            console.error("Error creating category:", error);
            alert("Error al crear la categoría.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/admin/categories" className="p-2 rounded-lg hover:bg-black/5 text-slate-500">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <h1 className="text-2xl font-bold text-slate-900">Nueva Categoría</h1>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900">Nombre de la Categoría</label>
                        <input 
                            type="text" 
                            name="name" 
                            value={formData.name} 
                            onChange={handleChange} 
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-admin"
                            placeholder="Ej: Platos Fuertes"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900">Slug (Opcional)</label>
                        <input 
                            type="text" 
                            name="slug" 
                            value={formData.slug} 
                            onChange={handleChange} 
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-admin"
                            placeholder="Ej: platos-fuertes"
                        />
                        <p className="text-xs text-slate-500">Si se deja vacío, se generará automáticamente a partir del nombre.</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900">URL de la Imagen/Banner</label>
                        <input 
                            type="url" 
                            name="image" 
                            value={formData.image} 
                            onChange={handleChange} 
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-admin"
                            placeholder="https://..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <Link href="/admin/categories" className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-slate-700 font-medium hover:bg-gray-50">
                            Cancelar
                        </Link>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="px-6 py-2 bg-primary-admin text-white rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : 'Crear Categoría'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NewCategoryPage;
