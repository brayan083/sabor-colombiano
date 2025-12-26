import React from 'react';
import Link from 'next/link';

const Footer: React.FC = () => {
    return (
        <footer className="bg-black/5 py-8 px-4 sm:px-10 lg:px-20 mt-auto">
            <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="md:col-span-2">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Empalombia</h3>
                    <p className="text-sm text-slate-600">Llevando el auténtico sabor de Colombia a tu hogar con ingredientes frescos y recetas tradicionales.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-slate-800 mb-2">Enlaces</h4>
                    <ul className="space-y-1">
                        <li><Link className="text-sm text-slate-600 hover:text-primary" href="/terminos">Términos y Condiciones</Link></li>
                        <li><Link className="text-sm text-slate-600 hover:text-primary" href="/privacidad">Política de Privacidad</Link></li>
                        <li><Link className="text-sm text-slate-600 hover:text-primary" href="/preguntas-frecuentes">Preguntas Frecuentes</Link></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold text-slate-800 mb-2">Contacto</h4>
                    <ul className="space-y-1 text-sm text-slate-600">
                        <li>+54 11-7363-8905</li>
                        <li>zorrobrayan0@gmail.com</li>
                    </ul>
                </div>
            </div>
            <div className="mt-6 pt-6 border-t border-black/10 text-center text-sm text-slate-500">
                <p>© 2024 Empalombia. Todos los derechos reservados.</p>
            </div>
        </footer>
    );
};

export default Footer;