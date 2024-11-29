import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
    login(req: any): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            username: any;
            profile: any;
            role: any;
        };
    }>;
    getProfile(req: any): any;
    refreshToken(req: any): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            username: any;
            profile: any;
            role: any;
        };
    }>;
    logout(req: any): Promise<{
        success: boolean;
    }>;
    updatePassword(req: any, currentPassword: string, newPassword: string): Promise<{
        success: boolean;
    }>;
    updateEmail(req: any, email: string, password: string): Promise<{
        success: boolean;
    }>;
    deleteAccount(req: any, password: string): Promise<{
        success: boolean;
    }>;
    forgotPassword(email: string): Promise<{
        success: boolean;
    }>;
    resetPassword(token: string, password: string): Promise<{
        success: boolean;
    }>;
    handleCallback(code: string): Promise<void>;
}
