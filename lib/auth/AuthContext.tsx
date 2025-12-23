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
    refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    loading: true,
    signOut: async () => { },
    refreshUser: async () => { },
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const signOut = async () => {
        try {
            if (auth.currentUser) {
                localStorage.removeItem(`colfood_user_${auth.currentUser.uid}`);
            }
            await firebaseSignOut(auth);
            setUser(null);
            router.push('/');
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const refreshUser = async () => {
        if (!auth.currentUser) return;

        try {
            const userData = await syncUser(auth.currentUser);
            setUser(userData);
            localStorage.setItem(`colfood_user_${auth.currentUser.uid}`, JSON.stringify(userData));
        } catch (error) {
            console.error("Error refreshing user data:", error);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Check session duration (1 day = 24 * 60 * 60 * 1000 ms)
                const lastSignInTime = firebaseUser.metadata.lastSignInTime;
                if (lastSignInTime) {
                    const lastSignInDate = new Date(lastSignInTime);
                    const now = new Date();
                    const diffTime = Math.abs(now.getTime() - lastSignInDate.getTime());
                    const oneDayMs = 24 * 60 * 60 * 1000;

                    if (diffTime > oneDayMs) {
                        console.log("Session expired (older than 1 day). Signing out.");
                        await signOut();
                        return;
                    }
                }

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



    return (
        <AuthContext.Provider value={{ user, loading, signOut, refreshUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
