"use client";

import React from 'react';
import { Product } from '@/types';
import { useCart } from '@/lib/context/CartContext';

interface AddToCartProps {
    product: Product;
    wrapperClassName?: string;
    compact?: boolean;
}

const AddToCart: React.FC<AddToCartProps> = ({ product, wrapperClassName = "", compact = false }) => {
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
            <div className={`flex items-center justify-between gap-2 w-full ${wrapperClassName}`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                <div className={`flex flex-1 items-center justify-between rounded-lg border border-primary bg-primary/5 ${compact ? 'px-1 py-0.5' : 'px-1 py-1'}`}>
                    <button
                        onClick={handleDecrement}
                        className={`flex items-center justify-center rounded-md bg-white text-primary shadow-sm transition-transform hover:scale-105 active:scale-95 ${compact ? 'h-7 w-7' : 'h-9 w-9'}`}
                        aria-label="Disminuir cantidad"
                    >
                        <span className="material-symbols-outlined text-sm">{quantity === 1 ? 'delete' : 'remove'}</span>
                    </button>

                    <span className={`font-bold text-slate-900 min-w-[2ch] text-center ${compact ? 'px-1 text-xs' : 'px-2'}`}>{quantity}</span>

                    <button
                        onClick={handleIncrement}
                        className={`flex items-center justify-center rounded-md bg-primary text-white shadow-sm transition-transform hover:scale-105 active:scale-95 ${compact ? 'h-7 w-7' : 'h-9 w-9'}`}
                        aria-label="Aumentar cantidad"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`w-full ${wrapperClassName}`}>
            <button
                onClick={handleAddToCart}
                className={`group flex w-full items-center justify-center gap-2 rounded-lg bg-[#FFCD00] text-sm font-bold text-[#003893] transition-all hover:bg-[#FFD700] hover:shadow-md active:scale-[0.98] ${compact ? 'px-3 py-2' : 'px-4 py-3'}`}
            >
                <span className="material-symbols-outlined text-base">add_shopping_cart</span>
                {compact ? 'Añadir' : 'Añadir al Carrito'}
            </button>
        </div>
    );
};

export default AddToCart;
