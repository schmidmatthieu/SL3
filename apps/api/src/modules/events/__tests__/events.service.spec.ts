/**
 * @group unit
 * @group events
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventsService } from '../events.service';
import { RoomService } from '../../rooms/room.service';
import type { Event } from '../schemas/event.schema';
import { EventStatus } from '../schemas/event.schema';
import type { CreateEventDto } from '../dto/create-event.dto';
import type { UpdateEventDto } from '../dto/update-event.dto';
import { NotFoundException } from '@nestjs/common';

describe('EventsService', () => {
  let service: EventsService;
  let eventModel: Model<Event>;
  let roomService: RoomService;

  const mockEventModel = {
    create: jest.fn(),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndUpdate: jest.fn(),
    findByIdAndDelete: jest.fn(),
    prototype: {
      save: jest.fn(),
      deleteOne: jest.fn(),
    },
  };

  const mockQuery = {
    where: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn(),
    populate: jest.fn().mockReturnThis(),
  };

  const mockRoomService = {
    findOne: jest.fn(),
    findAll: jest.fn().mockResolvedValue([]),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: getModelToken('Event'),
          useValue: mockEventModel,
        },
        {
          provide: RoomService,
          useValue: mockRoomService,
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    eventModel = module.get<Model<Event>>(getModelToken('Event'));
    roomService = module.get<RoomService>(RoomService);

    // Reset all mocks
    jest.clearAllMocks();
    mockEventModel.find.mockReturnValue(mockQuery);
    mockEventModel.findById.mockReturnValue(mockQuery);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create an event', async () => {
      const createEventDto: CreateEventDto = {
        title: 'Test Event',
        description: 'Test Description',
        startDateTime: '2025-01-02T13:00:00Z',
        endDateTime: '2025-01-02T15:00:00Z',
        status: EventStatus.SCHEDULED,
      };
      const userId = 'testUserId';

      const expectedEvent = {
        ...createEventDto,
        _id: 'testEventId',
        createdBy: userId,
        rooms: [],
        save: jest.fn().mockResolvedValue(this),
        deleteOne: jest.fn().mockResolvedValue({}),
      };

      mockEventModel.create.mockResolvedValue(expectedEvent);

      const result = await service.create(userId, createEventDto);

      expect(result).toEqual(expectedEvent);
      expect(mockEventModel.create).toHaveBeenCalledWith({
        ...createEventDto,
        createdBy: userId,
        rooms: [],
      });
    });

    it('should handle validation errors', async () => {
      const invalidDto = {
        title: '',
        description: '',
      };
      const userId = 'testUserId';

      mockEventModel.create.mockRejectedValue(new Error('Validation failed'));

      await expect(service.create(userId, invalidDto as CreateEventDto))
        .rejects
        .toThrow('Validation failed');
    });

    it('should validate date ranges', async () => {
      const invalidDateDto: CreateEventDto = {
        title: 'Test Event',
        description: 'Test Description',
        startDateTime: '2025-01-02T15:00:00Z', // Start après End
        endDateTime: '2025-01-02T13:00:00Z',
        status: EventStatus.SCHEDULED,
      };
      const userId = 'testUserId';

      await expect(service.create(userId, invalidDateDto))
        .rejects
        .toThrow('End date must be after start date');
    });
  });

  describe('findAll', () => {
    it('should return all events when no filters are provided', async () => {
      const mockEvents = [
        {
          _id: '1',
          title: 'Event 1',
          rooms: [],
          createdBy: 'testUserId',
        },
        {
          _id: '2',
          title: 'Event 2',
          rooms: [],
          createdBy: 'testUserId',
        },
      ];

      mockQuery.exec.mockResolvedValue(mockEvents);

      const result = await service.findAll({});

      const expectedEvents = mockEvents.map(event => ({
        id: event._id,
        title: event.title,
        description: undefined,
        startDateTime: undefined,
        endDateTime: undefined,
        status: undefined,
        featured: undefined,
        imageUrl: undefined,
        rooms: [],
        createdBy: event.createdBy,
        createdAt: undefined,
        updatedAt: undefined,
      }));

      expect(result).toEqual(expectedEvents);
      expect(mockEventModel.find).toHaveBeenCalled();
      expect(mockQuery.sort).toHaveBeenCalledWith({ startDateTime: 1 });
    });

    it('should filter events by status', async () => {
      const status = EventStatus.ACTIVE;
      const mockEvents = [
        {
          _id: '1',
          title: 'Event 1',
          status: EventStatus.ACTIVE,
          rooms: [],
          createdBy: 'testUserId',
        },
      ];

      mockQuery.exec.mockResolvedValue(mockEvents);

      const result = await service.findAll({ status });

      const expectedEvents = mockEvents.map(event => ({
        id: event._id,
        title: event.title,
        description: undefined,
        startDateTime: undefined,
        endDateTime: undefined,
        status: event.status,
        featured: undefined,
        imageUrl: undefined,
        rooms: [],
        createdBy: event.createdBy,
        createdAt: undefined,
        updatedAt: undefined,
      }));

      expect(result).toEqual(expectedEvents);
      expect(mockQuery.where).toHaveBeenCalledWith('status', status);
      expect(mockQuery.sort).toHaveBeenCalledWith({ startDateTime: 1 });
    });

    it('should filter events by date', async () => {
      const date = '2025-01-02';
      const mockEvents = [
        {
          _id: '1',
          title: 'Event 1',
          date: new Date(date),
          rooms: [],
          createdBy: 'testUserId',
        },
      ];

      mockQuery.exec.mockResolvedValue(mockEvents);

      const result = await service.findAll({ date });

      const expectedEvents = mockEvents.map(event => ({
        id: event._id,
        title: event.title,
        description: undefined,
        startDateTime: undefined,
        endDateTime: undefined,
        status: undefined,
        featured: undefined,
        imageUrl: undefined,
        rooms: [],
        createdBy: event.createdBy,
        createdAt: undefined,
        updatedAt: undefined,
      }));

      expect(result).toEqual(expectedEvents);
      expect(mockQuery.where).toHaveBeenCalledWith('date', new Date(date));
      expect(mockQuery.sort).toHaveBeenCalledWith({ startDateTime: 1 });
    });

    it('should handle invalid date filter', async () => {
      const invalidDate = 'invalid-date';

      await expect(service.findAll({ date: invalidDate }))
        .rejects
        .toThrow('Invalid date format');
    });
  });

  describe('findOne', () => {
    it('should return an event by id', async () => {
      const eventId = 'testEventId';
      const mockEvent = {
        _id: eventId,
        title: 'Test Event',
        rooms: [],
        createdBy: 'testUserId',
      };

      mockQuery.exec.mockResolvedValue(mockEvent);

      const result = await service.findOne(eventId);

      const expectedEvent = {
        id: mockEvent._id,
        title: mockEvent.title,
        description: undefined,
        startDateTime: undefined,
        endDateTime: undefined,
        status: undefined,
        featured: undefined,
        imageUrl: undefined,
        rooms: [],
        createdBy: mockEvent.createdBy,
        createdAt: undefined,
        updatedAt: undefined,
      };

      expect(result).toEqual(expectedEvent);
      expect(mockEventModel.findById).toHaveBeenCalledWith(eventId);
    });

    it('should throw NotFoundException when event not found', async () => {
      const eventId = 'nonExistentId';

      mockQuery.exec.mockResolvedValue(null);

      await expect(service.findOne(eventId))
        .rejects
        .toThrow('Event not found');
    });
  });

  describe('update', () => {
    it('should update an event', async () => {
      const eventId = 'testEventId';
      const updateEventDto: UpdateEventDto = {
        title: 'Updated Event',
      };

      const existingEvent = {
        _id: eventId,
        title: 'Old Title',
        rooms: [],
        save: jest.fn(),
      };

      const updatedEvent = {
        ...existingEvent,
        ...updateEventDto,
      };

      mockQuery.exec.mockResolvedValue(existingEvent);
      existingEvent.save.mockResolvedValue(updatedEvent);

      const result = await service.update(eventId, updateEventDto);

      expect(result).toEqual(updatedEvent);
      expect(existingEvent.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when event not found', async () => {
      const eventId = 'nonExistentId';
      const updateEventDto: UpdateEventDto = {
        title: 'Updated Event',
      };

      mockQuery.exec.mockResolvedValue(null);

      await expect(service.update(eventId, updateEventDto))
        .rejects
        .toThrow('Event not found');
    });

    it('should validate date ranges on update', async () => {
      const eventId = 'testEventId';
      const updateEventDto: UpdateEventDto = {
        startDateTime: '2025-01-02T15:00:00Z', // Start après End
        endDateTime: '2025-01-02T13:00:00Z',
      };

      const existingEvent = {
        _id: eventId,
        title: 'Test Event',
        rooms: [],
        save: jest.fn(),
      };

      mockQuery.exec.mockResolvedValue(existingEvent);

      await expect(service.update(eventId, updateEventDto))
        .rejects
        .toThrow('End date must be after start date');
    });
  });

  describe('remove', () => {
    it('should remove an event', async () => {
      const eventId = 'testEventId';
      const existingEvent = {
        _id: eventId,
        title: 'Test Event',
        rooms: ['room1', 'room2'],
        deleteOne: jest.fn(),
      };

      mockQuery.exec.mockResolvedValue(existingEvent);
      existingEvent.deleteOne.mockResolvedValue({});
      mockRoomService.remove.mockResolvedValue(undefined);

      await service.remove(eventId);

      expect(existingEvent.deleteOne).toHaveBeenCalled();
      expect(mockRoomService.remove).toHaveBeenCalledTimes(2);
    });

    it('should throw NotFoundException when event not found', async () => {
      const eventId = 'nonExistentId';

      mockQuery.exec.mockResolvedValue(null);

      await expect(service.remove(eventId))
        .rejects
        .toThrow('Event not found');
    });

    it('should handle room deletion errors', async () => {
      const eventId = 'testEventId';
      const existingEvent = {
        _id: eventId,
        title: 'Test Event',
        rooms: ['room1', 'room2'],
        deleteOne: jest.fn(),
      };

      mockQuery.exec.mockResolvedValue(existingEvent);
      existingEvent.deleteOne.mockResolvedValue({});
      mockRoomService.remove.mockRejectedValue(new Error('Failed to delete room'));

      await service.remove(eventId);

      expect(existingEvent.deleteOne).toHaveBeenCalled();
      expect(mockRoomService.remove).toHaveBeenCalledTimes(2);
    });
  });
});
