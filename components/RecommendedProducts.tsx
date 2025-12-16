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
        <div className="mt-12">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Quizás te antojes de esto...</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {recommendedProducts.map((product) => (
                    <div key={product.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow flex flex-col">
                        <Link href={`/product/${product.id}`} className="block relative aspect-square bg-gray-100">
                            <Image
                                src={product.image}
                                alt={product.name}
                                fill
                                className="object-cover"
                            />
                        </Link>
                        <div className="p-4 flex flex-col flex-1">
                            <Link href={`/product/${product.id}`}>
                                <h3 className="font-bold text-slate-900 mb-1 line-clamp-1">{product.name}</h3>
                                <p className="text-primary font-bold mb-3">${product.price.toLocaleString()}</p>
                            </Link>
                            <div className="mt-auto">
                                <AddToCart product={product} />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecommendedProducts;
