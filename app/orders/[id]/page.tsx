"use client";

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { getOrderById } from '@/lib/services/orders';
import { Order } from '@/types';
import Image from 'next/image';

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    // Unwrapping params using React.use for Next.js 15+ compatibility
    const { id } = use(params);

    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push(`/auth/login?redirect=/orders/${id}`);
        }
    }, [user, authLoading, router, id]);

    useEffect(() => {
        const fetchOrder = async () => {
            if (user && id) {
                try {
                    const orderData = await getOrderById(id);
                    if (orderData) {
                        // Basic security check: ensure order belongs to user
                        if (orderData.userId !== user.uid) {
                            alert("No tienes permiso para ver este pedido.");
                            router.push('/orders');
                            return;
                        }
                        setOrder(orderData);
                    }
                } catch (error) {
                    console.error("Error fetching order:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        if (user) {
            fetchOrder();
        }
    }, [user, id, router]);

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getPaymentMethodLabel = (method: string) => {
        switch (method) {
            case 'mercado_pago': return 'Mercado Pago / Tarjeta';
            case 'transfer': return 'Transferencia Bancaria';
            case 'cash': return 'Efectivo contra entrega';
            default: return method;
        }
    };

    const getStatusColor = (status: string, paymentStatus?: string) => {
        if (paymentStatus) {
            switch (paymentStatus) {
                case 'paid': return 'bg-green-100 text-green-800';
                case 'partially_paid': return 'bg-orange-100 text-orange-800';
                case 'unpaid': return 'bg-red-100 text-red-800';
                default: return 'bg-gray-100 text-gray-800';
            }
        }

        switch (status) {
            case 'paid':
            case 'shipped': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const translateStatus = (status: string, paymentStatus?: string) => {
        if (paymentStatus) {
            switch (paymentStatus) {
                case 'paid': return 'Pago';
                case 'partially_paid': return 'Seña Pagada';
                case 'unpaid': return 'No Pago';
                default: return paymentStatus;
            }
        }

        switch (status) {
            case 'pending': return 'Pendiente';
            case 'paid': return 'Pagado';
            case 'shipped': return 'Enviado';
            case 'cancelled': return 'Cancelado';
            default: return status;
        }
    };

    const handlePayWithMercadoPago = async () => {
        if (!order) return;

        setPaymentLoading(true);
        setPaymentError(null);

        try {
            const response = await fetch(`/api/orders/${order.id}/pay`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            });

            const data = await response.json();

            if (data.init_point) {
                // Redirect to Mercado Pago
                window.location.href = data.init_point;
            } else {
                throw new Error(data.error || 'No se pudo iniciar el pago');
            }
        } catch (error: any) {
            console.error('Error initiating payment:', error);
            setPaymentError(error.message || 'Error al procesar el pago');
            setPaymentLoading(false);
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center p-4">
                <p className="text-slate-500 mb-4">No se encontró el pedido.</p>
                <Link href="/orders" className="text-primary font-bold hover:underline">Volver a Mis Pedidos</Link>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex items-center gap-4 mb-8">
                <Link href="/orders" className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                    <span className="material-symbols-outlined text-slate-600">arrow_back</span>
                </Link>
                <h1 className="text-2xl font-black text-slate-900">Detalle del Pedido</h1>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-8">
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
                    <div>
                        <span className="block text-xs uppercase tracking-wider text-slate-500 font-bold">No. Pedido</span>
                        <span className="font-bold text-slate-900 text-lg">#{order.id.slice(0, 8).toUpperCase()}</span>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(order.status, order.paymentStatus)}`}>
                        {translateStatus(order.status, order.paymentStatus)}
                    </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div>
                            <span className="block text-sm text-slate-500">Fecha</span>
                            <span className="font-medium text-slate-900">{formatDate(order.createdAt)}</span>
                        </div>
                        <div>
                            <span className="block text-sm text-slate-500">Cliente</span>
                            <span className="font-medium text-slate-900">{order.customerName}</span>
                            <span className="block text-sm text-slate-400">{order.customerPhone}</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <span className="block text-sm text-slate-500">Método de Pago</span>
                            <span className="font-medium text-slate-900">{getPaymentMethodLabel(order.paymentMethod)}</span>
                        </div>
                        <div>
                            <span className="block text-sm text-slate-500">Entrega</span>
                            <span className="font-medium text-slate-900">
                                {order.deliveryMethod === 'pickup' ? 'Retiro en Local' : 'Envío a Domicilio'}
                            </span>
                            {order.deliveryMethod === 'delivery' && (
                                order.shippingAddress ? (
                                    <div className="mt-1 text-sm text-slate-600">
                                        <p>{order.shippingAddress.street}</p>
                                        <p>{order.shippingAddress.city}, {order.shippingAddress.zip}</p>
                                    </div>
                                ) : (
                                    <p className="mt-1 text-sm text-slate-400 italic">Dirección no disponible</p>
                                )
                            )}
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-200 px-6 py-4">
                    <h3 className="font-bold text-slate-900 mb-4">Productos</h3>
                    <div className="space-y-3">
                        {order.items.map((item, idx) => (
                            <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0 hover:bg-slate-50 transition-colors p-2 rounded">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 bg-gray-100 rounded-md overflow-hidden relative">
                                        <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">{item.name}</p>
                                        <p className="text-xs text-slate-500">Cant: {item.quantity} x ${item.price.toLocaleString()}</p>
                                    </div>
                                </div>
                                <span className="font-bold text-slate-900">${(item.price * item.quantity).toLocaleString()}</span>
                            </div>
                        ))}
                        {order.shippingCost && order.shippingCost > 0 && (
                            <div className="flex justify-between items-center py-2 border-b border-gray-100 hover:bg-slate-50 transition-colors p-2 rounded">
                                <div className="flex items-center gap-4">
                                    <div className="size-12 rounded-md overflow-hidden relative flex items-center justify-center bg-blue-50 text-blue-500">
                                        <span className="material-symbols-outlined">local_shipping</span>
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">
                                            Envío
                                            {order.shippingZone && <span className="text-xs font-normal text-slate-400 ml-1">({order.shippingZone === 'centro' ? 'Centro' : 'Bordes'})</span>}
                                        </p>
                                    </div>
                                </div>
                                <span className="font-bold text-slate-900">${order.shippingCost.toLocaleString()}</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                    <span className="font-bold text-lg text-slate-700">Total Pagado</span>
                    <span className="font-black text-2xl text-primary">${order.total.toLocaleString()}</span>
                </div>
            </div>

            {/* Payment button for pending orders */}
            {order.status === 'pending' && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6">
                    <div className="flex items-start gap-4">
                        <div className="bg-blue-100 p-3 rounded-full">
                            <span className="material-symbols-outlined text-blue-600 text-2xl">credit_card</span>
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-slate-900 text-lg mb-2">Pagar con Mercado Pago</h3>
                            <p className="text-sm text-slate-600 mb-4">
                                Completa tu pago de forma segura con tarjeta de crédito o débito
                            </p>

                            {paymentError && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-800">{paymentError}</p>
                                </div>
                            )}

                            <button
                                onClick={handlePayWithMercadoPago}
                                disabled={paymentLoading}
                                className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {paymentLoading ? (
                                    <>
                                        <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                        Procesando...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">payment</span>
                                        Pagar Ahora
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {order.paymentMethod === 'transfer' && order.status === 'pending' && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
                    <span className="material-symbols-outlined text-blue-600">info</span>
                    <div>
                        <p className="font-bold text-blue-900 text-sm">Recuerda enviar tu comprobante</p>
                        <p className="text-sm text-blue-800 mt-1">Si pagaste por transferencia, envía el comprobante al WhatsApp +54 11-7363-8905 indicando tu número de pedido #{order.id.slice(0, 6)}.</p>
                    </div>
                </div>
            )}
        </div>
    );
}
