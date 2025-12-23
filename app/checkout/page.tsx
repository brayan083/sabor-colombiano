"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { useCart } from '@/lib/context/CartContext';
import { createOrder } from '@/lib/services/orders';
import { updateUserPhone } from '@/lib/services/users';
import { Order, OrderItem } from '@/types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { formatPrice } from '@/lib/utils';

export default function CheckoutPage() {
    const { user, loading: authLoading, refreshUser } = useAuth();
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
        deliveryTimeSlot: '',
        paymentMethod: 'mercado_pago' as 'mercado_pago' | 'transfer' | 'cash',
        deliveryMethod: 'delivery' as 'delivery' | 'pickup'
    });

    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const isOrderPlaced = React.useRef(false);

    useEffect(() => {
        if (!authLoading && user && cart.length === 0 && !isOrderPlaced.current) {
            router.push('/catalog');
        }
    }, [cart, authLoading, user, router]);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login?redirect=/checkout');
        }
    }, [authLoading, user, router]);

    // Auto-fill user data when component loads
    useEffect(() => {
        if (user) {
            // Split displayName into firstName and lastName
            const nameParts = user.displayName?.trim().split(' ') || [];
            const firstName = nameParts[0] || '';
            const lastName = nameParts.slice(1).join(' ') || '';

            setFormData(prev => ({
                ...prev,
                firstName: prev.firstName || firstName,
                lastName: prev.lastName || lastName,
                phone: prev.phone || user.phoneNumber || ''
            }));
        }
    }, [user]);

    // Helper function to check if a time slot is available (at least 2 hours from now)
    const isTimeSlotAvailable = (timeSlot: string, selectedDate: Date | null): boolean => {
        if (!selectedDate) return true; // If no date selected, show all slots

        const now = new Date();
        const selectedDateOnly = new Date(selectedDate);
        selectedDateOnly.setHours(0, 0, 0, 0);
        const todayOnly = new Date(now);
        todayOnly.setHours(0, 0, 0, 0);

        // If selected date is in the future, all slots are available
        if (selectedDateOnly > todayOnly) return true;

        // If selected date is today, check if slot is at least 2 hours from now
        const [startTime] = timeSlot.split(' - ');
        const [hours, minutes] = startTime.split(':').map(Number);

        const slotDateTime = new Date(selectedDate);
        slotDateTime.setHours(hours, minutes, 0, 0);

        const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

        return slotDateTime >= twoHoursFromNow;
    };

    // Clear time slot if it becomes unavailable when date changes
    useEffect(() => {
        if (formData.deliveryTimeSlot && !isTimeSlotAvailable(formData.deliveryTimeSlot, selectedDate)) {
            setFormData(prev => ({
                ...prev,
                deliveryTimeSlot: ''
            }));
        }
    }, [selectedDate, formData.deliveryTimeSlot]);

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
            // Save phone number to user profile if not already saved
            if (formData.phone && formData.phone !== user.phoneNumber) {
                await updateUserPhone(user.uid, formData.phone);
                await refreshUser(); // Update local user state immediately
            }

            if (formData.paymentMethod === 'mercado_pago') {
                // Call API to create preference
                const response = await fetch('/api/payments/mercadopago', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        items: cart,
                        payer: {
                            ...formData,
                            email: user.email,
                            id: user.uid
                        },
                        deliveryTimeSlot: formData.deliveryTimeSlot,
                        deliveryDate: selectedDate ? selectedDate.toISOString().split('T')[0] : ''
                    })
                });

                const data = await response.json();
                if (data.init_point) {
                    window.location.href = data.init_point;
                    return; // Stop execution to allow redirect
                } else {
                    throw new Error('No se pudo iniciar el pago con Mercado Pago');
                }
            }

            // Standard order creation (Cash/Transfer)
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
                deliveryTimeSlot: formData.deliveryTimeSlot,
                deliveryDate: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-outlined text-primary text-4xl">shopping_cart_checkout</span>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900">Finalizar Compra</h1>
                </div>
                <p className="text-slate-600">Completa los datos para recibir tu pedido</p>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

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

                        {/* Date and Time Selection */}
                        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                            <div className="flex items-center gap-3 mb-4">
                                <span className="material-symbols-outlined text-primary text-2xl">event</span>
                                <h2 className="text-xl font-bold text-slate-900">
                                    {formData.deliveryMethod === 'pickup' ? 'Fecha y Horario de Retiro' : 'Fecha y Horario de Entrega'}
                                </h2>
                            </div>
                            <p className="text-sm text-slate-600 mb-4">
                                {formData.deliveryMethod === 'pickup'
                                    ? 'Selecciona cuándo prefieres pasar a retirar tu pedido'
                                    : 'Selecciona cuándo prefieres recibir tu pedido'}
                            </p>

                            {/* Date Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    {formData.deliveryMethod === 'pickup' ? 'Fecha de Retiro' : 'Fecha Preferida'}
                                </label>
                                <div className="relative">
                                    <DatePicker
                                        selected={selectedDate}
                                        onChange={(date: Date | null) => setSelectedDate(date)}
                                        minDate={new Date()}
                                        dateFormat="dd/MM/yyyy"
                                        placeholderText="Selecciona una fecha"
                                        className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-medium text-slate-900 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                        wrapperClassName="w-full"
                                    />
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl pointer-events-none">
                                        calendar_today
                                    </span>
                                </div>
                            </div>

                            {/* Time Slot Selection */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-2">
                                    {formData.deliveryMethod === 'pickup' ? 'Horario de Retiro' : 'Rango Horario'}
                                </label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {[
                                        '09:00 - 11:00',
                                        '11:00 - 13:00',
                                        '13:00 - 15:00',
                                        '15:00 - 17:00',
                                        '17:00 - 19:00'
                                    ].map((timeSlot) => {
                                        const isAvailable = isTimeSlotAvailable(timeSlot, selectedDate);
                                        const isSelected = formData.deliveryTimeSlot === timeSlot;

                                        return (
                                            <label
                                                key={timeSlot}
                                                className={`flex items-center justify-center gap-2 p-4 rounded-xl border cursor-pointer transition-all ${!isAvailable
                                                    ? 'border-gray-200 bg-gray-50 opacity-50 cursor-not-allowed'
                                                    : isSelected
                                                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                                                        : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="deliveryTimeSlot"
                                                    value={timeSlot}
                                                    checked={isSelected}
                                                    onChange={handleInputChange}
                                                    disabled={!isAvailable}
                                                    className="sr-only"
                                                />
                                                <span className={`material-symbols-outlined text-xl ${!isAvailable ? 'text-gray-400' : 'text-primary'}`}>
                                                    {!isAvailable ? 'block' : 'access_time'}
                                                </span>
                                                <span className={`font-bold ${!isAvailable ? 'text-gray-400' : 'text-slate-900'}`}>
                                                    {timeSlot}
                                                </span>
                                            </label>
                                        );
                                    })}
                                </div>
                            </div>

                            <p className="text-xs text-slate-500 mt-3 flex items-center gap-1">
                                <span className="material-symbols-outlined text-sm">info</span>
                                {formData.deliveryMethod === 'pickup'
                                    ? 'Los pedidos deben solicitarse con al menos 2 horas de anticipación al horario de retiro'
                                    : 'Los pedidos deben hacerse con al menos 2 horas de anticipación'}
                            </p>
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
                                        <p className="text-slate-600 mt-1">Calle 85 #12-34, Zona T<br />Bogotá, Cundinamarca</p>
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
                    <div className="bg-gradient-to-br from-gray-50 to-white p-6 sm:p-8 rounded-2xl border-2 border-gray-200 shadow-sm lg:sticky lg:top-24">
                        <div className="flex items-center gap-2 mb-6">
                            <span className="material-symbols-outlined text-primary text-2xl">receipt_long</span>
                            <h2 className="text-2xl font-black text-slate-900">Resumen del Pedido</h2>
                        </div>

                        <div className="space-y-3 mb-6 max-h-60 overflow-y-auto pr-2">
                            {cart.map((item) => (
                                <div key={item.id} className="flex gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:border-primary/20 transition-colors">
                                    <div className="relative size-16 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="64px" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-900 line-clamp-2">{item.name}</p>
                                        <p className="text-xs text-slate-500 mt-1">Cant: {item.quantity}</p>
                                    </div>
                                    <p className="text-sm font-black text-primary">{formatPrice(item.price * item.quantity)}</p>
                                </div>
                            ))}
                        </div>

                        <div className="border-t border-gray-200 pt-4 space-y-3 mb-4">
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>Subtotal</span>
                                <span className="font-semibold">{formatPrice(totalPrice)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-slate-600">
                                <span>Entrega</span>
                                {formData.deliveryMethod === 'delivery' ? (
                                    <span className="text-green-600 font-bold">Gratis</span>
                                ) : (
                                    <span className="text-slate-900 font-semibold">Retiro en local</span>
                                )}
                            </div>
                        </div>

                        <div className="bg-primary/5 rounded-xl p-4 mb-6 border border-primary/20">
                            <div className="flex justify-between items-center">
                                <span className="text-lg font-bold text-slate-900">Total</span>
                                <span className="text-2xl font-black text-primary">{formatPrice(totalPrice)}</span>
                            </div>
                        </div>

                        {errorMessage && (
                            <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 animate-in fade-in slide-in-from-top-2">
                                <div className="flex items-start gap-2">
                                    <span className="material-symbols-outlined text-red-600 text-xl">error</span>
                                    <div>
                                        <p className="text-sm font-bold text-red-800">Error al procesar el pedido</p>
                                        <p className="text-xs text-red-600 mt-1">{errorMessage}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <button
                            type="submit"
                            form="checkout-form"
                            disabled={isSubmitting}
                            className="w-full flex items-center justify-center gap-2 bg-primary text-white font-bold py-4 rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                    Procesando...
                                </>
                            ) : (
                                <>
                                    <span>Confirmar Pedido</span>
                                    <span className="material-symbols-outlined">check_circle</span>
                                </>
                            )}
                        </button>

                        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-500">
                            <span className="material-symbols-outlined text-green-600 text-sm">lock</span>
                            Todas las transacciones son seguras
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
