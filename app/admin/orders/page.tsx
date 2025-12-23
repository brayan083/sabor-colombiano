"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getOrders } from '@/lib/services/orders';
import { Order } from '@/types';

const AdminOrders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            setLoading(true);
            try {
                const data = await getOrders();
                setOrders(data);
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'shipped': return 'bg-blue-100 text-blue-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'paid': return 'Pagado';
            case 'pending': return 'Pendiente';
            case 'shipped': return 'Enviado';
            case 'cancelled': return 'Cancelado';
            default: return status;
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <p className="text-slate-900 text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">Administración de Pedidos</p>
                <div className="flex gap-2">
                    <Link href="/admin/orders/new" className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg px-5 bg-primary-admin text-white hover:opacity-90 transition-opacity">
                        <span className="material-symbols-outlined">add</span>
                        <p className="text-sm font-bold leading-normal">Nuevo Pedido</p>
                    </Link>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                            <span className="material-symbols-outlined text-[20px]">search</span>
                        </span>
                        <input className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-admin focus:border-transparent" placeholder="Buscar pedidos..." />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">ID Pedido</th>
                                <th className="px-6 py-3">Cliente</th>
                                <th className="px-6 py-3">Fecha</th>
                                <th className="px-6 py-3">Estado</th>
                                <th className="px-6 py-3">Total</th>
                                <th className="px-6 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center">Cargando pedidos...</td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-4 text-center">No hay pedidos registrados.</td>
                                </tr>
                            ) : orders.map((order) => (
                                <tr key={order.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                        #{order.id.slice(0, 8)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {order.customerName || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
                                            {getStatusLabel(order.status)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">${order.total.toFixed(2)}</td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <Link href={`/admin/orders/${order.id}`} className="text-slate-400 hover:text-primary-admin" title="Ver Detalles">
                                                <span className="material-symbols-outlined text-[20px]">visibility</span>
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-sm text-slate-500">Mostrando {orders.length} pedidos</span>
                </div>
            </div>
        </div>
    );
};

export default AdminOrders;
