import mongoose from 'mongoose';

beforeAll(async () => {
  jest.setTimeout(30000); // Augmentation du timeout à 30 secondes
  
  // Utilisation de l'instance MongoDB Docker existante
  try {
    await mongoose.connect('mongodb://localhost:27017/test');
    console.log('Connected to Docker MongoDB instance');
  } catch (error) {
    console.error('Failed to connect to Docker MongoDB:', error);
    throw error;
  }
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});

afterEach(async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
  }
});
