import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://backend:3001';

  try {
    const response = await fetch(`${apiUrl}/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });

    if (!response.ok) {
      return NextResponse.json(
        { message: 'Failed to logout' },
        { status: response.status }
      );
    }

    // Create response and clear the token cookie
    const res = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
    res.cookies.delete('token');

    return res;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
