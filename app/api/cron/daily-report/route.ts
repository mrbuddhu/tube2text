import { NextResponse } from 'next/server';
import { sendDailyReport } from '@/lib/email';

// This endpoint should be called by a cron job (e.g., using Vercel Cron)
export async function GET() {
  try {
    await sendDailyReport();
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending daily report:', error);
    return NextResponse.json({ error: 'Failed to send daily report' }, { status: 500 });
  }
}
