import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';
import { UserRole } from '../schemas/user.schema';
import { NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser = {
    _id: 'user_id',
    email: 'test@example.com',
    username: 'testuser',
    firstName: 'John',
    lastName: 'Doe',
    bio: 'Test bio',
    imageUrl: 'https://example.com/image.jpg',
    preferredLanguage: 'en',
    theme: 'system',
    role: UserRole.PARTICIPANT,
    toObject: () => mockUser,
  };

  const mockUsersService = {
    findById: jest.fn(),
    updateProfile: jest.fn(),
    updatePassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a user', async () => {
      mockUsersService.findById.mockResolvedValue(mockUser);

      const result = await controller.findOne('user_id');

      expect(result).toEqual(mockUser);
      expect(service.findById).toHaveBeenCalledWith('user_id');
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUsersService.findById.mockResolvedValue(null);

      await expect(controller.findOne('nonexistent_id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getProfile', () => {
    it('should return the user profile', async () => {
      const result = await controller.getProfile(mockUser);

      expect(result).toEqual(mockUser);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile', async () => {
      const updateDto = {
        firstName: 'Jane',
        lastName: 'Smith',
        bio: 'Updated bio',
      };

      mockUsersService.updateProfile.mockResolvedValue({
        ...mockUser,
        ...updateDto,
      });

      const result = await controller.updateProfile(mockUser, updateDto);

      expect(result).toEqual({
        ...mockUser,
        ...updateDto,
      });
      expect(service.updateProfile).toHaveBeenCalledWith(
        mockUser._id,
        updateDto,
      );
    });
  });

  describe('updatePassword', () => {
    it('should update user password', async () => {
      const updateDto = {
        password: 'newpassword123',
      };

      mockUsersService.updatePassword.mockResolvedValue(mockUser);

      const result = await controller.updatePassword(mockUser, updateDto);

      expect(result).toEqual(mockUser);
      expect(service.updatePassword).toHaveBeenCalledWith(
        mockUser._id,
        updateDto.password,
      );
    });
  });
});
