"use client";

import React from 'react';
import Link from 'next/link';
import { Product } from '@/types';
import { useCart } from '@/lib/context/CartContext';

interface AddToCartProps {
    product: Product;
    wrapperClassName?: string;
    compact?: boolean;
    showViewCart?: boolean;
}

const AddToCart: React.FC<AddToCartProps> = ({ product, wrapperClassName = "", compact = false, showViewCart = false }) => {
    const { cart, addToCart, updateQuantity, removeFromCart } = useCart();

    // Check if product is already in cart
    const cartItem = cart.find(item => item.id === product.id);
    const quantity = cartItem ? cartItem.quantity : 0;

    const handleIncrement = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (cartItem) {
            updateQuantity(product.id, quantity + 1);
        } else {
            addToCart(product, 1);
        }
    };

    const handleDecrement = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (quantity > 1) {
            updateQuantity(product.id, quantity - 1);
        } else {
            removeFromCart(product.id);
        }
    };

    const handleRemove = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        removeFromCart(product.id);
    };

    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link navigation
        e.stopPropagation();
        addToCart(product, 1);
    };

    if (quantity > 0) {
        return (
            <div className={`flex flex-col gap-3 w-full ${wrapperClassName}`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                <div className={`flex items-center justify-between rounded-xl sm:rounded-2xl border-2 border-primary/30 bg-gradient-to-r from-primary/5 to-amber-500/5 ${compact ? 'px-1 py-0.5' : 'px-1 py-1'}`}>
                    <button
                        onClick={handleDecrement}
                        className={`flex items-center justify-center rounded-lg bg-white text-primary shadow-sm transition-all hover:scale-105 hover:shadow-md active:scale-95 ${compact ? 'h-6 w-6 sm:h-7 sm:w-7' : 'h-7 w-7 sm:h-9 sm:w-9'}`}
                        aria-label="Disminuir cantidad"
                    >
                        <span className="material-symbols-outlined text-xs sm:text-sm">{quantity === 1 ? 'delete' : 'remove'}</span>
                    </button>

                    <span className={`font-bold text-slate-900 min-w-[2ch] text-center ${compact ? 'px-1 text-xs' : 'px-1 sm:px-2 text-sm sm:text-base'}`}>{quantity}</span>

                    <button
                        onClick={handleIncrement}
                        className={`flex items-center justify-center rounded-lg bg-gradient-to-r from-primary to-amber-500 text-white shadow-md transition-all hover:scale-105 hover:shadow-lg active:scale-95 ${compact ? 'h-6 w-6 sm:h-7 sm:w-7' : 'h-7 w-7 sm:h-9 sm:w-9'}`}
                        aria-label="Aumentar cantidad"
                    >
                        <span className="material-symbols-outlined text-xs sm:text-sm">add</span>
                    </button>
                </div>

                {showViewCart && (
                    <Link
                        href="/cart"
                        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/10"
                    >
                        <span>Ir al Carrito</span>
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                )}
            </div>
        );
    }

    return (
        <div className={`w-full ${wrapperClassName}`}>
            <button
                onClick={handleAddToCart}
                className={`group flex w-full items-center justify-center gap-1.5 sm:gap-2 rounded-xl sm:rounded-2xl bg-gradient-to-r from-primary to-amber-500 text-xs sm:text-sm font-bold text-white transition-all hover:shadow-lg hover:shadow-primary/30 active:scale-[0.98] ${compact ? 'px-3 py-2' : 'px-3 py-2 sm:px-4 sm:py-3'}`}
            >
                <span className="material-symbols-outlined text-[16px] sm:text-[18px]">add_shopping_cart</span>
                <span className="hidden xs:inline">{compact ? 'Añadir' : 'Añadir al Carrito'}</span>
                <span className="xs:hidden">Añadir</span>
            </button>
        </div>
    );
};

export default AddToCart;
