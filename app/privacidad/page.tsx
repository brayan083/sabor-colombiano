import React from 'react';

export default function PrivacidadPage() {
    return (
        <div className="bg-white text-slate-900 font-sans">
            <div className="max-w-4xl mx-auto px-6 py-12 lg:px-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-8">
                    Política de Privacidad
                </h1>

                <div className="prose prose-slate max-w-none">
                    <p className="lead text-lg text-slate-600 mb-6">
                        En Empalombia, valoramos tu privacidad y estamos comprometidos a proteger tu información personal. Esta política describe cómo recopilamos, usamos y compartimos tu información.
                    </p>

                    <h2 className="text-xl font-semibold mt-8 mb-4">1. Información que recopilamos</h2>
                    <p>
                        Recopilamos información que nos proporcionas directamente, como cuando creas una cuenta, realizas un pedido, te suscribes a nuestro boletín o te pones en contacto con nosotros.
                        Esta información puede incluir tu nombre, dirección de correo electrónico, dirección postal, número de teléfono y detalles de pago.
                    </p>

                    <h2 className="text-xl font-semibold mt-8 mb-4">2. Cómo usamos tu información</h2>
                    <p>
                        Usamos la información que recopilamos para procesar tus pedidos, comunicarnos contigo, mejorar nuestros servicios y personalizar tu experiencia de compra.
                        También podemos usar tu información para enviarte correos electrónicos promocionales, si has optado por recibirlos.
                    </p>

                    <h2 className="text-xl font-semibold mt-8 mb-4">3. Compartir tu información</h2>
                    <p>
                        No vendemos ni alquilamos tu información personal a terceros. Podemos compartir tu información con proveedores de servicios que nos ayudan a operar nuestro sitio web y procesar tus pedidos,
                        siempre que estos terceros acuerden mantener esta información confidencial.
                    </p>

                    <h2 className="text-xl font-semibold mt-8 mb-4">4. Seguridad de tus datos</h2>
                    <p>
                        Tomamos medidas razonables para proteger tu información personal contra pérdida, robo y uso no autorizado, divulgación o modificación.
                        Sin embargo, ten en cuenta que ninguna transmisión de datos a través de Internet o almacenamiento electrónico es 100% segura.
                    </p>

                    <h2 className="text-xl font-semibold mt-8 mb-4">5. Cookies</h2>
                    <p>
                        Utilizamos cookies para mejorar tu experiencia en nuestro sitio web. Las cookies son pequeños archivos de datos que se almacenan en tu dispositivo cuando visitas un sitio web.
                        Puedes configurar tu navegador para rechazar todas las cookies o para que te avise cuando se envíe una cookie.
                    </p>

                    <h2 className="text-xl font-semibold mt-8 mb-4">6. Tus derechos</h2>
                    <p>
                        Tienes derecho a acceder, corregir o eliminar tu información personal que tenemos en nuestro poder. Si deseas ejercer estos derechos, por favor contáctanos a través de la información proporcionada a continuación.
                    </p>

                    <h2 className="text-xl font-semibold mt-8 mb-4">7. Contacto</h2>
                    <p>
                        Si tienes alguna pregunta sobre esta Política de Privacidad, por favor contáctanos en contacto@empalombia.com.
                    </p>
                </div>
            </div>
        </div>
    );
}
