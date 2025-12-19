"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/lib/context/CartContext';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
    const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Tu Carrito</h1>
                    <div className="size-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-black text-primary">{totalItems}</span>
                    </div>
                </div>
                <p className="text-slate-600">Revisa tus productos antes de continuar</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                {/* Cart Items List */}
                <div className="flex-1 space-y-4">
                    {cart.map((item) => (
                        <div key={item.id} className="group bg-white border border-gray-200 rounded-xl p-4 sm:p-6 hover:shadow-lg hover:border-primary/20 transition-all duration-300">
                            <div className="flex gap-4 sm:gap-6">
                                {/* Product Image */}
                                <div className="relative w-20 h-20 sm:w-28 sm:h-28 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                    <Image
                                        src={item.image}
                                        alt={item.name}
                                        fill
                                        className="object-cover"
                                        sizes="(max-width: 640px) 80px, 112px"
                                    />
                                </div>

                                {/* Product Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-2 mb-2">
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base sm:text-lg font-bold text-slate-900 truncate">{item.name}</h3>
                                            <p className="text-xs sm:text-sm text-slate-500 line-clamp-1 sm:line-clamp-2">{item.description}</p>
                                        </div>
                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all p-2 rounded-lg flex-shrink-0"
                                            aria-label="Eliminar producto"
                                        >
                                            <span className="material-symbols-outlined text-xl">delete</span>
                                        </button>
                                    </div>

                                    {/* Price and Quantity Controls */}
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
                                        {/* Quantity Controls */}
                                        <div className="flex items-center gap-3">
                                            <span className="text-xs font-medium text-slate-500 hidden sm:block">Cantidad:</span>
                                            <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200">
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                    className="px-3 py-2 hover:bg-gray-100 rounded-l-lg transition-colors text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                                    disabled={item.quantity <= 1}
                                                >
                                                    <span className="material-symbols-outlined text-base">remove</span>
                                                </button>
                                                <span className="px-4 py-2 font-bold text-slate-900 min-w-[3ch] text-center">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                    className="px-3 py-2 hover:bg-gray-100 rounded-r-lg transition-colors text-slate-600"
                                                >
                                                    <span className="material-symbols-outlined text-base">add</span>
                                                </button>
                                            </div>
                                        </div>

                                        {/* Price */}
                                        <div className="flex items-baseline gap-2">
                                            {item.quantity > 1 && (
                                                <span className="text-xs text-slate-400">
                                                    {formatPrice(item.price)} × {item.quantity}
                                                </span>
                                            )}
                                            <p className="text-xl sm:text-2xl font-black text-primary">
                                                {formatPrice(item.price * item.quantity)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Clear Cart Button */}
                    <div className="flex items-center justify-between pt-4">
                        <button
                            onClick={clearCart}
                            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 font-medium hover:bg-red-50 px-4 py-2 rounded-lg transition-all"
                        >
                            <span className="material-symbols-outlined text-base">delete_sweep</span>
                            <span>Vaciar carrito</span>
                        </button>
                    </div>
                </div>

                {/* Sidebar - Summary Only */}
                <div className="w-full lg:w-96">
                    <div className="lg:sticky lg:top-24">
                        {/* Order Summary */}
                        <div className="bg-gradient-to-br from-gray-50 to-white p-6 sm:p-8 rounded-2xl border-2 border-gray-200 shadow-sm">
                            <h2 className="text-2xl font-black text-slate-900 mb-6 flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary">receipt_long</span>
                                Resumen
                            </h2>

                            {/* Items Summary - Detailed Breakdown */}
                            <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Desglose de productos</p>
                                {cart.map((item) => (
                                    <div key={item.id} className="flex justify-between items-start gap-2 text-sm">
                                        <div className="flex-1 min-w-0">
                                            <p className="font-medium text-slate-700 truncate">{item.name}</p>
                                            <p className="text-xs text-slate-500">
                                                {formatPrice(item.price)} × {item.quantity}
                                            </p>
                                        </div>
                                        <p className="font-bold text-slate-900 flex-shrink-0">
                                            {formatPrice(item.price * item.quantity)}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Total */}
                            <div className="bg-primary/5 rounded-xl p-4 mb-6 border border-primary/20">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-slate-900">Total</span>
                                    <span className="text-2xl font-black text-primary">{formatPrice(totalPrice)}</span>
                                </div>
                            </div>

                            {/* Checkout Button */}
                            <Link
                                href="/checkout"
                                className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] mb-4"
                            >
                                <span>Ir a Pagar</span>
                                <span className="material-symbols-outlined">arrow_forward</span>
                            </Link>

                            {/* Continue Shopping */}
                            <Link
                                href="/catalog"
                                className="w-full flex items-center justify-center gap-2 text-sm text-slate-600 hover:text-primary transition-colors py-2"
                            >
                                <span className="material-symbols-outlined text-base">arrow_back</span>
                                <span>Continuar comprando</span>
                            </Link>

                            {/* Trust Badges */}
                            <div className="mt-6 pt-6 border-t border-gray-200 grid grid-cols-2 gap-3 text-xs text-slate-500">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-green-600 text-base">verified</span>
                                    <span>Pago seguro</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-green-600 text-base">local_shipping</span>
                                    <span>Envío rápido</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
