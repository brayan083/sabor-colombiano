'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { getProducts } from '@/lib/services/products';
import { createOrder } from '@/lib/services/orders';
import { calculateShippingZone } from '@/lib/services/geocoding'; // Import geocoding service
import { Product, OrderItem } from '@/types';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const NewOrderPage: React.FC = () => {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedItems, setSelectedItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [calculatingShipping, setCalculatingShipping] = useState(false); // Add loading state

    // Form Data
    const [formData, setFormData] = useState({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        street: '',
        city: '',
        zip: '',
        floor: '',
        apartment: '',
        orderNotes: '',
        deliveryMethod: 'delivery', // 'delivery' | 'pickup'
        deliveryTimeSlot: '', // Time slot preference
        paymentStatus: 'unpaid', // 'unpaid' | 'paid' | 'partially_paid'
        shippingZone: '' // 'centro' | 'bordes'
    });

    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    useEffect(() => {
        // Auto-calculate shipping when address changes
        const timer = setTimeout(async () => {
            if (formData.deliveryMethod === 'delivery' && formData.street) {
                setCalculatingShipping(true);
                // Use provided city or default to Buenos Aires for search
                const searchCity = formData.city || 'Buenos Aires';
                const address = `${formData.street} ${formData.floor ? `Piso ${formData.floor}` : ''} ${formData.apartment ? `Depto ${formData.apartment}` : ''}, ${searchCity}, Argentina`;

                const result = await calculateShippingZone(address);

                if (result) {
                    setFormData(prev => ({
                        ...prev,
                        shippingZone: result.zone || '',
                        // Prioritize neighborhood (barrio) for locality/city field
                        city: result.neighborhood || result.city || prev.city,
                        zip: result.zip || prev.zip
                    }));
                } else {
                    setFormData(prev => ({ ...prev, shippingZone: '' }));
                }
                setCalculatingShipping(false);
            } else if (formData.deliveryMethod !== 'delivery') {
                setFormData(prev => ({ ...prev, shippingZone: '' }));
            }
        }, 1500); // 1.5s debounce

        return () => clearTimeout(timer);
    }, [formData.street, formData.city, formData.floor, formData.apartment, formData.deliveryMethod]);

    useEffect(() => {
        // ... (data fetching logic remains same) 
        const fetchProducts = async () => {
            // ... existing fetch logic
            try {
                const data = await getProducts();
                setProducts(data);
            } catch (error) {
                console.error("Error fetching products:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    // ... (helper functions remain same)
    const addToOrder = (product: Product) => {
        // ... existing addToOrder ...
        const existingItem = selectedItems.find(item => item.productId === product.id);
        if (existingItem) {
            setSelectedItems(selectedItems.map(item =>
                item.productId === product.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            setSelectedItems([...selectedItems, {
                productId: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
                image: product.image
            }]);
        }
    };

    const removeFromOrder = (productId: string) => setSelectedItems(selectedItems.filter(item => item.productId !== productId));

    const updateQuantity = (productId: string, quantity: number) => {
        if (quantity < 1) return;
        setSelectedItems(selectedItems.map(item => item.productId === productId ? { ...item, quantity } : item));
    };

    const calculateTotal = () => selectedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (selectedItems.length === 0) {
            alert("Debe agregar al menos un producto al pedido.");
            return;
        }

        setSubmitting(true);
        try {
            const baseOrder = {
                userId: 'admin-created',
                items: selectedItems,
                total: calculateTotal(),
                status: 'pending' as const,
                paymentMethod: 'cash' as const, // Default for manual orders
                paymentStatus: formData.paymentStatus as 'paid' | 'unpaid' | 'partially_paid',
                customerName: formData.customerName,
                customerPhone: formData.customerPhone,
                orderNotes: formData.orderNotes,
                deliveryMethod: formData.deliveryMethod as 'delivery' | 'pickup',
                deliveryTimeSlot: formData.deliveryTimeSlot,
                deliveryDate: selectedDate ? selectedDate.toISOString().split('T')[0] : '',
                createdAt: Date.now()
            };

            // Calculate shipping logic
            let shippingCost = 0;
            if (formData.deliveryMethod === 'delivery') {
                if (formData.shippingZone === 'centro') shippingCost = 5000;
                else if (formData.shippingZone === 'bordes') shippingCost = 9000;
            }

            baseOrder.total += shippingCost;

            const newOrder = formData.deliveryMethod === 'delivery'
                ? {
                    ...baseOrder,
                    shippingCost,
                    shippingZone: formData.shippingZone,
                    shippingAddress: {
                        street: formData.street,
                        city: formData.city,
                        floor: formData.floor,
                        apartment: formData.apartment,
                        state: '',
                        zip: formData.zip
                    }
                }
                : baseOrder;

            await createOrder(newOrder);
            router.push('/admin/orders');
        } catch (error) {
            console.error("Error creating order:", error);
            alert("Error al crear el pedido.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto flex flex-col gap-8">
            <div className="flex items-center gap-4">
                <Link href="/admin/orders" className="p-2 rounded-lg hover:bg-black/5 text-slate-500">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <h1 className="text-2xl font-bold text-slate-900">Nuevo Pedido Manual</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Product Selection */}
                <div className="flex flex-col gap-4 bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm max-h-[400px] lg:max-h-[calc(100vh-200px)]">
                    <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <h3 className="font-bold text-slate-900">1. Seleccionar Productos</h3>
                        <input className="mt-2 w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-admin" placeholder="Buscar productos..." />
                    </div>
                    <div className="overflow-y-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        {loading ? <p>Cargando productos...</p> : products.map(product => (
                            <div key={product.id} className="border border-gray-200 rounded-lg p-3 flex gap-3 hover:border-primary-admin cursor-pointer transition-colors" onClick={() => addToOrder(product)}>
                                <div className="relative h-16 w-16 rounded-md overflow-hidden flex-shrink-0 bg-gray-100">
                                    {product.image && (
                                        <Image
                                            fill
                                            src={product.image}
                                            alt={product.name}
                                            className="object-cover"
                                        />
                                    )}
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900 line-clamp-1">{product.name}</p>
                                    <p className="text-sm text-slate-500">${product.price.toFixed(2)}</p>
                                    <button className="text-xs text-primary-admin font-bold mt-1">Añadir +</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Order Details & Checkout */}
                <div className="flex flex-col gap-6">
                    {/* Selected Items */}
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex-shrink-0">
                        <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between">
                            <h3 className="font-bold text-slate-900">2. Resumen del Pedido</h3>
                            <span className="font-bold text-primary-admin">Total: ${calculateTotal().toFixed(2)}</span>
                        </div>
                        <div className="divide-y divide-gray-200 max-h-[300px] overflow-y-auto">
                            {selectedItems.length === 0 ? (
                                <div className="p-8 text-center text-slate-400 text-sm">No hay productos seleccionados.</div>
                            ) : selectedItems.map(item => (
                                <div key={item.productId} className="p-3 flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-3">
                                        <div className="relative h-10 w-10 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                                            {item.image && <Image fill src={item.image} alt={item.name} className="object-cover" />}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-slate-900 line-clamp-1">{item.name}</p>
                                            <p className="text-xs text-slate-500">${item.price}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="flex items-center border border-gray-300 rounded-lg">
                                            <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="px-2 py-1 hover:bg-gray-100 text-slate-600">-</button>
                                            <span className="text-sm w-6 text-center">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="px-2 py-1 hover:bg-gray-100 text-slate-600">+</button>
                                        </div>
                                        <button onClick={() => removeFromOrder(item.productId)} className="text-red-500 p-1 hover:bg-red-50 rounded">
                                            <span className="material-symbols-outlined text-[18px]">delete</span>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Customer Form */}
                    <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="font-bold text-slate-900">3. Datos del Cliente y Entrega</h3>
                        </div>
                        <div className="p-4 space-y-4">
                            {/* Customer Info */}
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-700">Nombre Cliente</label>
                                    <input type="text" name="customerName" value={formData.customerName} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-700">Teléfono</label>
                                        <input type="tel" name="customerPhone" value={formData.customerPhone} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Ej: +54 9 11 1234-5678" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-700">Email (Opcional)</label>
                                        <input type="email" name="customerEmail" value={formData.customerEmail} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-medium text-slate-700">Notas del Pedido (Opcional)</label>
                                    <textarea
                                        name="orderNotes"
                                        value={formData.orderNotes}
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-y min-h-[80px]"
                                        placeholder="Ej: Timbre no funciona, dejar en recepción..."
                                    />
                                </div>
                            </div>

                            {/* Delivery Method & Payment Status Grid */}
                            <div className="flex flex-col gap-4">
                                {/* Delivery Method */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-700">Método de Entrega</label>
                                    <div className="flex gap-4">
                                        <label className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border cursor-pointer ${formData.deliveryMethod === 'delivery' ? 'bg-primary-admin/5 border-primary-admin' : 'border-gray-200'}`}>
                                            <input
                                                type="radio"
                                                name="deliveryMethod"
                                                value="delivery"
                                                checked={formData.deliveryMethod === 'delivery'}
                                                onChange={handleChange}
                                                className="text-primary-admin focus:ring-primary-admin"
                                            />
                                            <span className="text-sm font-medium text-slate-900">Domicilio</span>
                                        </label>
                                        <label className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border cursor-pointer ${formData.deliveryMethod === 'pickup' ? 'bg-primary-admin/5 border-primary-admin' : 'border-gray-200'}`}>
                                            <input
                                                type="radio"
                                                name="deliveryMethod"
                                                value="pickup"
                                                checked={formData.deliveryMethod === 'pickup'}
                                                onChange={handleChange}
                                                className="text-primary-admin focus:ring-primary-admin"
                                            />
                                            <span className="text-sm font-medium text-slate-900">Retiro en Local</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Payment Status */}
                                <div className="space-y-2">
                                    <label className="text-xs font-medium text-slate-700">Estado de Pago</label>
                                    <div className="flex gap-4">
                                        <label className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border cursor-pointer ${formData.paymentStatus === 'unpaid' ? 'bg-red-50 border-red-500' : 'border-gray-200'}`}>
                                            <input
                                                type="radio"
                                                name="paymentStatus"
                                                value="unpaid"
                                                checked={formData.paymentStatus === 'unpaid'}
                                                onChange={handleChange}
                                                className="text-red-500 focus:ring-red-500"
                                            />
                                            <span className="text-sm font-medium text-slate-900">No Pago</span>
                                        </label>
                                        <label className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border cursor-pointer ${formData.paymentStatus === 'partially_paid' ? 'bg-orange-50 border-orange-500' : 'border-gray-200'}`}>
                                            <input
                                                type="radio"
                                                name="paymentStatus"
                                                value="partially_paid"
                                                checked={formData.paymentStatus === 'partially_paid'}
                                                onChange={handleChange}
                                                className="text-orange-500 focus:ring-orange-500"
                                            />
                                            <span className="text-sm font-medium text-slate-900">Seña Pagada</span>
                                        </label>
                                        <label className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border cursor-pointer ${formData.paymentStatus === 'paid' ? 'bg-green-50 border-green-500' : 'border-gray-200'}`}>
                                            <input
                                                type="radio"
                                                name="paymentStatus"
                                                value="paid"
                                                checked={formData.paymentStatus === 'paid'}
                                                onChange={handleChange}
                                                className="text-green-500 focus:ring-green-500"
                                            />
                                            <span className="text-sm font-medium text-slate-900">Pago</span>
                                        </label>
                                    </div>
                                </div>
                            </div>


                            {/* Date Selection */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-700">Fecha de Entrega Preferida</label>
                                <div className="relative">
                                    <DatePicker
                                        selected={selectedDate}
                                        onChange={(date: Date | null) => setSelectedDate(date)}
                                        minDate={new Date()}
                                        dateFormat="dd/MM/yyyy"
                                        placeholderText="Selecciona una fecha"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                        wrapperClassName="w-full"
                                    />
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[16px] pointer-events-none">
                                        calendar_today
                                    </span>
                                </div>
                            </div>

                            {/* Time Slot Selection */}
                            <div className="space-y-2">
                                <label className="text-xs font-medium text-slate-700">Rango Horario Preferido</label>
                                <select
                                    name="deliveryTimeSlot"
                                    value={formData.deliveryTimeSlot}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                >
                                    <option value="">Seleccionar horario...</option>
                                    <option value="09:00 - 11:00">09:00 - 11:00</option>
                                    <option value="11:00 - 13:00">11:00 - 13:00</option>
                                    <option value="13:00 - 15:00">13:00 - 15:00</option>
                                    <option value="15:00 - 17:00">15:00 - 17:00</option>
                                    <option value="17:00 - 19:00">17:00 - 19:00</option>
                                </select>
                            </div>

                            {/* Address Fields (Conditional) */}
                            {formData.deliveryMethod === 'delivery' && (
                                <div className="space-y-4 pt-4 border-t border-gray-100">
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <label className="text-xs font-medium text-slate-700">Costo de Envío</label>
                                            {calculatingShipping && (
                                                <div className="flex items-center gap-2 text-xs text-primary-admin animate-pulse">
                                                    <span className="material-symbols-outlined text-sm">calculate</span>
                                                    Calculando...
                                                </div>
                                            )}
                                        </div>

                                        {formData.shippingZone ? (
                                            <div className="flex items-center justify-between p-3 rounded-lg bg-primary-admin/5 border border-primary-admin/20 animate-in fade-in zoom-in duration-300">
                                                <div className="flex items-center gap-3">
                                                    <div className="bg-white p-1.5 rounded-md border border-gray-100 shadow-sm">
                                                        <span className="material-symbols-outlined text-primary-admin text-[20px]">local_shipping</span>
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-900 text-sm">
                                                            {formData.shippingZone === 'centro' ? 'Capital (Centro)' : 'Capital (Bordes)'}
                                                        </div>
                                                        <div className="text-[10px] text-slate-500">
                                                            Zona calculada automáticamente
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="font-black text-slate-900">
                                                    {formData.shippingZone === 'centro' ? '$5.000' : '$9.000'}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="p-3 rounded-lg bg-gray-50 border border-gray-200 text-xs text-slate-500 text-center flex items-center justify-center gap-2">
                                                <span className="material-symbols-outlined text-gray-400 text-[18px]">home_pin</span>
                                                Ingresa la dirección para calcular costo
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-medium text-slate-700">Dirección</label>
                                        <input type="text" name="street" value={formData.street} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-700">Piso (Opcional)</label>
                                            <input type="text" name="floor" value={formData.floor} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Ej: 4" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-700">Depto (Opcional)</label>
                                            <input type="text" name="apartment" value={formData.apartment} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Ej: C" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-700">Localidad</label>
                                            <input type="text" name="city" value={formData.city} onChange={handleChange} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" placeholder="Ej: Palermo, Recoleta" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-medium text-slate-700">Código Postal (Opcional)</label>
                                            <input type="text" name="zip" value={formData.zip} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                            <button
                                type="submit"
                                disabled={submitting || selectedItems.length === 0}
                                className="px-6 py-2 bg-primary-admin text-white rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50 w-full md:w-auto"
                            >
                                {submitting ? 'Creando Pedido...' : 'Crear Pedido'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default NewOrderPage;



