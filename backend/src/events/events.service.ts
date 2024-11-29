import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Event } from './schemas/event.schema';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventsService {
  constructor(
    @InjectModel(Event.name) private readonly eventModel: Model<Event>
  ) {}

  private toObjectId(id: string | Types.ObjectId): Types.ObjectId {
    return typeof id === 'string' ? new Types.ObjectId(id) : id;
  }

  async create(userId: string | Types.ObjectId, createEventDto: CreateEventDto) {
    const event = new this.eventModel({
      ...createEventDto,
      creator: this.toObjectId(userId),
    });
    return event.save();
  }

  async findAll(query: any) {
    return this.eventModel.find(query).exec();
  }

  async findOne(id: string | Types.ObjectId) {
    return this.eventModel.findById(this.toObjectId(id)).exec();
  }

  async update(userId: string | Types.ObjectId, id: string | Types.ObjectId, updateEventDto: UpdateEventDto) {
    return this.eventModel
      .findOneAndUpdate(
        { _id: this.toObjectId(id), creator: this.toObjectId(userId) },
        updateEventDto,
        { new: true }
      )
      .exec();
  }

  async remove(userId: string | Types.ObjectId, id: string | Types.ObjectId) {
    return this.eventModel
      .findOneAndDelete({ _id: this.toObjectId(id), creator: this.toObjectId(userId) })
      .exec();
  }

  async uploadImage(userId: string | Types.ObjectId, id: string | Types.ObjectId, file: any) {
    return this.eventModel
      .findOneAndUpdate(
        { _id: this.toObjectId(id), creator: this.toObjectId(userId) },
        { imageUrl: file.path },
        { new: true }
      )
      .exec();
  }

  async deleteImage(userId: string | Types.ObjectId, id: string | Types.ObjectId) {
    return this.eventModel
      .findOneAndUpdate(
        { _id: this.toObjectId(id), creator: this.toObjectId(userId) },
        { $unset: { imageUrl: "" } },
        { new: true }
      )
      .exec();
  }

  async registerForEvent(userId: string | Types.ObjectId, eventId: string | Types.ObjectId) {
    return this.eventModel
      .findByIdAndUpdate(
        this.toObjectId(eventId),
        { $addToSet: { participants: this.toObjectId(userId) } },
        { new: true }
      )
      .exec();
  }

  async unregisterFromEvent(userId: string | Types.ObjectId, eventId: string | Types.ObjectId) {
    return this.eventModel
      .findByIdAndUpdate(
        this.toObjectId(eventId),
        { $pull: { participants: this.toObjectId(userId) } },
        { new: true }
      )
      .exec();
  }

  async getUserRegisteredEvents(userId: string | Types.ObjectId) {
    return this.eventModel
      .find({ participants: this.toObjectId(userId) })
      .exec();
  }

  async getUserCreatedEvents(userId: string | Types.ObjectId) {
    return this.eventModel
      .find({ creator: this.toObjectId(userId) })
      .exec();
  }
}
