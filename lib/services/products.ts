import { db } from "@/lib/firebase";
import {
    collection,
    getDocs,
    doc,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    query,
    where,
    Timestamp
} from "firebase/firestore";
import { Product } from "@/types";

const COLLECTION_NAME = "products";

export const getProducts = async (): Promise<Product[]> => {
    try {
        const q = query(collection(db, COLLECTION_NAME), where("isArchived", "!=", true)); // Basic filtering
        // Firestore filter `!=` might require index or specific setup. simpler: fetch all filter client side or use `where("isArchived", "==", false)`?
        // But `isArchived` might be undefined for old products.
        // Safer for now: Fetch all and filter client side to avoid missing old products unless I update all docs.
        // OR: Active products usually have `inStock`? No, `isArchived` is new.
        // Let's stick to client-side filtering for safety on existing data without migrations, OR update `getProducts` for consumers.

        // Actually, let's keep `getProducts` for PUBLIC usage (filtering active) and add `getAllProducts` for ADMIN.
        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        const allProducts = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Product));

        // Return only NON-ARCHIVED products
        return allProducts.filter(p => !p.isArchived);
    } catch (error) {
        console.error("Error fetching products:", error);
        return [];
    }
};

export const getAllProducts = async (): Promise<Product[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Product));
    } catch (error) {
        console.error("Error fetching all products:", error);
        return [];
    }
};

export const getProductById = async (id: string): Promise<Product | null> => {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Product;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching product:", error);
        return null;
    }
};

export const getProductsByCategory = async (categoryId: string): Promise<Product[]> => {
    try {
        const q = query(collection(db, COLLECTION_NAME), where("categoryId", "==", categoryId));
        const querySnapshot = await getDocs(q);
        const products = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Product));
        return products.filter(p => !p.isArchived);
    } catch (error) {
        console.error("Error fetching products by category:", error);
        return [];
    }
};

export const createProduct = async (product: Omit<Product, "id">): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), {
            ...product,
            createdAt: Date.now()
        });
        return docRef.id;
    } catch (error) {
        console.error("Error creating product:", error);
        throw error;
    }
};

export const updateProduct = async (id: string, product: Partial<Product>): Promise<void> => {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, product);
    } catch (error) {
        console.error("Error updating product:", error);
        throw error;
    }
};

export const deleteProduct = async (id: string): Promise<void> => {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(docRef);
    } catch (error) {
        console.error("Error deleting product:", error);
        throw error;
    }
};

export const toggleProductArchive = async (id: string, isArchived: boolean): Promise<void> => {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, { isArchived });
    } catch (error) {
        console.error("Error toggling product archive status:", error);
        throw error;
    }
};
