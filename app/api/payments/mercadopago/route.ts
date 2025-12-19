
import { NextRequest, NextResponse } from 'next/server';
import MercadoPagoConfig, { Preference } from 'mercadopago';

const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// Validate configuration
if (!accessToken) {
    console.error('❌ MERCADOPAGO_ACCESS_TOKEN is not configured in environment variables');
}

const client = new MercadoPagoConfig({ accessToken: accessToken || '' });

export async function POST(req: NextRequest) {
    try {
        // Validate access token
        if (!accessToken) {
            return NextResponse.json({
                error: 'Mercado Pago no está configurado. Por favor contacta al administrador.'
            }, { status: 500 });
        }

        const body = await req.json();
        const { items, payer } = body;

        console.log('🔄 Creating Mercado Pago preference...');
        console.log('📍 Base URL:', baseUrl);

        const preference = new Preference(client);

        // Construct preference data according to Mercado Pago API specs
        const preferenceData: any = {
            items: items.map((item: any) => ({
                id: item.id,
                title: item.name,
                description: item.description || item.name,
                quantity: item.quantity,
                unit_price: Number(item.price),
                currency_id: 'ARS' // Cambiar a ARS si tu cuenta es de Argentina
            })),
            payer: {
                name: payer.firstName || 'Cliente',
                surname: payer.lastName || 'Empalombia',
                email: payer.email || 'cliente@empalombia.com',
                phone: {
                    area_code: '57',
                    number: String(payer.phone || '3001234567')
                }
            },
            back_urls: {
                success: `${baseUrl}/checkout/success`,
                failure: `${baseUrl}/checkout`,
                pending: `${baseUrl}/checkout`
            },
            auto_return: 'approved',
            notification_url: `${baseUrl}/api/webhooks/mercadopago`,
            statement_descriptor: 'EMPALOMBIA',
            external_reference: payer.id || `order_${Date.now()}`
        };

        // Only add address if delivery method is delivery
        if (payer.address && payer.deliveryMethod === 'delivery') {
            preferenceData.payer.address = {
                street_name: payer.address,
                zip_code: payer.postalCode || '110111'
            };
        }

        // Add metadata with complete order information for webhook
        preferenceData.metadata = {
            user_id: payer.id,
            delivery_method: payer.deliveryMethod || 'delivery',
            customer_name: `${payer.firstName} ${payer.lastName}`,
            customer_phone: payer.phone,
            order_notes: payer.orderNotes || '',
            shipping_address: payer.deliveryMethod === 'delivery' ? {
                street: payer.address,
                city: payer.locality,
                zip: payer.postalCode
            } : null
        };

        console.log('📦 Preference data:', JSON.stringify(preferenceData, null, 2));

        const response = await preference.create({
            body: preferenceData
        });

        console.log('✅ Preference created successfully:', response.id);
        console.log('🔗 Init point:', response.init_point);

        return NextResponse.json({
            init_point: response.init_point,
            id: response.id
        });
    } catch (error: any) {
        console.error("❌ Error creating Mercado Pago preference:", error);
        console.error("Error details:", JSON.stringify(error, null, 2));

        // Better error message
        const errorMessage = error.message || error.error || 'Error al procesar el pago';

        return NextResponse.json({
            error: `No se pudo iniciar el pago: ${errorMessage}`
        }, { status: 500 });
    }
}
