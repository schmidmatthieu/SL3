import { Connection } from 'mongoose';
import { Logger } from '@nestjs/common';

const logger = new Logger('MergeUsersProfiles');

export const up = async (connection: Connection) => {
  const db = connection.db;
  logger.log('Starting migration: Merging users and profiles collections');

  try {
    const users = await db.collection('users').find().toArray();
    const profiles = await db.collection('profiles').find().toArray();

    logger.log(`Found ${users.length} users and ${profiles.length} profiles`);

    // Créer un index pour optimiser les recherches
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ username: 1 }, { unique: true });

    // Pour chaque utilisateur, fusionner avec son profil
    for (const user of users) {
      const profile = profiles.find(p => p.userId.toString() === user._id.toString());
      if (profile) {
        await db.collection('users').updateOne(
          { _id: user._id },
          {
            $set: {
              firstName: profile.firstName || '',
              lastName: profile.lastName || '',
              bio: profile.bio || '',
              imageUrl: profile.imageUrl || '',
              preferredLanguage: profile.preferredLanguage || 'en',
              theme: profile.theme || 'system',
            },
            $unset: { profile: "" }
          }
        );
        logger.log(`Updated user ${user._id} with profile data`);
      }
    }

    // Supprimer la collection profiles
    if (profiles.length > 0) {
      await db.collection('profiles').drop();
      logger.log('Dropped profiles collection');
    }

    logger.log('Migration completed successfully');
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  }
};

export const down = async (connection: Connection) => {
  const db = connection.db;
  logger.log('Starting rollback: Separating users and profiles collections');

  try {
    // Créer la collection profiles
    await db.createCollection('profiles');
    logger.log('Created profiles collection');

    // Pour chaque utilisateur, créer un profil
    const users = await db.collection('users').find().toArray();
    for (const user of users) {
      const profileData = {
        userId: user._id,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        bio: user.bio || '',
        imageUrl: user.imageUrl || '',
        preferredLanguage: user.preferredLanguage || 'en',
        theme: user.theme || 'system',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const profile = await db.collection('profiles').insertOne(profileData);
      logger.log(`Created profile for user ${user._id}`);

      // Mettre à jour l'utilisateur avec la référence du profil
      await db.collection('users').updateOne(
        { _id: user._id },
        {
          $set: { profile: profile.insertedId },
          $unset: {
            firstName: "",
            lastName: "",
            bio: "",
            imageUrl: "",
            preferredLanguage: "",
            theme: "",
          }
        }
      );
      logger.log(`Updated user ${user._id} with profile reference`);
    }

    logger.log('Rollback completed successfully');
  } catch (error) {
    logger.error('Rollback failed:', error);
    throw error;
  }
};
