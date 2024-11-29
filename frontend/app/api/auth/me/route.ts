import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://backend:3001';
  
  try {
    console.log('Fetching user profile');
    const authHeader = request.headers.get('authorization');
    console.log('Auth header:', authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { message: 'No token provided' },
        { status: 401 }
      );
    }

    const response = await fetch(`${apiUrl}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      console.error('Profile fetch failed:', response.status);
      return NextResponse.json(
        { message: 'Failed to fetch user profile' },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('Profile data:', data);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Get user profile error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
