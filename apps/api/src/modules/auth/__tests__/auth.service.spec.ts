import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from '../auth.service';
import { UsersService } from '../../users/users.service';
import { RolesService } from '../../roles/roles.service';
import { JwtService } from '@nestjs/jwt';
import { ConflictException } from '@nestjs/common';
import { Types } from 'mongoose';
import { UserRole } from '../../users/schemas/user.schema';
import { Model } from 'mongoose';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let rolesService: jest.Mocked<RolesService>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser = {
    _id: new Types.ObjectId().toString(),
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'Test',
    lastName: 'User',
    imageUrl: 'http://example.com/image.jpg',
    preferredLanguage: 'fr',
    theme: 'light',
    role: UserRole.PARTICIPANT,
    password: 'hashedPassword',
    isEmailVerified: false,
    toObject: jest.fn().mockReturnThis(),
    // Ajout des méthodes de Document Mongoose
    $assertPopulated: jest.fn(),
    $clearModifiedPaths: jest.fn(),
    $clone: jest.fn(),
    $createModifiedPathsSnapshot: jest.fn(),
    $getAllSubdocs: jest.fn(),
    $ignore: jest.fn(),
    $isDefault: jest.fn(),
    $isDeleted: jest.fn(),
    $isEmpty: jest.fn(),
    $isValid: jest.fn(),
    $locals: {},
    $markValid: jest.fn(),
    $model: jest.fn(),
    $op: null,
    $session: jest.fn(),
    $set: jest.fn(),
    $where: jest.fn(),
    collection: {},
    db: {},
    delete: jest.fn(),
    deleteOne: jest.fn(),
    depopulate: jest.fn(),
    directModifiedPaths: jest.fn(),
    equals: jest.fn(),
    errors: {},
    get: jest.fn(),
    getChanges: jest.fn(),
    increment: jest.fn(),
    init: jest.fn(),
    invalidate: jest.fn(),
    isDirectModified: jest.fn(),
    isDirectSelected: jest.fn(),
    isInit: jest.fn(),
    isModified: jest.fn(),
    isNew: false,
    isSelected: jest.fn(),
    markModified: jest.fn(),
    modifiedPaths: jest.fn(),
    overwrite: jest.fn(),
    populate: jest.fn(),
    populated: jest.fn(),
    remove: jest.fn(),
    replaceOne: jest.fn(),
    save: jest.fn(),
    schema: {},
    set: jest.fn(),
    unmarkModified: jest.fn(),
    update: jest.fn(),
    updateOne: jest.fn(),
    validate: jest.fn(),
    validateSync: jest.fn(),
  } as any;

  beforeEach(async () => {
    const mockUsersService = {
      findOne: jest.fn(),
      findById: jest.fn(),
      validatePassword: jest.fn(),
      create: jest.fn(),
      count: jest.fn(),
      updateProfile: jest.fn(),
      updatePassword: jest.fn(),
    };

    const mockRolesService = {
      getRole: jest.fn(),
    };

    const mockJwtService = {
      sign: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: RolesService,
          useValue: mockRolesService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    rolesService = module.get(RolesService);
    jwtService = module.get(JwtService);
  });

  describe('validateUser', () => {
    it('should return user without password if validation succeeds', async () => {
      usersService.findOne.mockResolvedValue(mockUser);
      usersService.validatePassword.mockResolvedValue(true);

      const result = await service.validateUser('test@example.com', 'password');
      expect(result).toBeDefined();
      expect(result.password).toBeUndefined();
    });

    it('should return null if user not found', async () => {
      usersService.findOne.mockResolvedValue(null);

      const result = await service.validateUser('test@example.com', 'password');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return token and user data', async () => {
      const token = 'jwt-token';
      jwtService.sign.mockReturnValue(token);
      rolesService.getRole.mockResolvedValue('user');

      const result = await service.login(mockUser);

      expect(result).toEqual({
        token,
        user: {
          id: mockUser._id,
          email: mockUser.email,
          firstName: mockUser.firstName,
          lastName: mockUser.lastName,
          imageUrl: mockUser.imageUrl,
          preferredLanguage: mockUser.preferredLanguage,
          theme: mockUser.theme,
          role: 'user',
        },
      });
    });
  });

  describe('signup', () => {
    const signupDto = {
      email: 'test@example.com',
      password: 'password',
      username: 'testuser',
    };

    it('should create admin user if first user', async () => {
      usersService.findOne.mockResolvedValue(null);
      usersService.count.mockResolvedValue(0);
      usersService.create.mockResolvedValue(mockUser);
      jwtService.sign.mockReturnValue('jwt-token');
      rolesService.getRole.mockResolvedValue('admin');

      const result = await service.signup(signupDto);

      expect(usersService.create).toHaveBeenCalledWith({
        ...signupDto,
        role: 'admin',
      });
      expect(result).toBeDefined();
    });

    it('should throw ConflictException if user exists', async () => {
      usersService.findOne.mockResolvedValue(mockUser);

      await expect(service.signup(signupDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      usersService.findById.mockResolvedValue(mockUser);

      const result = await service.getProfile(mockUser._id);

      expect(result).toEqual({
        id: mockUser._id,
        email: mockUser.email,
        username: mockUser.username,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        imageUrl: mockUser.imageUrl,
        preferredLanguage: mockUser.preferredLanguage,
        theme: mockUser.theme,
        role: mockUser.role,
      });
    });

    it('should return null if user not found', async () => {
      usersService.findById.mockResolvedValue(null);

      const result = await service.getProfile('nonexistent-id');
      expect(result).toBeNull();
    });
  });

  describe('updateProfile', () => {
    const updateDto = {
      firstName: 'Updated',
      lastName: 'User',
    };

    it('should update user profile', async () => {
      const updatedUser = { ...mockUser, ...updateDto };
      usersService.updateProfile.mockResolvedValue(updatedUser);
      rolesService.getRole.mockResolvedValue('user');

      const result = await service.updateProfile(mockUser._id, updateDto);

      expect(result).toEqual({
        ...updatedUser,
        role: 'user',
      });
    });

    it('should throw error if user not found', async () => {
      usersService.updateProfile.mockResolvedValue(null);

      await expect(service.updateProfile('nonexistent-id', updateDto)).rejects.toThrow('User not found');
    });
  });

  describe('updatePassword', () => {
    const passwordDto = {
      currentPassword: 'oldPassword',
      newPassword: 'newPassword',
    };

    it('should update password successfully', async () => {
      usersService.findById.mockResolvedValue(mockUser);
      usersService.validatePassword.mockResolvedValue(true);
      usersService.updatePassword.mockResolvedValue(undefined);

      const result = await service.updatePassword(mockUser._id, passwordDto);

      expect(result).toEqual({ message: 'Password updated successfully' });
    });

    it('should throw error if current password is incorrect', async () => {
      usersService.findById.mockResolvedValue(mockUser);
      usersService.validatePassword.mockResolvedValue(false);

      await expect(service.updatePassword(mockUser._id, passwordDto)).rejects.toThrow('Current password is incorrect');
    });
  });
});
