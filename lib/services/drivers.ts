import { db } from '../firebase';
import { collection, addDoc, getDocs, getDoc, doc, updateDoc, deleteDoc, query, where, Timestamp, setDoc } from 'firebase/firestore';
import { User } from '@/types';

const usersCollection = collection(db, 'users');

// Get all drivers (users with role === 'driver')
export async function getDrivers(): Promise<User[]> {
    try {
        const q = query(usersCollection, where('role', '==', 'driver'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            uid: doc.id,
            ...doc.data()
        } as User));
    } catch (error) {
        console.error('Error getting drivers:', error);
        throw error;
    }
}

// Get driver by ID (user ID)
export async function getDriverById(id: string): Promise<User | null> {
    try {
        const userDoc = await getDoc(doc(usersCollection, id));
        if (userDoc.exists() && userDoc.data().role === 'driver') {
            return {
                uid: userDoc.id,
                ...userDoc.data()
            } as User;
        }
        return null;
    } catch (error) {
        console.error('Error getting driver:', error);
        throw error;
    }
}

// Promote user to driver
export async function promoteToDriver(
    userId: string,
    vehicleType: 'motorcycle' | 'bicycle' | 'car' | 'foot'
): Promise<void> {
    try {
        const userRef = doc(usersCollection, userId);
        await updateDoc(userRef, {
            role: 'driver',
            'driverInfo.vehicleType': vehicleType,
            'driverInfo.status': 'available',
            'driverInfo.stats': {
                totalDeliveries: 0,
                completedToday: 0,
                averageRating: 0
            },
            'driverInfo.isActive': true
        });
    } catch (error) {
        console.error('Error promoting user to driver:', error);
        throw error;
    }
}

// Demote driver to customer
export async function demoteFromDriver(userId: string): Promise<void> {
    try {
        const userRef = doc(usersCollection, userId);
        await updateDoc(userRef, {
            role: 'customer',
            driverInfo: null
        });
    } catch (error) {
        console.error('Error demoting driver:', error);
        throw error;
    }
}

// Update driver info
export async function updateDriver(id: string, data: Partial<User>): Promise<void> {
    try {
        const userRef = doc(usersCollection, id);
        await updateDoc(userRef, data);
    } catch (error) {
        console.error('Error updating driver:', error);
        throw error;
    }
}

// Delete driver (actually demote to customer)
export async function deleteDriver(id: string): Promise<void> {
    try {
        await demoteFromDriver(id);
    } catch (error) {
        console.error('Error deleting driver:', error);
        throw error;
    }
}

// Get available drivers
export async function getAvailableDrivers(): Promise<User[]> {
    try {
        const q = query(
            usersCollection,
            where('role', '==', 'driver'),
            where('driverInfo.status', '==', 'available'),
            where('driverInfo.isActive', '==', true)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            uid: doc.id,
            ...doc.data()
        } as User));
    } catch (error) {
        console.error('Error getting available drivers:', error);
        throw error;
    }
}

// Update driver status
export async function updateDriverStatus(
    id: string,
    status: 'available' | 'busy' | 'offline'
): Promise<void> {
    try {
        const userRef = doc(usersCollection, id);
        await updateDoc(userRef, {
            'driverInfo.status': status
        });
    } catch (error) {
        console.error('Error updating driver status:', error);
        throw error;
    }
}

// Increment delivery count
export async function incrementDriverDeliveries(id: string): Promise<void> {
    try {
        const driver = await getDriverById(id);
        if (driver && driver.driverInfo) {
            const userRef = doc(usersCollection, id);
            await updateDoc(userRef, {
                'driverInfo.stats.totalDeliveries': driver.driverInfo.stats.totalDeliveries + 1,
                'driverInfo.stats.completedToday': driver.driverInfo.stats.completedToday + 1
            });
        }
    } catch (error) {
        console.error('Error incrementing driver deliveries:', error);
        throw error;
    }
}

// Reset daily stats (should be called daily)
export async function resetDailyStats(): Promise<void> {
    try {
        const drivers = await getDrivers();
        const updates = drivers.map(driver =>
            updateDoc(doc(usersCollection, driver.uid), {
                'driverInfo.stats.completedToday': 0
            })
        );
        await Promise.all(updates);
    } catch (error) {
        console.error('Error resetting daily stats:', error);
        throw error;
    }
}

// Get all customers (for promoting to driver)
export async function getCustomers(): Promise<User[]> {
    try {
        const q = query(usersCollection, where('role', '==', 'customer'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({
            uid: doc.id,
            ...doc.data()
        } as User));
    } catch (error) {
        console.error('Error getting customers:', error);
        throw error;
    }
}
