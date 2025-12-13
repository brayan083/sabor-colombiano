'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { syncUser } from '@/lib/services/users';
import Link from 'next/link';

const RegisterPage: React.FC = () => {
    const router = useRouter();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (password.length < 6) {
            setError('La contraseña debe tener al menos 6 caracteres.');
            setLoading(false);
            return;
        }

        if (!termsAccepted) {
            setError('Debes aceptar los términos y condiciones.');
            setLoading(false);
            return;
        }

        try {
            // 1. Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // 2. Update Profile with Name
            await updateProfile(user, {
                displayName: name
            });

            // 3. Sync with Firestore (create user document)
            await syncUser(user, { phoneNumber, termsAccepted });

            router.push('/');
        } catch (err: any) {
             console.error("Registration error:", err);
             if (err.code === 'auth/email-already-in-use') {
                 setError('El correo electrónico ya está registrado.');
             } else {
                 setError('Error al registrar usuario. Inténtalo de nuevo.');
             }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-black text-slate-900 mb-2">Crear Cuenta</h1>
                    <p className="text-slate-500">Regístrate para gestionar Sabor Colombiano</p>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg border border-red-200">
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900">Nombre Completo</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-admin"
                            placeholder="Juan Pérez"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900">Correo Electrónico</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-admin"
                            placeholder="juan@ejemplo.com"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900">Número de Teléfono</label>
                        <input 
                            type="tel" 
                            value={phoneNumber} 
                            onChange={(e) => setPhoneNumber(e.target.value)} 
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-admin"
                            placeholder="+57 300 123 4567"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-900">Contraseña</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            required
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-admin"
                            placeholder="••••••••"
                        />
                         <p className="text-xs text-slate-400">Mínimo 6 caracteres</p>
                    </div>

                    <div className="flex items-center gap-2">
                        <input 
                            type="checkbox" 
                            id="terms"
                            checked={termsAccepted}
                            onChange={(e) => setTermsAccepted(e.target.checked)}
                            className="w-4 h-4 text-primary-admin bg-gray-100 border-gray-300 rounded focus:ring-primary-admin"
                        />
                        <label htmlFor="terms" className="text-sm text-slate-600">
                            Acepto los <a href="#" className="text-primary-admin hover:underline">términos y condiciones</a>
                        </label>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-3 bg-primary-admin text-white rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
                    >
                        {loading ? 'Registrando...' : 'Registrarse'}
                    </button>
                </form>

                 <div className="mt-8 text-center text-sm text-slate-500">
                    ¿Ya tienes una cuenta? <Link href="/auth/login" className="text-primary-admin font-bold hover:underline">Inicia Sesión</Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
