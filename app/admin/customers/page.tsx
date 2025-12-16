"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getUsers } from '@/lib/services/users';
import { getOrders } from '@/lib/services/orders';
import { User, Order } from '@/types';

interface UserWithStats extends User {
    orderCount: number;
    totalSpent: number;
    status: string;
    initial: string;
    color: string;
}

const AdminCustomers: React.FC = () => {
    const [users, setUsers] = useState<UserWithStats[]>([]);
    const [loading, setLoading] = useState(true);

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

                // Filter only customers if needed, or show all
                const customers = usersData; // .filter(u => u.role === 'customer');

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

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <p className="text-slate-900 text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">Administración de Clientes</p>
                {/* Removido boton de Nuevo Cliente */}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                {/* ... search and filters ... */}
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                   <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                             <span className="material-symbols-outlined text-[20px]">search</span>
                        </span>
                        <input className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-admin focus:border-transparent min-w-[300px]" placeholder="Buscar clientes..." />
                   </div>
                   <div className="flex gap-2">
                       <button className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-slate-600 hover:bg-gray-50 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">filter_list</span>
                            Filtros
                       </button>
                       <button className="px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm text-slate-600 hover:bg-gray-50 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[18px]">file_download</span>
                            Exportar
                       </button>
                   </div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">Cliente</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Teléfono</th>
                                <th className="px-6 py-3">Pedidos</th>
                                <th className="px-6 py-3">Total Gastado</th>
                                <th className="px-6 py-3">Estado</th>
                                <th className="px-6 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-4 text-center">Cargando clientes...</td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-4 text-center">No se encontraron clientes.</td>
                                </tr>
                            ) : (
                                users.map((customer) => (
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
                                        <td className="px-6 py-4">{customer.phoneNumber || 'N/A'}</td>
                                        <td className="px-6 py-4">{customer.orderCount}</td>
                                        <td className="px-6 py-4 font-medium text-slate-900">${customer.totalSpent.toLocaleString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                customer.status === 'Activo' || customer.status === 'VIP' ? 'bg-green-100 text-green-800' :
                                                customer.status === 'Nuevo' ? 'bg-blue-100 text-blue-800' :
                                                'bg-gray-100 text-gray-800'
                                            }`}>
                                                {customer.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/admin/customers/${customer.uid}`} className="text-slate-400 hover:text-primary-admin" title="Ver Perfil">
                                                    <span className="material-symbols-outlined text-[20px]">visibility</span>
                                                </Link>
                                                {/* <button className="text-slate-400 hover:text-primary-admin" title="Enviar Mensaje">
                                                    <span className="material-symbols-outlined text-[20px]">mail</span>
                                                </button> */}
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
                        <span className="text-sm text-slate-500">Mostrando {users.length} clientes</span>
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
