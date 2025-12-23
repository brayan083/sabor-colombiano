'use client';

import { useAuth } from '@/lib/auth/AuthContext';
import { updateUser } from '@/lib/services/users';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';

import { AVAILABLE_AVATARS } from '@/lib/config/avatars';

export default function ProfilePage() {
    const { user, loading, refreshUser } = useAuth();
    const router = useRouter();
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Form states
    const [phoneNumber, setPhoneNumber] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [selectedAvatar, setSelectedAvatar] = useState('');
    const [hasChanges, setHasChanges] = useState(false);
    const [phoneError, setPhoneError] = useState('');

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
        if (user) {
            setPhoneNumber(user.phoneNumber || '');
            setDisplayName(user.displayName || '');
            setSelectedAvatar(user.photoURL || '');
        }
    }, [user, loading, router]);

    // Check for changes
    useEffect(() => {
        if (!user) return;
        const isChanged =
            phoneNumber !== (user.phoneNumber || '') ||
            displayName !== (user.displayName || '') ||
            selectedAvatar !== (user.photoURL || '');
        setHasChanges(isChanged);
    }, [phoneNumber, displayName, selectedAvatar, user]);

    const handleAvatarSelect = (avatarUrl: string) => {
        setSelectedAvatar(avatarUrl);
    };

    const handleSaveProfile = async () => {
        if (!user) return;

        // Simple validation: Phone should be between 7 and 15 digits
        if (phoneNumber && (phoneNumber.length < 7 || phoneNumber.length > 15)) {
            setPhoneError('Por favor ingresa un número de teléfono válido (7-15 dígitos)');
            return;
        }

        try {
            await updateUser(user.uid, {
                phoneNumber,
                displayName,
                photoURL: selectedAvatar
            });
            setMessage({ type: 'success', text: 'Perfil actualizado con éxito' });

            // Refresh global user state immediately
            await refreshUser();

            // Allow time for toast to be seen
            setTimeout(() => {
                setMessage(null);
            }, 3000);

        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Error al actualizar el perfil' });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen pt-8 pb-8 flex justify-center items-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="min-h-screen pt-8 pb-8 bg-gray-50">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Mi Perfil</h1>

                <div className="bg-white rounded-2xl shadow overflow-hidden">
                    <div className="p-8">
                        {/* Profile Header */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 mb-8">
                            <div className="relative">
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-orange-100 relative shadow-lg">
                                    {selectedAvatar ? (
                                        <Image
                                            src={selectedAvatar}
                                            alt={displayName || "Avatar"}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-orange-100 flex items-center justify-center text-orange-500 text-4xl font-bold">
                                            {(displayName || user.email || 'U').charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="text-center sm:text-left flex-1 py-2">
                                <h2 className="text-2xl font-bold text-gray-900">{displayName || 'Usuario'}</h2>
                                <p className="text-gray-500">{user.email}</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    Miembro desde {new Date(user.createdAt).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        {message && (
                            <div className={`p-4 rounded-lg mb-6 ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                                {message.text}
                            </div>
                        )}

                        {/* Avatar Selection Section */}
                        <div className="mb-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Elige tu Avatar</h3>
                            <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                                {user.googlePhotoURL && (
                                    <button
                                        onClick={() => handleAvatarSelect(user.googlePhotoURL!)}
                                        className={`relative w-16 h-16 rounded-full overflow-hidden border-2 transition-all hover:scale-110 focus:outline-none ${selectedAvatar === user.googlePhotoURL ? 'border-orange-500 ring-2 ring-orange-200 scale-110' : 'border-transparent hover:border-gray-300'}`}
                                        title="Tu foto de Google"
                                    >
                                        <Image
                                            src={user.googlePhotoURL}
                                            alt="Google Profile"
                                            fill
                                            className="object-cover"
                                            sizes="64px"
                                        />
                                        {/* Google Icon Badge */}
                                        <div className="absolute bottom-0 right-0 bg-white rounded-full p-0.5 shadow-sm">
                                            <Image src="https://authjs.dev/img/providers/google.svg" width={12} height={12} alt="G" />
                                        </div>
                                    </button>
                                )}
                                {AVAILABLE_AVATARS.map((avatarUrl, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleAvatarSelect(avatarUrl)}
                                        className={`relative w-16 h-16 rounded-full overflow-hidden border-2 transition-all hover:scale-110 focus:outline-none ${selectedAvatar === avatarUrl ? 'border-orange-500 ring-2 ring-orange-200 scale-110' : 'border-transparent hover:border-gray-300'}`}
                                    >
                                        <Image
                                            src={avatarUrl}
                                            alt={`Avatar option ${index + 1}`}
                                            fill
                                            className="object-cover"
                                            sizes="64px"
                                        />
                                    </button>
                                ))}
                                {/* Option to clear avatar */}
                                <button
                                    onClick={() => handleAvatarSelect('')}
                                    className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:border-gray-400 focus:outline-none transition-colors bg-white"
                                    title="Sin foto"
                                >
                                    <span className="text-xs font-medium">Reset</span>
                                </button>
                            </div>
                        </div>

                        {/* Profile Form */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Nombre Completo
                                </label>
                                <input
                                    type="text"
                                    value={displayName}
                                    onChange={(e) => setDisplayName(e.target.value)}
                                    // Removed disabled={!isEditing}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Correo Electrónico
                                </label>
                                <input
                                    type="email"
                                    value={user.email}
                                    disabled
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-100 text-gray-500 cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Teléfono
                                </label>
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        // Only allow numbers
                                        if (/^\d*$/.test(value)) {
                                            setPhoneNumber(value);
                                            setPhoneError(''); // Clear error on change
                                        }
                                    }}
                                    placeholder="Agrega tu número de teléfono"
                                    className={`w-full px-4 py-2 rounded-lg border focus:ring-2 focus:border-transparent transition-colors ${phoneError
                                        ? 'border-red-300 focus:ring-red-500'
                                        : 'border-gray-300 focus:ring-orange-500'
                                        }`}
                                />
                                {phoneError && (
                                    <p className="mt-1 text-sm text-red-600">
                                        {phoneError}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Save Button */}
                        <div className="mt-8 flex justify-end">
                            <button
                                onClick={handleSaveProfile}
                                disabled={!hasChanges}
                                className={`px-6 py-2 rounded-full font-bold transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 ${hasChanges
                                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                                    : 'bg-gray-300 text-gray-500 cursor-not-allowed transform-none shadow-none'
                                    }`}
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
