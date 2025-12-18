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
                <div className="w-full">
                    <div className="flex min-h-[480px] flex-col gap-6 bg-cover bg-center bg-no-repeat rounded-xl items-center justify-center p-4 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-black/40"></div>
                        <div className="absolute inset-0 bg-[url('/img/banner%20principal%20v2.jpeg')] bg-cover bg-center -z-10"></div>
                        <div className="flex flex-col gap-2 text-center max-w-2xl z-10">
                            <h1 className="text-white text-4xl font-black leading-tight tracking-[-0.033em] sm:text-5xl">El Sabor de Empalombia, Directo a tu Mesa</h1>
                            <h2 className="text-white text-sm font-normal leading-normal sm:text-base">Descubre la auténtica comida colombiana preparada con amor y los ingredientes más frescos.</h2>
                        </div>
                        <Link href="/catalog" className="z-10 flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 sm:h-12 sm:px-5 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] sm:text-base hover:opacity-90">
                            <span className="truncate">Ver Menú Completo</span>
                        </Link>
                    </div>
                </div>

                <section className="py-12">
                    <h2 className="text-slate-900 text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-4 pt-5 text-center sm:text-left">Los Más Pedidos</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-4">
                        {featuredProducts.map((item, index) => (
                            <Link href={`/product/${item.id}`} key={item.id} className="flex flex-col gap-3 pb-3 bg-white rounded-xl overflow-hidden border border-black/10 hover:shadow-lg transition-all cursor-pointer">
                                <div className="relative w-full aspect-[4/3]">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        className="object-cover"
                                        priority={index < 2}
                                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                    />
                                </div>
                                <div className="px-4">
                                    <p className="text-slate-900 text-base font-medium leading-normal">{item.name}</p>
                                    <p className="text-slate-600 text-sm font-normal leading-normal line-clamp-2">{item.description}</p>
                                    <p className="text-slate-800 text-sm font-medium leading-normal mt-2">${item.price}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                <section className="py-12">
                    <div className="flex flex-col justify-end gap-6 px-4 py-10 rounded-xl bg-primary/10 sm:px-10 sm:py-20">
                        <div className="flex flex-col gap-2 text-center items-center">
                            <h1 className="text-slate-900 tracking-tight text-[32px] font-bold leading-tight sm:text-4xl max-w-2xl">20% de Descuento en Bandeja Paisa esta semana</h1>
                            <p className="text-slate-700 text-base font-normal leading-normal max-w-2xl">Aprovecha nuestra promoción de la semana y disfruta de nuestro plato más icónico a un precio especial.</p>
                        </div>
                        <div className="flex justify-center">
                            <Link href="/catalog" className="flex min-w-[84px] max-w-[480px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-10 px-4 sm:h-12 sm:px-5 bg-primary text-white text-sm font-bold leading-normal tracking-[0.015em] sm:text-base hover:opacity-90">
                                <span className="truncate">Ver Ofertas</span>
                            </Link>
                        </div>
                    </div>
                </section>

                <section className="py-12">
                    <h2 className="text-slate-900 text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-4 pt-5 text-center sm:text-left">Explora Nuestras Categorías</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-4">
                        {categories.map((cat) => (
                            <Link href={`/catalog?category=${cat.id}`} key={cat.id} className="group relative flex flex-col justify-end text-center rounded-xl overflow-hidden h-60 cursor-pointer">
                                <div className="absolute inset-0 bg-cover bg-center transition-transform duration-300 ease-in-out group-hover:scale-110" style={{ backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0)), url("${cat.image}")` }}></div>
                                <span className="relative z-10 p-4 text-white text-xl font-bold">{cat.name}</span>
                            </Link>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Home;
