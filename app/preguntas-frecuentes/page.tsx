import React from 'react';

export default function PreguntasFrecuentesPage() {
    const faqs = [
        {
            question: "¿Cómo puedo realizar un pedido?",
            answer: "Puedes realizar un pedido fácilmente a través de nuestro sitio web. Simplemente navega por nuestro catálogo, selecciona los productos que deseas y añádelos al carrito. Luego, sigue los pasos de pago para completar tu compra."
        },
        {
            question: "¿Cuáles son los métodos de pago aceptados?",
            answer: "Aceptamos varias formas de pago, incluyendo tarjetas de crédito/débito y pagos a través de Mercado Pago. Todas las transacciones son seguras y encriptadas."
        },
        {
            question: "¿Hacen envíos a todo el país?",
            answer: "Actualmente realizamos envíos en Bogotá y sus alrededores. Estamos trabajando para expandir nuestra cobertura a otras ciudades pronto."
        },
        {
            question: "¿Cuánto tarda en llegar mi pedido?",
            answer: "El tiempo de entrega depende de tu ubicación. Generalmente, los pedidos en Bogotá se entregan el mismo día o al día siguiente. Te proporcionaremos una estimación más precisa al momento de la compra."
        },
        {
            question: "¿Puedo cancelar o modificar mi pedido?",
            answer: "Si necesitas cancelar o modificar tu pedido, por favor contáctanos lo antes posible. Si el pedido aún no ha sido despachado, haremos todo lo posible para ayudarte."
        },
        {
            question: "¿Tienen opciones vegetarianas o veganas?",
            answer: "¡Sí! Ofrecemos opciones deliciosas para vegetarianos. Revisa la descripción de cada producto para ver los ingredientes."
        },
        {
            question: "¿Cómo puedo contactar con servicio al cliente?",
            answer: "Puedes contactarnos a través de nuestro correo electrónico contacto@empalombia.com o llamándonos al (555) 123-4567. Nuestro horario de atención es de lunes a viernes de 8:00 am a 6:00 pm."
        }
    ];

    return (
        <div className="bg-white text-slate-900 font-sans">
            <div className="max-w-4xl mx-auto px-6 py-12 lg:px-8">
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl mb-8">
                    Preguntas Frecuentes
                </h1>

                <div className="space-y-6">
                    {faqs.map((faq, index) => (
                        <div key={index} className="border-b border-black/10 pb-6 last:border-0">
                            <h3 className="text-lg font-semibold text-slate-900 mb-2">{faq.question}</h3>
                            <p className="text-slate-600">{faq.answer}</p>
                        </div>
                    ))}
                </div>

                <div className="mt-12 p-6 bg-slate-50 rounded-lg">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">¿No encuentras lo que buscas?</h3>
                    <p className="text-slate-600 mb-4">
                        Si tienes alguna otra pregunta, no dudes en ponerte en contacto con nosotros.
                    </p>
                    <ul className="text-sm text-slate-600 space-y-1">
                        <li>Email: contacto@empalombia.com</li>
                        <li>Teléfono: (555) 123-4567</li>
                    </ul>
                </div>

            </div>
        </div>
    );
}
