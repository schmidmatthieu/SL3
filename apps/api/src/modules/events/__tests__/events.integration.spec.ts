/**
 * @group integration
 * @group events
 */

import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventsModule } from '../events.module';
import { EventsService } from '../events.service';
import { RoomService } from '../../rooms/room.service';
import { Event, EventStatus } from '../schemas/event.schema';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { RoomStatus } from '../../rooms/room.schema';
import { CreateRoomDto } from '../../rooms/dto/create-room.dto';
import mongoose, { Types } from 'mongoose';
import configuration from '../../../config/configuration';

const TEST_DB_URI = 'mongodb://localhost:27017/sl3_beta_test';

describe('Events Integration Tests', () => {
  let app: TestingModule;
  let eventsService: EventsService;
  let roomService: RoomService;

  beforeAll(async () => {
    // Configuration du module de test
    app = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [() => ({
            ...configuration(),
            database: {
              uri: TEST_DB_URI,
            },
          })],
        }),
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            uri: configService.get<string>('database.uri'),
            connectionFactory: (connection) => {
              connection.on('connected', () => {
              });
              return connection;
            },
          }),
          inject: [ConfigService],
        }),
        EventsModule,
      ],
    }).compile();

    eventsService = app.get<EventsService>(EventsService);
    roomService = app.get<RoomService>(RoomService);
  });

  beforeEach(async () => {
    // Nettoyage de la base de données avant chaque test
    if (mongoose.connection.readyState === 1) {
      const collections = await mongoose.connection.db.collections();
      for (const collection of collections) {
        await collection.deleteMany({});
      }
    }
  });

  afterAll(async () => {
    // Nettoyage et fermeture de la connexion après tous les tests
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
    await app.close();
  });

  describe('Event Lifecycle', () => {
    it('should handle the complete event lifecycle', async () => {
      const userId = new Types.ObjectId().toString();

      // 1. Création d'un événement
      const createEventDto: CreateEventDto = {
        title: 'Integration Test Event',
        description: 'Test Description',
        startDateTime: '2025-01-02T14:00:00.000Z',
        endDateTime: '2025-01-02T16:00:00.000Z',
        status: EventStatus.SCHEDULED,
        featured: false,
        imageUrl: 'https://example.com/image.jpg'
      };

      const createdEvent = await eventsService.create(userId, createEventDto);
      expect(createdEvent).toBeDefined();
      expect(createdEvent.title).toBe(createEventDto.title);
      expect(createdEvent.createdBy.toString()).toBe(userId);

      // 2. Mise à jour de l'événement
      const updateEventDto: UpdateEventDto = {
        title: 'Updated Integration Test Event',
        description: 'Updated Description'
      };

      const updatedEvent = await eventsService.update(createdEvent.id, updateEventDto);
      expect(updatedEvent).toBeDefined();
      expect(updatedEvent.title).toBe(updateEventDto.title);
      expect(updatedEvent.description).toBe(updateEventDto.description);

      // 3. Recherche de l'événement
      const foundEvent = await eventsService.findOne(createdEvent.id);
      expect(foundEvent).toBeDefined();
      expect(foundEvent.title).toBe(updateEventDto.title);

      // 4. Suppression de l'événement
      await eventsService.remove(createdEvent.id);
      await expect(eventsService.findOne(createdEvent.id)).rejects.toThrow();
    });

    it('should handle event room assignments', async () => {
      const userId = new Types.ObjectId().toString();

      // 1. Création d'un événement
      const createEventDto: CreateEventDto = {
        title: 'Room Assignment Test Event',
        description: 'Test Description',
        startDateTime: '2025-01-02T14:00:00.000Z',
        endDateTime: '2025-01-02T16:00:00.000Z',
        status: EventStatus.SCHEDULED,
        featured: false
      };

      const createdEvent = await eventsService.create(userId, createEventDto);
      expect(createdEvent).toBeDefined();

      // 2. Création d'une salle
      const createRoomDto: CreateRoomDto = {
        name: 'Test Room',
        eventId: createdEvent.id,
        description: 'Test Room Description',
        status: RoomStatus.UPCOMING,
        startTime: '2025-01-02T14:00:00.000Z',
        endTime: '2025-01-02T16:00:00.000Z',
        settings: {
          isPublic: true,
          chatEnabled: true,
          recordingEnabled: true,
          maxParticipants: 50,
          allowQuestions: true,
          originalLanguage: 'fr',
          availableLanguages: ['fr', 'en']
        }
      };

      const room = await roomService.create(createRoomDto, userId);
      expect(room).toBeDefined();
      expect(room.eventId.toString()).toBe(createdEvent.id);

      // 3. Test de conflit
      const conflictingEventDto: CreateEventDto = {
        title: 'Conflicting Event',
        description: 'Should not be created',
        startDateTime: '2025-01-02T15:00:00.000Z',
        endDateTime: '2025-01-02T17:00:00.000Z',
        status: EventStatus.SCHEDULED,
        featured: false
      };

      const conflictingEvent = await eventsService.create(userId, conflictingEventDto);
      expect(conflictingEvent).toBeDefined();
    });
  });

  describe('Event Query Performance', () => {
    it('should handle multiple concurrent requests', async () => {
      const userId = new Types.ObjectId().toString();
      const numberOfEvents = 10;
      const createdEventIds = new Set<string>();
      const createPromises = [];

      // Création de plusieurs événements simultanément
      for (let i = 0; i < numberOfEvents; i++) {
        const createEventDto: CreateEventDto = {
          title: `Performance Test Event ${i}`,
          description: `Test Description ${i}`,
          startDateTime: '2025-01-02T14:00:00.000Z',
          endDateTime: '2025-01-02T16:00:00.000Z',
          status: EventStatus.SCHEDULED,
          featured: false
        };

        createPromises.push(
          eventsService.create(userId, createEventDto)
            .then(event => {
              createdEventIds.add(event.id);
              return event;
            })
        );
      }

      const createdEvents = await Promise.all(createPromises);
      expect(createdEvents).toHaveLength(numberOfEvents);

      // Test de recherche avec filtres
      const startTime = Date.now();
      const events = await eventsService.findAll({
        status: EventStatus.SCHEDULED
      });
      const endTime = Date.now();

      // Vérifier que tous les événements créés sont présents dans les résultats
      const foundEventIds = new Set(events.map(event => event.id));
      for (const eventId of createdEventIds) {
        expect(foundEventIds).toContain(eventId);
      }

      expect(endTime - startTime).toBeLessThan(1000); // La requête doit prendre moins d'une seconde
    });
  });
});
