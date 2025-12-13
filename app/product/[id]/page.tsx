import React from 'react';
import Link from 'next/link';
import Image from 'next/image'; // Import Image component
import { Metadata } from 'next';
import { getProductById, getProductsByCategory } from '@/lib/services/products';
import { notFound } from 'next/navigation';
import AddToCart from '@/components/AddToCart';

// Next.js 15: params is a Promise
interface Props {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    const product = await getProductById(id);
    
    if (!product) {
        return {
            title: 'Producto no encontrado',
        };
    }

    return {
        title: `${product.name} - Sabor Colombiano`,
        description: product.description,
    };
}

export default async function ProductDetail({ params }: Props) {
    const { id } = await params;
    const product = await getProductById(id);

    if (!product) {
        notFound();
    }

    // Fetch related products (same category, excluding current)
    const categoryProducts = await getProductsByCategory(product.categoryId);
    const relatedProducts = categoryProducts
        .filter(p => p.id !== product.id)
        .slice(0, 4);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-10 lg:px-20 py-8">
            <div className="flex flex-wrap gap-2 py-4">
                <Link href="/" className="text-slate-500 text-sm font-medium hover:text-primary">Inicio</Link>
                <span className="text-slate-500 text-sm font-medium">/</span>
                <Link href="/catalog" className="text-slate-500 text-sm font-medium hover:text-primary">Platos Típicos</Link>
                <span className="text-slate-500 text-sm font-medium">/</span>
                <span className="text-slate-900 text-sm font-medium">{product.name}</span>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 mt-6">
                <div className="w-full">
                    {/* Main Image */}
                    <div className="relative w-full aspect-square overflow-hidden rounded-xl bg-gray-100">
                        <Image 
                            src={product.image} 
                            alt={product.name}
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                </div>
                
                <div className="flex flex-col gap-6">
                    <div className="flex flex-col gap-3">
                        <h1 className="text-4xl lg:text-5xl font-black leading-tight tracking-[-0.033em]">{product.name}</h1>
                        <p className="text-2xl font-bold leading-normal text-primary">${product.price}</p>
                    </div>
                    <p className="text-base font-normal leading-normal text-slate-900">
                        {product.description}
                    </p>
                    
                    {/* Only show 'meat term' if relevant? Keeping it simple for now or commented out if not in schema.
                        Since schema doesn't have options yet, we'll comment it out or make it static for demo.
                     */}
                     {/* 
                    <div className="border-t border-b border-black/10 py-6 flex flex-col gap-4">
                        <h3 className="text-base font-bold">Elige el término de la carne</h3>
                        <div className="flex gap-2 flex-wrap">
                            <button className="px-4 py-2 rounded-full text-sm font-medium bg-primary/20 text-primary border border-primary">Medio</button>
                            <button className="px-4 py-2 rounded-full text-sm font-medium bg-black/5 hover:bg-black/10">Tres Cuartos</button>
                            <button className="px-4 py-2 rounded-full text-sm font-medium bg-black/5 hover:bg-black/10">Bien Cocido</button>
                        </div>
                    </div>
                    */}

                    <AddToCart product={product} />
                </div>
            </div>

            <div className="mt-16">
                <div className="border-b border-black/10">
                    <nav className="flex gap-8 -mb-px">
                        <button className="py-4 px-1 border-b-2 border-primary text-primary font-bold">Descripción</button>
                        <button className="py-4 px-1 border-b-2 border-transparent text-slate-500 hover:text-slate-900 font-medium">Ingredientes</button>
                    </nav>
                </div>
                <div className="py-6">
                    <p className="text-slate-900 text-base font-normal leading-relaxed">
                        {product.description} Disfruta de la mejor calidad y el sabor auténtico que nos caracteriza.
                    </p>
                </div>
            </div>

            {relatedProducts.length > 0 && (
                <div className="mt-16">
                    <h2 className="text-3xl font-bold mb-6">También te podría gustar</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                        {relatedProducts.map((item) => (
                            <Link href={`/product/${item.id}`} key={item.id} className="flex flex-col gap-2 group cursor-pointer">
                                <div className="relative w-full aspect-square overflow-hidden rounded-xl bg-gray-100">
                                    <Image 
                                        src={item.image} 
                                        alt={item.name} 
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <h4 className="text-lg font-bold group-hover:text-primary">{item.name}</h4>
                                <p className="text-base font-medium text-primary">${item.price}</p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

