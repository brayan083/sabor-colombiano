"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { getProducts } from '@/lib/services/products';
import { useCart } from '@/lib/context/CartContext';
import AddToCart from '@/components/AddToCart';

const RecommendedProducts: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const { cart } = useCart();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const allProducts = await getProducts();
                setProducts(allProducts);
            } catch (error) {
                console.error("Error fetching recommended products:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    // Filter out products already in cart
    const availableProducts = products.filter(
        product => !cart.some(cartItem => cartItem.id === product.id)
    );

    // Get random products (e.g., 4 items)
    const recommendedProducts = availableProducts
        .sort(() => 0.5 - Math.random()) // Simple shuffle
        .slice(0, 4);

    if (loading || recommendedProducts.length === 0) {
        return null; // Don't show anything if loading or no recommendations
    }

    return (
        <div className="mt-16 pt-12 border-t border-gray-200">
            {/* Section Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-outlined text-primary text-3xl">recommend</span>
                    <h2 className="text-3xl font-black text-slate-900">Otros productos que te pueden interesar</h2>
                </div>
                <p className="text-slate-600">Descubre más delicias de nuestra cocina colombiana</p>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendedProducts.map((product) => (
                    <div
                        key={product.id}
                        className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-xl hover:border-primary/30 transition-all duration-300 flex flex-col hover:-translate-y-1"
                    >
                        {/* Product Image */}
                        <Link href={`/product/${product.id}`} className="block relative aspect-square bg-gray-100 overflow-hidden">
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                            />
                            {/* Overlay on hover */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                        </Link>

                        {/* Product Info */}
                        <div className="p-5 flex flex-col flex-1">
                            <Link href={`/product/${product.id}`} className="mb-4">
                                <h3 className="font-bold text-lg text-slate-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                    {product.name}
                                </h3>
                                <div className="flex items-baseline gap-2">
                                    <p className="text-2xl font-black text-primary">${product.price.toLocaleString()}</p>
                                    <span className="text-xs text-slate-500">COP</span>
                                </div>
                            </Link>

                            {/* Add to Cart Button */}
                            <div className="mt-auto">
                                <AddToCart product={product} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* View All Products Link */}
            <div className="mt-8 text-center">
                <Link
                    href="/catalog"
                    className="inline-flex items-center gap-2 text-primary font-bold hover:gap-3 transition-all"
                >
                    <span>Ver todo el menú</span>
                    <span className="material-symbols-outlined">arrow_forward</span>
                </Link>
            </div>
        </div>
    );
};

export default RecommendedProducts;
