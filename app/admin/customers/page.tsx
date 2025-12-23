"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUsers } from '@/lib/services/users';
import { getOrders } from '@/lib/services/orders';
import { promoteToDriver } from '@/lib/services/drivers';
import { User, Order } from '@/types';

interface UserWithStats extends User {
    orderCount: number;
    totalSpent: number;
    status: string;
    initial: string;
    color: string;
}

const AdminCustomers: React.FC = () => {
    const router = useRouter();
    const [users, setUsers] = useState<UserWithStats[]>([]);
    const [loading, setLoading] = useState(true);
    const [roleFilter, setRoleFilter] = useState<'all' | 'customer' | 'driver' | 'admin'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const colors = [
        'bg-blue-100 text-blue-600',
        'bg-purple-100 text-purple-600',
        'bg-green-100 text-green-600',
        'bg-pink-100 text-pink-600',
        'bg-yellow-100 text-yellow-600',
        'bg-orange-100 text-orange-600',
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersData, ordersData] = await Promise.all([
                    getUsers(),
                    getOrders()
                ]);

                // Show all users
                const customers = usersData;

                const usersWithStats = customers.map((user, index) => {
                    const userOrders = ordersData.filter(o => o.userId === user.uid);
                    const totalSpent = userOrders.reduce((sum, order) => sum + order.total, 0);

                    // Determine status based on orders
                    let status = 'Nuevo';
                    if (userOrders.length > 0) status = 'Activo';
                    if (userOrders.length > 10) status = 'VIP'; // Example logic

                    // Get initials
                    const names = (user.displayName || 'Usuario').split(' ');
                    const initial = names.length > 1
                        ? `${names[0][0]}${names[1][0]}`.toUpperCase()
                        : (names[0][0] || 'U').toUpperCase();

                    return {
                        ...user,
                        orderCount: userOrders.length,
                        totalSpent,
                        status,
                        initial,
                        color: colors[index % colors.length]
                    };
                });

                setUsers(usersWithStats);
            } catch (error) {
                console.error("Error fetching admin customers:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handlePromoteToDriver = async (userId: string, userName: string) => {
        if (!confirm(`¿Promover a ${userName} como repartidor?`)) return;

        try {
            await promoteToDriver(userId, 'motorcycle'); // Default vehicle
            alert(`${userName} ahora es repartidor`);
            // Reload data
            window.location.reload();
        } catch (error) {
            console.error('Error promoting to driver:', error);
            alert('Error al promover el usuario');
        }
    };

    const filteredUsers = users.filter(user => {
        // Role filter
        if (roleFilter !== 'all' && user.role !== roleFilter) return false;

        // Search filter
        if (searchTerm) {
            const search = searchTerm.toLowerCase();
            return (
                user.displayName?.toLowerCase().includes(search) ||
                user.email.toLowerCase().includes(search) ||
                user.phoneNumber?.includes(search)
            );
        }

        return true;
    });

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <p className="text-slate-900 text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">Administración de Clientes</p>
                {/* Removido boton de Nuevo Cliente */}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                {/* ... search and filters ... */}
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <div className="flex gap-4 items-center">
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                                <span className="material-symbols-outlined text-[20px]">search</span>
                            </span>
                            <input
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-admin focus:border-transparent min-w-[300px]"
                                placeholder="Buscar por nombre, email o teléfono..."
                            />
                        </div>
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value as any)}
                            className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-admin"
                        >
                            <option value="all">Todos los roles</option>
                            <option value="customer">Clientes</option>
                            <option value="driver">Repartidores</option>
                            <option value="admin">Administradores</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Usuario</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Rol</th>
                                <th className="px-6 py-3">Teléfono</th>
                                <th className="px-6 py-3">Pedidos</th>
                                <th className="px-6 py-3">Total Gastado</th>
                                <th className="px-6 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-4 text-center">Cargando usuarios...</td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-4 text-center">No se encontraron usuarios.</td>
                                </tr>
                            ) : (
                                filteredUsers.map((customer) => (
                                    <tr key={customer.uid} className="bg-white border-b hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${customer.color}`}>
                                                    {customer.initial}
                                                </div>
                                                <div className="font-medium text-slate-900">{customer.displayName || 'Usuario'}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{customer.email}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${customer.role === 'admin' ? 'bg-red-100 text-red-800' :
                                                    customer.role === 'driver' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-gray-100 text-gray-800'
                                                }`}>
                                                {customer.role === 'admin' ? 'Admin' : customer.role === 'driver' ? 'Repartidor' : 'Cliente'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{customer.phoneNumber || 'N/A'}</td>
                                        <td className="px-6 py-4">{customer.orderCount}</td>
                                        <td className="px-6 py-4 font-medium text-slate-900">${customer.totalSpent.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/admin/customers/${customer.uid}`} className="text-slate-400 hover:text-primary-admin" title="Ver Perfil">
                                                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                </Link>
                                                {customer.role === 'customer' && (
                                                    <button
                                                        onClick={() => handlePromoteToDriver(customer.uid, customer.displayName || 'Usuario')}
                                                        className="text-blue-600 hover:text-blue-800"
                                                        title="Promover a Repartidor"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                                                    </button>
                                                )}
                                                {customer.role === 'driver' && (
                                                    <button
                                                        onClick={() => router.push(`/admin/drivers/${customer.uid}`)}
                                                        className="text-green-600 hover:text-green-800"
                                                        title="Ver como Repartidor"
                                                    >
                                                        <span className="material-symbols-outlined text-[20px]">badge</span>
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {!loading && users.length > 0 && (
                    <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                        <span className="text-sm text-slate-500">Mostrando {filteredUsers.length} de {users.length} usuarios</span>
                        <div className="flex gap-1">
                            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-slate-600 disabled:opacity-50" disabled>Anterior</button>
                            <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-slate-600 hover:bg-gray-50">Siguiente</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminCustomers;
