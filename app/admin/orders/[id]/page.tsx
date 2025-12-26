'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { getOrderById, updateOrderStatus, updateOrderPaymentStatus, updateDeliveryStatus, assignDriverToOrder, unassignDriverFromOrder } from '@/lib/services/orders';
import { getDriverById } from '@/lib/services/drivers';
import { Order, User } from '@/types';
import DriverSelector from '@/components/admin/DriverSelector';
import DriverStatusBadge from '@/components/admin/DriverStatusBadge';

const OrderDetailPage: React.FC = () => {
    const params = useParams();
    const id = params.id as string;
    const [order, setOrder] = useState<Order | null>(null);
    const [assignedDriver, setAssignedDriver] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [showDriverSelector, setShowDriverSelector] = useState(false);

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        if (!id) return;
        try {
            const data = await getOrderById(id);
            setOrder(data);

            // Load driver info if assigned
            if (data && data.assignedDriverId) {
                const driver = await getDriverById(data.assignedDriverId);
                setAssignedDriver(driver);
            }
        } catch (error) {
            console.error("Error fetching order:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePaymentStatusChange = async (newStatus: Order['paymentStatus']) => {
        if (!order || !newStatus) return;
        setUpdating(true);
        try {
            await updateOrderPaymentStatus(order.id, newStatus);
            setOrder({ ...order, paymentStatus: newStatus });
        } catch (error) {
            console.error("Error updating status:", error);
            alert("Error al actualizar el estado");
        } finally {
            setUpdating(false);
        }
    };

    const handleDeliveryStatusChange = async (newStatus: Order['deliveryStatus']) => {
        if (!order || !newStatus) return;
        setUpdating(true);
        try {
            await updateDeliveryStatus(order.id, newStatus);
            setOrder({ ...order, deliveryStatus: newStatus });
        } catch (error) {
            console.error("Error updating delivery status:", error);
            alert("Error al actualizar el estado de entrega");
        } finally {
            setUpdating(false);
        }
    };

    const handleDriverSelect = async (driver: User) => {
        if (!order) return;
        try {
            await assignDriverToOrder(order.id, driver.uid, driver.displayName);
            setShowDriverSelector(false);
            await fetchOrder();
            alert(`Repartidor ${driver.displayName} asignado exitosamente`);
        } catch (error) {
            console.error("Error assigning driver:", error);
            alert('Error al asignar el repartidor');
        }
    };

    const handleUnassignDriver = async () => {
        if (!order || !confirm('¿Desasignar repartidor de este pedido?')) return;
        try {
            await unassignDriverFromOrder(order.id);
            setAssignedDriver(null);
            await fetchOrder();
            alert('Repartidor desasignado exitosamente');
        } catch (error) {
            console.error("Error unassigning driver:", error);
            alert('Error al desasignar el repartidor');
        }
    };

    const getVehicleIcon = (vehicleType?: string) => {
        switch (vehicleType) {
            case 'motorcycle': return '🏍️';
            case 'bicycle': return '🚲';
            case 'car': return '🚗';
            case 'foot': return '🚶';
            default: return '🚚';
        }
    };

    const getDeliveryStatusConfig = (status?: string) => {
        const configs = {
            pending: { label: 'Sin asignar', color: 'text-gray-600', icon: 'schedule' },
            assigned: { label: 'Asignado', color: 'text-blue-600', icon: 'assignment' },
            picked_up: { label: 'Recogido', color: 'text-purple-600', icon: 'shopping_bag' },
            in_transit: { label: 'En tránsito', color: 'text-yellow-600', icon: 'local_shipping' },
            delivered: { label: 'Entregado', color: 'text-green-600', icon: 'check_circle' },
            failed: { label: 'Fallido', color: 'text-red-600', icon: 'error' }
        };
        return configs[status as keyof typeof configs] || configs.pending;
    };

    const deliverySteps = [
        { status: 'pending', label: 'Sin asignar' },
        { status: 'assigned', label: 'Asignado' },
        { status: 'picked_up', label: 'Recogido' },
        { status: 'in_transit', label: 'En tránsito' },
        { status: 'delivered', label: 'Entregado' }
    ];

    const getStepStatus = (stepStatus: string) => {
        if (!order?.deliveryStatus) return 'pending';
        const currentIndex = deliverySteps.findIndex(s => s.status === order.deliveryStatus);
        const stepIndex = deliverySteps.findIndex(s => s.status === stepStatus);

        if (order.deliveryStatus === 'failed') return 'failed';
        if (stepIndex < currentIndex) return 'completed';
        if (stepIndex === currentIndex) return 'current';
        return 'pending';
    };

    if (loading) return <div className="p-8 text-center bg-transparent">Cargando pedido...</div>;
    if (!order) return <div className="p-8 text-center">Pedido no encontrado</div>;

    // Determine current display status
    const currentPaymentStatus = order.paymentStatus || (
        order.status === 'paid' ? 'paid' :
            order.status === 'pending' ? 'unpaid' : 'unpaid'
    );

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case 'paid': return { bg: 'bg-green-100', text: 'text-green-800', dot: 'bg-green-500' };
            case 'partially_paid': return { bg: 'bg-orange-100', text: 'text-orange-800', dot: 'bg-orange-500' };
            case 'unpaid': return { bg: 'bg-red-100', text: 'text-red-800', dot: 'bg-red-500' };
            default: return { bg: 'bg-gray-100', text: 'text-gray-800', dot: 'bg-gray-500' };
        }
    };

    const getPaymentStatusLabel = (status: string) => {
        switch (status) {
            case 'paid': return 'Pagado';
            case 'partially_paid': return 'Seña Pagada';
            case 'unpaid': return 'No Pago';
            default: return 'Desconocido';
        }
    };

    const statusStyle = getPaymentStatusColor(currentPaymentStatus);

    return (
        <div className="flex flex-col gap-8 max-w-6xl mx-auto">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <Link href="/admin/orders" className="p-2 rounded-lg hover:bg-black/5 text-slate-500">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </Link>
                    <div>
                        <p className="text-slate-900 text-2xl font-bold">Pedido #{order.id.slice(0, 8)}</p>
                        <p className="text-slate-500 text-sm">{new Date(order.createdAt).toLocaleString()}</p>
                        <div className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium w-fit ${statusStyle.bg} ${statusStyle.text}`}>
                            <span className={`size-2 rounded-full ${statusStyle.dot}`}></span>
                            Status: {getPaymentStatusLabel(currentPaymentStatus)}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2 items-center bg-white p-2 rounded-lg shadow-sm border border-gray-200">
                    <span className="text-sm font-medium text-slate-700 ml-2">Estado de Pago:</span>
                    <select
                        value={currentPaymentStatus}
                        onChange={(e) => handlePaymentStatusChange(e.target.value as Order['paymentStatus'])}
                        disabled={updating}
                        className={`appearance-none text-sm font-medium rounded-lg border-none focus:ring-0 cursor-pointer py-2 pl-3 pr-10 ${currentPaymentStatus === 'paid' ? 'text-green-600 bg-green-50' :
                            currentPaymentStatus === 'partially_paid' ? 'text-orange-600 bg-orange-50' :
                                'text-red-600 bg-red-50'
                            }`}
                        style={{
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                            backgroundPosition: 'right 0.5rem center',
                            backgroundSize: '1.5em 1.5em',
                            backgroundRepeat: 'no-repeat'
                        }}
                    >
                        <option value="unpaid" className="text-red-600 bg-white">No Pago</option>
                        <option value="partially_paid" className="text-orange-600 bg-white">Seña Pagada</option>
                        <option value="paid" className="text-green-600 bg-white">Pago</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                        {order.shippingCost && order.shippingCost > 0 && (
                            <div className="p-4 flex justify-between items-center border-t border-gray-200">
                                <span className="font-medium text-slate-700">
                                    Envío
                                    {order.shippingZone && <span className="text-xs text-slate-400 ml-1">({order.shippingZone === 'centro' ? 'Centro' : 'Bordes'})</span>}
                                </span>
                                <span className="font-bold text-slate-900">${order.shippingCost.toFixed(2)}</span>
                            </div>
                        )}
                        <div className="p-4 bg-gray-50 flex justify-between items-center border-t border-gray-200">
                            <span className="font-medium text-slate-700">Total</span>
                            <span className="text-xl font-black text-slate-900">${order.total.toFixed(2)}</span>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="flex flex-col gap-6">
                    {/* Driver Section */}
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <div className="p-4 border-b border-gray-200 bg-gray-50">
                            <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                <span className="material-symbols-outlined text-[20px]">local_shipping</span>
                                Repartidor
                            </h3>
                        </div>
                        <div className="p-4">
                            {order.deliveryMethod === 'pickup' ? (
                                <div className="text-center py-6">
                                    <span className="material-symbols-outlined text-4xl text-gray-300 mb-3">storefront</span>
                                    <p className="text-slate-900 font-medium mb-1">Retira en Local</p>
                                    <p className="text-sm text-gray-500 mb-4">Este pedido es para retirar, no requiere repartidor.</p>

                                    <div className="flex items-center justify-center gap-2">
                                        <label className="text-sm font-medium text-slate-700">Estado:</label>
                                        <select
                                            value={order.deliveryStatus === 'delivered' ? 'delivered' : 'pending'}
                                            onChange={(e) => handleDeliveryStatusChange(e.target.value as Order['deliveryStatus'])}
                                            disabled={updating}
                                            className={`text-sm rounded-lg border-gray-300 focus:ring-primary-admin focus:border-primary-admin py-1.5 px-3 ${order.deliveryStatus === 'delivered'
                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                }`}
                                        >
                                            <option value="pending">Pendiente de retiro</option>
                                            <option value="delivered">Retirado</option>
                                        </select>
                                    </div>
                                </div>
                            ) : assignedDriver ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="text-3xl">
                                            {getVehicleIcon(assignedDriver.driverInfo?.vehicleType)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-bold text-slate-900">{assignedDriver.displayName}</p>
                                            <DriverStatusBadge status={assignedDriver.driverInfo?.status || 'offline'} size="sm" />
                                        </div>
                                    </div>

                                    {assignedDriver.phoneNumber && (
                                        <a href={`tel:${assignedDriver.phoneNumber}`} className="flex items-center gap-2 text-primary hover:underline">
                                            <span className="material-symbols-outlined text-sm">phone</span>
                                            <span className="text-sm">{assignedDriver.phoneNumber}</span>
                                        </a>
                                    )}

                                    <div className="grid grid-cols-3 gap-2 p-3 bg-gray-50 rounded-lg">
                                        <div className="text-center">
                                            <div className="text-xs text-gray-600">Hoy</div>
                                            <div className="font-bold text-primary">{assignedDriver.driverInfo?.stats.completedToday || 0}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xs text-gray-600">Total</div>
                                            <div className="font-bold text-slate-900">{assignedDriver.driverInfo?.stats.totalDeliveries || 0}</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-xs text-gray-600">Rating</div>
                                            <div className="font-bold text-yellow-600">
                                                {assignedDriver.driverInfo?.stats.averageRating && assignedDriver.driverInfo.stats.averageRating > 0
                                                    ? assignedDriver.driverInfo.stats.averageRating.toFixed(1)
                                                    : '-'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setShowDriverSelector(true)}
                                            className="flex-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            Cambiar
                                        </button>
                                        <button
                                            onClick={handleUnassignDriver}
                                            className="flex-1 px-3 py-2 text-sm bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                        >
                                            Quitar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6">
                                    <span className="material-symbols-outlined text-4xl text-gray-300 mb-3">person_off</span>
                                    <p className="text-sm text-gray-500 mb-4">Sin repartidor asignado</p>
                                    <button
                                        onClick={() => setShowDriverSelector(true)}
                                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                                    >
                                        Asignar Repartidor
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Delivery Info */}
                    {order.deliveryMethod === 'delivery' && (
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="p-4 border-b border-gray-200 bg-gray-50">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[20px]">location_on</span>
                                    Información de Entrega
                                </h3>
                            </div>
                            <div className="p-4 space-y-3 text-sm">
                                <div>
                                    <span className="font-medium text-gray-600">Método:</span>
                                    <span className="ml-2 text-slate-900">Envío a Domicilio</span>
                                </div>
                                {order.deliveryDate && (
                                    <div>
                                        <span className="font-medium text-gray-600">Fecha:</span>
                                        <span className="ml-2 text-slate-900">{new Date(order.deliveryDate).toLocaleDateString()}</span>
                                    </div>
                                )}
                                {order.deliveryTimeSlot && (
                                    <div>
                                        <span className="font-medium text-gray-600">Horario:</span>
                                        <span className="ml-2 text-slate-900">{order.deliveryTimeSlot}</span>
                                    </div>
                                )}
                                {order.shippingAddress && (
                                    <a
                                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${order.shippingAddress.street}, ${order.shippingAddress.city}`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 text-primary hover:underline mt-3"
                                    >
                                        <span className="material-symbols-outlined text-sm">map</span>
                                        Ver en Google Maps
                                    </a>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Delivery Timeline */}
                    {order.assignedDriverId && (
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[20px]">timeline</span>
                                    Estado de Entrega
                                </h3>
                                {order.deliveryStatus !== 'delivered' && order.deliveryStatus !== 'failed' && (
                                    <select
                                        value={order.deliveryStatus || 'pending'}
                                        onChange={(e) => handleDeliveryStatusChange(e.target.value as Order['deliveryStatus'])}
                                        disabled={updating}
                                        className="text-xs bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-admin focus:border-primary-admin p-1.5"
                                    >
                                        <option value="pending">Sin asignar</option>
                                        <option value="assigned">Asignado</option>
                                        <option value="picked_up">Recogido</option>
                                        <option value="in_transit">En tránsito</option>
                                        <option value="delivered">Entregado</option>
                                        <option value="failed">Fallido</option>
                                    </select>
                                )}
                            </div>
                            <div className="p-4">
                                <div className="space-y-3">
                                    {deliverySteps.map((step, index) => {
                                        const stepState = getStepStatus(step.status);
                                        const config = getDeliveryStatusConfig(step.status);

                                        return (
                                            <div key={step.status} className="flex items-center gap-3">
                                                <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${stepState === 'completed' ? 'bg-green-500 border-green-500' :
                                                    stepState === 'current' ? 'bg-primary border-primary' :
                                                        stepState === 'failed' ? 'bg-red-500 border-red-500' :
                                                            'bg-white border-gray-300'
                                                    }`}>
                                                    {stepState === 'completed' || stepState === 'current' ? (
                                                        <span className="material-symbols-outlined text-white text-[16px]">
                                                            {stepState === 'completed' ? 'check' : config.icon}
                                                        </span>
                                                    ) : (
                                                        <span className={`w-2 h-2 rounded-full bg-gray-300`}></span>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <p className={`text-sm font-medium ${stepState === 'completed' ? 'text-green-600' :
                                                        stepState === 'current' ? 'text-primary' :
                                                            'text-gray-400'
                                                        }`}>
                                                        {step.label}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })}

                                    {order.deliveryStatus === 'failed' && (
                                        <div className="flex items-center gap-3 mt-2 p-3 bg-red-50 rounded-lg">
                                            <span className="material-symbols-outlined text-red-600">error</span>
                                            <p className="text-sm font-medium text-red-600">Entrega Fallida</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Shipping Address */}
                    {order.shippingAddress && (
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="p-4 border-b border-gray-200 bg-gray-50">
                                <h3 className="font-bold text-slate-900">Dirección de Envío</h3>
                            </div>
                            <div className="p-4 text-sm text-slate-700 space-y-2">
                                <p><span className="font-medium">Calle:</span> {order.shippingAddress.street}</p>
                                <p><span className="font-medium">Ciudad:</span> {order.shippingAddress.city}</p>
                                <p><span className="font-medium">CP:</span> {order.shippingAddress.zip}</p>
                            </div>
                        </div>
                    )}

                    {/* Customer Info */}
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

                    {/* Order Notes */}
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

            {/* Driver Selector Modal */}
            <DriverSelector
                isOpen={showDriverSelector}
                onClose={() => setShowDriverSelector(false)}
                onSelect={handleDriverSelect}
                orderId={order.id}
            />
        </div>
    );
};

export default OrderDetailPage;
