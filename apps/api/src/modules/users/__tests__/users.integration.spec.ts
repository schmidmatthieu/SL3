import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../users.module';
import { AuthModule } from '../../auth/auth.module';
import { MediaModule } from '../../media/media.module';
import { User, UserRole } from '../schemas/user.schema';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';

describe('Users Integration Tests', () => {
  let app: INestApplication;
  let userModel: Model<User>;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env.test',
        }),
        MongooseModule.forRootAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            uri: configService.get<string>('MONGODB_URI'),
          }),
          inject: [ConfigService],
        }),
        UsersModule,
        AuthModule,
        MediaModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    userModel = moduleFixture.get<Model<User>>(getModelToken(User.name));
    await app.init();

    // Create an admin user for testing
    const hashedPassword = await bcrypt.hash('adminpass123', 10);
    const adminUser = await userModel.create({
      email: 'admin@test.com',
      password: hashedPassword,
      username: 'admin',
      role: UserRole.ADMIN,
    });

    // Get auth token
    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'admin@test.com',
        password: 'adminpass123',
      });

    authToken = response.body.access_token;
    userId = adminUser._id.toString();
  });

  afterAll(async () => {
    await userModel.deleteMany({});
    await app.close();
  });

  describe('GET /users/profile', () => {
    it('should get user profile', async () => {
      const response = await request(app.getHttpServer())
        .get('/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        email: 'admin@test.com',
        username: 'admin',
        role: UserRole.ADMIN,
      });
    });

    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer())
        .get('/users/profile')
        .expect(401);
    });
  });

  describe('PATCH /users/profile', () => {
    it('should update user profile', async () => {
      const updateData = {
        firstName: 'Admin',
        lastName: 'User',
        bio: 'Test bio',
      };

      const response = await request(app.getHttpServer())
        .patch('/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject(updateData);
    });

    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer())
        .patch('/users/profile')
        .send({ firstName: 'Test' })
        .expect(401);
    });

    it('should handle invalid data', async () => {
      await request(app.getHttpServer())
        .patch('/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ invalidField: 'test' })
        .expect(400);
    });
  });

  describe('PATCH /users/profile/password', () => {
    it('should update password', async () => {
      const newPassword = 'newpass123';

      await request(app.getHttpServer())
        .patch('/users/profile/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ password: newPassword })
        .expect(200);

      // Verify new password works
      const response = await request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'admin@test.com',
          password: newPassword,
        })
        .expect(201);

      expect(response.body.access_token).toBeDefined();
    });

    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer())
        .patch('/users/profile/password')
        .send({ password: 'test123' })
        .expect(401);
    });

    it('should handle invalid password', async () => {
      await request(app.getHttpServer())
        .patch('/users/profile/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ password: 'short' })
        .expect(400);
    });
  });

  describe('GET /users/:id', () => {
    it('should get user by id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toMatchObject({
        email: 'admin@test.com',
        username: 'admin',
      });
    });

    it('should return 404 for non-existent user', async () => {
      await request(app.getHttpServer())
        .get('/users/000000000000000000000000')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    it('should return 401 without auth token', async () => {
      await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(401);
    });
  });
});
