"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { LineChart, Line, XAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { getOrders } from '@/lib/services/orders';
import { getUsers } from '@/lib/services/users';
import { Order, User } from '@/types';
import { formatPrice } from '@/lib/utils';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import './datepicker-custom.css';

const AdminDashboard: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'>('weekly');
    const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
    const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
    const [showFilters, setShowFilters] = useState(false);

    const [kpis, setKpis] = useState({
        totalSales: 0,
        orderCount: 0,
        avgTicket: 0,
        newCustomers: 0
    });

    const [topProducts, setTopProducts] = useState<{ name: string; sold: number; img: string }[]>([]);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [salesTrend, setSalesTrend] = useState<{ name: string; value: number }[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ordersData, usersData] = await Promise.all([
                    getOrders(),
                    getUsers()
                ]);

                setOrders(ordersData);
                setUsers(usersData);
                // Initial recent orders (always global)
                setRecentOrders(ordersData.slice(0, 5));
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    useEffect(() => {
        if (loading || orders.length === 0) return;

        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        let filteredOrders = orders;
        let filteredUsers = users;
        let chartData: { name: string; value: number }[] = [];

        // --- Filtering Logic ---
        if (filter === 'daily') {
            // Filter: Today
            filteredOrders = orders.filter(o => new Date(o.createdAt) >= startOfToday);
            filteredUsers = users.filter(u => u.createdAt >= startOfToday.getTime());

            const hours = Array.from({ length: 24 }, (_, i) => i);
            chartData = hours.map(hour => {
                const sum = filteredOrders
                    .filter(o => new Date(o.createdAt).getHours() === hour)
                    .reduce((acc, o) => acc + o.total, 0);
                return { name: `${hour}:00`, value: sum };
            });

        } else if (filter === 'weekly') {
            // Filter: Last 7 days
            const sevenDaysAgo = new Date(now);
            sevenDaysAgo.setDate(now.getDate() - 6);
            sevenDaysAgo.setHours(0, 0, 0, 0);

            filteredOrders = orders.filter(o => new Date(o.createdAt) >= sevenDaysAgo);
            filteredUsers = users.filter(u => u.createdAt >= sevenDaysAgo.getTime());

            const last7Days = Array.from({ length: 7 }, (_, i) => {
                const d = new Date(now);
                d.setDate(d.getDate() - (6 - i));
                return d;
            });

            chartData = last7Days.map(date => {
                const dateStr = date.toISOString().split('T')[0];
                const total = filteredOrders
                    .filter(o => new Date(o.createdAt).toISOString().split('T')[0] === dateStr)
                    .reduce((sum, o) => sum + o.total, 0);
                return {
                    name: date.toLocaleDateString('es-ES', { weekday: 'short' }),
                    value: total
                };
            });

        } else if (filter === 'monthly') {
            // Filter: Last 30 days
            const thirtyDaysAgo = new Date(now);
            thirtyDaysAgo.setDate(now.getDate() - 29);
            thirtyDaysAgo.setHours(0, 0, 0, 0);

            filteredOrders = orders.filter(o => new Date(o.createdAt) >= thirtyDaysAgo);
            filteredUsers = users.filter(u => u.createdAt >= thirtyDaysAgo.getTime());

            const last30Days = Array.from({ length: 30 }, (_, i) => {
                const d = new Date(now);
                d.setDate(d.getDate() - (29 - i));
                return d;
            });

            chartData = last30Days.map(date => {
                const dateStr = date.toISOString().split('T')[0];
                const total = filteredOrders
                    .filter(o => new Date(o.createdAt).toISOString().split('T')[0] === dateStr)
                    .reduce((sum, o) => sum + o.total, 0);
                return {
                    name: date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
                    value: total
                };
            });

        } else if (filter === 'yearly') {
            // Filter: Last 12 months
            const oneYearAgo = new Date(now);
            oneYearAgo.setFullYear(now.getFullYear() - 1);
            oneYearAgo.setHours(0, 0, 0, 0);

            filteredOrders = orders.filter(o => new Date(o.createdAt) >= oneYearAgo);
            filteredUsers = users.filter(u => u.createdAt >= oneYearAgo.getTime());

            const last12Months = Array.from({ length: 12 }, (_, i) => {
                const d = new Date(now.getFullYear(), now.getMonth() - (11 - i), 1);
                return d;
            });

            chartData = last12Months.map(date => {
                const monthYearStr = `${date.getFullYear()}-${date.getMonth()}`;
                const total = filteredOrders
                    .filter(o => {
                        const d = new Date(o.createdAt);
                        return `${d.getFullYear()}-${d.getMonth()}` === monthYearStr;
                    })
                    .reduce((sum, o) => sum + o.total, 0);
                return {
                    name: date.toLocaleDateString('es-ES', { month: 'short' }),
                    value: total
                };
            });
        } else if (filter === 'custom') {
            // Filter: Custom date range
            if (customStartDate && customEndDate) {
                const startDate = new Date(customStartDate);
                startDate.setHours(0, 0, 0, 0);
                const endDate = new Date(customEndDate);
                endDate.setHours(23, 59, 59, 999);

                filteredOrders = orders.filter(o => {
                    const orderDate = new Date(o.createdAt);
                    return orderDate >= startDate && orderDate <= endDate;
                });
                filteredUsers = users.filter(u => {
                    return u.createdAt >= startDate.getTime() && u.createdAt <= endDate.getTime();
                });

                // Generate chart data for custom range (daily breakdown)
                const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                const daysArray = Array.from({ length: daysDiff }, (_, i) => {
                    const d = new Date(startDate);
                    d.setDate(d.getDate() + i);
                    return d;
                });

                chartData = daysArray.map(date => {
                    const dateStr = date.toISOString().split('T')[0];
                    const total = filteredOrders
                        .filter(o => new Date(o.createdAt).toISOString().split('T')[0] === dateStr)
                        .reduce((sum, o) => sum + o.total, 0);
                    return {
                        name: date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
                        value: total
                    };
                });
            }
        }

        // --- KPI Calculation ---
        const totalSales = filteredOrders.reduce((sum, order) => sum + order.total, 0);
        const orderCount = filteredOrders.length;
        const avgTicket = orderCount > 0 ? totalSales / orderCount : 0;
        const newCustomers = filteredUsers.length;

        setKpis({ totalSales, orderCount, avgTicket, newCustomers });
        setSalesTrend(chartData);

        // --- Top Products (based on filtered orders) ---
        const productSales: { [key: string]: { name: string; sold: number; img: string } } = {};
        filteredOrders.forEach(order => {
            order.items.forEach(item => {
                if (!productSales[item.productId]) {
                    productSales[item.productId] = { name: item.name, sold: 0, img: item.image };
                }
                productSales[item.productId].sold += item.quantity;
            });
        });

        const sortedProducts = Object.values(productSales).sort((a, b) => b.sold - a.sold).slice(0, 4);
        console.log('Top Products:', sortedProducts);
        setTopProducts(sortedProducts);

    }, [orders, users, filter, loading, customStartDate, customEndDate]);

    if (loading) {
        return <div className="p-8 text-center">Cargando dashboard...</div>;
    }

    return (
        <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4">
                {/* Header with Filter Toggle */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <p className="text-slate-900 text-3xl sm:text-4xl font-black leading-tight tracking-[-0.033em]">Dashboard de Administración</p>

                    {/* Filter Summary & Toggle Button */}
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-white border border-gray-200 rounded-lg hover:border-primary-admin/50 hover:bg-primary-admin/5 transition-all shadow-sm group w-full sm:w-auto justify-between sm:justify-start"
                    >
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-slate-600 group-hover:text-primary-admin transition-colors text-[20px]">
                                tune
                            </span>
                            <div className="flex flex-col items-start">
                                <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Filtro</span>
                                <span className="text-sm font-semibold text-slate-900">
                                    {filter === 'custom' && customStartDate && customEndDate
                                        ? `${customStartDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - ${customEndDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}`
                                        : filter === 'daily' ? 'Hoy'
                                            : filter === 'weekly' ? 'Última semana'
                                                : filter === 'monthly' ? 'Último mes'
                                                    : 'Último año'
                                    }
                                </span>
                            </div>
                        </div>
                        <span className="material-symbols-outlined text-slate-400 text-[18px]">
                            {showFilters ? 'expand_less' : 'expand_more'}
                        </span>
                    </button>
                </div>

                {/* Collapsible Filter Panel */}
                {showFilters && (
                    <div className="bg-white border border-gray-200 rounded-xl shadow-sm animate-[slideDown_0.2s_ease-out]">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
                            {/* Date Range Section */}
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-primary-admin text-[20px]">calendar_month</span>
                                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Rango de fechas</h3>
                                </div>
                                <div className="relative">
                                    <DatePicker
                                        selected={customStartDate}
                                        onChange={(dates) => {
                                            const [start, end] = dates as [Date | null, Date | null];
                                            setCustomStartDate(start);
                                            setCustomEndDate(end);
                                            if (start && end) {
                                                setFilter('custom');
                                            }
                                        }}
                                        startDate={customStartDate}
                                        endDate={customEndDate}
                                        selectsRange
                                        dateFormat="dd/MM/yyyy"
                                        placeholderText="Selecciona rango de fechas"
                                        className="w-full text-sm px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-admin/50 focus:border-primary-admin"
                                        wrapperClassName="w-full"
                                    />
                                    <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px] pointer-events-none">
                                        calendar_today
                                    </span>
                                </div>
                                {customStartDate && customEndDate && (
                                    <div className="flex items-center gap-2 text-xs text-slate-600 bg-primary-admin/5 px-3 py-2 rounded-lg border border-primary-admin/20">
                                        <span className="material-symbols-outlined text-primary-admin text-[16px]">check_circle</span>
                                        <div>
                                            <span className="font-medium">Desde:</span> {customStartDate.toLocaleDateString('es-ES')}
                                            <span className="mx-2">→</span>
                                            <span className="font-medium">Hasta:</span> {customEndDate.toLocaleDateString('es-ES')}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Quick Filters Section */}
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className="material-symbols-outlined text-primary-admin text-[20px]">bolt</span>
                                    <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Filtros rápidos</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => {
                                            const now = new Date();
                                            const sevenDaysAgo = new Date(now);
                                            sevenDaysAgo.setDate(now.getDate() - 7);
                                            setCustomStartDate(sevenDaysAgo);
                                            setCustomEndDate(now);
                                            setFilter('custom');
                                        }}
                                        className="px-4 py-2.5 text-sm font-medium rounded-lg transition-all bg-slate-50 text-slate-700 hover:bg-primary-admin hover:text-white border border-gray-200 hover:border-primary-admin"
                                    >
                                        Última semana
                                    </button>
                                    <button
                                        onClick={() => {
                                            const now = new Date();
                                            setCustomStartDate(now);
                                            setCustomEndDate(now);
                                            setFilter('custom');
                                        }}
                                        className="px-4 py-2.5 text-sm font-medium rounded-lg transition-all bg-slate-50 text-slate-700 hover:bg-primary-admin hover:text-white border border-gray-200 hover:border-primary-admin"
                                    >
                                        Hoy
                                    </button>
                                    <button
                                        onClick={() => {
                                            const yesterday = new Date();
                                            yesterday.setDate(yesterday.getDate() - 1);
                                            setCustomStartDate(yesterday);
                                            setCustomEndDate(yesterday);
                                            setFilter('custom');
                                        }}
                                        className="px-4 py-2.5 text-sm font-medium rounded-lg transition-all bg-slate-50 text-slate-700 hover:bg-primary-admin hover:text-white border border-gray-200 hover:border-primary-admin"
                                    >
                                        Ayer
                                    </button>
                                    <button
                                        onClick={() => {
                                            const now = new Date();
                                            const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                                            const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
                                            setCustomStartDate(lastMonth);
                                            setCustomEndDate(lastMonthEnd);
                                            setFilter('custom');
                                        }}
                                        className="px-4 py-2.5 text-sm font-medium rounded-lg transition-all bg-slate-50 text-slate-700 hover:bg-primary-admin hover:text-white border border-gray-200 hover:border-primary-admin"
                                    >
                                        El último mes
                                    </button>
                                    <button
                                        onClick={() => {
                                            const now = new Date();
                                            const thirtyDaysAgo = new Date(now);
                                            thirtyDaysAgo.setDate(now.getDate() - 30);
                                            setCustomStartDate(thirtyDaysAgo);
                                            setCustomEndDate(now);
                                            setFilter('custom');
                                        }}
                                        className="px-4 py-2.5 text-sm font-medium rounded-lg transition-all col-span-2 bg-slate-50 text-slate-700 hover:bg-primary-admin hover:text-white border border-gray-200 hover:border-primary-admin"
                                    >
                                        Últimos 30 días
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                {[
                    { label: 'Ventas Totales', val: formatPrice(kpis.totalSales), change: 'En este periodo', color: 'green' },
                    { label: 'Número de Pedidos', val: kpis.orderCount, change: 'En este periodo', color: 'green' },
                    { label: 'Ticket Promedio', val: formatPrice(kpis.avgTicket), change: 'Promedio', color: 'blue' },
                    { label: 'Nuevos Clientes', val: kpis.newCustomers, change: 'Registros', color: 'green' }
                ].map((stat, i) => (
                    <div key={i} className="flex flex-col gap-2 rounded-xl p-4 sm:p-6 bg-white border border-gray-200 shadow-sm">
                        <p className="text-slate-500 text-sm sm:text-base font-medium leading-normal">{stat.label}</p>
                        <p className="text-slate-900 tracking-light text-2xl sm:text-3xl font-bold leading-tight">{stat.val}</p>
                        <p className={`text-xs sm:text-sm font-medium leading-normal ${stat.color === 'green' ? 'text-green-600' : stat.color === 'blue' ? 'text-blue-600' : 'text-slate-500'}`}>{stat.change}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sales Trend Chart */}
                <div className="lg:col-span-2 flex flex-col gap-4 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                    <div className="flex flex-col">
                        <p className="text-slate-900 text-lg font-medium leading-normal">Tendencia de Ventas</p>
                        <p className="text-slate-500 text-sm font-normal leading-normal">
                            {filter === 'daily' ? 'Hoy (por hora)' :
                                filter === 'weekly' ? 'Últimos 7 días' :
                                    filter === 'monthly' ? 'Últimos 30 días' :
                                        filter === 'yearly' ? 'Último año' :
                                            filter === 'custom' && customStartDate && customEndDate ?
                                                `${new Date(customStartDate).toLocaleDateString('es-ES')} - ${new Date(customEndDate).toLocaleDateString('es-ES')}` :
                                                'Selecciona un rango de fechas'}
                        </p>
                    </div>
                    <div className="h-[250px] w-full mt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={salesTrend}>
                                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} />
                                <Tooltip
                                    formatter={(value: any) => [formatPrice(Number(value)), 'Ventas']}
                                    labelFormatter={(label) => `Tiempo: ${label}`}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#137fec"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#137fec', strokeWidth: 2, stroke: '#fff' }}
                                    activeDot={{ r: 6, fill: '#137fec' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Selling Products */}
                <div className="flex flex-col gap-4 p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
                    <p className="text-slate-900 text-lg font-medium leading-normal">Productos más vendidos</p>
                    <div className="flex flex-col gap-4">
                        {topProducts.length === 0 ? (
                            <p className="text-slate-500 text-sm">No hay datos en este periodo.</p>
                        ) : (
                            topProducts.map((item, i) => (
                                <div key={i} className="flex items-center gap-4">
                                    <div className="relative w-12 h-12 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden">
                                        {item.img ? (
                                            <Image
                                                fill
                                                className="object-cover"
                                                src={item.img}
                                                alt={item.name}
                                                onError={(e) => {
                                                    const target = e.target as HTMLImageElement;
                                                    target.style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <span className="material-symbols-outlined text-gray-400 text-[24px]">
                                                    restaurant
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-slate-900 font-medium text-sm line-clamp-1">{item.name}</p>
                                        <p className="text-slate-500 text-xs">
                                            {item.sold} {item.sold === 1 ? 'vendido' : 'vendidos'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
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
                            {recentOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center">No hay pedidos recientes.</td>
                                </tr>
                            ) : (
                                recentOrders.map((order) => (
                                    <tr key={order.id} className="bg-white border-b hover:bg-gray-50">
                                        <th className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">#{order.id.slice(-6)}</th>
                                        <td className="px-6 py-4">{order.customerName}</td>
                                        <td className="px-6 py-4">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            <span className={`text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full capitalize ${order.status === 'paid' || order.status === 'shipped' ? 'bg-green-100 text-green-800' :
                                                order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {order.status === 'paid' ? 'Pagado' : order.status === 'pending' ? 'Pendiente' : order.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">{formatPrice(order.total)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
