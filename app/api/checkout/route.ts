import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const prices = {
  basic: {
    credits: 10,
    priceId: process.env.STRIPE_BASIC_PRICE_ID,
  },
  pro: {
    credits: 50,
    priceId: process.env.STRIPE_PRO_PRICE_ID,
  },
  enterprise: {
    credits: 200,
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID,
  },
};

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan, mode = 'payment' } = await request.json();
    const price = prices[plan as keyof typeof prices];

    if (!price) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      client_reference_id: userId,
      customer_email: auth().sessionClaims?.email as string,
      mode: mode as Stripe.Checkout.SessionCreateParams.Mode,
      payment_method_types: ['card'],
      line_items: [
        {
          price: price.priceId,
          quantity: 1,
        },
      ],
      metadata: {
        credits: price.credits.toString(),
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
