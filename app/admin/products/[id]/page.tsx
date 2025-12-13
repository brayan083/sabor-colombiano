'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { getProductById, updateProduct } from '@/lib/services/products';
import { getCategories } from '@/lib/services/categories';
import { Category, Product } from '@/types';

const EditProductPage: React.FC = () => {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        categoryId: '',
        image: '',
        inStock: true
    });

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [productData, categoriesData] = await Promise.all([
                    getProductById(id),
                    getCategories()
                ]);

                if (productData) {
                    setFormData({
                        name: productData.name,
                        description: productData.description,
                        price: productData.price.toString(),
                        stock: productData.stock.toString(),
                        categoryId: productData.categoryId,
                        image: productData.image,
                        inStock: productData.inStock
                    });
                }
                setCategories(categoriesData);
            } catch (error) {
                console.error("Error fetching data:", error);
                alert("Error cargando el producto.");
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchInitialData();
        }
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: checked }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await updateProduct(id, {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                stock: parseInt(formData.stock),
                categoryId: formData.categoryId,
                image: formData.image,
                inStock: formData.inStock
            });
            router.push('/admin/products');
        } catch (error) {
            console.error("Error updating product:", error);
            alert("Error al actualizar el producto.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Cargando...</div>;
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
                <Link href="/admin/products" className="p-2 rounded-lg hover:bg-black/5 text-slate-500">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <h1 className="text-2xl font-bold text-slate-900">Editar Producto</h1>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-900">Nombre del Producto</label>
                            <input 
                                type="text" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-admin"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-900">Precio</label>
                            <input 
                                type="number" 
                                name="price" 
                                value={formData.price} 
                                onChange={handleChange} 
                                required
                                step="0.01"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-admin"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900">Descripción</label>
                        <textarea 
                            name="description" 
                            value={formData.description} 
                            onChange={handleChange} 
                            required
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-admin resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                         <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-900">Categoría</label>
                            <select 
                                name="categoryId" 
                                value={formData.categoryId} 
                                onChange={handleChange} 
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-admin bg-white"
                            >
                                <option value="" disabled>Seleccionar Categoría</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-900">Stock</label>
                            <input 
                                type="number" 
                                name="stock" 
                                value={formData.stock} 
                                onChange={handleChange} 
                                required
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-admin"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900">URL de la Imagen</label>
                        <input 
                            type="url" 
                            name="image" 
                            value={formData.image} 
                            onChange={handleChange} 
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-admin"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input 
                            type="checkbox" 
                            name="inStock" 
                            id="inStock"
                            checked={formData.inStock} 
                            onChange={handleCheckboxChange} 
                            className="h-4 w-4 rounded border-gray-300 text-primary-admin focus:ring-primary-admin"
                        />
                        <label htmlFor="inStock" className="text-sm font-medium text-slate-900">Producto Activo / Disponible</label>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <Link href="/admin/products" className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-slate-700 font-medium hover:bg-gray-50">
                            Cancelar
                        </Link>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="px-6 py-2 bg-primary-admin text-white rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditProductPage;
