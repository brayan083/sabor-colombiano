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
    role: 'admin' | 'customer';
    phoneNumber?: string;
    termsAccepted?: boolean;
    photoURL?: string | null;
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
    createdAt: number;
}
