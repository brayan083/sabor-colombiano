'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User as FirebaseUser, onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { User } from '@/types';
import { syncUser } from '@/lib/services/users';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Optimization: Try to load from cache first for instant feedback
                const cachedUser = localStorage.getItem(`colfood_user_${firebaseUser.uid}`);
                if (cachedUser) {
                    setUser(JSON.parse(cachedUser));
                    setLoading(false); // Unblock UI with cached data
                }

                try {
                    // Fetch fresh user data from Firestore in background
                    const userData = await syncUser(firebaseUser);
                    setUser(userData);
                    // Update cache
                    localStorage.setItem(`colfood_user_${firebaseUser.uid}`, JSON.stringify(userData));
                } catch (error) {
                    console.error("Error fetching user data:", error);
                    // If cache failed or didn't exist, we might be in trouble, but keep existing state if any
                    if (!cachedUser) setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signOut = async () => {
        try {
            if (user) {
                localStorage.removeItem(`colfood_user_${user.uid}`);
            }
            await firebaseSignOut(auth);
            setUser(null);
            router.push('/');
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signOut }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
