'use client';

import React from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { Order } from '@/types';
import { geocodeAddress, formatAddressForGeocoding } from '@/lib/services/geocoding';

interface DeliveryMapProps {
    orders: Order[];
}

interface MarkerData {
    orderId: string;
    position: { lat: number; lng: number };
    order: Order;
}

const DeliveryMap: React.FC<DeliveryMapProps> = ({ orders }) => {
    const [selectedMarker, setSelectedMarker] = React.useState<string | null>(null);
    const [map, setMap] = React.useState<google.maps.Map | null>(null);
    const [markers, setMarkers] = React.useState<MarkerData[]>([]);
    const [loading, setLoading] = React.useState(true);

    // Filter only delivery orders with addresses
    const deliveryOrders = orders.filter(
        order => order.deliveryMethod === 'delivery' && order.shippingAddress
    );

    const mapContainerStyle = {
        width: '100%',
        height: '100%'
    };

    const defaultCenter = {
        lat: -34.6037, // Buenos Aires default
        lng: -58.3816
    };

    const mapOptions: google.maps.MapOptions = {
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
        // Hide all POIs (points of interest)
        styles: [
            {
                featureType: 'poi',
                stylers: [{ visibility: 'off' }]
            },
            {
                featureType: 'transit',
                stylers: [{ visibility: 'off' }]
            }
        ]
    };

    // Geocode addresses and create markers
    React.useEffect(() => {
        const geocodeOrders = async () => {
            if (deliveryOrders.length === 0) {
                setLoading(false);
                return;
            }

            setLoading(true);
            const newMarkers: MarkerData[] = [];

            for (const order of deliveryOrders) {
                const address = formatAddressForGeocoding(order);
                if (!address) continue;

                const coords = await geocodeAddress(address);
                if (coords) {
                    newMarkers.push({
                        orderId: order.id,
                        position: coords,
                        order
                    });
                }

                // Small delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 200));
            }

            setMarkers(newMarkers);
            setLoading(false);
        };

        geocodeOrders();
    }, [deliveryOrders.length]);

    // Fit bounds to show all markers
    React.useEffect(() => {
        if (map && markers.length > 0) {
            const bounds = new google.maps.LatLngBounds();
            markers.forEach(marker => {
                bounds.extend(new google.maps.LatLng(marker.position.lat, marker.position.lng));
            });

            // Add some padding
            const padding = { top: 50, right: 50, bottom: 50, left: 50 };
            map.fitBounds(bounds, padding);
        }
    }, [map, markers]);

    // Get marker icon based on delivery status
    const getMarkerIcon = (status?: string): string => {
        // Using Google Maps default marker colors
        switch (status) {
            case 'assigned': return 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png';
            case 'picked_up': return 'http://maps.google.com/mapfiles/ms/icons/purple-dot.png';
            case 'in_transit': return 'http://maps.google.com/mapfiles/ms/icons/yellow-dot.png';
            case 'delivered': return 'http://maps.google.com/mapfiles/ms/icons/green-dot.png';
            default: return 'http://maps.google.com/mapfiles/ms/icons/red-dot.png';
        }
    };

    const getStatusLabel = (status?: string): string => {
        switch (status) {
            case 'assigned': return 'Asignado';
            case 'picked_up': return 'Recogido';
            case 'in_transit': return 'En Tránsito';
            case 'delivered': return 'Entregado';
            case 'failed': return 'Fallido';
            default: return 'Pendiente';
        }
    };

    if (deliveryOrders.length === 0) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">📍 Mapa de Entregas</h2>
                    <span className="text-sm text-gray-500">0 destinos</span>
                </div>
                <div className="w-full h-[300px] sm:h-[400px] rounded-lg bg-gray-50 flex items-center justify-center border border-gray-200">
                    <div className="text-center">
                        <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">map</span>
                        <p className="text-gray-500">No hay entregas activas para mostrar</p>
                    </div>
                </div>
            </div>
        );
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

    if (!apiKey) {
        return (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg sm:text-xl font-bold text-slate-900">📍 Mapa de Entregas</h2>
                </div>
                <div className="w-full h-[300px] sm:h-[400px] rounded-lg bg-yellow-50 border-2 border-yellow-200 flex items-center justify-center">
                    <div className="text-center p-6">
                        <span className="material-symbols-outlined text-6xl text-yellow-600 mb-4">warning</span>
                        <p className="text-yellow-800 font-medium mb-2">API Key de Google Maps no configurada</p>
                        <p className="text-sm text-yellow-700">
                            Agrega NEXT_PUBLIC_GOOGLE_MAPS_API_KEY en tu archivo .env.local
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl p-4 sm:p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg sm:text-xl font-bold text-slate-900">📍 Mapa de Entregas</h2>
                <div className="flex items-center gap-2">
                    {loading && (
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                            Cargando...
                        </div>
                    )}
                    <span className="text-sm text-gray-600">
                        {markers.length} de {deliveryOrders.length} {deliveryOrders.length === 1 ? 'destino' : 'destinos'}
                    </span>
                </div>
            </div>

            <div className="w-full h-[300px] sm:h-[400px] rounded-lg overflow-hidden border border-gray-200">
                <LoadScript googleMapsApiKey={apiKey}>
                    <GoogleMap
                        mapContainerStyle={mapContainerStyle}
                        center={markers.length > 0 ? markers[0].position : defaultCenter}
                        zoom={12}
                        options={mapOptions}
                        onLoad={setMap}
                    >
                        {markers.map((marker, index) => (
                            <Marker
                                key={marker.orderId}
                                position={marker.position}
                                icon={{
                                    url: getMarkerIcon(marker.order.deliveryStatus),
                                    scaledSize: new google.maps.Size(32, 32)
                                }}
                                label={{
                                    text: `${index + 1}`,
                                    color: 'white',
                                    fontWeight: 'bold',
                                    fontSize: '12px'
                                }}
                                onClick={() => setSelectedMarker(marker.orderId)}
                            />
                        ))}

                        {selectedMarker && markers.find(m => m.orderId === selectedMarker) && (
                            <InfoWindow
                                position={markers.find(m => m.orderId === selectedMarker)!.position}
                                onCloseClick={() => setSelectedMarker(null)}
                            >
                                <div className="p-2 max-w-xs">
                                    <h3 className="font-bold text-sm mb-1">
                                        Pedido #{markers.find(m => m.orderId === selectedMarker)!.order.id.slice(0, 8)}
                                    </h3>
                                    <p className="text-xs text-gray-600 mb-1">
                                        {markers.find(m => m.orderId === selectedMarker)!.order.customerName}
                                    </p>
                                    <p className="text-xs text-gray-700 mb-1">
                                        {markers.find(m => m.orderId === selectedMarker)!.order.shippingAddress?.street}{' '}
                                        {markers.find(m => m.orderId === selectedMarker)!.order.shippingAddress?.number}
                                    </p>
                                    <p className="text-xs font-medium text-slate-800 mb-2">
                                        Repartidor: {markers.find(m => m.orderId === selectedMarker)!.order.assignedDriverName || 'Sin asignar'}
                                    </p>
                                    <span className={`text-xs px-2 py-1 rounded ${markers.find(m => m.orderId === selectedMarker)!.order.deliveryStatus === 'delivered'
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-blue-100 text-blue-800'
                                        }`}>
                                        {getStatusLabel(markers.find(m => m.orderId === selectedMarker)!.order.deliveryStatus)}
                                    </span>
                                </div>
                            </InfoWindow>
                        )}
                    </GoogleMap>
                </LoadScript>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span>Asignado</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                        <span>Recogido</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                        <span>En tránsito</span>
                    </div>
                </div>
                <span className="hidden sm:block">💡 Click en los marcadores para ver detalles</span>
            </div>
        </div>
    );
};

export default DeliveryMap;
