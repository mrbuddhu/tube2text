import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/app/api/auth/[...nextauth]/route';

// In-memory storage (replace with database in production)
const userHistory = new Map<string, Array<{
  id: string;
  title: string;
  url: string;
  processedAt: string;
  wordCount: number;
}>>();

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const history = userHistory.get(session.user.id) || [];
  return NextResponse.json(history);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { title, url, wordCount } = await req.json();

    if (!title || !url) {
      return NextResponse.json(
        { error: 'Title and URL are required' },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const userRecords = userHistory.get(userId) || [];

    const newRecord = {
      id: crypto.randomUUID(),
      title,
      url,
      processedAt: new Date().toISOString(),
      wordCount: wordCount || 0
    };

    // Add to beginning of array (most recent first)
    userRecords.unshift(newRecord);

    // Keep only last 100 records
    if (userRecords.length > 100) {
      userRecords.pop();
    }

    userHistory.set(userId, userRecords);
    return NextResponse.json(newRecord);
  } catch (error) {
    console.error('Error saving history:', error);
    return NextResponse.json(
      { error: 'Failed to save history' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session || !session.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json(
        { error: 'Record ID is required' },
        { status: 400 }
      );
    }

    const userId = session.user.id;
    const userRecords = userHistory.get(userId) || [];
    const updatedRecords = userRecords.filter(record => record.id !== id);
    userHistory.set(userId, updatedRecords);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting history:', error);
    return NextResponse.json(
      { error: 'Failed to delete history' },
      { status: 500 }
    );
  }
}
