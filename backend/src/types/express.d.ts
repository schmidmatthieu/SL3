import { Request } from 'express';
import { User } from '../users/schemas/user.schema';
import { Types } from 'mongoose';

declare global {
  namespace Express {
    interface User {
      id: Types.ObjectId;
      email: string;
      // Add other user properties as needed
    }
    interface Request {
      user?: User;
    }
  }
}
