'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import { Order } from '@/types';
import { getOrdersByDriver, updateDeliveryStatus } from '@/lib/services/orders';
import { updateDriverStatus } from '@/lib/services/drivers';
import DriverOrderCard from '@/components/driver/DriverOrderCard';
import DriverStatusBadge from '@/components/admin/DriverStatusBadge';

const DriverDashboard = () => {
    const { user } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('active');
    const [changingStatus, setChangingStatus] = useState(false);

    useEffect(() => {
        if (user) {
            loadOrders();
        }
    }, [user]);

    const loadOrders = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const driverOrders = await getOrdersByDriver(user.uid);
            setOrders(driverOrders);
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (orderId: string, newStatus: Order['deliveryStatus']) => {
        try {
            await updateDeliveryStatus(orderId, newStatus!);
            await loadOrders();
        } catch (error) {
            console.error('Error updating delivery status:', error);
            throw error;
        }
    };

    const handleDriverStatusChange = async (newStatus: 'available' | 'busy' | 'offline') => {
        if (!user) return;
        setChangingStatus(true);
        try {
            await updateDriverStatus(user.uid, newStatus);
            // Reload user data would happen here if we had a refresh function
            alert(`Estado cambiado a: ${newStatus === 'available' ? 'Disponible' : newStatus === 'busy' ? 'Ocupado' : 'Desconectado'}`);
        } catch (error) {
            console.error('Error updating driver status:', error);
            alert('Error al cambiar el estado');
        } finally {
            setChangingStatus(false);
        }
    };

    const filteredOrders = orders.filter(order => {
        if (filter === 'active') {
            return order.deliveryStatus !== 'delivered' && order.deliveryStatus !== 'failed';
        }
        if (filter === 'completed') {
            return order.deliveryStatus === 'delivered' || order.deliveryStatus === 'failed';
        }
        return true;
    });

    const stats = {
        total: user?.driverInfo?.stats.totalDeliveries || 0,
        today: user?.driverInfo?.stats.completedToday || 0,
        rating: user?.driverInfo?.stats.averageRating || 0,
        active: orders.filter(o => o.deliveryStatus !== 'delivered' && o.deliveryStatus !== 'failed').length
    };

    if (!user) return null;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">
                                👋 Hola, {user.displayName}
                            </h1>
                            <p className="text-gray-600">Panel de Repartidor</p>
                        </div>

                        {/* Status Selector */}
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <div className="text-sm text-gray-600 mb-1">Tu estado:</div>
                                <DriverStatusBadge status={user.driverInfo?.status || 'offline'} size="lg" />
                            </div>
                            <div className="relative group">
                                <button
                                    disabled={changingStatus}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                                >
                                    <span className="material-symbols-outlined">more_vert</span>
                                </button>
                                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                                    <div className="py-2">
                                        <button
                                            onClick={() => handleDriverStatusChange('available')}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                                        >
                                            🟢 Disponible
                                        </button>
                                        <button
                                            onClick={() => handleDriverStatusChange('busy')}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                                        >
                                            🟡 Ocupado
                                        </button>
                                        <button
                                            onClick={() => handleDriverStatusChange('offline')}
                                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center gap-2"
                                        >
                                            ⚫ Desconectado
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-white p-5 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <span className="material-symbols-outlined text-blue-600">local_shipping</span>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Total Entregas</div>
                                    <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                    <span className="material-symbols-outlined text-green-600">today</span>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Hoy</div>
                                    <div className="text-2xl font-bold text-green-600">{stats.today}</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                                    <span className="material-symbols-outlined text-yellow-600">star</span>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Calificación</div>
                                    <div className="text-2xl font-bold text-yellow-600">
                                        {stats.rating > 0 ? stats.rating.toFixed(1) : 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-5 rounded-xl border border-gray-200">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <span className="material-symbols-outlined text-purple-600">pending_actions</span>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600">Activas</div>
                                    <div className="text-2xl font-bold text-purple-600">{stats.active}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Orders Section */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-slate-900">Mis Entregas</h2>

                        {/* Filters */}
                        <div className="flex gap-2">
                            {(['all', 'active', 'completed'] as const).map((f) => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === f
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {f === 'all' ? 'Todas' : f === 'active' ? 'Activas' : 'Completadas'}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Orders List */}
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="text-center py-12">
                            <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">
                                {filter === 'active' ? 'pending_actions' : 'check_circle'}
                            </span>
                            <p className="text-gray-500">
                                {filter === 'active'
                                    ? 'No tienes entregas activas'
                                    : filter === 'completed'
                                        ? 'No tienes entregas completadas'
                                        : 'No tienes entregas asignadas'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {filteredOrders.map((order) => (
                                <DriverOrderCard
                                    key={order.id}
                                    order={order}
                                    onStatusChange={handleStatusChange}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DriverDashboard;
