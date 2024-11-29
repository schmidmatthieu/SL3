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
exports.EventsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const event_schema_1 = require("./schemas/event.schema");
let EventsService = class EventsService {
    constructor(eventModel) {
        this.eventModel = eventModel;
    }
    toObjectId(id) {
        return typeof id === 'string' ? new mongoose_2.Types.ObjectId(id) : id;
    }
    async create(userId, createEventDto) {
        const event = new this.eventModel({
            ...createEventDto,
            creator: this.toObjectId(userId),
        });
        return event.save();
    }
    async findAll(query) {
        return this.eventModel.find(query).exec();
    }
    async findOne(id) {
        return this.eventModel.findById(this.toObjectId(id)).exec();
    }
    async update(userId, id, updateEventDto) {
        return this.eventModel
            .findOneAndUpdate({ _id: this.toObjectId(id), creator: this.toObjectId(userId) }, updateEventDto, { new: true })
            .exec();
    }
    async remove(userId, id) {
        return this.eventModel
            .findOneAndDelete({ _id: this.toObjectId(id), creator: this.toObjectId(userId) })
            .exec();
    }
    async uploadImage(userId, id, file) {
        return this.eventModel
            .findOneAndUpdate({ _id: this.toObjectId(id), creator: this.toObjectId(userId) }, { imageUrl: file.path }, { new: true })
            .exec();
    }
    async deleteImage(userId, id) {
        return this.eventModel
            .findOneAndUpdate({ _id: this.toObjectId(id), creator: this.toObjectId(userId) }, { $unset: { imageUrl: "" } }, { new: true })
            .exec();
    }
    async registerForEvent(userId, eventId) {
        return this.eventModel
            .findByIdAndUpdate(this.toObjectId(eventId), { $addToSet: { participants: this.toObjectId(userId) } }, { new: true })
            .exec();
    }
    async unregisterFromEvent(userId, eventId) {
        return this.eventModel
            .findByIdAndUpdate(this.toObjectId(eventId), { $pull: { participants: this.toObjectId(userId) } }, { new: true })
            .exec();
    }
    async getUserRegisteredEvents(userId) {
        return this.eventModel
            .find({ participants: this.toObjectId(userId) })
            .exec();
    }
    async getUserCreatedEvents(userId) {
        return this.eventModel
            .find({ creator: this.toObjectId(userId) })
            .exec();
    }
};
exports.EventsService = EventsService;
exports.EventsService = EventsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(event_schema_1.Event.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], EventsService);
//# sourceMappingURL=events.service.js.map