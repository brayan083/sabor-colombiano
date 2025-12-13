import { db } from "@/lib/firebase";
import {
    collection,
    getDocs,
    doc,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc
} from "firebase/firestore";
import { Category } from "@/types";

const COLLECTION_NAME = "categories";

export const getCategories = async (): Promise<Category[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Category));
    } catch (error) {
        console.error("Error fetching categories:", error);
        return [];
    }
};

export const getCategoryById = async (id: string): Promise<Category | null> => {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Category;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching category:", error);
        return null;
    }
};

export const createCategory = async (category: Omit<Category, "id">): Promise<string> => {
    try {
        const docRef = await addDoc(collection(db, COLLECTION_NAME), category);
        return docRef.id;
    } catch (error) {
        console.error("Error creating category:", error);
        throw error;
    }
};

export const updateCategory = async (id: string, category: Partial<Category>): Promise<void> => {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await updateDoc(docRef, category);
    } catch (error) {
        console.error("Error updating category:", error);
        throw error;
    }
};

export const deleteCategory = async (id: string): Promise<void> => {
    try {
        const docRef = doc(db, COLLECTION_NAME, id);
        await deleteDoc(docRef);
    } catch (error) {
        console.error("Error deleting category:", error);
        throw error;
    }
};
