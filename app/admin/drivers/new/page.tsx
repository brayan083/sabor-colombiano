'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCustomers, promoteToDriver } from '@/lib/services/drivers';
import { User } from '@/types';

const PromoteToDriverPage = () => {
    const router = useRouter();
    const [customers, setCustomers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [vehicleType, setVehicleType] = useState<'motorcycle' | 'bicycle' | 'car' | 'foot'>('motorcycle');
    const [promoting, setPromoting] = useState(false);

    useEffect(() => {
        loadCustomers();
    }, []);

    const loadCustomers = async () => {
        setLoading(true);
        try {
            const users = await getCustomers();
            setCustomers(users);
        } catch (error) {
            console.error('Error loading customers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePromote = async () => {
        if (!selectedUser) return;

        setPromoting(true);
        try {
            await promoteToDriver(selectedUser.uid, vehicleType);
            alert(`${selectedUser.displayName} ahora es repartidor`);
            router.push('/admin/drivers');
        } catch (error) {
            console.error('Error promoting user:', error);
            alert('Error al promover el usuario a repartidor');
        } finally {
            setPromoting(false);
        }
    };

    const filteredCustomers = customers.filter(customer =>
        customer.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (customer.phoneNumber && customer.phoneNumber.includes(searchTerm))
    );

    const vehicleOptions = [
        { value: 'motorcycle', label: 'Motocicleta', icon: '🏍️' },
        { value: 'bicycle', label: 'Bicicleta', icon: '🚲' },
        { value: 'car', label: 'Automóvil', icon: '🚗' },
        { value: 'foot', label: 'A pie', icon: '🚶' }
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                        Volver
                    </button>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Promover Usuario a Repartidor</h1>
                    <p className="text-gray-600">Selecciona un usuario existente y conviértelo en repartidor</p>
                </div>

                {/* Two Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left: User Selection */}
                    <div className="bg-white rounded-xl border border-gray-200 p-6">
                        <h2 className="text-lg font-bold text-slate-900 mb-4">1. Seleccionar Usuario</h2>

                        {/* Search */}
                        <div className="relative mb-4">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                search
                            </span>
                            <input
                                type="text"
                                placeholder="Buscar usuario..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                        </div>

                        {/* User List */}
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                                </div>
                            ) : filteredCustomers.length === 0 ? (
                                <div className="text-center py-8 text-gray-500">
                                    {searchTerm ? 'No se encontraron usuarios' : 'No hay usuarios disponibles'}
                                </div>
                            ) : (
                                filteredCustomers.map((customer) => (
                                    <button
                                        key={customer.uid}
                                        onClick={() => setSelectedUser(customer)}
                                        className={`w-full p-4 border-2 rounded-lg text-left transition-all ${selectedUser?.uid === customer.uid
                                                ? 'border-primary bg-primary/5'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                                                <span className="material-symbols-outlined text-primary">person</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-bold text-slate-900">{customer.displayName}</div>
                                                <div className="text-sm text-gray-600">{customer.email}</div>
                                                {customer.phoneNumber && (
                                                    <div className="text-xs text-gray-500">{customer.phoneNumber}</div>
                                                )}
                                            </div>
                                            {selectedUser?.uid === customer.uid && (
                                                <span className="material-symbols-outlined text-primary">check_circle</span>
                                            )}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Right: Vehicle Selection & Confirm */}
                    <div className="space-y-6">
                        {/* Vehicle Type Selection */}
                        <div className="bg-white rounded-xl border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-slate-900 mb-4">2. Tipo de Vehículo</h2>

                            <div className="grid grid-cols-2 gap-3">
                                {vehicleOptions.map((option) => (
                                    <label
                                        key={option.value}
                                        className={`flex flex-col items-center gap-2 p-4 border-2 rounded-xl cursor-pointer transition-all ${vehicleType === option.value
                                                ? 'border-primary bg-primary/5'
                                                : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="vehicleType"
                                            value={option.value}
                                            checked={vehicleType === option.value}
                                            onChange={(e) => setVehicleType(e.target.value as any)}
                                            className="sr-only"
                                        />
                                        <span className="text-3xl">{option.icon}</span>
                                        <span className="text-sm font-medium text-slate-900">
                                            {option.label}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Selected User Summary */}
                        {selectedUser && (
                            <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl border-2 border-primary/20 p-6">
                                <h3 className="text-sm font-medium text-gray-600 mb-3">Usuario Seleccionado</h3>
                                <div className="space-y-2 mb-4">
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-sm">person</span>
                                        <span className="font-bold text-slate-900">{selectedUser.displayName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary text-sm">email</span>
                                        <span className="text-sm text-gray-700">{selectedUser.email}</span>
                                    </div>
                                    {selectedUser.phoneNumber && (
                                        <div className="flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary text-sm">phone</span>
                                            <span className="text-sm text-gray-700">{selectedUser.phoneNumber}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-primary/20">
                                    <div className="text-sm text-gray-600 mb-1">Se convertirá en repartidor con:</div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl">
                                            {vehicleOptions.find(v => v.value === vehicleType)?.icon}
                                        </span>
                                        <span className="font-medium text-slate-900">
                                            {vehicleOptions.find(v => v.value === vehicleType)?.label}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => router.back()}
                                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handlePromote}
                                disabled={!selectedUser || promoting}
                                className="flex-1 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {promoting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Promoviendo...
                                    </>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined">upgrade</span>
                                        Promover a Repartidor
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PromoteToDriverPage;
