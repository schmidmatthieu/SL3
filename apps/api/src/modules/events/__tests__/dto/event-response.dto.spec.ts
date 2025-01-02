import { EventResponseDto } from '../../dto/event-response.dto';
import { EventStatus } from '../../schemas/event.schema';

describe('EventResponseDto', () => {
  it('should create a valid response DTO with all fields', () => {
    const now = new Date();
    const startDateTime = new Date('2025-01-02T13:00:00Z');
    const endDateTime = new Date('2025-01-02T15:00:00Z');
    
    const response: EventResponseDto = {
      id: 'testEventId',
      title: 'Test Event',
      description: 'Test Description',
      startDateTime,
      endDateTime,
      status: EventStatus.SCHEDULED,
      featured: false,
      imageUrl: 'https://example.com/image.jpg',
      rooms: ['room1', 'room2'],
      createdBy: 'testUserId',
      createdAt: now,
      updatedAt: now,
    };

    expect(response).toBeDefined();
    expect(response.id).toBe('testEventId');
    expect(response.title).toBe('Test Event');
    expect(response.description).toBe('Test Description');
    expect(response.startDateTime).toBe(startDateTime);
    expect(response.endDateTime).toBe(endDateTime);
    expect(response.status).toBe(EventStatus.SCHEDULED);
    expect(response.featured).toBe(false);
    expect(response.imageUrl).toBe('https://example.com/image.jpg');
    expect(response.rooms).toEqual(['room1', 'room2']);
    expect(response.createdBy).toBe('testUserId');
    expect(response.createdAt).toBe(now);
    expect(response.updatedAt).toBe(now);
  });

  it('should create a valid response DTO with minimal fields', () => {
    const response: EventResponseDto = {
      id: 'testEventId',
      title: 'Test Event',
      description: undefined,
      startDateTime: undefined,
      endDateTime: undefined,
      status: undefined,
      featured: undefined,
      imageUrl: undefined,
      rooms: [],
      createdBy: 'testUserId',
      createdAt: undefined,
      updatedAt: undefined,
    };

    expect(response).toBeDefined();
    expect(response.id).toBe('testEventId');
    expect(response.title).toBe('Test Event');
    expect(response.rooms).toEqual([]);
    expect(response.createdBy).toBe('testUserId');
  });

  it('should handle undefined rooms array', () => {
    const startDateTime = new Date('2025-01-02T13:00:00Z');
    const endDateTime = new Date('2025-01-02T15:00:00Z');
    
    const response: EventResponseDto = {
      id: 'testEventId',
      title: 'Test Event',
      description: 'Test Description',
      startDateTime,
      endDateTime,
      status: EventStatus.SCHEDULED,
      featured: false,
      imageUrl: 'https://example.com/image.jpg',
      rooms: undefined,
      createdBy: 'testUserId',
      createdAt: undefined,
      updatedAt: undefined,
    };

    expect(response).toBeDefined();
    expect(response.rooms).toBeUndefined();
  });

  it('should handle all optional fields as undefined', () => {
    const response: EventResponseDto = {
      id: 'testEventId',
      title: 'Test Event',
      description: undefined,
      startDateTime: undefined,
      endDateTime: undefined,
      status: undefined,
      featured: undefined,
      imageUrl: undefined,
      rooms: undefined,
      createdBy: undefined,
      createdAt: undefined,
      updatedAt: undefined,
    };

    expect(response).toBeDefined();
    expect(response.id).toBe('testEventId');
    expect(response.title).toBe('Test Event');
    expect(response.description).toBeUndefined();
    expect(response.startDateTime).toBeUndefined();
    expect(response.endDateTime).toBeUndefined();
    expect(response.status).toBeUndefined();
    expect(response.featured).toBeUndefined();
    expect(response.imageUrl).toBeUndefined();
    expect(response.rooms).toBeUndefined();
    expect(response.createdBy).toBeUndefined();
    expect(response.createdAt).toBeUndefined();
    expect(response.updatedAt).toBeUndefined();
  });
});
