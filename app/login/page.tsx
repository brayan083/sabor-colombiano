import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Iniciar Sesión - Empalombia',
    description: 'Accede a tu cuenta',
};

const Login: React.FC = () => {
    return (
        <div className="flex min-h-screen w-full flex-col font-body bg-background-light">
            <div className="flex flex-1 justify-center items-center p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col w-full max-w-6xl">
                    <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[80vh] bg-white shadow-xl rounded-xl overflow-hidden">
                        <div className="hidden lg:block relative">
                            <Image
                                fill
                                className="object-cover"
                                alt="Plato de comida colombiana"
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAHpiXl42Oog67HBR2rRYBaHRk9g1X6uJsfXR1PPPm8j6YDCfT6YpLNzONxb1J4xO1nHZdzXa-NBsgCeMRwJTKyO9AlECYiJND0qHczAL4WMYMFJmV1MmchWRcfxeT8IQ8wsVX8zLtdQSP4o8nVrfBk91PT1eAG6wk3HV9l0PYxGNGUKEjdyFqkK-tI-d2bdymPu6lbvLN0EGucA41zVIBRCGCL_2vGFrCrbwZw2hCxN9IQftgAWRgy0cmaLLwpRAEFXrUK7ldzD7E"
                            />
                        </div>
                        <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-16">
                            <Link href="/" className="flex items-center gap-4 mb-8">
                                <div className="relative size-10">
                                    <Image src="/img/logo2.png" fill alt="Empalombia" className="object-contain" />
                                </div>
                                <h2 className="text-slate-900 text-xl font-bold leading-tight tracking-[-0.015em]">Empalombia</h2>
                            </Link>
                            <h1 className="text-slate-900 tracking-tight text-[32px] font-bold leading-tight pb-2">Iniciar Sesión</h1>
                            <p className="text-slate-500 text-base font-normal leading-normal mb-8">Bienvenido de nuevo, por favor ingresa tus datos.</p>
                            <form className="flex flex-col gap-5">
                                <label className="flex flex-col min-w-40 flex-1">
                                    <p className="text-slate-900 text-sm font-medium leading-normal pb-2">Correo Electrónico</p>
                                    <input className="rounded-lg border border-gray-300 h-12 px-4 focus:ring-primary-admin/20 focus:border-primary-admin" placeholder="tu@correo.com" type="email" />
                                </label>
                                <label className="flex flex-col min-w-40 flex-1">
                                    <p className="text-slate-900 text-sm font-medium leading-normal pb-2">Contraseña</p>
                                    <input className="rounded-lg border border-gray-300 h-12 px-4 focus:ring-primary-admin/20 focus:border-primary-admin" placeholder="••••••••••" type="password" />
                                </label>
                                <a className="text-primary-admin text-sm font-medium leading-normal text-right -mt-2 hover:underline" href="#">Olvidé mi contraseña</a>
                                <button className="w-full bg-primary-admin text-white font-semibold py-3 px-4 rounded-lg hover:bg-primary-admin/90 transition-colors mt-4" type="submit">Iniciar Sesión</button>
                                <div className="flex items-center gap-4 my-2">
                                    <hr className="w-full border-t border-gray-200" />
                                    <span className="text-xs text-gray-500">o</span>
                                    <hr className="w-full border-t border-gray-200" />
                                </div>
                                <button className="w-full flex items-center justify-center gap-2 bg-white text-slate-900 font-medium py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors" type="button">
                                    <svg className="h-5 w-5" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"></path><path d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"></path><path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.223 0-9.657-3.356-11.303-7.962l-6.571 4.819C9.656 39.663 16.318 44 24 44z" fill="#4CAF50"></path><path d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C44.438 36.372 48 30.656 48 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"></path></svg>
                                    Iniciar sesión con Google
                                </button>
                                <p className="text-sm text-center text-slate-500 mt-6">
                                    ¿No tienes una cuenta? <Link className="font-semibold text-primary-admin hover:underline" href="/register">Crear una</Link>
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
