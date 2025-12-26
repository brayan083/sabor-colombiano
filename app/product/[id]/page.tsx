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
        title: `${product.name} - Empalombia`,
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
        <div className="max-w-7xl mx-auto px-4 sm:px-10 lg:px-20 py-8 lg:py-12">
            {/* Breadcrumbs */}
            <div className="flex items-center gap-2 py-4 mb-4 text-sm">
                <Link href="/" className="text-slate-500 hover:text-primary transition-colors">Inicio</Link>
                <span className="text-slate-300">/</span>
                <Link href="/catalog" className="text-slate-500 hover:text-primary transition-colors">Menú</Link>
                <span className="text-slate-300">/</span>
                <span className="text-slate-900 font-medium">{product.name}</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-20">
                {/* Left Column: Image */}
                <div className="w-full">
                    <div className="relative w-full aspect-square overflow-hidden rounded-2xl bg-white shadow-xl shadow-black/5 ring-1 ring-black/5">
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-700"
                            priority
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    </div>
                </div>

                {/* Right Column: Info */}
                <div className="flex flex-col gap-8">
                    <div className="space-y-4">
                        <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-wide uppercase">
                            Platos Típicos
                        </div>
                        <h1 className="text-4xl lg:text-6xl font-black leading-tight tracking-tight text-slate-900">
                            {product.name}
                        </h1>
                        <div className="flex items-baseline gap-4">
                            <p className="text-3xl lg:text-4xl font-bold text-primary">
                                ${product.price.toLocaleString()}
                            </p>
                            {/* Optional: Show original price if discounted later */}
                        </div>
                    </div>

                    <div className="prose prose-slate prose-lg text-slate-600 leading-relaxed">
                        <p>{product.description}</p>
                    </div>

                    <div className="border-t border-gray-100 pt-8 mt-2">
                        <AddToCart product={product} showViewCart={true} />
                    </div>

                    {/* Additional Info / Trust Badges */}
                    <div className="grid grid-cols-2 gap-4 pt-4">
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                            <span className="material-symbols-outlined text-green-600">verified</span>
                            <span className="text-sm font-medium text-slate-700">Calidad Premium</span>
                        </div>
                        <div className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 border border-gray-100">
                            <span className="material-symbols-outlined text-primary">local_shipping</span>
                            <span className="text-sm font-medium text-slate-700">Envío Rápido</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs / Detailed Info - Removed redundant description */}
            <div className="mt-20 lg:mt-32 max-w-4xl mx-auto text-center">
                <div className="inline-block p-4 rounded-2xl bg-gray-50 border border-gray-100 italic text-slate-600">
                    "El sabor auténtico de nuestra tierra en cada bocado, preparado con ingredientes frescos y amor por la tradición."
                </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <div className="mt-20 lg:mt-32 pb-10">
                    <div className="flex items-center justify-between mb-8 leading-none">
                        <h2 className="text-2xl lg:text-3xl font-bold text-slate-900">También te podría gustar</h2>
                        <Link
                            href="/catalog"
                            className="inline-flex items-center px-4 py-2 rounded-full bg-slate-100 text-slate-900 font-bold text-sm hover:bg-slate-200 transition-colors"
                        >
                            Ver todo el menú
                        </Link>
                    </div>

                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-8 lg:gap-x-6 lg:gap-y-10">
                        {relatedProducts.map((item) => (
                            <Link href={`/product/${item.id}`} key={item.id} className="group cursor-pointer">
                                <div className="relative w-full aspect-[4/5] overflow-hidden rounded-xl lg:rounded-2xl bg-gray-100 mb-3 lg:mb-4 shadow-sm group-hover:shadow-md transition-shadow">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
                                </div>

                                <h4 className="text-base lg:text-lg font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-2">
                                    {item.name}
                                </h4>
                                <p className="text-sm lg:text-base text-slate-500 mt-1 font-medium">
                                    ${item.price.toLocaleString()}
                                </p>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

