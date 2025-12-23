'use client';

import React, { useState, useEffect } from 'react';
import { User } from '@/types';
import { getAvailableDrivers } from '@/lib/services/drivers';
import DriverStatusBadge from './DriverStatusBadge';

interface DriverSelectorProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (driver: User) => void;
    orderId: string;
}

const DriverSelector: React.FC<DriverSelectorProps> = ({ isOpen, onClose, onSelect, orderId }) => {
    const [drivers, setDrivers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            loadDrivers();
        }
    }, [isOpen]);

    const loadDrivers = async () => {
        setLoading(true);
        try {
            const availableDrivers = await getAvailableDrivers();
            setDrivers(availableDrivers);
        } catch (error) {
            console.error('Error loading drivers:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredDrivers = drivers.filter(driver =>
        driver.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (driver.phoneNumber && driver.phoneNumber.includes(searchTerm))
    );

    const getVehicleIcon = (vehicleType: string) => {
        const icons = {
            motorcycle: '🏍️',
            bicycle: '🚲',
            car: '🚗',
            foot: '🚶'
        };
        return icons[vehicleType as keyof typeof icons] || '🚗';
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-slate-900">Asignar Repartidor</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <span className="material-symbols-outlined text-3xl">close</span>
                        </button>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            search
                        </span>
                        <input
                            type="text"
                            placeholder="Buscar por nombre o teléfono..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                        />
                    </div>
                </div>

                {/* Driver List */}
                <div className="flex-1 overflow-y-auto p-6">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                    ) : filteredDrivers.length === 0 ? (
                        <div className="text-center py-12">
                            <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">
                                person_off
                            </span>
                            <p className="text-gray-500">
                                {searchTerm ? 'No se encontraron repartidores' : 'No hay repartidores disponibles'}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredDrivers.map((driver) => (
                                <button
                                    key={driver.uid}
                                    onClick={() => onSelect(driver)}
                                    className="w-full p-4 border border-gray-200 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left group"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4 flex-1">
                                            {/* Vehicle Icon */}
                                            <div className="text-3xl">
                                                {getVehicleIcon(driver.driverInfo?.vehicleType || 'foot')}
                                            </div>

                                            {/* Driver Info */}
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="font-bold text-slate-900">{driver.displayName}</h3>
                                                    <DriverStatusBadge status={driver.driverInfo?.status || 'offline'} size="sm" />
                                                </div>
                                                <div className="text-sm text-gray-600 space-y-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-sm">phone</span>
                                                        {driver.phoneNumber || 'N/A'}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="material-symbols-outlined text-sm">local_shipping</span>
                                                        {driver.driverInfo?.stats.completedToday || 0} entregas hoy
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Select Icon */}
                                        <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                                            arrow_forward
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 bg-gray-50">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                    >
                        Cancelar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DriverSelector;
