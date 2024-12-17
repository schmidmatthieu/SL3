import { NextRequest, NextResponse } from 'next/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  console.log('API Route - Updating event status for event:', params.eventId);
  try {
    const authHeader = request.headers.get('authorization');
    console.log('API Route - Auth header present:', !!authHeader);
    const body = await request.json();
    console.log('API Route - Request body:', body);
    
    const response = await fetch(`http://localhost:3001/api/events/${params.eventId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { 'Authorization': authHeader } : {}),
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error('API Route - Backend responded with error:', response.status);
      const errorData = await response.json().catch(() => ({}));
      console.error('API Route - Error details:', errorData);
      throw new Error(`API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log('API Route - Successfully updated event status:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Route - Error updating event status:', error);
    return NextResponse.json(
      { error: 'Failed to update event status' },
      { status: 500 }
    );
  }
}
