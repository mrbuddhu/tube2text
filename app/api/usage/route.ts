import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

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
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const usage = getUserUsage(session.user.email);
  return NextResponse.json(usage);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const usage = incrementUsage(session.user.email);
  if (!usage.allowed) {
    return NextResponse.json(
      { error: 'Usage limit exceeded. Please upgrade your plan.' },
      { status: 429 }
    );
  }

  return NextResponse.json(usage);
}

function getUserUsage(email: string) {
  let usage = userUsage.get(email);
  
  // Initialize new users with free plan
  if (!usage) {
    usage = {
      count: 0,
      plan: 'free',
      lastReset: new Date()
    };
    userUsage.set(email, usage);
  }

  // Reset monthly usage
  const now = new Date();
  if (now.getMonth() !== usage.lastReset.getMonth()) {
    usage.count = 0;
    usage.lastReset = now;
    userUsage.set(email, usage);
  }

  const limit = LIMITS[usage.plan];
  return {
    used: usage.count,
    limit,
    remaining: Math.max(0, limit - usage.count),
    plan: usage.plan,
    allowed: usage.count < limit
  };
}

function incrementUsage(email: string) {
  const usage = getUserUsage(email);
  if (usage.allowed) {
    const userData = userUsage.get(email)!;
    userData.count++;
    userUsage.set(email, userData);
    return { ...usage, used: userData.count };
  }
  return usage;
}
