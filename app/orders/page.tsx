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
                return 'bg-green-50 text-green-700 border-green-200';
            case 'pending':
                return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 'cancelled':
                return 'bg-red-50 text-red-700 border-red-200';
            default:
                return 'bg-gray-50 text-gray-700 border-gray-200';
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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'paid':
            case 'shipped':
                return 'check_circle';
            case 'pending':
                return 'schedule';
            case 'cancelled':
                return 'cancel';
            default:
                return 'info';
        }
    };

    // Calculate favorite product (most ordered)
    const getFavoriteProduct = () => {
        const productCount: { [key: string]: { name: string; count: number } } = {};

        orders.forEach(order => {
            order.items.forEach(item => {
                if (productCount[item.name]) {
                    productCount[item.name].count += item.quantity;
                } else {
                    productCount[item.name] = { name: item.name, count: item.quantity };
                }
            });
        });

        const products = Object.values(productCount);
        if (products.length === 0) return { name: 'N/A', count: 0 };

        return products.reduce((max, product) =>
            product.count > max.count ? product : max
        );
    };

    const favoriteProduct = getFavoriteProduct();

    // Calculate orders this month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    const ordersThisMonth = orders.filter(o => o.createdAt >= startOfMonth).length;

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
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-black tracking-[-0.033em] text-slate-900 mb-2">Mis Pedidos</h1>
                <p className="text-slate-600">Revisa el estado y detalles de tus pedidos</p>
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
                <>
                    {/* Statistics Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600 mb-1">Total de Pedidos</p>
                                    <p className="text-3xl font-black text-slate-900">{orders.length}</p>
                                </div>
                                <div className="size-12 bg-primary/20 rounded-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary text-2xl">shopping_bag</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-50/50 rounded-xl p-6 border border-green-200">
                            <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0 pr-3">
                                    <p className="text-sm font-medium text-slate-600 mb-1">Producto Favorito</p>
                                    <p className="text-lg font-black text-slate-900 truncate" title={favoriteProduct.name}>
                                        {favoriteProduct.name}
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        {favoriteProduct.count} {favoriteProduct.count === 1 ? 'vez' : 'veces'} pedido
                                    </p>
                                </div>
                                <div className="size-12 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <span className="material-symbols-outlined text-green-600 text-2xl">favorite</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-yellow-50 to-yellow-50/50 rounded-xl p-6 border border-yellow-200">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-slate-600 mb-1">Pedidos Este Mes</p>
                                    <p className="text-3xl font-black text-slate-900">{ordersThisMonth}</p>
                                </div>
                                <div className="size-12 bg-yellow-100 rounded-full flex items-center justify-center">
                                    <span className="material-symbols-outlined text-yellow-600 text-2xl">calendar_month</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Orders Grid */}
                    <div className="grid grid-cols-1 gap-4">
                        {orders.map((order) => (
                            <Link
                                key={order.id}
                                href={`/orders/${order.id}`}
                                className="group bg-white rounded-xl border border-gray-200 hover:border-primary/30 hover:shadow-lg transition-all duration-300 overflow-hidden"
                            >
                                <div className="p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                        {/* Left Section - Order Info */}
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="size-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                                                    <span className="material-symbols-outlined text-primary text-xl">receipt</span>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-500">Pedido</p>
                                                    <p className="text-lg font-black text-primary">#{order.id.slice(0, 8).toUpperCase()}</p>
                                                </div>
                                            </div>


                                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                                {/* Date */}
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <span className="material-symbols-outlined text-base">calendar_today</span>
                                                    <span>{formatDate(order.createdAt)}</span>
                                                </div>

                                                {/* Delivery Method */}
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <span className="material-symbols-outlined text-base">
                                                        {order.deliveryMethod === 'pickup' ? 'store' : 'local_shipping'}
                                                    </span>
                                                    <span>{order.deliveryMethod === 'pickup' ? 'Retiro en Local' : 'Domicilio'}</span>
                                                </div>

                                                {/* Items Count with Product Images */}
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center gap-2 text-slate-600">
                                                        <span className="material-symbols-outlined text-base">shopping_cart</span>
                                                        <span>{order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}</span>
                                                    </div>

                                                    {/* Product Thumbnails */}
                                                    <div className="flex items-center gap-1">
                                                        {order.items.slice(0, 3).map((item, index) => (
                                                            <div key={index} className="relative group/img">
                                                                <div className="w-10 h-10 rounded-md overflow-hidden border border-gray-200 group-hover/img:border-primary transition-colors">
                                                                    <img
                                                                        src={item.image}
                                                                        alt={item.name}
                                                                        className="w-full h-full object-cover"
                                                                    />
                                                                </div>
                                                                {item.quantity > 1 && (
                                                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white shadow-sm">
                                                                        {item.quantity}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ))}
                                                        {order.items.length > 3 && (
                                                            <div className="w-10 h-10 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center">
                                                                <span className="text-[10px] font-bold text-gray-600">+{order.items.length - 3}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Section - Status & Price */}
                                        <div className="flex sm:flex-col items-center sm:items-end gap-4 sm:gap-3">
                                            {/* Status Badge */}
                                            <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold border ${getStatusColor(order.status)}`}>
                                                <span className="material-symbols-outlined text-base">{getStatusIcon(order.status)}</span>
                                                <span>{translateStatus(order.status)}</span>
                                            </div>

                                            {/* Price */}
                                            <div className="text-right">
                                                <p className="text-sm font-medium text-slate-500">Total</p>
                                                <p className="text-2xl font-black text-slate-900">${order.total.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* View Details Button */}
                                    <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                                        <span className="text-sm text-slate-500">
                                            Haz clic para ver los detalles completos
                                        </span>
                                        <div className="flex items-center gap-2 text-primary font-bold group-hover:gap-3 transition-all">
                                            <span>Ver Detalles</span>
                                            <span className="material-symbols-outlined">arrow_forward</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </>
            )}
        </div>
    );
}
