import { Document, Types } from 'mongoose';
export type EventDocument = Event & Document;
export declare class Event {
    _id: Types.ObjectId;
    title: string;
    description: string;
    date: Date;
    location: string;
    imageUrl?: string;
    creator: Types.ObjectId;
    participants: Types.ObjectId[];
    metadata: Record<string, any>;
    get id(): Types.ObjectId;
}
export declare const EventSchema: import("mongoose").Schema<Event, import("mongoose").Model<Event, any, any, any, Document<unknown, any, Event> & Event & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Event, Document<unknown, {}, import("mongoose").FlatRecord<Event>> & import("mongoose").FlatRecord<Event> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
