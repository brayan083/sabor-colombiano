"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getUserById, updateUserRole } from '@/lib/services/users';
import { getOrdersByUser } from '@/lib/services/orders';
import { User, Order } from '@/types';

const UserDetailsPage: React.FC = () => {
    const { id } = useParams();
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [role, setRole] = useState<'admin' | 'customer' | 'driver'>('customer');
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (typeof id !== 'string') return;
            try {
                const [userData, ordersData] = await Promise.all([
                    getUserById(id),
                    getOrdersByUser(id)
                ]);

                if (userData) {
                    setUser(userData);
                    setRole(userData.role || 'customer');
                }
                setOrders(ordersData);
            } catch (error) {
                console.error("Error fetching user details:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id]);

    const handleRoleChange = async () => {
        if (!user || user.role === role) return;
        setUpdating(true);
        try {
            await updateUserRole(user.uid, role);
            setUser({ ...user, role });
            // Show success message or toast
        } catch (error) {
            console.error("Error updating role:", error);
            // Show error message
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Cargando usuario...</div>;
    }

    if (!user) {
        return (
            <div className="p-8 text-center">
                <p className="text-xl mb-4">Usuario no encontrado</p>
                <Link href="/admin/customers" className="text-primary hover:underline">Volver a Clientes</Link>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto">
            <div className="mb-6 flex items-center gap-4">
                <Link href="/admin/customers" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <span className="material-symbols-outlined">arrow_back</span>
                </Link>
                <h1 className="text-3xl font-bold text-slate-900">Detalles del Cliente</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Info Card */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <div className="flex flex-col items-center mb-6">
                            <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center text-3xl font-bold text-primary mb-4">
                                {user.displayName ? user.displayName[0].toUpperCase() : 'U'}
                            </div>
                            <h2 className="text-xl font-bold text-slate-900">{user.displayName || 'Usuario'}</h2>
                            <p className="text-slate-500">{user.email}</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-500 mb-1">Rol</label>
                                <div className="flex gap-2">
                                    <select
                                        value={role}
                                        onChange={(e) => setRole(e.target.value as 'admin' | 'customer' | 'driver')}
                                        className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                                    >
                                        <option value="customer">Cliente</option>
                                        <option value="admin">Administrador</option>
                                        <option value="driver">Repartidor</option>
                                    </select>
                                    <button
                                        onClick={handleRoleChange}
                                        disabled={role === user.role || updating}
                                        className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                                    >
                                        {updating ? '...' : 'Guardar'}
                                    </button>
                                </div>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">ID</p>
                                <p className="text-sm font-mono bg-gray-50 p-2 rounded border border-gray-100 truncate">{user.uid}</p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">Teléfono</p>
                                <p className="text-slate-900">{user.phoneNumber || 'No registrado'}</p>
                            </div>

                            <div>
                                <p className="text-sm font-medium text-slate-500 mb-1">Fecha de Registro</p>
                                <p className="text-slate-900">{new Date(user.createdAt).toLocaleDateString()}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Orders History */}
                <div className="lg:col-span-2">
                    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Historial de Pedidos ({orders.length})</h3>

                        {orders.length === 0 ? (
                            <p className="text-slate-500 text-center py-8">Este usuario no ha realizado pedidos.</p>
                        ) : (
                            <div className="space-y-4">
                                {orders.map((order) => (
                                    <div key={order.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-bold text-slate-900">Pedido #{order.id.slice(-6)}</p>
                                                <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString()}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded text-xs font-bold capitalize ${order.status === 'paid' ? 'bg-green-100 text-green-700' :
                                                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                        'bg-gray-100 text-gray-700'
                                                }`}>
                                                {order.status === 'paid' ? 'Pagado' : order.status === 'pending' ? 'Pendiente' : order.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <p className="text-sm text-slate-600">{order.items.length} productos</p>
                                            <p className="font-bold text-slate-900">${order.total.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetailsPage;
