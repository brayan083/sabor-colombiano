'use client';

import React, { useState } from 'react';
import { Order } from '@/types';
import { formatPrice } from '@/lib/utils';

interface DriverOrderCardProps {
    order: Order;
    onStatusChange: (orderId: string, newStatus: Order['deliveryStatus']) => Promise<void>;
}

const DriverOrderCard: React.FC<DriverOrderCardProps> = ({ order, onStatusChange }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [updating, setUpdating] = useState(false);

    const getStatusConfig = (status?: string) => {
        const configs = {
            pending: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Sin asignar', icon: 'schedule' },
            assigned: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Asignado', icon: 'assignment' },
            picked_up: { bg: 'bg-purple-100', text: 'text-purple-800', label: 'Recogido', icon: 'shopping_bag' },
            in_transit: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'En tránsito', icon: 'local_shipping' },
            delivered: { bg: 'bg-green-100', text: 'text-green-800', label: 'Entregado', icon: 'check_circle' },
            failed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Fallido', icon: 'error' }
        };
        return configs[status as keyof typeof configs] || configs.pending;
    };

    const handleStatusUpdate = async (newStatus: Order['deliveryStatus']) => {
        if (!newStatus) return;
        setUpdating(true);
        try {
            await onStatusChange(order.id, newStatus);
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Error al actualizar el estado');
        } finally {
            setUpdating(false);
        }
    };

    const getNextActions = () => {
        const status = order.deliveryStatus || 'assigned';

        switch (status) {
            case 'assigned':
                return [
                    { label: 'Marcar como Recogido', status: 'picked_up' as const, color: 'bg-purple-600' },
                    { label: 'Reportar Problema', status: 'failed' as const, color: 'bg-red-600' }
                ];
            case 'picked_up':
                return [
                    { label: 'En Camino', status: 'in_transit' as const, color: 'bg-yellow-600' },
                    { label: 'Reportar Problema', status: 'failed' as const, color: 'bg-red-600' }
                ];
            case 'in_transit':
                return [
                    { label: 'Marcar como Entregado', status: 'delivered' as const, color: 'bg-green-600' },
                    { label: 'Reportar Problema', status: 'failed' as const, color: 'bg-red-600' }
                ];
            default:
                return [];
        }
    };

    const statusConfig = getStatusConfig(order.deliveryStatus);
    const nextActions = getNextActions();
    const isCompleted = order.deliveryStatus === 'delivered' || order.deliveryStatus === 'failed';

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold text-slate-900">#{order.id.slice(0, 8)}</h3>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
                            <span className="material-symbols-outlined text-sm">{statusConfig.icon}</span>
                            {statusConfig.label}
                        </span>
                    </div>
                    <div className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString('es-ES', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-2xl font-bold text-primary">{formatPrice(order.total)}</div>
                </div>
            </div>

            {/* Customer Info */}
            <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-gray-700">
                    <span className="material-symbols-outlined text-sm">person</span>
                    <span className="font-medium">{order.customerName}</span>
                </div>
                {order.customerPhone && (
                    <a
                        href={`tel:${order.customerPhone}`}
                        className="flex items-center gap-2 text-primary hover:underline"
                    >
                        <span className="material-symbols-outlined text-sm">phone</span>
                        <span>{order.customerPhone}</span>
                    </a>
                )}
                {order.deliveryMethod === 'delivery' && order.shippingAddress && (
                    <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${order.shippingAddress.street}, ${order.shippingAddress.city}`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start gap-2 text-gray-700 hover:text-primary transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm mt-0.5">location_on</span>
                        <span className="flex-1">
                            {order.shippingAddress.street}<br />
                            {order.shippingAddress.city}
                        </span>
                    </a>
                )}
                {order.deliveryTimeSlot && (
                    <div className="flex items-center gap-2 text-gray-700">
                        <span className="material-symbols-outlined text-sm">schedule</span>
                        <span>Horario: {order.deliveryTimeSlot}</span>
                    </div>
                )}
            </div>

            {/* Items (Collapsible) */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors mb-4"
            >
                <span className="text-sm font-medium text-gray-700">
                    {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
                </span>
                <span className={`material-symbols-outlined text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                    expand_more
                </span>
            </button>

            {isExpanded && (
                <div className="space-y-2 mb-4 pl-4 border-l-2 border-gray-200">
                    {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-700">{item.quantity}x {item.name}</span>
                            <span className="font-medium text-gray-900">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Notes */}
            {order.orderNotes && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-start gap-2">
                        <span className="material-symbols-outlined text-amber-600 text-sm mt-0.5">info</span>
                        <div>
                            <div className="text-xs font-medium text-amber-800 mb-1">Notas del pedido:</div>
                            <div className="text-sm text-amber-900">{order.orderNotes}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Action Buttons */}
            {!isCompleted && nextActions.length > 0 && (
                <div className="flex gap-2">
                    {nextActions.map((action) => (
                        <button
                            key={action.status}
                            onClick={() => handleStatusUpdate(action.status)}
                            disabled={updating}
                            className={`flex-1 px-4 py-2.5 ${action.color} text-white rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
                        >
                            {updating ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            ) : (
                                action.label
                            )}
                        </button>
                    ))}
                </div>
            )}

            {isCompleted && (
                <div className={`text-center py-3 rounded-lg ${order.deliveryStatus === 'delivered' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                    <span className="font-medium">
                        {order.deliveryStatus === 'delivered' ? '✓ Entrega completada' : '✗ Entrega fallida'}
                    </span>
                </div>
            )}
        </div>
    );
};

export default DriverOrderCard;
