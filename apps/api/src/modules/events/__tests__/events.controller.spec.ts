import { Test, TestingModule } from '@nestjs/testing';
import { EventsController } from '../events.controller';
import { EventsService } from '../events.service';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { EventStatus } from '../schemas/event.schema';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('EventsController', () => {
  let controller: EventsController;
  let service: EventsService;

  const mockEventsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  const mockRequest = {
    user: {
      id: 'testUserId',
    },
  };

  const mockEvent = {
    id: 'testEventId',
    title: 'Test Event',
    description: 'Test Description',
    startDateTime: '2025-01-02T13:00:00Z',
    endDateTime: '2025-01-02T15:00:00Z',
    status: EventStatus.SCHEDULED,
    featured: false,
    imageUrl: 'https://example.com/image.jpg',
    rooms: [],
    createdBy: 'testUserId',
    createdAt: '2025-01-02T13:00:00Z',
    updatedAt: '2025-01-02T13:00:00Z',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EventsController],
      providers: [
        {
          provide: EventsService,
          useValue: mockEventsService,
        },
      ],
    }).compile();

    controller = module.get<EventsController>(EventsController);
    service = module.get<EventsService>(EventsService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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

      mockEventsService.create.mockResolvedValue(mockEvent);

      const result = await controller.create(mockRequest as any, createEventDto);

      expect(result).toEqual(mockEvent);
      expect(mockEventsService.create).toHaveBeenCalledWith(
        mockRequest.user.id,
        createEventDto,
      );
    });

    it('should handle validation errors', async () => {
      const invalidDto = {
        title: '',
        description: '',
      };

      mockEventsService.create.mockRejectedValue(
        new BadRequestException('Validation failed'),
      );

      await expect(
        controller.create(mockRequest as any, invalidDto as CreateEventDto),
      ).rejects.toThrow('Validation failed');
    });

    it('should handle date validation errors', async () => {
      const invalidDateDto: CreateEventDto = {
        title: 'Test Event',
        description: 'Test Description',
        startDateTime: '2025-01-02T15:00:00Z',
        endDateTime: '2025-01-02T13:00:00Z',
        status: EventStatus.SCHEDULED,
      };

      mockEventsService.create.mockRejectedValue(
        new BadRequestException('End date must be after start date'),
      );

      await expect(
        controller.create(mockRequest as any, invalidDateDto),
      ).rejects.toThrow('End date must be after start date');
    });
  });

  describe('findAll', () => {
    it('should return all events when no filters are provided', async () => {
      mockEventsService.findAll.mockResolvedValue([mockEvent]);

      const result = await controller.findAll({});

      expect(result).toEqual([mockEvent]);
      expect(mockEventsService.findAll).toHaveBeenCalledWith({});
    });

    it('should filter events by status', async () => {
      const query = { status: EventStatus.ACTIVE };
      mockEventsService.findAll.mockResolvedValue([mockEvent]);

      const result = await controller.findAll(query);

      expect(result).toEqual([mockEvent]);
      expect(mockEventsService.findAll).toHaveBeenCalledWith(query);
    });

    it('should filter events by date', async () => {
      const query = { date: '2025-01-02' };
      mockEventsService.findAll.mockResolvedValue([mockEvent]);

      const result = await controller.findAll(query);

      expect(result).toEqual([mockEvent]);
      expect(mockEventsService.findAll).toHaveBeenCalledWith(query);
    });

    it('should handle invalid date filter', async () => {
      const query = { date: 'invalid-date' };
      mockEventsService.findAll.mockRejectedValue(
        new BadRequestException('Invalid date format'),
      );

      await expect(controller.findAll(query)).rejects.toThrow(
        'Invalid date format',
      );
    });
  });

  describe('findOne', () => {
    it('should return an event by id', async () => {
      const eventId = 'testEventId';
      mockEventsService.findOne.mockResolvedValue(mockEvent);

      const result = await controller.findOne(eventId);

      expect(result).toEqual(mockEvent);
      expect(mockEventsService.findOne).toHaveBeenCalledWith(eventId);
    });

    it('should throw NotFoundException when event not found', async () => {
      const eventId = 'nonExistentId';
      mockEventsService.findOne.mockRejectedValue(
        new NotFoundException('Event not found'),
      );

      await expect(controller.findOne(eventId)).rejects.toThrow('Event not found');
    });
  });

  describe('update', () => {
    it('should update an event', async () => {
      const eventId = 'testEventId';
      const updateEventDto: UpdateEventDto = {
        title: 'Updated Event',
      };

      mockEventsService.update.mockResolvedValue({
        ...mockEvent,
        ...updateEventDto,
      });

      const result = await controller.update(eventId, updateEventDto);

      expect(result).toEqual({ ...mockEvent, ...updateEventDto });
      expect(mockEventsService.update).toHaveBeenCalledWith(
        eventId,
        updateEventDto,
      );
    });

    it('should throw NotFoundException when event not found', async () => {
      const eventId = 'nonExistentId';
      const updateEventDto: UpdateEventDto = {
        title: 'Updated Event',
      };

      mockEventsService.update.mockRejectedValue(
        new NotFoundException('Event not found'),
      );

      await expect(
        controller.update(eventId, updateEventDto),
      ).rejects.toThrow('Event not found');
    });

    it('should handle date validation errors', async () => {
      const eventId = 'testEventId';
      const updateEventDto: UpdateEventDto = {
        startDateTime: '2025-01-02T15:00:00Z',
        endDateTime: '2025-01-02T13:00:00Z',
      };

      mockEventsService.update.mockRejectedValue(
        new BadRequestException('End date must be after start date'),
      );

      await expect(
        controller.update(eventId, updateEventDto),
      ).rejects.toThrow('End date must be after start date');
    });
  });

  describe('remove', () => {
    it('should remove an event', async () => {
      const eventId = 'testEventId';
      mockEventsService.remove.mockResolvedValue(undefined);

      await controller.remove(eventId);

      expect(mockEventsService.remove).toHaveBeenCalledWith(eventId);
    });

    it('should throw NotFoundException when event not found', async () => {
      const eventId = 'nonExistentId';
      mockEventsService.remove.mockRejectedValue(
        new NotFoundException('Event not found'),
      );

      await expect(controller.remove(eventId)).rejects.toThrow('Event not found');
    });

    it('should handle room deletion errors gracefully', async () => {
      const eventId = 'testEventId';
      mockEventsService.remove.mockImplementation(async () => {
        // Simuler la suppression réussie de l'événement même si la suppression des salles échoue
        return undefined;
      });

      await controller.remove(eventId);

      expect(mockEventsService.remove).toHaveBeenCalledWith(eventId);
    });
  });
});
