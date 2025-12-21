import { NextRequest, NextResponse } from 'next/server';
import MercadoPagoConfig, { Preference } from 'mercadopago';
import { getOrderById } from '@/lib/services/orders';

const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

if (!accessToken) {
    console.error('❌ MERCADOPAGO_ACCESS_TOKEN is not configured in environment variables');
}

const client = new MercadoPagoConfig({ accessToken: accessToken || '' });

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ orderId: string }> }
) {
    try {
        // Validate access token
        if (!accessToken) {
            return NextResponse.json({
                error: 'Mercado Pago no está configurado. Por favor contacta al administrador.'
            }, { status: 500 });
        }

        const { orderId } = await params;

        // Get the existing order
        const order = await getOrderById(orderId);

        if (!order) {
            return NextResponse.json({
                error: 'Pedido no encontrado'
            }, { status: 404 });
        }

        // Only allow payment for pending orders
        if (order.status !== 'pending') {
            return NextResponse.json({
                error: 'Este pedido ya fue procesado o cancelado'
            }, { status: 400 });
        }

        console.log('🔄 Creating Mercado Pago preference for existing order:', orderId);
        console.log('📍 Base URL:', baseUrl);

        const preference = new Preference(client);

        // Construct preference data from existing order
        const preferenceData: any = {
            items: order.items.map((item) => ({
                id: item.productId,
                title: item.name,
                description: item.name,
                quantity: item.quantity,
                unit_price: Number(item.price),
                currency_id: 'ARS',
                picture_url: item.image || ''
            })),
            payer: {
                name: order.customerName.split(' ')[0] || 'Cliente',
                surname: order.customerName.split(' ').slice(1).join(' ') || 'Empalombia',
                email: 'cliente@empalombia.com', // We don't have email in order
                phone: {
                    area_code: '57',
                    number: String(order.customerPhone || '3001234567')
                }
            },
            back_urls: {
                success: `${baseUrl}/checkout/success`,
                failure: `${baseUrl}/orders/${orderId}`,
                pending: `${baseUrl}/orders/${orderId}`
            },
            notification_url: `${baseUrl}/api/webhooks/mercadopago`,
            statement_descriptor: 'EMPALOMBIA',
            external_reference: orderId // Use order ID as reference
        };

        // Add shipping address if delivery
        if (order.deliveryMethod === 'delivery' && order.shippingAddress) {
            preferenceData.payer.address = {
                street_name: order.shippingAddress.street,
                zip_code: order.shippingAddress.zip || '110111'
            };
        }

        // Add metadata with order information
        preferenceData.metadata = {
            order_id: orderId,
            user_id: order.userId,
            delivery_method: order.deliveryMethod,
            customer_name: order.customerName,
            customer_phone: order.customerPhone,
            order_notes: order.orderNotes || '',
            is_existing_order: true, // Flag to indicate this is for an existing order
            shipping_address: order.deliveryMethod === 'delivery' && order.shippingAddress ? {
                street: order.shippingAddress.street,
                city: order.shippingAddress.city,
                zip: order.shippingAddress.zip
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

        const errorMessage = error.message || error.error || 'Error al procesar el pago';

        return NextResponse.json({
            error: `No se pudo iniciar el pago: ${errorMessage}`
        }, { status: 500 });
    }
}
