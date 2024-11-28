import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// In-memory storage (replace with database in production)
const userPreferences = new Map<string, {
  notifications: {
    email: boolean;
    usage: boolean;
    newsletter: boolean;
  };
  exportFormat: string;
  theme: string;
}>();

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const preferences = userPreferences.get(session.user.email) || {
    notifications: {
      email: true,
      usage: true,
      newsletter: false,
    },
    exportFormat: 'markdown',
    theme: 'light',
  };

  return NextResponse.json(preferences);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const updates = await req.json();
    const currentPrefs = userPreferences.get(session.user.email) || {
      notifications: {
        email: true,
        usage: true,
        newsletter: false,
      },
      exportFormat: 'markdown',
      theme: 'light',
    };

    const newPrefs = {
      ...currentPrefs,
      ...updates,
      notifications: {
        ...currentPrefs.notifications,
        ...(updates.notifications || {}),
      },
    };

    userPreferences.set(session.user.email, newPrefs);
    return NextResponse.json(newPrefs);
  } catch (error) {
    console.error('Preferences update error:', error);
    return NextResponse.json(
      { error: 'Failed to update preferences' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  userPreferences.delete(session.user.email);
  return NextResponse.json({ success: true });
}
