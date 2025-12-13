"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { name: 'Lun', value: 20 },
  { name: 'Mar', value: 85 },
  { name: 'Mié', value: 40 },
  { name: 'Jue', value: 100 },
  { name: 'Vie', value: 10 },
  { name: 'Sáb', value: 140 },
  { name: 'Dom', value: 90 },
];

const AdminDashboard: React.FC = () => {
    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <p className="text-slate-900 text-4xl font-black leading-tight tracking-[-0.033em] min-w-72">Dashboard de Administración</p>
                <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                    <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-md px-4 bg-primary-admin text-white">
                        <p className="text-sm font-medium leading-normal">Diario</p>
                    </button>
                    <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-md px-4 text-slate-900 hover:bg-gray-200">
                        <p className="text-sm font-medium leading-normal">Semanal</p>
                    </button>
                    <button className="flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-md px-4 text-slate-900 hover:bg-gray-200">
                        <p className="text-sm font-medium leading-normal">Mensual</p>
                    </button>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Ventas Totales', val: '$1,250.00', change: '+2.5% vs ayer', color: 'green' },
                    { label: 'Número de Pedidos', val: '85', change: '+5.1% vs ayer', color: 'green' },
                    { label: 'Ticket Promedio', val: '$14.71', change: '-0.5% vs ayer', color: 'red' },
                    { label: 'Nuevos Clientes', val: '12', change: '+8% vs ayer', color: 'green' }
                ].map((stat, i) => (
                    <div key={i} className="flex min-w-[158px] flex-1 flex-col gap-2 rounded-xl p-6 bg-white border border-gray-200 shadow-sm">
                        <p className="text-slate-500 text-base font-medium leading-normal">{stat.label}</p>
                        <p className="text-slate-900 tracking-light text-3xl font-bold leading-tight">{stat.val}</p>
                        <p className={`text-sm font-medium leading-normal ${stat.color === 'green' ? 'text-green-600' : 'text-red-500'}`}>{stat.change}</p>
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 flex flex-col gap-4 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                    <div className="flex flex-col">
                        <p className="text-slate-900 text-lg font-medium leading-normal">Tendencia de Ventas</p>
                        <p className="text-slate-500 text-sm font-normal leading-normal">Últimos 7 días</p>
                    </div>
                    <div className="h-[250px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#137fec" stopOpacity={0.2}/>
                                        <stop offset="95%" stopColor="#137fec" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <Tooltip />
                                <Area type="monotone" dataKey="value" stroke="#137fec" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="flex flex-col gap-4 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                    <p className="text-slate-900 text-lg font-medium leading-normal">Productos más vendidos</p>
                    <div className="flex flex-col gap-4">
                        {[
                            { name: 'Bandeja Paisa', sold: 320, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAfikdOTWAdtlzQqVZKAMNkvQI3N2QgHPwmyV7SFaBh4AlROdN2l_cdGSw_nxNA9di7oJJWA9kNMlxgXq0OAUxvRVx6n1diGKEbK5_tx3zb5d0WONrF-ScicFgIGt72UqXiXU1lBXc6yEuvR10u9E96hDtU5u9l4en0R0fobioP1-yXzFiBzga0rdSNsJALTGNFNqhbaEagHJphiNX7zeV098DZbxaszO2TXiCWdL_eQ6DDoWpXclJtvYWrhxB65SPd9AeZzh7bSrU' },
                            { name: 'Arepa con Queso', sold: 250, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCwPnljy-sIJUWRyMPSpbxJptLRf258NGAGlpcFducaUGl35TvL2zsjEQ-IyScURFUyGkmObRftAoJEih-Jvk2uAuvd4dz9nSPNVV6-1FPqVLKYmalqi4KXC2i2RUaH_JS-IzFs2dmagNr9f1Z6G_cqzCz_wa9kCnR0vHFS2-kMNcJnpdD2xO6Vt7ztF64_OJI6DvhMkG8y8_fcam4SANebreJeIx1aJm1ft_SCrBbvCimDdgSsfNtBW9qIFlFZojT4oEGfFfs7rx0' },
                            { name: 'Jugo de Lulo', sold: 180, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4yVGP0-a7XHcCskcg2UoB3EYaVUksy049QHyJTOAX9kgGUkfHT-Il4hUMIB3jYn45eLurI3NUD1CHNfn2Vy37ys6vQ6XQG4wioQRADdNdwNGc9s90OY8z2DUV7Qr6FI6CBqpl5WWqCZIVqpScVYM9mYgHCbqyja7Wl4_xMWP69iVqaWDmm3yV-jLzHrbaEoO1O2l_mmkBkoIGnqPFBjOPqJJOLs51JAdwF8BqPxt9NJyVmQl0MO6B25vnXHsJhLPYdxU8-LjRHA0' },
                            { name: 'Empanadas', sold: 150, img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDT9O7t0vd7noPhx1Lsdo9mFSQ8kb-pzzBVPzvvZRE5ygEtQCpDpfPT0f8QDk3iaDxKTsNWupcFQYggxS6_7tWizzT1gOygO7CLEF3q4QwLH2r_5Dwsgg51C_j60b2gk0izXThM8dHos3mN5u3zOlZVbLpjy-3O7H_0uUfBzFJkCYEOAW7ioLhLSZX8vTUNyKXMJIkYXtUc7dLCRLUEYrRLN83MEpaLBXmjvfWFAPiq8mtpittY2LMlPBMCk2EEtQ1AjSTHI51gnjE' }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-4">
                                <Image width={48} height={48} className="rounded-lg object-cover" src={item.img} alt={item.name} />
                                <div className="flex-1">
                                    <p className="text-slate-900 font-medium text-sm">{item.name}</p>
                                    <p className="text-slate-500 text-xs">{item.sold} vendidos</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <h3 className="text-lg font-medium text-slate-900 p-6">Pedidos Recientes</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                                <th className="px-6 py-3">ID Pedido</th>
                                <th className="px-6 py-3">Cliente</th>
                                <th className="px-6 py-3">Fecha</th>
                                <th className="px-6 py-3">Estado</th>
                                <th className="px-6 py-3 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {[
                                { id: '#12548', client: 'Carlos Vega', date: '2023-10-27', status: 'Completado', total: '$25.50', color: 'green' },
                                { id: '#12547', client: 'Sofia Rodriguez', date: '2023-10-27', status: 'En Proceso', total: '$14.00', color: 'yellow' },
                                { id: '#12546', client: 'Luis Gomez', date: '2023-10-26', status: 'Cancelado', total: '$32.10', color: 'red' },
                                { id: '#12545', client: 'Ana Torres', date: '2023-10-26', status: 'Completado', total: '$19.80', color: 'green' }
                            ].map((row, i) => (
                                <tr key={i} className="bg-white border-b hover:bg-gray-50">
                                    <th className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{row.id}</th>
                                    <td className="px-6 py-4">{row.client}</td>
                                    <td className="px-6 py-4">{row.date}</td>
                                    <td className="px-6 py-4">
                                        <span className={`text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full ${
                                            row.color === 'green' ? 'bg-green-100 text-green-800' :
                                            row.color === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                            {row.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">{row.total}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
