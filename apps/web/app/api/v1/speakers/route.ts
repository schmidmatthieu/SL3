import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { db } from '@/lib/db';

const speakerSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  imageUrl: z.string().optional(),
  rooms: z.array(z.string()).min(1),
  eventId: z.string(),
});

export async function GET(req: NextRequest, { params }: { params: { eventId: string } }) {
  try {
    const speakers = await db.speaker.findMany({
      where: {
        eventId: params.eventId,
      },
    });

    return NextResponse.json(speakers);
  } catch (error) {
    console.error('Failed to fetch speakers:', error);
    return NextResponse.json({ error: 'Failed to fetch speakers' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { eventId: string } }) {
  try {
    const body = await req.json();
    const validatedData = speakerSchema.parse(body);

    const speaker = await db.speaker.create({
      data: {
        ...validatedData,
        eventId: params.eventId,
      },
    });

    return NextResponse.json(speaker);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid speaker data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Failed to create speaker:', error);
    return NextResponse.json({ error: 'Failed to create speaker' }, { status: 500 });
  }
}
