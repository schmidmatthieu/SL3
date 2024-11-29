import { UsersService } from './users.service';
import { Request as ExpressRequest } from 'express';
import { UpdateProfileDto } from './dto/update-profile.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getProfile(req: ExpressRequest): Promise<any>;
    updateProfile(req: ExpressRequest, profileData: UpdateProfileDto): Promise<any>;
    uploadAvatar(req: ExpressRequest, file: any): Promise<void>;
    deleteAvatar(req: ExpressRequest): Promise<void>;
    findAll(page?: number, limit?: number, search?: string): Promise<import("./schemas/user.schema").User[]>;
    findOne(id: string): Promise<any>;
    updateRole(id: string, role: string): Promise<void>;
    getSettings(req: ExpressRequest): Promise<any>;
    updateSettings(req: ExpressRequest, settings: any): Promise<void>;
}
