"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/AuthContext';
import { getOrdersByUser } from '@/lib/services/orders';
import { Order } from '@/types';

export default function OrderHistory() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login?redirect=/orders');
        }
    }, [user, authLoading, router]);

    useEffect(() => {
        const fetchOrders = async () => {
            if (user) {
                try {
                    const userOrders = await getOrdersByUser(user.uid);
                    setOrders(userOrders);
                } catch (error) {
                    console.error("Error fetching orders:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        if (user) {
            fetchOrders();
        } else if (!authLoading) {
            setLoading(false);
        }
    }, [user, authLoading]);

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('es-CO', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid':
            case 'shipped':
                return 'bg-green-100 text-green-800';
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusDotColor = (status: string) => {
        switch (status) {
            case 'paid':
            case 'shipped':
                return 'bg-green-500';
            case 'pending':
                return 'bg-yellow-500';
            case 'cancelled':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };
    
    const translateStatus = (status: string) => {
        switch (status) {
            case 'pending': return 'Pendiente';
            case 'paid': return 'Pagado';
            case 'shipped': return 'Enviado';
            case 'cancelled': return 'Cancelado';
            default: return status;
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 min-h-[60vh]">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                <h1 className="text-4xl font-black tracking-[-0.033em] text-slate-900">Mi Historial de Pedidos</h1>
            </div>

            {orders.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-gray-200 shadow-sm">
                    <div className="size-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="material-symbols-outlined text-4xl text-gray-400">receipt_long</span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Aún no tienes pedidos</h2>
                    <p className="text-slate-500 mb-6">¡Descubre nuestros deliciosos platos y haz tu primer pedido!</p>
                    <Link href="/catalog" className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-bold rounded-xl hover:bg-primary/90 transition-colors">
                        Ir al Menú
                    </Link>
                </div>
            ) : (
                <div className="mt-6 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr className="border-b border-gray-200">
                                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">No. de Pedido</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Fecha</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Entrega</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Estado</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-slate-700">Total</th>
                                    <th className="px-6 py-4 text-right"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {orders.map((order) => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm font-semibold text-primary">#{order.id.slice(0, 8).toUpperCase()}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{formatDate(order.createdAt)}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {order.deliveryMethod === 'pickup' ? 'Retiro en Local' : 'Domicilio'}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${getStatusColor(order.status)}`}>
                                                <span className={`size-2 rounded-full ${getStatusDotColor(order.status)}`}></span>
                                                {translateStatus(order.status)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-black text-slate-900">${order.total.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right text-sm font-bold text-primary hover:underline">
                                            <Link href={`/orders/${order.id}`}>Ver Detalles</Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
