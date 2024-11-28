import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// In-memory storage (replace with database in production)
const userHistory = new Map<string, Array<{
  id: string;
  title: string;
  url: string;
  processedAt: string;
  wordCount: number;
}>>();

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const history = userHistory.get(session.user.email) || [];
  return NextResponse.json(history);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, url, wordCount } = await req.json();
    
    if (!title || !url) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const newEntry = {
      id: Math.random().toString(36).substr(2, 9),
      title,
      url,
      processedAt: new Date().toISOString(),
      wordCount: wordCount || 0,
    };

    const userEmail = session.user.email;
    const history = userHistory.get(userEmail) || [];
    
    // Keep only last 50 entries
    if (history.length >= 50) {
      history.pop();
    }
    
    history.unshift(newEntry);
    userHistory.set(userEmail, history);

    return NextResponse.json(newEntry);
  } catch (error) {
    console.error('History update error:', error);
    return NextResponse.json(
      { error: 'Failed to update history' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'Missing entry ID' },
      { status: 400 }
    );
  }

  const userEmail = session.user.email;
  const history = userHistory.get(userEmail) || [];
  
  const newHistory = history.filter(entry => entry.id !== id);
  userHistory.set(userEmail, newHistory);

  return NextResponse.json({ success: true });
}
