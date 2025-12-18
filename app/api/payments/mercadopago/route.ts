
import { NextRequest, NextResponse } from 'next/server';
import MercadoPagoConfig, { Preference } from 'mercadopago';

const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '' });

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { items, payer } = body;

        const preference = new Preference(client);

        const response = await preference.create({
            body: {
                items: items.map((item: any) => ({
                    title: item.name,
                    quantity: item.quantity,
                    unit_price: item.price,
                    currency_id: 'COP',
                    picture_url: item.image
                })),
                payer: {
                    name: payer.firstName,
                    surname: payer.lastName,
                    email: payer.email || 'test_user@test.com', // Fallback for testing if email missing
                    phone: {
                        area_code: '57', // Colombia
                        number: payer.phone
                    },
                    address: {
                        street_name: payer.address || 'Calle 123',
                        zip_code: payer.postalCode
                    }
                },
                back_urls: {
                    success: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout/success`,
                    failure: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout?error=payment_failed`,
                    pending: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout?status=pending`
                },
                auto_return: 'approved',
                statement_descriptor: 'EMPALOMBIA',
                external_reference: payer.id // Could send order ID here ideally
            }
        });

        return NextResponse.json({ init_point: response.init_point, id: response.id });
    } catch (error) {
        console.error("Error creating Mercado Pago preference:", error);
        return NextResponse.json({ error: 'Error processing payment' }, { status: 500 });
    }
}
