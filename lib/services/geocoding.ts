import { Order } from '@/types';

// Cache for geocoded addresses
const geocodeCache = new Map<string, { lat: number; lng: number }>();

/**
 * Geocode an address using our server-side API route
 */
export const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
    // Check cache first
    if (geocodeCache.has(address)) {
        console.log(`💾 Using cached coordinates for: ${address}`);
        return geocodeCache.get(address)!;
    }

    try {
        console.log('🔍 Geocoding request for:', address);

        // Call our server-side API route instead of Google directly
        const response = await fetch(`/api/geocode?address=${encodeURIComponent(address)}`);
        const data = await response.json();

        if (data.success && data.coordinates) {
            const coords = data.coordinates;

            // Cache the result
            geocodeCache.set(address, coords);

            console.log(`✅ Geocoded successfully: ${address} → (${coords.lat}, ${coords.lng})`);
            return coords;
        }

        console.error(`❌ Geocoding failed for "${address}":`, data.error || data.message);
        return null;
    } catch (error) {
        console.error('💥 Exception during geocoding:', error);
        return null;
    }
};

/**
 * Format shipping address for geocoding
 */
export const formatAddressForGeocoding = (order: Order): string | null => {
    const addr = order.shippingAddress;
    if (!addr) return null;

    const parts = [
        addr.street,
        addr.number,
        addr.city,
        addr.state,
        addr.zip,
        'Argentina' // Default country
    ].filter(Boolean);

    return parts.join(', ');
};

/**
 * Geocode multiple orders
 */
export const geocodeOrders = async (orders: Order[]): Promise<Map<string, { lat: number; lng: number }>> => {
    const results = new Map<string, { lat: number; lng: number }>();

    for (const order of orders) {
        const address = formatAddressForGeocoding(order);
        if (!address) continue;

        const coords = await geocodeAddress(address);
        if (coords) {
            results.set(order.id, coords);
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    return results;
};
