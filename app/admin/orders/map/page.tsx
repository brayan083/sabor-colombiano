'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getOrders } from '@/lib/services/orders';
import { Order } from '@/types';
import DeliveryMap from '@/components/driver/DeliveryMap';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale, setDefaultLocale } from "react-datepicker";
import { es } from 'date-fns/locale/es';

registerLocale('es', es);

export default function DeliveryMapPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const allOrders = await getOrders();
                setOrders(allOrders);
            } catch (error) {
                console.error("Error fetching orders:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, []);

    // Filter orders by selected date
    const filteredOrders = orders.filter(order => {
        if (!order.deliveryDate) return false;
        // Compare dates (ignoring time)
        const orderDate = new Date(order.deliveryDate + 'T00:00:00'); // Ensure local time interpretation if strict ISO
        // Or simpler string comparison if format is YYYY-MM-DD
        return order.deliveryDate === selectedDate.toISOString().split('T')[0];
    });

    return (
        <div className="flex flex-col h-[calc(100vh-theme(spacing.24))] gap-6">
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Link
                        href="/admin/orders"
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500"
                    >
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                </div>

                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                    <span className="material-symbols-outlined text-slate-500">calendar_today</span>
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date: Date | null) => {
                            if (date) setSelectedDate(date);
                        }}
                        dateFormat="dd 'de' MMMM, yyyy"
                        locale="es"
                        className="text-sm font-medium text-slate-900 border-none focus:ring-0 cursor-pointer w-40"
                    />
                </div>
            </div>

            {loading ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex-1 min-h-[500px] overflow-hidden">
                    <DeliveryMap orders={filteredOrders} />
                </div>
            )}
        </div>
    );
}
