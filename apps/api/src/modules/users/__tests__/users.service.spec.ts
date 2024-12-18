import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { UsersService } from '../users.service';
import { User, UserDocument } from '../schemas/user.schema';
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
  role: 'participant',
};

describe('UsersService', () => {
  let service: UsersService;
  let model: Model<UserDocument>;

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
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    model = module.get<Model<UserDocument>>(getModelToken(User.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user with hashed password', async () => {
      const createUserDto = {
        email: 'test@example.com',
        password: 'password123',
        username: 'testuser',
        firstName: 'John',
        lastName: 'Doe',
      };

      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve('hashedpassword'));
      jest.spyOn(model.prototype, 'save').mockResolvedValue(mockUser);

      const result = await service.create(createUserDto);

      expect(result).toEqual(mockUser);
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
  });

  describe('updateProfile', () => {
    it('should update user profile information', async () => {
      const updateData = {
        firstName: 'Jane',
        lastName: 'Smith',
        bio: 'Updated bio',
      };

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
  });

  describe('updatePassword', () => {
    it('should update user password', async () => {
      const newPassword = 'newpassword123';
      const hashedPassword = 'newhashpassword';

      jest.spyOn(bcrypt, 'hash').mockImplementation(() => Promise.resolve(hashedPassword));
      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce({ ...mockUser, password: hashedPassword }),
      } as any);

      const result = await service.updatePassword('user_id', newPassword);

      expect(result.password).toEqual(hashedPassword);
      expect(bcrypt.hash).toHaveBeenCalledWith(newPassword, 10);
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        'user_id',
        { $set: { password: hashedPassword } },
        { new: true },
      );
    });
  });

  describe('updateAvatar', () => {
    it('should update user avatar', async () => {
      const newImageUrl = 'https://example.com/newimage.jpg';

      jest.spyOn(model, 'findByIdAndUpdate').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce({ ...mockUser, imageUrl: newImageUrl }),
      } as any);

      const result = await service.updateAvatar('user_id', newImageUrl);

      expect(result.imageUrl).toEqual(newImageUrl);
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        'user_id',
        { $set: { imageUrl: newImageUrl } },
        { new: true },
      );
    });
  });
});
