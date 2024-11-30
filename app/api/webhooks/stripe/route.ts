import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { supabase } from '@/lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      console.error('Webhook signature verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const { credits } = session.metadata as { credits: string };

        if (!userId) {
          throw new Error('No user ID in session');
        }

        // Update user credits
        const { error } = await supabase
          .from('users')
          .update({
            credits: supabase.sql`credits + ${parseInt(credits)}`,
          })
          .eq('id', userId);

        if (error) throw error;

        // Record the transaction
        await supabase.from('transactions').insert({
          user_id: userId,
          amount: session.amount_total! / 100, // Convert from cents
          credits: parseInt(credits),
          stripe_session_id: session.id,
          status: 'completed',
        });

        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.userId;

        if (!userId) {
          throw new Error('No user ID in subscription');
        }

        // Update user subscription status
        const { error } = await supabase
          .from('users')
          .update({
            stripe_subscription_id: subscription.id,
            subscription_status: subscription.status,
            subscription_plan: subscription.items.data[0].price.lookup_key,
            subscription_current_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
          })
          .eq('id', userId);

        if (error) throw error;
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const userId = subscription.metadata.userId;

        if (!userId) {
          throw new Error('No user ID in subscription');
        }

        // Update user subscription status
        const { error } = await supabase
          .from('users')
          .update({
            subscription_status: 'canceled',
            subscription_current_period_end: new Date(
              subscription.current_period_end * 1000
            ).toISOString(),
          })
          .eq('id', userId);

        if (error) throw error;
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
