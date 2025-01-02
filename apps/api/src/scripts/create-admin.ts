import { connect, connection, model } from 'mongoose';
import { ProfileSchema } from '../modules/roles/schemas/profile.schema';
import { UserSchema } from '../modules/users/schemas/user.schema';

async function createAdmin() {
  try {
    // Connexion à MongoDB
    await connect('mongodb://localhost:27017/sl3_beta');

    // Créer les modèles
    const UserModel = model('User', UserSchema);
    const ProfileModel = model('Profile', ProfileSchema);

    // Trouver l'utilisateur par email
    const user = await UserModel.findOne({ email: 'matthieu@ark.swiss' });

    if (!user) {
      console.error('User not found');
      return;
    }

    // Créer ou mettre à jour le profil avec le rôle admin
    const result = await ProfileModel.findOneAndUpdate(
      { userId: user._id },
      {
        userId: user._id,
        role: 'admin',
        updatedAt: new Date(),
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      },
    );

    console.log('Admin profile created/updated:', result);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.close();
  }
}

createAdmin();
