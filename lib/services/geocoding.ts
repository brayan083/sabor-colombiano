import { Order } from '@/types';

// Google Maps Address Component Type
interface AddressComponent {
    long_name: string;
    short_name: string;
    types: string[];
}

// Geocode response type
interface GeocodeResult {
    lat: number;
    lng: number;
    addressComponents?: AddressComponent[];
}

// Cache for geocoded addresses
const geocodeCache = new Map<string, GeocodeResult>();

/**
 * Geocode an address using our server-side API route
 */
export const geocodeAddress = async (address: string): Promise<GeocodeResult | null> => {
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
            const result: GeocodeResult = {
                lat: data.coordinates.lat,
                lng: data.coordinates.lng,
                addressComponents: data.addressComponents
            };

            // Cache the result
            geocodeCache.set(address, result);

            console.log(`✅ Geocoded successfully: ${address}`);
            return result;
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

        const geocodeResult = await geocodeAddress(address);
        if (geocodeResult) {
            results.set(order.id, { lat: geocodeResult.lat, lng: geocodeResult.lng });
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));
    }

    return results;
};

// Shop Coordinates (Obelisco, Buenos Aires - Default Center)
export const SHOP_COORDINATES = {
    lat: -34.6037,
    lng: -58.3816
};

// Neighborhoods with $9.000 shipping cost
const EXPENSIVE_NEIGHBORHOODS = [
    'nuñez',
    'unez', // Handle non-accented
    'belgrano',
    'villa devoto',
    'devoto',
    'saavedra',
    'villa urquiza',
    'urquiza',
    'liniers',
    'microcentro',
    'san nicolas', // Microcentro parts
    'monserrat',   // Microcentro parts
    'san telmo'
];

export const calculateShippingZone = async (address: string): Promise<{ zone: 'centro' | 'bordes' | null, cost: number, neighborhood?: string, city?: string, zip?: string } | null> => {
    try {
        const result = await geocodeAddress(address);
        if (!result || !result.addressComponents) return null;

        // Find neighborhood in address components
        // "sublocality" or "neighborhood" type
        const neighborhoodComponent = result.addressComponents.find(c =>
            c.types.includes('neighborhood') ||
            c.types.includes('sublocality') ||
            c.types.includes('sublocality_level_1')
        );

        const neighborhood = neighborhoodComponent?.long_name;
        console.log(`🏘️ Identified neighborhood: ${neighborhood}`);

        // Extract City (Locality)
        const cityComponent = result.addressComponents.find(c => c.types.includes('locality'));
        const city = cityComponent?.long_name;

        // Extract Zip Code (Postal Code)
        const zipComponent = result.addressComponents.find(c => c.types.includes('postal_code'));
        const zip = zipComponent?.long_name;

        if (!neighborhood) {
            // Fallback: If no neighborhood found, default to expensive to be safe, or cheap? 
            // Let's stick to previous distance logic as fallback? 
            // The user was specific about barrios. If we can't determine barrio, we might default to Centro ($5000) as per "cualquier otro barrio".
            console.warn("⚠️ No neighborhood found in address components.");
            return { zone: 'centro', cost: 5000, city, zip };
        }

        const normalizedNeighborhood = neighborhood.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        const isExpensive = EXPENSIVE_NEIGHBORHOODS.some(n => normalizedNeighborhood.includes(n));

        if (isExpensive) {
            return { zone: 'bordes', cost: 9000, neighborhood, city, zip };
        } else {
            return { zone: 'centro', cost: 5000, neighborhood, city, zip };
        }

    } catch (error) {
        console.error("Error calculating shipping zone:", error);
        return null;
    }
};
