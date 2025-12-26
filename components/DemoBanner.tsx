import React from 'react';

const DemoBanner = () => {
    return (
        <div className="bg-yellow-400 text-yellow-900 px-4 py-2 text-center text-sm font-bold border-b border-yellow-500 shadow-sm relative z-50">
            <p>
                🚧 Esta web es una demo. Funciona todo correctamente y se pueden realizar pedidos/pagos,
                pero <span className="underline decoration-yellow-700/50">no se tomarán los precios que hay en la actualidad</span>.
                <span className="block sm:inline sm:ml-2">📞 Pedidos también al WhatsApp: <strong>+54 11-7363-8905</strong></span>
            </p>
        </div>
    );
};

export default DemoBanner;
