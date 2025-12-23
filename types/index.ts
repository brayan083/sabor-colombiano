export interface Category {
    id: string;
    name: string;
    slug: string;
    image: string;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    categoryId: string;
    stock: number;
    inStock: boolean;
    isArchived?: boolean;
    createdAt: number; // Timestamp
}

export interface CartItem extends Product {
    quantity: number;
}

export interface User {
    uid: string;
    email: string;
    displayName: string;
    role: 'admin' | 'customer' | 'driver'; // Added 'driver' role
    phoneNumber?: string;
    termsAccepted?: boolean;
    photoURL?: string | null;
    googlePhotoURL?: string | null; // Store original Google photo

    // Driver-specific information (only present if role === 'driver')
    driverInfo?: {
        vehicleType: 'motorcycle' | 'bicycle' | 'car' | 'foot';
        status: 'available' | 'busy' | 'offline';
        stats: {
            totalDeliveries: number;
            completedToday: number;
            averageRating: number;
        };
        isActive: boolean;
    };

    createdAt: number;
}

export interface OrderItem {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    image: string;
}

export interface Order {
    id: string;
    userId: string;
    items: OrderItem[];
    total: number;
    status: 'pending' | 'paid' | 'shipped' | 'cancelled';
    deliveryMethod: 'pickup' | 'delivery';
    shippingAddress?: {
        street: string;
        city: string; // Will store Localidad
        state: string; // Keeping for compatibility, or empty
        zip: string;
    };
    paymentMethod: 'mercado_pago' | 'transfer' | 'cash';
    customerName: string;
    customerPhone?: string;
    orderNotes?: string; // Optional message from user
    deliveryTimeSlot?: string; // Preferred delivery time range (e.g., "11:00 - 13:00")
    deliveryDate?: string; // Preferred delivery date (ISO format: YYYY-MM-DD)
    assignedDriverId?: string; // UID of user with driver role
    assignedDriverName?: string; // Name of assigned delivery driver
    deliveryStatus?: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed';
    mercadoPagoPaymentId?: string; // Mercado Pago payment ID
    mercadoPagoStatus?: string; // Mercado Pago payment status
    createdAt: number;
}
