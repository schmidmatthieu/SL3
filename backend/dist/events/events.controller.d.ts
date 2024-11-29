import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { Request as ExpressRequest } from 'express';
export declare class EventsController {
    private readonly eventsService;
    constructor(eventsService: EventsService);
    create(req: ExpressRequest, createEventDto: CreateEventDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/event.schema").Event> & import("./schemas/event.schema").Event & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    findAll(page?: number, limit?: number, search?: string, category?: string, startDate?: string, endDate?: string, location?: string): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/event.schema").Event> & import("./schemas/event.schema").Event & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/event.schema").Event> & import("./schemas/event.schema").Event & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    update(req: ExpressRequest, id: string, updateEventDto: UpdateEventDto): Promise<import("mongoose").Document<unknown, {}, import("./schemas/event.schema").Event> & import("./schemas/event.schema").Event & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    remove(req: ExpressRequest, id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/event.schema").Event> & import("./schemas/event.schema").Event & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    uploadImage(req: ExpressRequest, id: string, file: any): Promise<import("mongoose").Document<unknown, {}, import("./schemas/event.schema").Event> & import("./schemas/event.schema").Event & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    deleteImage(req: ExpressRequest, id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/event.schema").Event> & import("./schemas/event.schema").Event & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    registerForEvent(req: ExpressRequest, id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/event.schema").Event> & import("./schemas/event.schema").Event & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    unregisterFromEvent(req: ExpressRequest, id: string): Promise<import("mongoose").Document<unknown, {}, import("./schemas/event.schema").Event> & import("./schemas/event.schema").Event & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }>;
    getUserRegisteredEvents(req: ExpressRequest): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/event.schema").Event> & import("./schemas/event.schema").Event & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getUserCreatedEvents(req: ExpressRequest): Promise<(import("mongoose").Document<unknown, {}, import("./schemas/event.schema").Event> & import("./schemas/event.schema").Event & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
}
