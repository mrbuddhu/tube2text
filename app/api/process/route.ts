import { NextRequest, NextResponse } from 'next/server';
import { processVideo } from '@/app/utils/videoProcessing';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

// Rate limiting map
const userRequests = new Map<string, { count: number; resetTime: number }>();
const FREE_TIER_LIMIT = 5; // 5 requests per day
const RESET_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = userRequests.get(userId);

  if (!userLimit || now > userLimit.resetTime) {
    // Reset or initialize rate limit
    userRequests.set(userId, {
      count: 1,
      resetTime: now + RESET_INTERVAL,
    });
    return true;
  }

  if (userLimit.count >= FREE_TIER_LIMIT) {
    return false;
  }

  // Increment request count
  userLimit.count += 1;
  userRequests.set(userId, userLimit);
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    if (!checkRateLimit(userId)) {
      return NextResponse.json(
        { error: 'Daily limit reached. Please try again tomorrow.' },
        { status: 429 }
      );
    }

    const { url } = await req.json();
    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    const result = await processVideo(url);
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Video processing error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process video' },
      { status: 500 }
    );
  }
}
