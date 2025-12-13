"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/context/CartContext';

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();

    if (cart.length === 0) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-10 lg:px-20 py-20 flex flex-col items-center justify-center text-center">
                <div className="size-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                    <span className="material-symbols-outlined text-4xl text-gray-400">shopping_cart_off</span>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 mb-2">Tu carrito está vacío</h1>
                <p className="text-slate-600 mb-8 max-w-md">Parece que aún no has añadido ningún plato delicioso a tu pedido. ¡Explora nuestro menú!</p>
                <Link href="/catalog" className="px-8 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors">
                    Ver Menú
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-10 lg:px-20 py-10">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Tu Pedido</h1>

            <div className="flex flex-col lg:flex-row gap-10">
                {/* Cart Items List */}
                <div className="flex-1 flex flex-col gap-6">
                    {cart.map((item) => (
                        <div key={item.id} className="flex flex-col sm:flex-row gap-6 p-4 border border-gray-200 rounded-xl bg-white shadow-sm hover:shadow-md transition-shadow">
                            <div className="relative w-full sm:w-32 aspect-square flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                <Image 
                                    src={item.image} 
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            
                            <div className="flex-1 flex flex-col justify-between">
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-slate-900">{item.name}</h3>
                                        <p className="text-sm text-slate-500 line-clamp-1">{item.description}</p>
                                    </div>
                                    <button 
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-gray-400 hover:text-red-500 transition-colors p-1"
                                        aria-label="Eliminar producto"
                                    >
                                        <span className="material-symbols-outlined">delete</span>
                                    </button>
                                </div>
                                
                                <div className="flex flex-wrap items-center justify-between gap-4 mt-4">
                                    <div className="flex items-center rounded-lg border border-gray-200">
                                        <button 
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="px-3 py-2 hover:bg-gray-50 rounded-l-lg transition-colors text-slate-600"
                                            disabled={item.quantity <= 1}
                                        >
                                            <span className="material-symbols-outlined text-sm">remove</span>
                                        </button>
                                        <span className="px-3 font-bold text-slate-900 min-w-[2ch] text-center">{item.quantity}</span>
                                        <button 
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="px-3 py-2 hover:bg-gray-50 rounded-r-lg transition-colors text-slate-600"
                                        >
                                            <span className="material-symbols-outlined text-sm">add</span>
                                        </button>
                                    </div>
                                    
                                    <p className="text-lg font-bold text-primary">
                                        ${(item.price * item.quantity).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                    
                    <button 
                        onClick={clearCart}
                        className="self-start text-sm text-red-500 hover:text-red-700 font-medium underline decoration-red-200 hover:decoration-red-700 underline-offset-4 transition-all"
                    >
                        Vaciar carrito
                    </button>
                </div>

                {/* Order Summary */}
                <div className="w-full lg:w-96">
                    <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 sticky top-24">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Resumen</h2>
                        
                        <div className="space-y-3 mb-6">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal</span>
                                <span>${totalPrice.toLocaleString()}</span>
                            </div>
                            {/* <div className="flex justify-between text-slate-600">
                                <span>Envío</span>
                                <span className="text-green-600 font-medium">Gratis</span>
                            </div> */}
                        </div>
                        
                        <div className="border-t border-gray-200 pt-4 mb-8">
                            <div className="flex justify-between items-center text-lg font-bold text-slate-900">
                                <span>Total</span>
                                <span>${totalPrice.toLocaleString()}</span>
                            </div>
                        </div>
                        
                        <Link 
                            href="/checkout"
                            className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary/90 transition-all shadow-md active:scale-[0.98]"
                        >
                            Ir a Pagar
                            <span className="material-symbols-outlined">arrow_forward</span>
                        </Link>
                        
                        <div className="mt-4 text-center">
                            <Link href="/catalog" className="text-sm text-slate-500 hover:text-primary transition-colors">
                                Continuar comprando
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
