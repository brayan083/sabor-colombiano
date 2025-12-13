import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Registro - Sabor Colombiano',
  description: 'Crea tu cuenta',
};

const Register: React.FC = () => {
    return (
        <div className="flex min-h-screen w-full flex-col font-body bg-background-light">
            <div className="flex flex-1 justify-center">
                <div className="flex w-full flex-1">
                    <div className="grid w-full grid-cols-1 lg:grid-cols-2">
                        <div className="relative hidden h-full w-full flex-col items-center justify-center bg-slate-900 lg:flex">
                            <div className="w-full h-full bg-center bg-no-repeat bg-cover" style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDQZEVf4CNyGZvcHHQzu5azjA4X8qZ4nYI_EUQ1hJmKx4sgrxnOzZv5XMldBhqlZ_xUDWC0_b8ytt7ahlezS6kxo8YUZFBZQJLroOAG8tHd1xAOdE4S44Ta-TEUfzhJTI8SlxV8mfMabPpesxwayNJexTXofqq7RRpVVXlBcxNFESO0w4hn9a1Ms1fJBkQ-o3j8Wt-hd_TgYn8X3B-EoSpGTPIa_BEu6AvvH__8vSV3WkZmfkXOutWiS6aDQaEFSrL0hIXduvNYA4M")' }}></div>
                        </div>
                        <div className="flex w-full items-center justify-center bg-white p-6 sm:p-8 lg:p-12">
                            <div className="flex w-full max-w-md flex-col items-center gap-8">
                                <div className="flex w-full flex-col items-center gap-4 text-center">
                                    <h1 className="text-slate-900 text-3xl font-black leading-tight tracking-[-0.033em] sm:text-4xl">Crea tu Cuenta</h1>
                                    <h2 className="text-slate-500 text-base font-normal leading-normal">Únete para disfrutar de los mejores sabores de Colombia.</h2>
                                </div>
                                <div className="w-full">
                                    <button className="flex w-full min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-slate-100 text-slate-900 text-base font-bold leading-normal gap-2 hover:bg-slate-200">
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.578 12.245c0-.82-.07-1.62-.205-2.39H12.24v4.51h5.803c-.25 1.46-1.02 2.7-2.295 3.55v2.92h3.75c2.19-2.02 3.44-5.01 3.44-8.59z" fill="#4285F4"></path><path d="M12.24 23c3.24 0 5.95-1.08 7.93-2.91l-3.75-2.92c-1.08.73-2.45 1.16-4.18 1.16-3.22 0-5.96-2.17-6.94-5.08H1.5v3.01C3.47 20.21 7.55 23 12.24 23z" fill="#34A853"></path><path d="M5.3 13.89c-.21-.63-.33-1.3-.33-2s.12-1.37.33-2V6.88H1.5C.56 8.84 0 10.86 0 13s.56 4.16 1.5 6.12l3.8-3.23z" fill="#FBBC05"></path><path d="M12.24 4.62c1.75 0 3.32.61 4.57 1.79l3.32-3.32C18.18.99 15.47 0 12.24 0 7.55 0 3.47 2.79 1.5 6.88l3.8 3.01c.98-2.91 3.72-5.08 6.94-5.08z" fill="#EA4335"></path></svg>
                                        <span className="truncate">Registrarse con Google</span>
                                    </button>
                                </div>
                                <div className="flex w-full items-center gap-4">
                                    <div className="h-px flex-1 bg-gray-200"></div>
                                    <p className="text-slate-500 text-sm font-normal leading-normal">O</p>
                                    <div className="h-px flex-1 bg-gray-200"></div>
                                </div>
                                <div className="w-full flex flex-col gap-4">
                                    <label className="flex flex-col w-full">
                                        <p className="text-slate-900 text-base font-medium leading-normal pb-2">Nombre Completo</p>
                                        <input className="rounded-lg border border-gray-300 h-14 px-4 focus:ring-primary-admin/20 focus:border-primary-admin" placeholder="Ingresa tu nombre completo" />
                                    </label>
                                    <label className="flex flex-col w-full">
                                        <p className="text-slate-900 text-base font-medium leading-normal pb-2">Correo Electrónico</p>
                                        <input className="rounded-lg border border-gray-300 h-14 px-4 focus:ring-primary-admin/20 focus:border-primary-admin" placeholder="tu.correo@ejemplo.com" type="email" />
                                    </label>
                                    <label className="flex flex-col w-full">
                                        <p className="text-slate-900 text-base font-medium leading-normal pb-2">Contraseña</p>
                                        <div className="flex w-full flex-1 items-stretch relative">
                                            <input className="rounded-lg border border-gray-300 h-14 px-4 w-full focus:ring-primary-admin/20 focus:border-primary-admin" placeholder="Crea una contraseña segura" type="password" />
                                            <button className="absolute right-0 top-0 h-14 px-4 text-slate-500">
                                                <span className="material-symbols-outlined">visibility</span>
                                            </button>
                                        </div>
                                    </label>
                                </div>
                                <div className="w-full">
                                    <button className="flex w-full min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-5 bg-primary-admin text-white text-base font-bold leading-normal hover:bg-primary-admin/90 transition-colors">
                                        <span className="truncate">Crear Cuenta</span>
                                    </button>
                                </div>
                                <div className="flex flex-col items-center gap-2 text-center">
                                    <p className="text-xs text-slate-500">Al registrarte, aceptas nuestros <a className="font-medium text-primary-admin hover:underline" href="#">Términos de Servicio</a> y <a className="font-medium text-primary-admin hover:underline" href="#">Política de Privacidad</a>.</p>
                                    <p className="text-sm text-slate-900">¿Ya tienes una cuenta? <Link className="font-bold text-primary-admin hover:underline" href="/login">Inicia Sesión</Link></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
