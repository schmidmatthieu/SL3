import { Document, Types } from 'mongoose';
export type UserDocument = User & Document;
export declare class User {
    _id: Types.ObjectId;
    email: string;
    password: string;
    username: string;
    roles: string[];
    profile: {
        avatar?: string;
        bio?: string;
        website?: string;
    };
    settings: Record<string, any>;
    isActive: boolean;
    get id(): Types.ObjectId;
    toObject(): any;
}
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, Document<unknown, any, User> & User & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, Document<unknown, {}, import("mongoose").FlatRecord<User>> & import("mongoose").FlatRecord<User> & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}>;
