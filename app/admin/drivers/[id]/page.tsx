'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { User, Order } from '@/types';
import { getDriverById, updateDriver, updateDriverStatus } from '@/lib/services/drivers';
import { getOrdersByDriver } from '@/lib/services/orders';
import DriverStatusBadge from '@/components/admin/DriverStatusBadge';
import { formatPrice } from '@/lib/utils';

const DriverDetailPage = () => {
    const router = useRouter();
    const params = useParams();
    const driverId = params.id as string;

    const [driver, setDriver] = useState<User | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({
        name: '',
        email: '',
        phone: '',
        vehicleType: 'motorcycle' as 'motorcycle' | 'bicycle' | 'car' | 'foot'
    });

    useEffect(() => {
        loadDriverData();
    }, [driverId]);

    const loadDriverData = async () => {
        setLoading(true);
        try {
            const [driverData, ordersData] = await Promise.all([
                getDriverById(driverId),
                getOrdersByDriver(driverId)
            ]);

            if (driverData) {
                setDriver(driverData);
                setEditForm({
                    name: driverData.displayName,
                    email: driverData.email,
                    phone: driverData.phoneNumber || '',
                    vehicleType: driverData.driverInfo?.vehicleType || 'motorcycle'
                });
            }
            setOrders(ordersData);
        } catch (error) {
            console.error('Error loading driver data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus: 'available' | 'busy' | 'offline') => {
        if (!driver) return;
        try {
            await updateDriverStatus(driver.uid, newStatus);
            await loadDriverData();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Error al actualizar el estado');
        }
    };

    const handleSaveEdit = async () => {
        if (!driver) return;
        try {
            await updateDriver(driver.uid, editForm);
            setIsEditing(false);
            await loadDriverData();
            alert('Información actualizada exitosamente');
        } catch (error) {
            console.error('Error updating driver:', error);
            alert('Error al actualizar la información');
        }
    };

    const getVehicleIcon = (vehicleType: string) => {
        const icons = {
            motorcycle: '🏍️',
            bicycle: '🚲',
            car: '🚗',
            foot: '🚶'
        };
        return icons[vehicleType as keyof typeof icons] || '🚗';
    };

    const getDeliveryStatusBadge = (status?: string) => {
        const config = {
            pending: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Pendiente' },
            assigned: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Asignado' },
            picked_up: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Recogido' },
            in_transit: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En tránsito' },
            delivered: { bg: 'bg-green-100', text: 'text-green-800', label: 'Entregado' },
            failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Fallido' }
        };

        const statusConfig = config[status as keyof typeof config] || config.pending;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                {statusConfig.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!driver) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">person_off</span>
                    <p className="text-gray-500">Repartidor no encontrado</p>
                    <button
                        onClick={() => router.push('/admin/drivers')}
                        className="mt-4 text-primary hover:underline"
                    >
                        Volver a repartidores
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push('/admin/drivers')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                        Volver
                    </button>

                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                            <div className="text-5xl">
                                {getVehicleIcon(driver.driverInfo?.vehicleType || 'motorcycle')}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-slate-900 mb-2">{driver.displayName}</h1>
                                <DriverStatusBadge status={driver.driverInfo?.status || 'offline'} size="lg" />
                            </div>
                        </div>

                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <span className="material-symbols-outlined">edit</span>
                            {isEditing ? 'Cancelar' : 'Editar'}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Info */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Driver Info */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Información</h2>

                            {isEditing ? (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                                        <input
                                            type="text"
                                            value={editForm.name}
                                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                        <input
                                            type="email"
                                            value={editForm.email}
                                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                                        <input
                                            type="tel"
                                            value={editForm.phone}
                                            onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Vehículo</label>
                                        <select
                                            value={editForm.vehicleType}
                                            onChange={(e) => setEditForm({ ...editForm, vehicleType: e.target.value as any })}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                        >
                                            <option value="motorcycle">🏍️ Motocicleta</option>
                                            <option value="bicycle">🚲 Bicicleta</option>
                                            <option value="car">🚗 Automóvil</option>
                                            <option value="foot">🚶 A pie</option>
                                        </select>
                                    </div>
                                    <button
                                        onClick={handleSaveEdit}
                                        className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                                    >
                                        Guardar Cambios
                                    </button>
                                </div>
                            ) : (
                                <div className="space-y-3 text-sm">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <span className="material-symbols-outlined text-sm">email</span>
                                        {driver.email}
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <span className="material-symbols-outlined text-sm">phone</span>
                                        {driver.phoneNumber}
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <span className="material-symbols-outlined text-sm">two_wheeler</span>
                                        {driver.driverInfo?.vehicleType === 'motorcycle' ? 'Motocicleta' :
                                            driver.driverInfo?.vehicleType === 'bicycle' ? 'Bicicleta' :
                                                driver.driverInfo?.vehicleType === 'car' ? 'Automóvil' : 'A pie'}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Stats */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Estadísticas</h2>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-sm text-gray-600 mb-1">Total Entregas</div>
                                    <div className="text-2xl font-bold text-slate-900">{driver.driverInfo?.stats.totalDeliveries || 0}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600 mb-1">Entregas Hoy</div>
                                    <div className="text-2xl font-bold text-primary">{driver.driverInfo?.stats.completedToday || 0}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-600 mb-1">Calificación Promedio</div>
                                    <div className="text-2xl font-bold text-yellow-600">
                                        {(driver.driverInfo?.stats.averageRating || 0) > 0 ? driver.driverInfo?.stats.averageRating.toFixed(1) : 'N/A'}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Status Control */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">Cambiar Estado</h2>
                            <div className="space-y-2">
                                <button
                                    onClick={() => handleStatusChange('available')}
                                    className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${driver.driverInfo?.status === 'available'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-gray-100 text-gray-700 hover:bg-green-50'
                                        }`}
                                >
                                    🟢 Disponible
                                </button>
                                <button
                                    onClick={() => handleStatusChange('busy')}
                                    className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${driver.driverInfo?.status === 'busy'
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-gray-100 text-gray-700 hover:bg-yellow-50'
                                        }`}
                                >
                                    🟡 Ocupado
                                </button>
                                <button
                                    onClick={() => handleStatusChange('offline')}
                                    className={`w-full px-4 py-3 rounded-lg font-medium transition-colors ${driver.driverInfo?.status === 'offline'
                                        ? 'bg-gray-200 text-gray-800'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    ⚫ Desconectado
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Orders */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">
                                Pedidos Asignados ({orders.length})
                            </h2>

                            {orders.length === 0 ? (
                                <div className="text-center py-12">
                                    <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">
                                        shopping_bag
                                    </span>
                                    <p className="text-gray-500">No hay pedidos asignados</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {orders.map((order) => (
                                        <div
                                            key={order.id}
                                            className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                            onClick={() => router.push(`/admin/orders/${order.id}`)}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div>
                                                    <div className="font-bold text-slate-900">#{order.id.slice(0, 8)}</div>
                                                    <div className="text-sm text-gray-600">{order.customerName}</div>
                                                </div>
                                                <div className="text-right">
                                                    <div className="font-bold text-primary">{formatPrice(order.total)}</div>
                                                    {getDeliveryStatusBadge(order.deliveryStatus)}
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(order.createdAt).toLocaleDateString('es-ES', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DriverDetailPage;
