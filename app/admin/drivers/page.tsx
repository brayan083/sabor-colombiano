'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { getDrivers, deleteDriver } from '@/lib/services/drivers';
import DriverStatusBadge from '@/components/admin/DriverStatusBadge';

const DriversPage = () => {
    const router = useRouter();
    const [drivers, setDrivers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'available' | 'busy' | 'offline'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadDrivers();
    }, []);

    const loadDrivers = async () => {
        setLoading(true);
        try {
            const driversData = await getDrivers();
            setDrivers(driversData);
        } catch (error) {
            console.error('Error loading drivers:', error);
        } finally {
            setLoading(false);
        }
    };



    const handleDeleteDriver = async (driverId: string, driverName: string) => {
        if (confirm(`¿Estás seguro de eliminar a ${driverName}?`)) {
            try {
                await deleteDriver(driverId);
                await loadDrivers();
            } catch (error) {
                console.error('Error deleting driver:', error);
                alert('Error al eliminar el repartidor');
            }
        }
    };

    const filteredDrivers = drivers
        .filter(driver => {
            if (filter !== 'all' && driver.driverInfo?.status !== filter) return false;
            if (searchTerm && !driver.displayName.toLowerCase().includes(searchTerm.toLowerCase())) return false;
            return true;
        })
        .sort((a, b) => {
            // Sort by status: available > busy > offline
            const statusOrder = { available: 0, busy: 1, offline: 2 };
            const aStatus = a.driverInfo?.status || 'offline';
            const bStatus = b.driverInfo?.status || 'offline';
            return statusOrder[aStatus] - statusOrder[bStatus];
        });

    const getVehicleIcon = (vehicleType: string) => {
        const icons = {
            motorcycle: '🏍️',
            bicycle: '🚲',
            car: '🚗',
            foot: '🚶'
        };
        return icons[vehicleType as keyof typeof icons] || '🚗';
    };

    const stats = {
        total: drivers.length,
        available: drivers.filter(d => d.driverInfo?.status === 'available').length,
        busy: drivers.filter(d => d.driverInfo?.status === 'busy').length,
        offline: drivers.filter(d => d.driverInfo?.status === 'offline').length
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 mb-2">Repartidores</h1>
                            <p className="text-gray-600">Gestiona tu equipo de repartidores</p>
                        </div>
                        <button
                            onClick={() => router.push('/admin/drivers/new')}
                            className="flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors font-medium shadow-lg shadow-primary/20"
                        >
                            <span className="material-symbols-outlined">add</span>
                            Nuevo Repartidor
                        </button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white p-4 rounded-xl border border-gray-200">
                            <div className="text-sm text-gray-600 mb-1">Total</div>
                            <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                            <div className="text-sm text-green-700 mb-1">Disponibles</div>
                            <div className="text-2xl font-bold text-green-900">{stats.available}</div>
                        </div>
                        <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
                            <div className="text-sm text-yellow-700 mb-1">Ocupados</div>
                            <div className="text-2xl font-bold text-yellow-900">{stats.busy}</div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                            <div className="text-sm text-gray-600 mb-1">Desconectados</div>
                            <div className="text-2xl font-bold text-gray-700">{stats.offline}</div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white p-4 rounded-xl border border-gray-200">
                        <div className="flex flex-col md:flex-row gap-4">
                            {/* Search */}
                            <div className="flex-1 relative">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                    search
                                </span>
                                <input
                                    type="text"
                                    placeholder="Buscar repartidor..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                />
                            </div>

                            {/* Status Filter */}
                            <div className="flex gap-2">
                                {(['all', 'available', 'busy', 'offline'] as const).map((status) => (
                                    <button
                                        key={status}
                                        onClick={() => setFilter(status)}
                                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${filter === status
                                            ? 'bg-primary text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                            }`}
                                    >
                                        {status === 'all' ? 'Todos' : status === 'available' ? 'Disponibles' : status === 'busy' ? 'Ocupados' : 'Desconectados'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Drivers List */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                    </div>
                ) : filteredDrivers.length === 0 ? (
                    <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">
                            delivery_dining
                        </span>
                        <p className="text-gray-500 mb-4">
                            {searchTerm || filter !== 'all' ? 'No se encontraron repartidores' : 'No hay repartidores registrados'}
                        </p>
                        {!searchTerm && filter === 'all' && (
                            <button
                                onClick={() => router.push('/admin/drivers/new')}
                                className="text-primary hover:underline font-medium"
                            >
                                Crear primer repartidor
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {filteredDrivers.map((driver) => (
                            <div
                                key={driver.uid}
                                className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className="text-4xl">
                                            {getVehicleIcon(driver.driverInfo?.vehicleType || 'car')}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-slate-900 mb-1">{driver.displayName}</h3>
                                            <DriverStatusBadge status={driver.driverInfo?.status || 'offline'} />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => router.push(`/admin/drivers/${driver.uid}`)}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                            title="Ver detalles"
                                        >
                                            <span className="material-symbols-outlined text-gray-600">visibility</span>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteDriver(driver.uid, driver.displayName)}
                                            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Eliminar"
                                        >
                                            <span className="material-symbols-outlined text-red-600">delete</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 text-sm text-gray-600 mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">phone</span>
                                        {driver.phoneNumber || 'No disponible'}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">email</span>
                                        {driver.email}
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mb-4">
                                    <div className="text-center">
                                        <div className="text-xs text-gray-600 mb-1">Total</div>
                                        <div className="text-lg font-bold text-slate-900">{driver.driverInfo?.stats.totalDeliveries || 0}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-gray-600 mb-1">Hoy</div>
                                        <div className="text-lg font-bold text-primary">{driver.driverInfo?.stats.completedToday || 0}</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-xs text-gray-600 mb-1">Rating</div>
                                        <div className="text-lg font-bold text-yellow-600">
                                            {driver.driverInfo?.stats.averageRating && driver.driverInfo.stats.averageRating > 0 ? driver.driverInfo.stats.averageRating.toFixed(1) : '-'}
                                        </div>
                                    </div>
                                </div>


                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DriversPage;
