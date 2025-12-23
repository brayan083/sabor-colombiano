import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { getProducts } from '@/lib/services/products';
import { getCategories } from '@/lib/services/categories';

export const metadata: Metadata = {
    title: 'Empalombia - Inicio',
    description: 'Comida colombiana auténtica',
};

// Async Server Component
const Home = async () => {
    // Fetch data in parallel
    const [products, categories] = await Promise.all([
        getProducts(),
        getCategories()
    ]);

    // Select featured products (e.g., first 4)
    const featuredProducts = products.slice(0, 4);

    return (
        <div className="px-4 sm:px-10 lg:px-20 py-8">
            <div className="mx-auto max-w-6xl">
                {/* Hero Banner with Glassmorphism */}
                <div className="w-full">
                    <div className="flex min-h-[520px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-2xl items-center justify-center p-8 relative overflow-hidden group">
                        {/* Background Image with Parallax Effect */}
                        <div className="absolute inset-0 bg-[url('/img/banner%20principal%20v2.jpeg')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"></div>

                        {/* Glassmorphism Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/40 to-black/60 backdrop-blur-[2px]"></div>

                        {/* Decorative Elements */}
                        <div className="absolute top-10 right-10 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-float"></div>
                        <div className="absolute bottom-10 left-10 w-40 h-40 bg-yellow-400/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>

                        {/* Content */}
                        <div className="flex flex-col gap-4 text-center max-w-3xl z-10 animate-fade-in-up">
                            <h1 className="text-white text-5xl font-black leading-tight tracking-tight sm:text-6xl drop-shadow-2xl">
                                El Sabor de Empalombia,<br />
                                <span className="bg-gradient-to-r from-yellow-200 via-yellow-300 to-yellow-400 bg-clip-text text-transparent">
                                    Directo a tu Mesa
                                </span>
                            </h1>
                            <h2 className="text-white/90 text-base font-medium leading-relaxed sm:text-lg drop-shadow-lg">
                                Descubre la auténtica comida colombiana preparada con amor y los ingredientes más frescos.
                            </h2>
                        </div>

                        {/* CTA Button with Gradient */}
                        <Link
                            href="/catalog"
                            className="z-10 group/btn relative flex min-w-[200px] cursor-pointer items-center justify-center overflow-hidden rounded-xl h-12 px-8 sm:h-14 sm:px-10 bg-gradient-to-r from-primary via-yellow-500 to-primary bg-[length:200%_100%] text-white text-base font-bold leading-normal tracking-wide sm:text-lg shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-105 animate-glow"
                        >
                            <span className="relative z-10">Ver Menú Completo</span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-700"></div>
                        </Link>
                    </div>
                </div>

                {/* Featured Products Section */}
                <section className="py-16">
                    <h2 className="text-slate-900 text-3xl font-bold leading-tight tracking-tight px-4 pb-8 pt-5 text-center sm:text-left bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        Los Más Pedidos
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-4">
                        {featuredProducts.map((item, index) => (
                            <Link
                                href={`/product/${item.id}`}
                                key={item.id}
                                className="group/card flex flex-col gap-3 pb-4 bg-white rounded-2xl overflow-hidden border border-slate-200/50 hover:border-primary/30 shadow-lg hover:shadow-2xl hover:shadow-primary/20 transition-all duration-500 cursor-pointer hover:-translate-y-2 animate-fade-in-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                <div className="relative w-full aspect-[4/3] overflow-hidden">
                                    {/* Gradient Overlay on Hover */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity duration-300 z-10"></div>

                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        className="object-cover transition-transform duration-500 group-hover/card:scale-110"
                                        priority={index < 2}
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                    />

                                    {/* Shine Effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-200%] group-hover/card:translate-x-[200%] transition-transform duration-1000"></div>
                                </div>
                                <div className="px-4 space-y-2">
                                    <p className="text-slate-900 text-lg font-semibold leading-snug group-hover/card:text-primary transition-colors duration-300">
                                        {item.name}
                                    </p>
                                    <p className="text-slate-600 text-sm font-normal leading-relaxed line-clamp-2">
                                        {item.description}
                                    </p>
                                    <div className="flex items-center justify-between pt-2">
                                        <p className="text-primary text-xl font-bold leading-normal">
                                            ${item.price}
                                        </p>
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center group-hover/card:bg-primary group-hover/card:scale-110 transition-all duration-300">
                                            <span className="text-primary group-hover/card:text-white text-xl">+</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                {/* Values Section */}
                <section className="py-16">
                    <div className="text-center mb-12">
                        <h2 className="text-slate-900 text-3xl font-bold leading-tight tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent mb-3">
                            ¿Por Qué Elegirnos?
                        </h2>
                        <p className="text-slate-600 text-lg max-w-2xl mx-auto">
                            Más que comida, es tradición y amor en cada plato
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 p-4">
                        {/* Value 1: Autenticidad */}
                        <div className="group relative flex flex-col items-center text-center p-8 bg-white rounded-2xl border border-slate-200/50 hover:border-primary/30 shadow-lg hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2 animate-fade-in-up">
                            {/* Icon Container */}
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                                <div className="relative w-20 h-20 bg-gradient-to-br from-primary to-yellow-500 rounded-2xl flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-500 shadow-lg">
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                            </div>

                            <h3 className="text-slate-900 text-xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">
                                100% Auténtico
                            </h3>
                            <p className="text-slate-600 text-base leading-relaxed">
                                Recetas tradicionales colombianas transmitidas de generación en generación, manteniendo el sabor original de nuestra tierra.
                            </p>

                            {/* Decorative Line */}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </div>

                        {/* Value 2: Calidad */}
                        <div className="group relative flex flex-col items-center text-center p-8 bg-white rounded-2xl border border-slate-200/50 hover:border-primary/30 shadow-lg hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
                            {/* Icon Container */}
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                                <div className="relative w-20 h-20 bg-gradient-to-br from-primary to-yellow-500 rounded-2xl flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-500 shadow-lg">
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                    </svg>
                                </div>
                            </div>

                            <h3 className="text-slate-900 text-xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">
                                Ingredientes Premium
                            </h3>
                            <p className="text-slate-600 text-base leading-relaxed">
                                Seleccionamos cuidadosamente los mejores ingredientes frescos para garantizar la máxima calidad en cada preparación.
                            </p>

                            {/* Decorative Line */}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </div>

                        {/* Value 3: Tradición */}
                        <div className="group relative flex flex-col items-center text-center p-8 bg-white rounded-2xl border border-slate-200/50 hover:border-primary/30 shadow-lg hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                            {/* Icon Container */}
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                                <div className="relative w-20 h-20 bg-gradient-to-br from-primary to-yellow-500 rounded-2xl flex items-center justify-center transform group-hover:rotate-6 transition-transform duration-500 shadow-lg">
                                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                    </svg>
                                </div>
                            </div>

                            <h3 className="text-slate-900 text-xl font-bold mb-3 group-hover:text-primary transition-colors duration-300">
                                Hecho con Amor
                            </h3>
                            <p className="text-slate-600 text-base leading-relaxed">
                                Cada plato es preparado con dedicación y pasión, llevando el calor del hogar colombiano directamente a tu mesa.
                            </p>

                            {/* Decorative Line */}
                            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        </div>
                    </div>
                </section>


                {/* Categories Section */}
                <section className="py-16">
                    <h2 className="text-slate-900 text-3xl font-bold leading-tight tracking-tight px-4 pb-8 pt-5 text-center sm:text-left bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                        Explora Nuestras Categorías
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-4">
                        {categories.map((cat, index) => (
                            <Link
                                href={`/catalog?category=${cat.id}`}
                                key={cat.id}
                                className="group/cat relative flex flex-col justify-end text-center rounded-2xl overflow-hidden h-72 cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 animate-fade-in-up"
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {/* Background Image with Zoom Effect */}
                                <div
                                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover/cat:scale-110"
                                    style={{ backgroundImage: `url("${cat.image}")` }}
                                ></div>

                                {/* Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover/cat:from-primary/90 group-hover/cat:via-primary/50 transition-all duration-500"></div>

                                {/* Border Glow Effect */}
                                <div className="absolute inset-0 border-2 border-transparent group-hover/cat:border-primary/50 rounded-2xl transition-all duration-500"></div>

                                {/* Category Name */}
                                <div className="relative z-10 p-6 transform transition-transform duration-500 group-hover/cat:translate-y-[-8px]">
                                    <span className="text-white text-2xl font-bold drop-shadow-lg">
                                        {cat.name}
                                    </span>
                                    <div className="mt-2 w-12 h-1 bg-white/50 group-hover/cat:bg-white group-hover/cat:w-20 transition-all duration-500 mx-auto"></div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Home;
