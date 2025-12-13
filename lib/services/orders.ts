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
    where
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
        const docRef = await addDoc(collection(db, COLLECTION_NAME), order);
        return docRef.id;
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
