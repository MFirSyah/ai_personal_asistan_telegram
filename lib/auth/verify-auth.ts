import { NextResponse } from 'next/server';
import { resolveUserForApi } from '@/lib/supabase/queries/sessions';

export interface VerifiedUser {
  id: string;
  name: string | null;
  telegramId: number | null;
}

export async function verifyApiUser(req: Request): Promise<{
  authenticated: boolean;
  user: VerifiedUser | null;
  errorResponse?: NextResponse;
}> {
  const url = new URL(req.url);
  const headerUserId = req.headers.get('x-user-id');
  const headerTelegramId = req.headers.get('x-telegram-id');
  const paramUserId = url.searchParams.get('userId');
  const paramTelegramId = url.searchParams.get('telegramId');

  const userId = headerUserId || paramUserId;
  const telegramId = headerTelegramId || paramTelegramId;

  if (!userId && !telegramId) {
    return {
      authenticated: false,
      user: null,
      errorResponse: NextResponse.json(
        { error: 'Unauthorized: User identity headers or parameters are missing' },
        { status: 401 }
      ),
    };
  }

  const user = await resolveUserForApi(userId, telegramId);

  if (!user) {
    return {
      authenticated: false,
      user: null,
      errorResponse: NextResponse.json(
        { error: 'Unauthorized: User identity could not be verified' },
        { status: 401 }
      ),
    };
  }

  return {
    authenticated: true,
    user,
  };
}
