"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const users_service_1 = require("../users/users.service");
let AuthService = class AuthService {
    constructor(usersService, jwtService) {
        this.usersService = usersService;
        this.jwtService = jwtService;
    }
    async validateUser(email, password) {
        const user = await this.usersService.findOne(email);
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const isValidPassword = await this.usersService.validatePassword(user, password);
        if (!isValidPassword) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const { password: _, ...result } = user.toObject();
        return result;
    }
    async login(user) {
        if (!user || !user._id) {
            throw new common_1.UnauthorizedException('Invalid user data');
        }
        const payload = { email: user.email, sub: user._id };
        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                profile: user.profile,
                role: user.role,
            },
        };
    }
    async register(email, password, username) {
        const existingUser = await this.usersService.findOne(email);
        if (existingUser) {
            throw new common_1.BadRequestException('User already exists');
        }
        const user = await this.usersService.create(email, password, username);
        return this.login(user);
    }
    async refreshToken(userId) {
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        return this.login(user);
    }
    async logout(userId) {
        return { success: true };
    }
    async updatePassword(userId, currentPassword, newPassword) {
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const isValid = await this.usersService.validatePassword(user, currentPassword);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Current password is incorrect');
        }
        await this.usersService.updatePassword(userId, newPassword);
        return { success: true };
    }
    async updateEmail(userId, email, password) {
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const isValid = await this.usersService.validatePassword(user, password);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Password is incorrect');
        }
        await this.usersService.updateEmail(userId, email);
        return { success: true };
    }
    async deleteAccount(userId, password) {
        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new common_1.UnauthorizedException('User not found');
        }
        const isValid = await this.usersService.validatePassword(user, password);
        if (!isValid) {
            throw new common_1.UnauthorizedException('Password is incorrect');
        }
        await this.usersService.deleteUser(userId);
        return { success: true };
    }
    async forgotPassword(email) {
        const user = await this.usersService.findOne(email);
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        const resetToken = this.jwtService.sign({ email: user.email }, { expiresIn: '1h' });
        await this.usersService.saveResetToken(user._id.toString(), resetToken);
        return { success: true };
    }
    async resetPassword(token, newPassword) {
        try {
            const decoded = this.jwtService.verify(token);
            const user = await this.usersService.findOne(decoded.email);
            if (!user) {
                throw new common_1.BadRequestException('Invalid token');
            }
            await this.usersService.updatePassword(user._id.toString(), newPassword);
            return { success: true };
        }
        catch (error) {
            throw new common_1.BadRequestException('Invalid or expired token');
        }
    }
    async handleCallback(code) {
        throw new Error('OAuth callback not implemented');
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map