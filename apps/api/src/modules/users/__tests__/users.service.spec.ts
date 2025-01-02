import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from '../users.service';
import { User, UserDocument, UserRole } from '../schemas/user.schema';
import { MediaService } from '../../media/media.service';
import * as bcrypt from 'bcrypt';

const mockUser = {
  _id: 'user_id',
  email: 'test@example.com',
  username: 'testuser',
  password: 'hashedpassword',
  firstName: 'John',
  lastName: 'Doe',
  bio: 'Test bio',
  imageUrl: 'https://example.com/image.jpg',
  preferredLanguage: 'en',
  theme: 'system',
  role: UserRole.PARTICIPANT,
  toObject: jest.fn().mockReturnThis(),
};

describe('UsersService', () => {
  let service: UsersService;
  let model: Model<UserDocument>;
  let mediaService: MediaService;

  const mockMediaService = {
    findByFilename: jest.fn(),
    removeUsage: jest.fn(),
    addUsage: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getModelToken(User.name),
          useValue: {
            new: jest.fn().mockResolvedValue(mockUser),
            constructor: jest.fn().mockResolvedValue(mockUser),
            find: jest.fn(),
            findOne: jest.fn(),
            findById: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            exec: jest.fn(),
            findByIdAndUpdate: jest.fn(),
            countDocuments: jest.fn(),
          },
        },
        {
          provide: MediaService,
          useValue: mockMediaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get<Model<UserDocument>>(getModelToken(User.name));
    mediaService = module.get<MediaService>(MediaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create first user as admin', async () => {
      const createUserDto = {
        email: 'admin@example.com',
        password: 'password123',
        username: 'admin',
      };

      jest.spyOn(model, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(0),
      } as any);
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashedpassword'));
      jest.spyOn(model.prototype, 'save').mockResolvedValue({
        ...mockUser,
        ...createUserDto,
        role: UserRole.ADMIN,
      });

      const result = await service.create(createUserDto);

      expect(result.role).toBe(UserRole.ADMIN);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });

    it('should create subsequent users as participants', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
      };

      jest.spyOn(model, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(1),
      } as any);
      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashedpassword'));
      jest.spyOn(model.prototype, 'save').mockResolvedValue({
        ...mockUser,
        ...createUserDto,
        role: UserRole.PARTICIPANT,
      });

      const result = await service.create(createUserDto);

      expect(result.role).toBe(UserRole.PARTICIPANT);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
    });
  });

  describe('findOne', () => {
    it('should return a user by email', async () => {
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockUser),
      } as any);

      const result = await service.findOne('test@example.com');

      expect(result).toEqual(mockUser);
      expect(model.findOne).toHaveBeenCalledWith({ email: 'test@example.com' });
    });

    it('should return null if user not found', async () => {
      jest.spyOn(model, 'findOne').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      const result = await service.findOne('nonexistent@example.com');

      expect(result).toBeNull();
    });
  });

  describe('findById', () => {
    it('should return a user by id', async () => {
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockUser),
      } as any);

      const result = await service.findById('user_id');

      expect(result).toEqual(mockUser);
      expect(model.findById).toHaveBeenCalledWith('user_id');
    });

    it('should return null if user not found', async () => {
      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      const result = await service.findById('nonexistent_id');

      expect(result).toBeNull();
    });
  });

  describe('updateProfile', () => {
    it('should update user profile information', async () => {
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith',
        bio: 'Updated bio',
      };

      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(mockUser),
      } as any);

      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce({ ...mockUser, ...updateData }),
      } as any);

      const result = await service.updateProfile('user_id', updateData);

      expect(result).toEqual({ ...mockUser, ...updateData });
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        'user_id',
        { $set: updateData },
        { new: true },
      );
    });

    it('should throw error if user not found', async () => {
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith',
      };

      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(null),
      } as any);

      await expect(service.updateProfile('nonexistent_id', updateData)).rejects.toThrow('User not found');
    });

    it('should handle image url update', async () => {
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith',
        imageUrl: '/uploads/newimage.jpg',
      };

      const oldMedia = { id: 'old_media_id' };
      const newMedia = { id: 'new_media_id' };

      jest.spyOn(model, 'findById').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce({
          ...mockUser,
          imageUrl: '/uploads/oldimage.jpg',
        }),
      } as any);

      mockMediaService.findByFilename
        .mockResolvedValueOnce(oldMedia)
        .mockResolvedValueOnce(newMedia);

      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce({ ...mockUser, ...updateData }),
      } as any);

      const result = await service.updateProfile('user_id', updateData);

      expect(result).toEqual({ ...mockUser, ...updateData });
      expect(mockMediaService.removeUsage).toHaveBeenCalledWith(oldMedia.id, 'user_id');
      expect(mockMediaService.addUsage).toHaveBeenCalledWith(newMedia.id, {
        type: 'profile',
        entityId: 'user_id',
        entityName: 'Jane Smith',
      });
    });
  });

  describe('validatePassword', () => {
    it('should return true for valid password', async () => {
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(true));

      const result = await service.validatePassword(mockUser as UserDocument, 'correct_password');

      expect(result).toBe(true);
      expect(bcrypt.compare).toHaveBeenCalledWith('correct_password', mockUser.password);
    });

    it('should return false for invalid password', async () => {
      jest.spyOn(bcrypt, 'compare').mockImplementation(() => Promise.resolve(false));

      const result = await service.validatePassword(mockUser as UserDocument, 'wrong_password');

      expect(result).toBe(false);
      expect(bcrypt.compare).toHaveBeenCalledWith('wrong_password', mockUser.password);
    });
  });

  describe('count', () => {
    it('should return the number of users', async () => {
      jest.spyOn(model, 'countDocuments').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(5),
      } as any);

      const result = await service.count();

      expect(result).toBe(5);
    });
  });
});
