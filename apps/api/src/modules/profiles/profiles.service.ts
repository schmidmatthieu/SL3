import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Profile, ProfileDocument } from './schemas/profile.schema';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class ProfilesService {
  private readonly logger = new Logger(ProfilesService.name);

  constructor(
    @InjectModel(Profile.name) private profileModel: Model<ProfileDocument>,
  ) {}

  async create(userId: string): Promise<Profile> {
    const profile = new this.profileModel({ userId });
    return profile.save();
  }

  async findByUserId(userId: string): Promise<Profile> {
    this.logger.log('Finding profile for userId:', userId);
    const profile = await this.profileModel.findOne({ userId }).exec();
    this.logger.log('Found profile:', profile);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  async update(userId: string, updateData: UpdateProfileDto): Promise<Profile> {
    this.logger.log('Updating profile for userId:', userId);
    this.logger.log('Update data:', updateData);

    // Filtrer les champs vides ou undefined
    const cleanedData = Object.fromEntries(
      Object.entries(updateData)
        .filter(([_, value]) => value !== undefined && value !== '')
    );

    this.logger.log('Cleaned update data:', cleanedData);

    try {
      // Mise à jour directe avec $set
      const updatedProfile = await this.profileModel
        .findOneAndUpdate(
          { userId },
          { $set: cleanedData },
          { 
            new: true, // Retourne le document mis à jour
            runValidators: true, // Active la validation du schéma
            lean: false // Retourne un document Mongoose complet
          }
        )
        .exec();

      if (!updatedProfile) {
        this.logger.error('Profile not found for update');
        throw new NotFoundException('Profile not found');
      }

      this.logger.log('Profile updated successfully:', updatedProfile);
      return updatedProfile;
    } catch (error) {
      this.logger.error('Error updating profile:', error);
      throw error;
    }
  }

  async delete(userId: string): Promise<Profile> {
    const profile = await this.profileModel.findOneAndDelete({ userId }).exec();
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }
}
