"use client";

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { getOrderById, getOrderByPaymentId } from '@/lib/services/orders';
import { useCart } from '@/lib/context/CartContext';
import { Order } from '@/types';

function OrderSuccessContent() {
    const searchParams = useSearchParams();
    const orderId = searchParams.get('orderId');
    const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id');
    const { clearCart } = useCart();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                let orderData: Order | null = null;

                // First, try to get order by orderId if available
                if (orderId) {
                    console.log('🔍 Fetching order by orderId:', orderId);
                    orderData = await getOrderById(orderId);
                }
                // If no orderId, try to get order by Mercado Pago payment ID
                else if (paymentId) {
                    console.log('🔍 Fetching order by payment ID:', paymentId);
                    // Wait a bit for the webhook to process
                    await new Promise(resolve => setTimeout(resolve, 2000));
                    orderData = await getOrderByPaymentId(paymentId);

                    // If not found, retry a few times (webhook might be processing)
                    if (!orderData) {
                        console.log('⏳ Order not found, retrying...');
                        for (let i = 0; i < 3; i++) {
                            await new Promise(resolve => setTimeout(resolve, 2000));
                            orderData = await getOrderByPaymentId(paymentId);
                            if (orderData) break;
                        }
                    }
                }

                if (orderData) {
                    console.log('✅ Order found:', orderData.id);
                    setOrder(orderData);
                    // Clear the cart after successful order
                    clearCart();
                } else {
                    console.error('❌ Order not found');
                    setError('No se encontró el pedido. Por favor, verifica en "Mis Pedidos".');
                }
            } catch (error) {
                console.error("Error fetching order:", error);
                setError('Error al cargar el pedido. Por favor, verifica en "Mis Pedidos".');
            } finally {
                setLoading(false);
            }
        };

        if (orderId || paymentId) {
            fetchOrder();
        } else {
            setLoading(false);
            setError('No se proporcionó información del pedido.');
        }
    }, [orderId, paymentId]);

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

    return (
        <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 py-12">
            <div className={`transition-all duration-700 ${loading ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                <div className="size-24 bg-green-100 rounded-full flex items-center justify-center mb-6 mx-auto animate-in zoom-in duration-500">
                    <span className="material-symbols-outlined text-5xl text-green-600">check_circle</span>
                </div>

                <h1 className="text-3xl md:text-4xl font-black text-slate-900 mb-2 tracking-tight text-center">¡Pedido Confirmado!</h1>
                <p className="text-slate-600 text-lg mb-8 max-w-md mx-auto text-center">
                    Gracias por tu compra. Hemos enviado la confirmación a tu correo.
                </p>

                {loading ? (
                    <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                ) : error ? (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 max-w-lg mx-auto w-full mb-8">
                        <div className="flex items-start gap-3">
                            <span className="material-symbols-outlined text-yellow-600 text-2xl">warning</span>
                            <div>
                                <p className="font-bold text-yellow-900 mb-2">{error}</p>
                                <p className="text-sm text-yellow-800">
                                    El pago fue procesado correctamente. Puedes revisar tus pedidos en la sección "Mis Pedidos" o esperar la confirmación por correo.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : order ? (
                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm max-w-lg mx-auto w-full overflow-hidden mb-8">
                        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                            <span className="font-bold text-slate-700">Comprobante de Pedido</span>
                            <span className="text-sm text-slate-500">#{order.id.slice(0, 8).toUpperCase()}</span>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Fecha</span>
                                <span className="font-medium text-slate-900">{formatDate(order.createdAt)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Cliente</span>
                                <span className="font-medium text-slate-900">{order.customerName}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Método de Pago</span>
                                <span className="font-medium text-slate-900">{getPaymentMethodLabel(order.paymentMethod)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Entrega</span>
                                <span className="font-medium text-slate-900">
                                    {order.deliveryMethod === 'pickup' ? 'Retiro en Local' : 'Envío a Domicilio'}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">Estado</span>
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 capitalize">
                                    {order.status === 'pending' ? 'Pendiente' : order.status}
                                </span>
                            </div>

                            <div className="border-t border-dashed border-gray-200 my-4 pt-4">
                                <p className="font-bold text-slate-900 mb-3 text-sm">Detalle</p>
                                <div className="space-y-2">
                                    {order.items.map((item, idx) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                            <span className="text-slate-600">{item.quantity}x {item.name}</span>
                                            <span className="text-slate-900 font-medium">${(item.price * item.quantity).toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                                <span className="font-bold text-lg text-slate-900">Total</span>
                                <span className="font-black text-xl text-primary">${order.total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                ) : null}

                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm mx-auto">
                    <Link
                        href="/orders"
                        className="flex-1 px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-sm text-center"
                    >
                        Ver Mis Pedidos
                    </Link>
                    <Link
                        href="/"
                        className="flex-1 px-6 py-3 bg-white border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors text-center"
                    >
                        Volver al Inicio
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function OrderSuccessPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex justify-center items-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>}>
            <OrderSuccessContent />
        </Suspense>
    );
}
