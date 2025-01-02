import { Test, TestingModule } from '@nestjs/testing';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from '../auth.service';
import { UsersModule } from '../../users/users.module';
import { RolesModule } from '../../roles/roles.module';
import { User, UserSchema, UserRole } from '../../users/schemas/user.schema';
import * as mongoose from 'mongoose';

describe('Auth Integration Tests', () => {
  let module: TestingModule;
  let authService: AuthService;
  let mongoConnection: mongoose.Connection;

  beforeAll(async () => {
    module = await Test.createTestingModule({
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
        MongooseModule.forFeature([
          { name: User.name, schema: UserSchema },
        ]),
        PassportModule,
        JwtModule.registerAsync({
          imports: [ConfigModule],
          useFactory: async (configService: ConfigService) => ({
            secret: configService.get<string>('JWT_SECRET'),
            signOptions: { expiresIn: '1d' },
          }),
          inject: [ConfigService],
        }),
        UsersModule,
        RolesModule,
      ],
      providers: [AuthService],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    mongoConnection = module.get<mongoose.Connection>('DatabaseConnection');

    // Clear the database before tests
    await mongoConnection.dropDatabase();
  });

  afterAll(async () => {
    await mongoConnection.dropDatabase();
    await mongoConnection.close();
    await module.close();
  });

  describe('Signup Flow', () => {
    it('should create first user as admin', async () => {
      const signupDto = {
        email: 'admin@test.com',
        password: 'Password123!',
        username: 'admin',
      };

      const result = await authService.signup(signupDto);

      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(signupDto.email);
      expect(result.user.role).toBe(UserRole.ADMIN);
    });

    it('should create subsequent users as participants', async () => {
      const signupDto = {
        email: 'user@test.com',
        password: 'Password123!',
        username: 'user',
      };

      const result = await authService.signup(signupDto);

      expect(result).toBeDefined();
      expect(result.token).toBeDefined();
      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(signupDto.email);
      expect(result.user.role).toBe(UserRole.PARTICIPANT);
    });

    it('should prevent duplicate email registration', async () => {
      const signupDto = {
        email: 'user@test.com',
        password: 'Password123!',
        username: 'user',
      };

      await expect(authService.signup(signupDto)).rejects.toThrow();
    });
  });

  describe('Login Flow', () => {
    const testUser = {
      email: 'test@test.com',
      password: 'Password123!',
      username: 'test',
    };

    beforeAll(async () => {
      await authService.signup(testUser);
    });

    it('should validate user credentials and return token', async () => {
      const validatedUser = await authService.validateUser(
        testUser.email,
        testUser.password,
      );
      expect(validatedUser).toBeDefined();
      expect(validatedUser.email).toBe(testUser.email);

      const result = await authService.login(validatedUser);
      expect(result.token).toBeDefined();
      expect(result.user.email).toBe(testUser.email);
      expect(result.user.role).toBe(UserRole.PARTICIPANT);
    });

    it('should reject invalid credentials', async () => {
      const result = await authService.validateUser(
        testUser.email,
        'wrongpassword',
      );
      expect(result).toBeNull();
    });
  });

  describe('Profile Management', () => {
    let userId: string;
    let authToken: string;

    beforeAll(async () => {
      const signupResult = await authService.signup({
        email: 'profile@test.com',
        password: 'Password123!',
        username: 'profile',
      });
      userId = signupResult.user.id;
      authToken = signupResult.token;
    });

    it('should get user profile', async () => {
      const profile = await authService.getProfile(userId);
      expect(profile).toBeDefined();
      expect(profile.email).toBe('profile@test.com');
      expect(profile.role).toBe(UserRole.PARTICIPANT);
    });

    it('should update user profile', async () => {
      const updateDto = {
        firstName: 'Updated',
        lastName: 'User',
        preferredLanguage: 'en',
      };

      const updatedProfile = await authService.updateProfile(userId, updateDto);
      expect(updatedProfile).toBeDefined();
      expect(updatedProfile.firstName).toBe(updateDto.firstName);
      expect(updatedProfile.lastName).toBe(updateDto.lastName);
      expect(updatedProfile.preferredLanguage).toBe(updateDto.preferredLanguage);
      expect(updatedProfile.role).toBe(UserRole.PARTICIPANT);
    });

    it('should update password', async () => {
      const passwordDto = {
        currentPassword: 'Password123!',
        newPassword: 'NewPassword123!',
      };

      const result = await authService.updatePassword(userId, passwordDto);
      expect(result.message).toBe('Password updated successfully');

      // Verify new password works
      const validatedUser = await authService.validateUser(
        'profile@test.com',
        passwordDto.newPassword,
      );
      expect(validatedUser).toBeDefined();
      expect(validatedUser.role).toBe(UserRole.PARTICIPANT);
    });
  });
});
