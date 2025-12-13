import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="bg-black/5 py-12 px-4 sm:px-10 lg:px-20 mt-auto">
            <div className="mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-2">
                    <h3 className="text-lg font-bold text-slate-900 mb-2">Sabor Colombiano</h3>
                    <p className="text-sm text-slate-600">Llevando el auténtico sabor de Colombia a tu hogar con ingredientes frescos y recetas tradicionales.</p>
                </div>
                <div>
                    <h4 className="font-semibold text-slate-800 mb-3">Enlaces</h4>
                    <ul className="space-y-2">
                        <li><a className="text-sm text-slate-600 hover:text-primary" href="#">Términos y Condiciones</a></li>
                        <li><a className="text-sm text-slate-600 hover:text-primary" href="#">Política de Privacidad</a></li>
                        <li><a className="text-sm text-slate-600 hover:text-primary" href="#">Preguntas Frecuentes</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold text-slate-800 mb-3">Contacto</h4>
                    <ul className="space-y-2 text-sm text-slate-600">
                        <li>Calle Falsa 123, Bogotá</li>
                        <li>(555) 123-4567</li>
                        <li>contacto@saborcolombiano.com</li>
                    </ul>
                </div>
            </div>
            <div className="mt-8 pt-8 border-t border-black/10 text-center text-sm text-slate-500">
                <p>© 2024 Sabor Colombiano. Todos los derechos reservados.</p>
            </div>
        </footer>
    );
};

export default Footer;