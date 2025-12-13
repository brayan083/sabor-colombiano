"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const AdminCustomers: React.FC = () => {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <p className="text-slate-900 text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">Administración de Clientes</p>
                <div className="flex gap-2">
                     {/* 
                     Usually customers register themselves, but an admin might want to manually add a special client or support account. 
                     For now, we can omit the "Add Customer" button or keep it if requested. 
                     The user asked to "manage" customers, so viewing is the priority.
                     I'll verify if they want a create button later or include a placeholder.
                     */}
                    <button className="flex h-10 shrink-0 items-center justify-center gap-x-2 rounded-lg px-5 bg-primary-admin text-white hover:opacity-90 transition-opacity">
                        <span className="material-symbols-outlined">person_add</span>
                        <p className="text-sm font-bold leading-normal">Nuevo Cliente</p>
                    </button>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
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
                            {[
                                { name: 'Carlos Vega', email: 'carlos.vega@example.com', phone: '+57 300 123 4567', orders: 12, total: '$1,250.00', status: 'Activo', initial: 'CV', color: 'bg-blue-100 text-blue-600' },
                                { name: 'Sofia Rodriguez', email: 'sofia.r@example.com', phone: '+57 310 987 6543', orders: 5, total: '$450.00', status: 'Activo', initial: 'SR', color: 'bg-purple-100 text-purple-600' },
                                { name: 'Luis Gomez', email: 'luis.gomez@example.com', phone: '+57 315 555 1234', orders: 2, total: '$85.50', status: 'Inactivo', initial: 'LG', color: 'bg-green-100 text-green-600' },
                                { name: 'Ana Torres', email: 'ana.torres@example.com', phone: '+57 300 111 2233', orders: 8, total: '$920.00', status: 'Activo', initial: 'AT', color: 'bg-pink-100 text-pink-600' },
                                { name: 'Maria Diaz', email: 'maria.d@example.com', phone: '+57 320 444 5566', orders: 1, total: '$45.00', status: 'Nuevo', initial: 'MD', color: 'bg-yellow-100 text-yellow-600' },
                                { name: 'Juan Perez', email: 'juan.p@example.com', phone: '+57 310 222 3344', orders: 24, total: '$2,850.00', status: 'VIP', initial: 'JP', color: 'bg-orange-100 text-orange-600' },
                            ].map((customer, i) => (
                                <tr key={i} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${customer.color}`}>
                                                {customer.initial}
                                            </div>
                                            <div className="font-medium text-slate-900">{customer.name}</div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{customer.email}</td>
                                    <td className="px-6 py-4">{customer.phone}</td>
                                    <td className="px-6 py-4">{customer.orders}</td>
                                    <td className="px-6 py-4 font-medium text-slate-900">{customer.total}</td>
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
                                            <button className="text-slate-400 hover:text-primary-admin" title="Ver Perfil">
                                                <span className="material-symbols-outlined text-[20px]">visibility</span>
                                            </button>
                                            <button className="text-slate-400 hover:text-primary-admin" title="Enviar Mensaje">
                                                <span className="material-symbols-outlined text-[20px]">mail</span>
                                            </button>
                                            <button className="text-slate-400 hover:text-red-600" title="Bloquear">
                                                <span className="material-symbols-outlined text-[20px]">block</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4 border-t border-gray-200 flex items-center justify-between">
                    <span className="text-sm text-slate-500">Mostrando 1-6 de 45 clientes</span>
                    <div className="flex gap-1">
                        <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-slate-600 disabled:opacity-50">Anterior</button>
                        <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-slate-600 hover:bg-gray-50">Siguiente</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminCustomers;
