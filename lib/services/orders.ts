import { db } from "@/lib/firebase";
import {
    collection,
    getDocs,
    doc,
    getDoc,
    addDoc,
    updateDoc,
    query,
    orderBy,
    where,
    runTransaction
} from "firebase/firestore";
import { Order } from "@/types";

const COLLECTION_NAME = "orders";

export const getOrders = async (): Promise<Order[]> => {
    try {
        const q = query(collection(db, COLLECTION_NAME), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Order));
    } catch (error) {
        console.error("Error fetching orders:", error);
        return [];
    }
};

export const getOrderById = async (id: string): Promise<Order | null> => {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Order;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching order:", error);
        return null;
    }
};

export const createOrder = async (order: Omit<Order, "id">): Promise<string> => {
    try {
        return await runTransaction(db, async (transaction) => {
            const productDocs = [];

            // 1. Reads: Fetch all product data first
            for (const item of order.items) {
                const productRef = doc(db, "products", item.productId);
                const productSnap = await transaction.get(productRef);
                productDocs.push({ item, ref: productRef, snap: productSnap });
            }

            // 2. Writes: Verify stock and update
            for (const { item, ref, snap } of productDocs) {
                if (!snap.exists()) {
                    throw new Error(`Producto no encontrado: ${item.name}`);
                }

                const productData = snap.data();
                const newStock = productData.stock - item.quantity;

                if (newStock < 0) {
                    throw new Error(`Stock insuficiente para ${item.name}. Disponible: ${productData.stock}`);
                }

                transaction.update(ref, { stock: newStock });
            }

            // 3. Create the order
            const newOrderRef = doc(collection(db, COLLECTION_NAME));
            transaction.set(newOrderRef, order);

            return newOrderRef.id;
        });
    } catch (error) {
        console.error("Error creating order:", error);
        throw error;
    }
};

export const updateOrderStatus = async (id: string, status: Order['status']): Promise<void> => {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, { status });
    } catch (error) {
        console.error("Error updating order status:", error);
        throw error;
    }
};

export const updateOrderPaymentStatus = async (id: string, status: Order['paymentStatus']): Promise<void> => {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, { paymentStatus: status });
    } catch (error) {
        console.error("Error updating order payment status:", error);
        throw error;
    }
};

export const getOrdersByUser = async (userId: string): Promise<Order[]> => {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where("userId", "==", userId)
        );
        const querySnapshot = await getDocs(q);
        const orders = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Order));

        return orders.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
        console.error("Error fetching user orders:", error);
        return [];
    }
};

export const getOrderByPaymentId = async (paymentId: string): Promise<Order | null> => {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where("mercadoPagoPaymentId", "==", paymentId)
        );
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null;
        }

        // Return the first matching order
        const doc = querySnapshot.docs[0];
        return { id: doc.id, ...doc.data() } as Order;
    } catch (error) {
        console.error("Error fetching order by payment ID:", error);
        return null;
    }
};

export const updateOrderPayment = async (
    id: string,
    paymentId: string,
    paymentStatus: string
): Promise<void> => {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, {
            status: 'paid',
            paymentMethod: 'mercado_pago',
            mercadoPagoPaymentId: paymentId,
            mercadoPagoStatus: paymentStatus
        });
        console.log(`✅ Order ${id} updated with payment ${paymentId}`);
    } catch (error) {
        console.error("Error updating order payment:", error);
        throw error;
    }
};

// Assign driver to order
export const assignDriverToOrder = async (
    orderId: string,
    driverId: string,
    driverName: string
): Promise<void> => {
    try {
        const docRef = doc(db, COLLECTION_NAME, orderId);
        await updateDoc(docRef, {
            assignedDriverId: driverId,
            assignedDriverName: driverName,
            deliveryStatus: 'assigned'
        });
    } catch (error) {
        console.error("Error assigning driver to order:", error);
        throw error;
    }
};

// Update delivery status
export const updateDeliveryStatus = async (
    orderId: string,
    status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed'
): Promise<void> => {
    try {
        const docRef = doc(db, COLLECTION_NAME, orderId);
        await updateDoc(docRef, { deliveryStatus: status });
    } catch (error) {
        console.error("Error updating delivery status:", error);
        throw error;
    }
};

// Get orders by driver
export const getOrdersByDriver = async (driverId: string): Promise<Order[]> => {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where("assignedDriverId", "==", driverId),
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Order));
    } catch (error) {
        console.error("Error fetching orders by driver:", error);
        return [];
    }
};

// Unassign driver from order
export const unassignDriverFromOrder = async (orderId: string): Promise<void> => {
    try {
        const docRef = doc(db, COLLECTION_NAME, orderId);
        await updateDoc(docRef, {
            assignedDriverId: null,
            assignedDriverName: null,
            deliveryStatus: 'pending'
        });
    } catch (error) {
        console.error("Error unassigning driver from order:", error);
        throw error;
    }
};
