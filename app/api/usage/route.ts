import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';

// Simple in-memory usage tracking (replace with database in production)
const userUsage = new Map<string, {
  count: number;
  plan: 'free' | 'pro' | 'business';
  lastReset: Date;
}>();

const LIMITS = {
  free: 5,
  pro: 50,
  business: Infinity
};

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const usage = getUserUsage(session.user.id);
  return NextResponse.json(usage);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { plan } = await req.json();
    if (!plan || !LIMITS[plan as keyof typeof LIMITS]) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const usage = incrementUsage(session.user.id);
    return NextResponse.json(usage);
  } catch (error) {
    console.error('Error updating usage:', error);
    return NextResponse.json(
      { error: 'Failed to update usage' },
      { status: 500 }
    );
  }
}

function getUserUsage(userId: string) {
  const now = new Date();
  const userRecord = userUsage.get(userId);

  // If no record exists or it's a new day, create/reset the record
  if (!userRecord || isNewDay(userRecord.lastReset, now)) {
    const newRecord = {
      count: 0,
      plan: 'free' as const,
      lastReset: now
    };
    userUsage.set(userId, newRecord);
    return newRecord;
  }

  return userRecord;
}

function incrementUsage(userId: string) {
  const usage = getUserUsage(userId);
  if (usage.count < LIMITS[usage.plan]) {
    usage.count++;
    userUsage.set(userId, usage);
  }
  return usage;
}

function isNewDay(lastReset: Date, now: Date): boolean {
  return (
    lastReset.getFullYear() !== now.getFullYear() ||
    lastReset.getMonth() !== now.getMonth() ||
    lastReset.getDate() !== now.getDate()
  );
}
