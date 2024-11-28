import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { orderId, userEmail, amount, paypalEmail } = await req.json();

    // Validate the payment amount
    if (amount !== 249) {
      return NextResponse.json({ error: 'Invalid payment amount' }, { status: 400 });
    }

    // Store payment info in local storage for now
    // In production, you'd want to store this in a database
    const paymentInfo = {
      orderId,
      userEmail,
      amount,
      paypalEmail,
      timestamp: new Date().toISOString(),
      status: 'completed'
    };

    // You can add database storage here later
    // For now, we'll just return success
    return NextResponse.json({ 
      success: true,
      message: 'Payment confirmed',
      paymentInfo 
    });

  } catch (error: any) {
    console.error('Payment confirmation error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
