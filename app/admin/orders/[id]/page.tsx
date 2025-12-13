'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { getOrderById, updateOrderStatus } from '@/lib/services/orders';
import { Order } from '@/types';

const OrderDetailPage: React.FC = () => {
    const params = useParams();
    const id = params.id as string;
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!id) return;
            try {
                const data = await getOrderById(id);
                setOrder(data);
            } catch (error) {
                console.error("Error fetching order:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOrder();
    }, [id]);

    const handleStatusChange = async (newStatus: Order['status']) => {
        if (!order) return;
        setUpdating(true);
        try {
            await updateOrderStatus(order.id, newStatus);
            setOrder({ ...order, status: newStatus });
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Error al actualizar el estado");
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return <div className="p-8 text-center bg-transparent">Cargando pedido...</div>;
    if (!order) return <div className="p-8 text-center">Pedido no encontrado</div>;

    return (
        <div className="flex flex-col gap-8 max-w-5xl mx-auto">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/orders" className="p-2 rounded-lg hover:bg-black/5 text-slate-500">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <div>
                        <p className="text-slate-900 text-2xl font-bold">Pedido #{order.id.slice(0, 8)}</p>
                        <p className="text-slate-500 text-sm">{new Date(order.createdAt).toLocaleString()}</p>
                        <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium w-fit ${
                            order.status === 'paid' || order.status === 'shipped' ? 'bg-green-100 text-green-800' :
                            order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                            'bg-red-100 text-red-800'
                        }`}>
                            <span className={`size-2 rounded-full ${
                                order.status === 'paid' || order.status === 'shipped' ? 'bg-green-500' :
                                order.status === 'pending' ? 'bg-yellow-500' : 
                                'bg-red-500'
                            }`}></span>
                            Status: {
                                order.status === 'pending' ? 'Pendiente' :
                                order.status === 'paid' ? 'Pagado' :
                                order.status === 'shipped' ? 'Enviado' : 'Cancelado'
                            }
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 items-center bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                    <span className="text-sm font-medium text-slate-700 ml-2">Estado:</span>
                    <select 
                        value={order.status}
                        onChange={(e) => handleStatusChange(e.target.value as Order['status'])}
                        disabled={updating}
                        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-admin focus:border-primary-admin block p-2.5"
                    >
                        <option value="pending">Pendiente</option>
                        <option value="paid">Pagado</option>
                        <option value="shipped">Enviado</option>
                        <option value="cancelled">Cancelado</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Order Items */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="font-bold text-slate-900">Productos ({order.items.length})</h3>
                        </div>
                        <div className="divide-y divide-gray-200">
                            {order.items.map((item, index) => (
                                <div key={index} className="p-4 flex gap-4 items-center">
                                    <div className="relative h-20 w-20 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
                                        {item.image && (
                                            <Image 
                                                fill
                                                src={item.image} 
                                                alt={item.name} 
                                                className="object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-slate-900">{item.name}</p>
                                        <p className="text-sm text-slate-500">${item.price} x {item.quantity}</p>
                                    </div>
                                    <div className="font-bold text-slate-900">
                                        ${(item.price * item.quantity).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-gray-50 flex justify-between items-center border-t border-gray-200">
                            <span className="font-medium text-slate-700">Total</span>
                            <span className="text-xl font-black text-slate-900">${order.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Customer Info */}
                <div className="flex flex-col gap-6">
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="font-bold text-slate-900">Dirección de Envío</h3>
                        </div>
                        <div className="p-4 text-sm text-slate-700 space-y-2">
                             {order.shippingAddress ? (
                                <>
                                    <p><span className="font-medium">Calle:</span> {order.shippingAddress.street}</p>
                                    <p><span className="font-medium">Ciudad:</span> {order.shippingAddress.city}</p>

                                    <p><span className="font-medium">CP:</span> {order.shippingAddress.zip}</p>
                                </>
                             ) : (
                                 <p className="italic text-slate-400">No hay información de envío.</p>
                             )}
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="font-bold text-slate-900">Cliente</h3>
                        </div>
                        <div className="p-4 text-sm text-slate-700 space-y-2">
                             <p><span className="font-medium">Nombre:</span> {order.customerName}</p>
                             {order.customerPhone && <p><span className="font-medium">Teléfono:</span> {order.customerPhone}</p>}
                             <p className="text-xs text-slate-400 mt-2">ID Usuario: {order.userId}</p>
                        </div>
                    </div>

                    {order.orderNotes && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="p-4 border-b border-yellow-200 bg-yellow-100">
                                <h3 className="font-bold text-yellow-900 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base">sticky_note_2</span>
                                    Notas del Pedido
                                </h3>
                            </div>
                            <div className="p-4 text-sm text-yellow-900">
                                <p className="whitespace-pre-wrap">{order.orderNotes}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderDetailPage;
