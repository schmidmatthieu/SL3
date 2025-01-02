import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../../../app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let mongoConnection: Connection;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    mongoConnection = moduleFixture.get<Connection>(getConnectionToken());
    await mongoConnection.dropDatabase();
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await app.close();
  });

  describe('/auth/signup (POST)', () => {
    it('should create first user as admin', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'admin@test.com',
          password: 'Password123!',
          username: 'admin',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.token).toBeDefined();
          expect(res.body.user).toBeDefined();
          expect(res.body.user.role).toBe('admin');
        });
    });

    it('should create subsequent user as participant', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'user@test.com',
          password: 'Password123!',
          username: 'user',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.token).toBeDefined();
          expect(res.body.user).toBeDefined();
          expect(res.body.user.role).toBe('participant');
          userId = res.body.user.id;
        });
    });

    it('should prevent duplicate email registration', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'user@test.com',
          password: 'Password123!',
          username: 'user2',
        })
        .expect(409);
    });

    it('should validate email format', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'invalid-email',
          password: 'Password123!',
          username: 'user3',
        })
        .expect(400);
    });

    it('should validate password strength', () => {
      return request(app.getHttpServer())
        .post('/auth/signup')
        .send({
          email: 'valid@test.com',
          password: 'weak',
          username: 'user4',
        })
        .expect(400);
    });
  });

  describe('/auth/login (POST)', () => {
    it('should authenticate user and return token', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'user@test.com',
          password: 'Password123!',
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.token).toBeDefined();
          authToken = res.body.token;
        });
    });

    it('should reject invalid credentials', () => {
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'user@test.com',
          password: 'WrongPassword',
        })
        .expect(401);
    });
  });

  describe('/auth/profile (GET)', () => {
    it('should get user profile with valid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.email).toBe('user@test.com');
        });
    });

    it('should reject request without token', () => {
      return request(app.getHttpServer()).get('/auth/profile').expect(401);
    });

    it('should reject request with invalid token', () => {
      return request(app.getHttpServer())
        .get('/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);
    });
  });

  describe('/auth/profile (PATCH)', () => {
    it('should update user profile', () => {
      const updateDto = {
        firstName: 'Updated',
        lastName: 'User',
        preferredLanguage: 'en',
      };

      return request(app.getHttpServer())
        .patch('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateDto)
        .expect(200)
        .expect((res) => {
          expect(res.body.firstName).toBe(updateDto.firstName);
          expect(res.body.lastName).toBe(updateDto.lastName);
          expect(res.body.preferredLanguage).toBe(updateDto.preferredLanguage);
        });
    });

    it('should validate profile update data', () => {
      return request(app.getHttpServer())
        .patch('/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          preferredLanguage: 'invalid-language',
        })
        .expect(400);
    });
  });

  describe('/auth/password (PATCH)', () => {
    it('should update password', () => {
      return request(app.getHttpServer())
        .patch('/auth/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'Password123!',
          newPassword: 'NewPassword123!',
        })
        .expect(200);
    });

    it('should reject invalid current password', () => {
      return request(app.getHttpServer())
        .patch('/auth/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'WrongPassword',
          newPassword: 'NewPassword123!',
        })
        .expect(400);
    });

    it('should validate new password strength', () => {
      return request(app.getHttpServer())
        .patch('/auth/password')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          currentPassword: 'NewPassword123!',
          newPassword: 'weak',
        })
        .expect(400);
    });
  });
});
