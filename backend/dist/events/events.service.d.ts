import { Model, Types } from 'mongoose';
import { Event } from './schemas/event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
export declare class EventsService {
    private readonly eventModel;
    constructor(eventModel: Model<Event>);
    private toObjectId;
    create(userId: string | Types.ObjectId, createEventDto: CreateEventDto): Promise<import("mongoose").Document<unknown, {}, Event> & Event & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAll(query: any): Promise<(import("mongoose").Document<unknown, {}, Event> & Event & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findOne(id: string | Types.ObjectId): Promise<import("mongoose").Document<unknown, {}, Event> & Event & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(userId: string | Types.ObjectId, id: string | Types.ObjectId, updateEventDto: UpdateEventDto): Promise<import("mongoose").Document<unknown, {}, Event> & Event & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    remove(userId: string | Types.ObjectId, id: string | Types.ObjectId): Promise<import("mongoose").Document<unknown, {}, Event> & Event & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    uploadImage(userId: string | Types.ObjectId, id: string | Types.ObjectId, file: any): Promise<import("mongoose").Document<unknown, {}, Event> & Event & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    deleteImage(userId: string | Types.ObjectId, id: string | Types.ObjectId): Promise<import("mongoose").Document<unknown, {}, Event> & Event & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    registerForEvent(userId: string | Types.ObjectId, eventId: string | Types.ObjectId): Promise<import("mongoose").Document<unknown, {}, Event> & Event & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    unregisterFromEvent(userId: string | Types.ObjectId, eventId: string | Types.ObjectId): Promise<import("mongoose").Document<unknown, {}, Event> & Event & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getUserRegisteredEvents(userId: string | Types.ObjectId): Promise<(import("mongoose").Document<unknown, {}, Event> & Event & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getUserCreatedEvents(userId: string | Types.ObjectId): Promise<(import("mongoose").Document<unknown, {}, Event> & Event & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
}
