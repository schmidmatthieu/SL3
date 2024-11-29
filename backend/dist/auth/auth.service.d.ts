import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(email: string, password: string): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            username: any;
            profile: any;
            role: any;
        };
    }>;
    register(email: string, password: string, username?: string): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            username: any;
            profile: any;
            role: any;
        };
    }>;
    refreshToken(userId: string): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            username: any;
            profile: any;
            role: any;
        };
    }>;
    logout(userId: string): Promise<{
        success: boolean;
    }>;
    updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        success: boolean;
    }>;
    updateEmail(userId: string, email: string, password: string): Promise<{
        success: boolean;
    }>;
    deleteAccount(userId: string, password: string): Promise<{
        success: boolean;
    }>;
    forgotPassword(email: string): Promise<{
        success: boolean;
    }>;
    resetPassword(token: string, newPassword: string): Promise<{
        success: boolean;
    }>;
    handleCallback(code: string): Promise<void>;
}
