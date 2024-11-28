import { NextRequest, NextResponse } from 'next/server';

// In a real app, this would be in a database
let earlyBirdSpotsTaken = 0;
const TOTAL_SPOTS = 100;

export async function GET() {
  const spotsLeft = Math.max(0, TOTAL_SPOTS - earlyBirdSpotsTaken);
  return NextResponse.json({ spotsLeft });
}

export async function POST(req: NextRequest) {
  try {
    const { action } = await req.json();
    
    if (action === 'increment') {
      if (earlyBirdSpotsTaken < TOTAL_SPOTS) {
        earlyBirdSpotsTaken++;
        const spotsLeft = TOTAL_SPOTS - earlyBirdSpotsTaken;
        return NextResponse.json({ spotsLeft });
      } else {
        return NextResponse.json({ error: 'No spots left' }, { status: 400 });
      }
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
