'use client';

import React, { useState } from 'react';
import { seedDatabase } from '@/lib/db/seed';

export default function SeedPage() {
    const [status, setStatus] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const handleSeed = async () => {
        setLoading(true);
        setStatus('Seeding database...');
        try {
            const result = await seedDatabase();
            if (result) {
                setStatus('Database seeded successfully! Check Firestore console.');
            } else {
                setStatus('Error seeding database. Check console logs.');
            }
        } catch (error) {
            setStatus('Error: ' + error);
        }
        setLoading(false);
    };

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-4">Database Seeder</h1>
            <p className="mb-4">Click the button below to populate Firestore with initial data.</p>
            
            <button 
                onClick={handleSeed}
                disabled={loading}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
            >
                {loading ? 'Seeding...' : 'Seed Database'}
            </button>
            
            {status && (
                <div className="mt-4 p-4 border rounded bg-gray-100">
                    {status}
                </div>
            )}
        </div>
    );
}
