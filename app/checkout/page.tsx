"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { useCart } from '@/lib/context/CartContext';
import { createOrder } from '@/lib/services/orders';
import { Order, OrderItem } from '@/types';

import { formatPrice } from '@/lib/utils';

export default function CheckoutPage() {
    const { user, loading: authLoading } = useAuth();
    const { cart, totalPrice, clearCart } = useCart();
    const router = useRouter();

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        phone: '',
        address: '',
        locality: '', 
        postalCode: '', 
        orderNotes: '',
        paymentMethod: 'mercado_pago' as 'mercado_pago' | 'transfer' | 'cash',
        deliveryMethod: 'delivery' as 'delivery' | 'pickup'
    });

    const isOrderPlaced = React.useRef(false);

    useEffect(() => {
        if (!authLoading && user && cart.length === 0 && !isOrderPlaced.current) {
            router.push('/catalog');
        }
    }, [cart, authLoading, user, router]);

    // Auto-fill user data if available (recreating this as it might have been lost)
    useEffect(() => {
        if (user) {
            // Check if user has a profile with extra data (omitted for now as I don't have the context of where profile data comes from exactly beyond 'user' object which is usually auth user)
            // Assuming basic auth user displayName/email/phone for now or just skipping auto-fill if specific profile fetch logic was complex and lost.
            // Looking at step 521, there wasn't explicit complex auto-fill visible in the snippet provided there? 
            // Wait, Step 521 shows line 34: // ... (keep protection and auto-fill effects unchanged)
            // Ah, the file view in 521 was NOT complete, it had comments hiding code? 
            // "The above content shows the entire, complete file contents of the requested file." - wait, line 34 says "// ... (keep protection and auto-fill effects unchanged)"?
            // If the original file had that comment LITERALY, then I don't need to restore code that wasn't there.
            // BUT, if Step 521 view was actually truncated by the *system* or *tool* before passing to me...
            // "The following code has been modified to include a line number... The above content shows the entire, complete file contents... "
            // If line 34 in Step 521 was explicitly visible as `34:     // ... (keep protection and auto-fill effects unchanged)` then that comment was IN THE FILE.
            // If so, I just need to put back the state and handlers.
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePaymentChange = (method: 'mercado_pago' | 'transfer' | 'cash') => {
        setFormData(prev => ({
            ...prev,
            paymentMethod: method
        }));
    };

    const handleDeliveryChange = (method: 'delivery' | 'pickup') => {
        setFormData(prev => ({
            ...prev,
            deliveryMethod: method
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSubmitting(true);
        setErrorMessage(null);

        try {
            const orderItems: OrderItem[] = cart.map(item => ({
                productId: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image
            }));


            const baseOrder = {
                userId: user.uid,
                items: orderItems,
                total: totalPrice,
                status: 'pending' as const,
                deliveryMethod: formData.deliveryMethod,
                paymentMethod: formData.paymentMethod,
                customerName: `${formData.firstName} ${formData.lastName}`.trim(),
                customerPhone: formData.phone,
                orderNotes: formData.orderNotes, // Pass to order creation
                createdAt: Date.now()
            };

            const newOrder: Omit<Order, 'id'> = formData.deliveryMethod === 'delivery' 
                ? {
                    ...baseOrder,
                    shippingAddress: {
                        street: formData.address,
                        city: formData.locality, 
                        state: '', 
                        zip: formData.postalCode
                    }
                }
                : baseOrder;

            const orderId = await createOrder(newOrder);
            isOrderPlaced.current = true; 
            clearCart();
            router.push(`/checkout/success?orderId=${orderId}`);
        } catch (error: any) {
            console.error("Error creating order:", error);
            // Capture specific error message from backend (e.g., stock issues) or fallback
            const msg = error.message || "Hubo un error al procesar tu pedido. Por favor intenta nuevamente.";
            setErrorMessage(msg);
            setIsSubmitting(false);
        }
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-10 lg:px-20 py-10">
            <h1 className="text-3xl font-black text-slate-900 mb-8">Proceso de Pago</h1>

            <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
                
                {/* Left: Forms */}
                <div className="flex-1 space-y-6">
                    <form id="checkout-form" onSubmit={handleSubmit} className="space-y-6">
                        
                        {/* 0. Delivery Method */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Método de Entrega</h2>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <label className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${formData.deliveryMethod === 'delivery' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input 
                                        type="radio" 
                                        name="deliveryMethod" 
                                        value="delivery"
                                        checked={formData.deliveryMethod === 'delivery'}
                                        onChange={() => handleDeliveryChange('delivery')}
                                        className="sr-only"
                                    />
                                    <span className="material-symbols-outlined text-2xl text-primary">local_shipping</span>
                                    <div className="text-left">
                                        <div className="font-bold text-slate-900">Envío a Domicilio</div>
                                        <div className="text-xs text-slate-500">Recibe en tu puerta</div>
                                    </div>
                                </label>

                                <label className={`flex-1 flex items-center justify-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${formData.deliveryMethod === 'pickup' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input 
                                        type="radio" 
                                        name="deliveryMethod" 
                                        value="pickup"
                                        checked={formData.deliveryMethod === 'pickup'}
                                        onChange={() => handleDeliveryChange('pickup')}
                                        className="sr-only"
                                    />
                                    <span className="material-symbols-outlined text-2xl text-primary">storefront</span>
                                    <div className="text-left">
                                        <div className="font-bold text-slate-900">Retiro en Local</div>
                                        <div className="text-xs text-slate-500">Recoge tu pedido</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* 1. User Info (Always visible) */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex items-center justify-center size-8 rounded-full bg-primary text-[#003893] font-bold text-sm">1</div>
                                <h2 className="text-xl font-bold text-slate-900">Tus Datos</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombres</label>
                                    <input 
                                        type="text" 
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleInputChange}
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Apellidos</label>
                                    <input 
                                        type="text" 
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleInputChange}
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        required
                                    />
                                </div>
                                
                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                                    <input 
                                        type="tel" 
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleInputChange}
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        placeholder="Ej: 300 123 4567"
                                        required
                                    />
                                </div>

                                <div className="md:col-span-2">
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Mensaje Opcional</label>
                                    <textarea 
                                        name="orderNotes"
                                        value={formData.orderNotes}
                                        onChange={handleInputChange}
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all min-h-[100px] resize-y"
                                        placeholder="Ej: La arepa con extra de queso, por favor. O instrucciones de entrega."
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 2. Shipping Info (Conditional) */}
                        {formData.deliveryMethod === 'delivery' && (
                            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="flex items-center justify-center size-8 rounded-full bg-primary text-[#003893] font-bold text-sm">2</div>
                                    <h2 className="text-xl font-bold text-slate-900">Dirección de Envío</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Dirección</label>
                                        <input 
                                            type="text" 
                                            name="address"
                                            value={formData.address}
                                            onChange={handleInputChange}
                                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                            placeholder="Calle 123 #45-67"
                                            required={formData.deliveryMethod === 'delivery'}
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Localidad</label>
                                        <input 
                                            type="text" 
                                            name="locality"
                                            value={formData.locality}
                                            onChange={handleInputChange}
                                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                            placeholder="Ej: Usaquén"
                                            required={formData.deliveryMethod === 'delivery'}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Código Postal</label>
                                        <input 
                                            type="text" 
                                            name="postalCode"
                                            value={formData.postalCode}
                                            onChange={handleInputChange}
                                            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                            placeholder="Ej: 110111"
                                            required={formData.deliveryMethod === 'delivery'}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Pickup Info (Conditional) */}
                        {formData.deliveryMethod === 'pickup' && (
                           <div className="bg-white p-6 rounded-xl border border-blue-200 bg-blue-50/50 shadow-sm animate-in fade-in slide-in-from-top-4 duration-300">
                                <div className="flex items-start gap-3">
                                    <span className="material-symbols-outlined text-primary text-3xl">store</span>
                                    <div>
                                        <h3 className="font-bold text-slate-900 text-lg">Retiro en Empalombia</h3>
                                        <p className="text-slate-600 mt-1">Calle 85 #12-34, Zona T<br/>Bogotá, Cundinamarca</p>
                                        <p className="text-sm text-slate-500 mt-2">Horario: Lunes a Sábado, 11:00 AM - 9:00 PM</p>
                                        <div className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-primary bg-white px-3 py-1 rounded-full shadow-sm border border-primary/20">
                                            <span className="material-symbols-outlined text-sm">check</span>
                                            Listo en 30-45 minutos
                                        </div>
                                    </div>
                                </div>
                           </div>
                        )}

                        {/* 3. Payment Method */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex items-center justify-center size-8 rounded-full bg-gray-200 text-slate-600 font-bold text-sm">3</div>
                                <h2 className="text-xl font-bold text-slate-900">Método de Pago</h2>
                            </div>

                            <div className="space-y-3">
                                <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${formData.paymentMethod === 'mercado_pago' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input 
                                        type="radio" 
                                        name="paymentMethod" 
                                        value="mercado_pago"
                                        checked={formData.paymentMethod === 'mercado_pago'}
                                        onChange={() => handlePaymentChange('mercado_pago')}
                                        className="size-5 text-primary border-gray-300 focus:ring-primary"
                                    />
                                    <div className="flex items-center gap-3">
                                        <div className="bg-blue-50 p-2 rounded-lg">
                                            <span className="material-symbols-outlined text-blue-500">credit_card</span>
                                        </div>
                                        <span className="font-medium text-slate-900">Mercado Pago / Tarjeta</span>
                                    </div>
                                </label>

                                <label className={`flex flex-col gap-0 p-0 rounded-xl border cursor-pointer transition-all ${formData.paymentMethod === 'transfer' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <div className="flex items-center gap-4 p-4 w-full">
                                        <input 
                                            type="radio" 
                                            name="paymentMethod" 
                                            value="transfer"
                                            checked={formData.paymentMethod === 'transfer'}
                                            onChange={() => handlePaymentChange('transfer')}
                                            className="size-5 text-primary border-gray-300 focus:ring-primary"
                                        />
                                        <div className="flex items-center gap-3">
                                            <div className="bg-green-50 p-2 rounded-lg">
                                                <span className="material-symbols-outlined text-green-500">account_balance</span>
                                            </div>
                                            <span className="font-medium text-slate-900">Transferencia Bancaria</span>
                                        </div>
                                    </div>
                                    
                                    {/* Bank Details Conditional Rendering */}
                                    {formData.paymentMethod === 'transfer' && (
                                        <div className="px-4 pb-4 ml-9 animate-in slide-in-from-top-2 fade-in duration-200">
                                            <div className="bg-white p-4 rounded-lg border border-primary/20 text-sm text-slate-600 space-y-2">
                                                <p className="font-bold text-primary">Datos Bancarios:</p>
                                                <p>Banco: <span className="font-medium text-slate-900">Bancolombia</span></p>
                                                <p>Tipo de Cuenta: <span className="font-medium text-slate-900">Ahorros</span></p>
                                                <p>Número: <span className="font-medium text-slate-900">987-654321-00</span></p>
                                                <p>Titular: <span className="font-medium text-slate-900">Empalombia SAS</span></p>
                                                <p>NIT: <span className="font-medium text-slate-900">900.123.456-7</span></p>
                                                <div className="bg-blue-50 text-blue-800 p-2 rounded mt-2 text-xs flex items-center gap-2">
                                                    <span className="material-symbols-outlined text-base">info</span>
                                                    Envía el comprobante al WhatsApp +57 300 123 4567
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </label>

                                <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${formData.paymentMethod === 'cash' ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-gray-200 hover:border-gray-300'}`}>
                                    <input 
                                        type="radio" 
                                        name="paymentMethod" 
                                        value="cash"
                                        checked={formData.paymentMethod === 'cash'}
                                        onChange={() => handlePaymentChange('cash')}
                                        className="size-5 text-primary border-gray-300 focus:ring-primary"
                                    />
                                    <div className="flex items-center gap-3">
                                        <div className="bg-yellow-50 p-2 rounded-lg">
                                            <span className="material-symbols-outlined text-yellow-600">payments</span>
                                        </div>
                                        <span className="font-medium text-slate-900">Efectivo contra entrega</span>
                                    </div>
                                </label>
                            </div>
                        </div>

                    </form>
                </div>

                {/* Right: Summary */}
                <div className="w-full lg:w-96">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm sticky top-24">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">Resumen del Pedido</h2>
                        
                        <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {cart.map((item) => (
                                <div key={item.id} className="flex gap-4">
                                    <div className="relative size-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                        <Image src={item.image} alt={item.name} fill className="object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold text-slate-900 line-clamp-2">{item.name}</p>
                                        <p className="text-xs text-slate-500">Cant: {item.quantity}</p>
                                    </div>
                                    <p className="text-sm font-bold text-slate-900">{formatPrice(item.price * item.quantity)}</p>
                                </div>
                            ))}
                        </div>
                        
                        <div className="border-t border-gray-200 my-4 pt-4 space-y-3">
                            <div className="flex justify-between text-slate-600">
                                <span>Subtotal</span>
                                <span>{formatPrice(totalPrice)}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Entrega</span>
                                {formData.deliveryMethod === 'delivery' ? (
                                    <span className="text-green-600 font-medium">Gratis</span>
                                ) : (
                                    <span className="text-slate-900 font-medium">Retiro en local</span>
                                )}
                            </div>
                        </div>
                        
                        <div className="border-t border-gray-200 my-4 pt-4">
                            <div className="flex justify-between items-center text-xl font-black text-slate-900">
                                <span>Total</span>
                                <span>{formatPrice(totalPrice)}</span>
                            </div>
                        </div>

                        {errorMessage && (
                            <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 flex flex-col gap-2 animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-center gap-2 text-red-800 font-bold text-sm">
                                    <span className="material-symbols-outlined text-[18px]">error</span>
                                    Error al procesar el pedido
                                </div>
                                <p className="text-xs text-red-600 pl-6.5">
                                    {errorMessage}
                                </p>
                            </div>
                        )}
                        
                        <button 
                            type="submit"
                            form="checkout-form"
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary/90 transition-all shadow-md active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    Confirmar Pedido
                                    <span className="material-symbols-outlined">check</span>
                                </>
                            )}
                        </button>
                        
                        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
                            <span className="material-symbols-outlined text-sm">lock</span>
                            Todas las transacciones son seguras
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
