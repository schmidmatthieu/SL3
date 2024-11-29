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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const user_schema_1 = require("./schemas/user.schema");
const bcrypt = require("bcrypt");
let UsersService = class UsersService {
    constructor(userModel) {
        this.userModel = userModel;
    }
    toObjectId(id) {
        return typeof id === 'string' ? new mongoose_2.Types.ObjectId(id) : id;
    }
    async onModuleInit() {
        await this.createSuperAdmin();
    }
    async createSuperAdmin() {
        const email = 'matthieu@ark.swiss';
        const password = '159753Yxc!';
        const username = 'Matthieu Schmid';
        const role = 'super-admin';
        const existingUser = await this.findOne(email);
        if (!existingUser) {
            const hashedPassword = await bcrypt.hash(password, 10);
            const user = new this.userModel({
                email,
                password: hashedPassword,
                username,
                role,
            });
            await user.save();
            console.log('Super admin user created:', email);
        }
        else {
            console.log('Super admin user already exists:', email);
        }
    }
    async create(email, password, username) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new this.userModel({
            email,
            password: hashedPassword,
            username: username || email.split('@')[0],
        });
        return user.save();
    }
    async findOne(email) {
        return this.userModel.findOne({ email }).exec();
    }
    async findById(id) {
        return this.userModel.findById(this.toObjectId(id)).exec();
    }
    async updateProfile(userId, profile) {
        return this.userModel
            .findByIdAndUpdate(this.toObjectId(userId), { $set: { profile } }, { new: true })
            .exec();
    }
    async validatePassword(user, password) {
        return bcrypt.compare(password, user.password);
    }
    async updatePassword(userId, newPassword) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.userModel
            .findByIdAndUpdate(this.toObjectId(userId), { password: hashedPassword })
            .exec();
    }
    async updateEmail(userId, email) {
        await this.userModel
            .findByIdAndUpdate(this.toObjectId(userId), { email })
            .exec();
    }
    async deleteUser(userId) {
        const result = await this.userModel.findByIdAndDelete(this.toObjectId(userId)).exec();
        if (!result) {
            throw new common_1.NotFoundException('User not found');
        }
    }
    async saveResetToken(userId, token) {
        await this.userModel
            .findByIdAndUpdate(this.toObjectId(userId), { resetToken: token })
            .exec();
    }
    async uploadAvatar(userId, avatarUrl) {
        await this.userModel
            .findByIdAndUpdate(this.toObjectId(userId), { 'profile.avatar': avatarUrl })
            .exec();
    }
    async deleteAvatar(userId) {
        await this.userModel
            .findByIdAndUpdate(this.toObjectId(userId), { $unset: { 'profile.avatar': 1 } })
            .exec();
    }
    async findAll(page, limit, search) {
        const query = search ? { email: new RegExp(search, 'i') } : {};
        return this.userModel
            .find(query)
            .skip((page - 1) * limit)
            .limit(limit)
            .exec();
    }
    async getSettings(userId) {
        const user = await this.findById(userId);
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        return user.settings;
    }
    async updateSettings(userId, settings) {
        await this.userModel
            .findByIdAndUpdate(this.toObjectId(userId), { settings })
            .exec();
    }
    async updateRole(userId, role) {
        await this.userModel.findByIdAndUpdate(this.toObjectId(userId), { role }, { new: true }).exec();
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_schema_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], UsersService);
//# sourceMappingURL=users.service.js.map