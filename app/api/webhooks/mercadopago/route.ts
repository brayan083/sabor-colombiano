import { NextRequest, NextResponse } from 'next/server';
import { createOrder } from '@/lib/services/orders';
import { Order, OrderItem } from '@/types';

// Mercado Pago webhook endpoint
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        console.log('🔔 Webhook received from Mercado Pago:', JSON.stringify(body, null, 2));

        // Mercado Pago sends different types of notifications
        // We're interested in 'payment' notifications
        if (body.type === 'payment') {
            const paymentId = body.data?.id;

            if (!paymentId) {
                console.error('❌ No payment ID in webhook');
                return NextResponse.json({ error: 'No payment ID' }, { status: 400 });
            }

            console.log('💳 Payment ID:', paymentId);

            // Get payment details from Mercado Pago
            const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;

            if (!accessToken) {
                console.error('❌ MERCADOPAGO_ACCESS_TOKEN not configured');
                return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
            }

            // Fetch payment details
            const paymentResponse = await fetch(
                `https://api.mercadopago.com/v1/payments/${paymentId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                }
            );

            if (!paymentResponse.ok) {
                console.error('❌ Failed to fetch payment details');
                return NextResponse.json({ error: 'Failed to fetch payment' }, { status: 500 });
            }

            const payment = await paymentResponse.json();

            console.log('💰 Payment status:', payment.status);
            console.log('📋 External reference:', payment.external_reference);

            // Only process approved payments
            if (payment.status === 'approved') {
                // Get metadata from payment
                const metadata = payment.metadata || {};
                const userId = metadata.user_id || payment.external_reference;

                if (!userId) {
                    console.error('❌ No user ID in metadata or external reference');
                    return NextResponse.json({ error: 'No user ID' }, { status: 400 });
                }

                // Check if this is for an existing order
                const isExistingOrder = metadata.is_existing_order === true;
                const existingOrderId = metadata.order_id || payment.external_reference;

                if (isExistingOrder && existingOrderId) {
                    console.log('🔄 Updating existing order:', existingOrderId);

                    // Import the update function
                    const { updateOrderPayment } = await import('@/lib/services/orders');

                    try {
                        await updateOrderPayment(existingOrderId, paymentId, payment.status);

                        console.log('✅ Order updated successfully:', existingOrderId);

                        return NextResponse.json({
                            success: true,
                            orderId: existingOrderId,
                            message: 'Order updated successfully'
                        });
                    } catch (error) {
                        console.error('❌ Error updating order:', error);
                        return NextResponse.json({
                            error: 'Error updating order',
                            details: error instanceof Error ? error.message : 'Unknown error'
                        }, { status: 500 });
                    }
                }

                // Extract order items from payment
                const orderItems: OrderItem[] = payment.additional_info?.items?.map((item: any) => ({
                    productId: item.id,
                    name: item.title,
                    price: item.unit_price,
                    quantity: item.quantity,
                    image: item.picture_url || ''
                })) || [];

                // Get delivery method and shipping info from metadata
                const deliveryMethod = metadata.delivery_method || 'delivery';
                const shippingAddress = metadata.shipping_address;

                // Create order in Firebase
                const baseOrder = {
                    userId: userId,
                    items: orderItems,
                    total: payment.transaction_amount,
                    status: 'paid' as const, // Mark as paid since payment is approved
                    deliveryMethod: deliveryMethod as 'pickup' | 'delivery',
                    paymentMethod: 'mercado_pago' as const,
                    customerName: metadata.customer_name || 'Cliente',
                    customerPhone: metadata.customer_phone || '',
                    orderNotes: metadata.order_notes || `Pago procesado por Mercado Pago. Payment ID: ${paymentId}`,
                    deliveryTimeSlot: metadata.delivery_time_slot || '',
                    deliveryDate: metadata.delivery_date || '',
                    createdAt: Date.now(),
                    mercadoPagoPaymentId: paymentId,
                    mercadoPagoStatus: payment.status
                };

                // Add shipping address if delivery
                const newOrder: Omit<Order, 'id'> = deliveryMethod === 'delivery' && shippingAddress
                    ? {
                        ...baseOrder,
                        shippingAddress: {
                            street: shippingAddress.street,
                            city: shippingAddress.city,
                            state: '',
                            zip: shippingAddress.zip
                        }
                    }
                    : baseOrder;

                console.log('📦 Creating order:', JSON.stringify(newOrder, null, 2));

                const orderId = await createOrder(newOrder);

                console.log('✅ Order created successfully:', orderId);

                return NextResponse.json({
                    success: true,
                    orderId,
                    message: 'Order created successfully'
                });
            } else {
                console.log('⏳ Payment not approved yet, status:', payment.status);
                return NextResponse.json({
                    success: true,
                    message: 'Payment received but not approved yet'
                });
            }
        }

        // For other notification types, just acknowledge
        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('❌ Error processing webhook:', error);
        return NextResponse.json({
            error: 'Error processing webhook',
            details: error.message
        }, { status: 500 });
    }
}

// GET endpoint to verify webhook is working
export async function GET() {
    return NextResponse.json({
        status: 'Webhook endpoint is active',
        timestamp: new Date().toISOString()
    });
}
