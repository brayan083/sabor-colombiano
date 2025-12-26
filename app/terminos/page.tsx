import React from 'react';

export default function TerminosPage() {
    return (
        <div className="bg-white text-slate-900 font-sans">
            <div className="max-w-4xl mx-auto px-6 py-12 lg:px-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-8">
                    Términos y Condiciones
                </h1>

                <div className="prose prose-slate max-w-none">
                    <p className="lead text-lg text-slate-600 mb-6">
                        Bienvenido a Empalombia. Al acceder y utilizar nuestro sitio web, aceptas cumplir los siguientes términos y condiciones.
                    </p>

                    <h2 className="text-xl font-semibold mt-8 mb-4">1. Uso del sitio</h2>
                    <p>
                        Al utilizar este sitio web, declaras que tienes al menos 18 años de edad o que estás visitando el sitio bajo la supervisión de un padre o tutor legal.
                        Te concedemos una licencia no transferible y revocable para utilizar el sitio, bajo los términos y condiciones descritos,
                        con el propósito de la compra de artículos personales vendidos en el sitio.
                    </p>

                    <h2 className="text-xl font-semibold mt-8 mb-4">2. Contenido del usuario</h2>
                    <p>
                        Cualquier cosa que envíes al sitio y/o nos proporciones, incluyendo pero no limitado a, preguntas, críticas, comentarios y sugerencias
                        (colectivamente, "Envíos") se convertirá en nuestra única y exclusiva propiedad y no te será devuelta.
                    </p>

                    <h2 className="text-xl font-semibold mt-8 mb-4">3. Aceptación de pedidos y precios</h2>
                    <p>
                        Ten en cuenta que puede haber ciertos pedidos que no podamos aceptar y debamos cancelar. Nos reservamos el derecho, a nuestra sola discreción,
                        de rechazar o cancelar cualquier pedido por cualquier motivo.
                    </p>

                    <h2 className="text-xl font-semibold mt-8 mb-4">4. Marcas comerciales y derechos de autor</h2>
                    <p>
                        Todos los derechos de propiedad intelectual, ya sean registrados o no registrados, en el sitio, el contenido de información en el sitio y
                        todo el diseño del sitio web, incluyendo, pero no limitado a, texto, gráficos, software, fotos, video, música, sonido, y su selección y disposición,
                        seguirán siendo de nuestra propiedad.
                    </p>

                    <h2 className="text-xl font-semibold mt-8 mb-4">5. Terminación</h2>
                    <p>
                        Además de cualquier otro remedio legal o equitativo, podemos, sin previo aviso, terminar inmediatamente el Acuerdo o revocar cualquiera o todos tus derechos
                        concedidos bajo este Acuerdo.
                    </p>

                    <h2 className="text-xl font-semibold mt-8 mb-4">6. Ley aplicable</h2>
                    <p>
                        Estos Términos de Servicio y cualquier acuerdo separado por el cual te proporcionemos servicios se regirán e interpretarán de acuerdo con las leyes de Colombia.
                    </p>

                    <h2 className="text-xl font-semibold mt-8 mb-4">7. Cambios en los términos</h2>
                    <p>
                        Puedes revisar la versión más actual de los Términos de Servicio en cualquier momento en esta página.
                        Nos reservamos el derecho, a nuestra sola discreción, de actualizar, cambiar o reemplazar cualquier parte de estos Términos de Servicio mediante la publicación de actualizaciones y cambios en nuestro sitio web.
                    </p>
                </div>
            </div>
        </div>
    );
}
