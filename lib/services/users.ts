import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc, collection, getDocs, query, where, updateDoc } from "firebase/firestore";
import { User as FirebaseUser } from "firebase/auth";
import { User } from "@/types";
import { AVAILABLE_AVATARS } from "@/lib/config/avatars";

const COLLECTION_NAME = "users";

export const getUsers = async (): Promise<User[]> => {
    try {
        const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
        return querySnapshot.docs.map(doc => ({
            uid: doc.id,
            ...doc.data()
        } as User));
    } catch (error) {
        console.error("Error fetching users:", error);
        return [];
    }
};

export const syncUser = async (firebaseUser: FirebaseUser, additionalData?: { phoneNumber?: string; termsAccepted?: boolean }): Promise<User> => {
    try {
        const userRef = doc(db, COLLECTION_NAME, firebaseUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return userSnap.data() as User;
        } else {
            // Determine photoURL
            let photoURL = firebaseUser.photoURL;
            let googlePhotoURL = null;

            // Check for Google provider data to get the original/stable URL
            const googleProvider = firebaseUser.providerData.find(p => p.providerId === 'google.com');
            if (googleProvider && googleProvider.photoURL) {
                googlePhotoURL = googleProvider.photoURL;
                // Ideally, we use this as the default if it exists
                if (!photoURL) photoURL = googlePhotoURL;
            }

            if (!photoURL) {
                // Assign random avatar if no Google photo
                const randomIndex = Math.floor(Math.random() * AVAILABLE_AVATARS.length);
                photoURL = AVAILABLE_AVATARS[randomIndex];
            }

            const newUser: User = {
                uid: firebaseUser.uid,
                email: firebaseUser.email || "",
                displayName: firebaseUser.displayName || "Usuario",
                photoURL,
                googlePhotoURL,
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

export const getUserRole = async (uid: string): Promise<'admin' | 'customer' | 'driver' | null> => {
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

export const getUserById = async (uid: string): Promise<User | null> => {
    try {
        const userRef = doc(db, COLLECTION_NAME, uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
            return userSnap.data() as User;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error fetching user by id:", error);
        return null;
    }
};

export const updateUserRole = async (uid: string, role: 'admin' | 'customer' | 'driver'): Promise<void> => {
    try {
        const userRef = doc(db, COLLECTION_NAME, uid);
        await updateDoc(userRef, { role });
    } catch (error) {
        console.error("Error updating user role:", error);
        throw error;
    }
};

export const updateUserPhone = async (uid: string, phoneNumber: string): Promise<void> => {
    try {
        const userRef = doc(db, COLLECTION_NAME, uid);
        await updateDoc(userRef, { phoneNumber });
    } catch (error) {
        console.error("Error updating user phone:", error);
        throw error;
    }
};

export const updateUser = async (uid: string, data: Partial<User>): Promise<void> => {
    try {
        const userRef = doc(db, COLLECTION_NAME, uid);
        await updateDoc(userRef, data);
    } catch (error) {
        console.error("Error updating user:", error);
        throw error;
    }
};
