import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { User as FirebaseUser } from "firebase/auth";
import { User } from "@/types";

const COLLECTION_NAME = "users";

export const syncUser = async (firebaseUser: FirebaseUser, additionalData?: { phoneNumber?: string; termsAccepted?: boolean }): Promise<User> => {
    try {
        const userRef = doc(db, COLLECTION_NAME, firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return userSnap.data() as User;
        } else {
            const newUser: User = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || "",
                displayName: firebaseUser.displayName || "Usuario",
                role: 'customer', // Default role
                createdAt: Date.now(),
                ...additionalData
            };

            await setDoc(userRef, newUser);
            return newUser;
        }
    } catch (error) {
        console.error("Error syncing user:", error);
        throw error;
    }
};

export const getUserRole = async (uid: string): Promise<'admin' | 'customer' | null> => {
    try {
        const userRef = doc(db, COLLECTION_NAME, uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return (userSnap.data() as User).role;
        }
        return null;
    } catch (error) {
        console.error("Error getting user role:", error);
        return null;
    }
};
