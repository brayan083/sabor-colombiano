"use client";

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { getOrders, assignDriverToOrder } from '@/lib/services/orders';
import { Order, User } from '@/types';
import DriverSelector from '@/components/admin/DriverSelector';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import { es } from 'date-fns/locale/es';

registerLocale('es', es);

const AdminOrders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
    const [showDriverSelector, setShowDriverSelector] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
    const [searchQuery, setSearchQuery] = useState('');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');
    const [deliveryStatusFilter, setDeliveryStatusFilter] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, []);

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

    const handleAssignDriver = (orderId: string) => {
        setSelectedOrderId(orderId);
        setShowDriverSelector(true);
    };

    const handleDriverSelect = async (driver: User) => {
        if (!selectedOrderId) return;

        try {
            await assignDriverToOrder(selectedOrderId, driver.uid, driver.displayName);
            setShowDriverSelector(false);
            setSelectedOrderId(null);
            await fetchOrders();
            alert(`Repartidor ${driver.displayName} asignado exitosamente`);
        } catch (error) {
            console.error("Error assigning driver:", error);
            alert('Error al asignar el repartidor');
        }
    };

    const getStatusColor = (status: string, paymentStatus?: string) => {
        // Use paymentStatus if available
        if (paymentStatus) {
            switch (paymentStatus) {
                case 'paid': return 'bg-green-100 text-green-800';
                case 'partially_paid': return 'bg-orange-100 text-orange-800';
                case 'unpaid': return 'bg-red-100 text-red-800';
                default: return 'bg-gray-100 text-gray-800';
            }
        }

        // Fallback for old orders
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-800';
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'shipped': return 'bg-blue-100 text-blue-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string, paymentStatus?: string) => {
        // Use paymentStatus if available
        if (paymentStatus) {
            switch (paymentStatus) {
                case 'paid': return 'Pago';
                case 'partially_paid': return 'Seña Pagada';
                case 'unpaid': return 'No Pago';
                default: return paymentStatus;
            }
        }

        // Fallback for old orders
        switch (status) {
            case 'paid': return 'Pago';
            case 'pending': return 'No Pago';
            case 'shipped': return 'Enviado';
            case 'cancelled': return 'Cancelado';
            default: return status;
        }
    };

    const getDeliveryStatusBadge = (status?: string, isPickup = false) => {
        if (!status) return null;

        const config = {
            pending: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Sin asignar' },
            assigned: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Asignado' },
            picked_up: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Recogido' },
            in_transit: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En tránsito' },
            delivered: { bg: 'bg-green-100', text: 'text-green-800', label: 'Entregado' },
            failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Fallido' }
        };

        const pickupConfig = {
            pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente retiro' },
            delivered: { bg: 'bg-green-100', text: 'text-green-800', label: 'Retirado' }
        };

        const statusConfig = isPickup
            ? (pickupConfig[status as keyof typeof pickupConfig] || pickupConfig.pending)
            : (config[status as keyof typeof config] || config.pending);

        return (
            <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${statusConfig.bg} ${statusConfig.text}`}>
                {statusConfig.label}
            </span>
        );
    };

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            // Date filter
            if (selectedDate && order.deliveryDate) {
                if (new Date(order.deliveryDate).toISOString().split('T')[0] !== selectedDate.toISOString().split('T')[0]) {
                    return false;
                }
            } else if (selectedDate && !order.deliveryDate) {
                return false;
            }

            // Search filter
            if (searchQuery) {
                const searchLower = searchQuery.toLowerCase();
                const matchesSearch = (
                    order.id.toLowerCase().includes(searchLower) ||
                    (order.customerName && order.customerName.toLowerCase().includes(searchLower)) ||
                    (order.customerPhone && order.customerPhone.includes(searchLower))
                );
                if (!matchesSearch) return false;
            }

            // Payment Status Filter
            if (paymentStatusFilter !== 'all') {
                const isPaid = order.paymentStatus === 'paid' || (!order.paymentStatus && order.status === 'paid');
                const isPartial = order.paymentStatus === 'partially_paid';
                const isUnpaid = order.paymentStatus === 'unpaid' || (!order.paymentStatus && order.status === 'pending');

                if (paymentStatusFilter === 'paid' && !isPaid) return false;
                if (paymentStatusFilter === 'partially_paid' && !isPartial) return false;
                if (paymentStatusFilter === 'unpaid' && !isUnpaid) return false;
            }

            // Delivery Status Filter
            if (deliveryStatusFilter !== 'all') {
                const dStatus = order.deliveryStatus || 'pending';
                if (dStatus !== deliveryStatusFilter) return false;
            }

            return true;
        });
    }, [orders, selectedDate, searchQuery, paymentStatusFilter, deliveryStatusFilter]);

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <p className="text-slate-900 text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">Administración de Pedidos</p>
                <div className="flex gap-2">
                    <Link href="/admin/orders/map" className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg px-5 bg-white border border-gray-200 text-slate-700 hover:bg-gray-50 transition-colors">
                        <span className="material-symbols-outlined">map</span>
                        <p className="text-sm font-bold leading-normal">Ver Mapa</p>
                    </Link>
                    <Link href="/admin/orders/new" className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg px-5 bg-primary-admin text-white hover:opacity-90 transition-opacity">
                        <span className="material-symbols-outlined">add</span>
                        <p className="text-sm font-bold leading-normal">Nuevo Pedido</p>
                    </Link>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-50">
                    <div className="relative w-full sm:w-auto">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                            <span className="material-symbols-outlined text-[20px]">search</span>
                        </span>
                        <input
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-admin focus:border-transparent w-full sm:w-64"
                            placeholder="Buscar pedidos..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                        {/* Payment Filter */}
                        <select
                            value={paymentStatusFilter}
                            onChange={(e) => setPaymentStatusFilter(e.target.value)}
                            className="text-sm border-gray-300 rounded-lg focus:ring-primary-admin focus:border-primary-admin bg-white py-2 px-3"
                        >
                            <option value="all">Todos los pagos</option>
                            <option value="paid">Pago</option>
                            <option value="unpaid">No Pago</option>
                            <option value="partially_paid">Seña Pagada</option>
                        </select>

                        {/* Delivery Filter */}
                        <select
                            value={deliveryStatusFilter}
                            onChange={(e) => setDeliveryStatusFilter(e.target.value)}
                            className="text-sm border-gray-300 rounded-lg focus:ring-primary-admin focus:border-primary-admin bg-white py-2 px-3"
                        >
                            <option value="all">Todos los envíos</option>
                            <option value="pending">Sin asignar</option>
                            <option value="assigned">Asignado</option>
                            <option value="picked_up">Recogido</option>
                            <option value="in_transit">En tránsito</option>
                            <option value="delivered">Entregado</option>
                            <option value="failed">Fallido</option>
                        </select>

                        {selectedDate && (
                            <button
                                onClick={() => setSelectedDate(null)}
                                className="text-xs text-slate-500 hover:text-red-500 font-medium whitespace-nowrap"
                            >
                                Limpiar fecha
                            </button>
                        )}
                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-gray-300">
                            <span className="material-symbols-outlined text-slate-400 text-[20px]">calendar_today</span>
                            <DatePicker
                                selected={selectedDate}
                                onChange={(date: Date | null) => setSelectedDate(date)}
                                dateFormat="dd/MM/yyyy"
                                placeholderText="Filtrar fecha"
                                locale="es"
                                className="text-sm border-none focus:ring-0 cursor-pointer w-24 p-0 text-slate-600 font-medium"
                            />
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">ID Pedido</th>
                                <th className="px-6 py-3">Cliente</th>
                                <th className="px-6 py-3">Entrega</th>
                                <th className="px-6 py-3">Estado</th>
                                <th className="px-6 py-3">Repartidor</th>
                                <th className="px-6 py-3">Total</th>
                                <th className="px-6 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-4 text-center">Cargando pedidos...</td>
                                </tr>
                            ) : orders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-4 text-center">No hay pedidos registrados.</td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-4 text-center">No se encontraron pedidos con los filtros seleccionados.</td>
                                </tr>
                            ) : filteredOrders.map((order) => (
                                <tr key={order.id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                        #{order.id.slice(0, 8)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {order.customerName || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {order.deliveryDate ? (() => {
                                            const [y, m, d] = order.deliveryDate.split('-');
                                            return `${d}/${m}/${y}`;
                                        })() : 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full ${getStatusColor(order.status, order.paymentStatus)}`}>
                                            {getStatusLabel(order.status, order.paymentStatus)}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {order.deliveryMethod === 'pickup' ? (
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm font-medium text-slate-500 italic">Retira en local</span>
                                                {getDeliveryStatusBadge(order.deliveryStatus || 'pending', true)}
                                            </div>
                                        ) : order.assignedDriverName ? (
                                            <div className="flex flex-col gap-1">
                                                <span className="font-medium text-slate-900">{order.assignedDriverName}</span>
                                                {getDeliveryStatusBadge(order.deliveryStatus)}
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleAssignDriver(order.id)}
                                                className="text-xs px-3 py-1.5 bg-primary-admin/10 text-primary-admin rounded-lg hover:bg-primary-admin/20 transition-colors font-medium"
                                            >
                                                Asignar
                                            </button>
                                        )}
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
                    <span className="text-sm text-slate-500">Mostrando {filteredOrders.length} pedidos</span>
                </div>
            </div>

            {/* Driver Selector Modal */}
            <DriverSelector
                isOpen={showDriverSelector}
                onClose={() => {
                    setShowDriverSelector(false);
                    setSelectedOrderId(null);
                }}
                onSelect={handleDriverSelect}
                orderId={selectedOrderId || ''}
            />
        </div>
    );
};

export default AdminOrders;
