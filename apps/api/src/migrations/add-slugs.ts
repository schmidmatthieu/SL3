import { connect, disconnect, Connection } from 'mongoose';
import { Types } from 'mongoose';
import { slugify } from '../utils/slugify';

async function generateUniqueSlug(
  collection: any,
  baseSlug: string,
  existingId?: Types.ObjectId
): Promise<string> {
  let slug = baseSlug;
  let counter = 1;
  let exists = true;

  while (exists) {
    const query = existingId
      ? { slug, _id: { $ne: existingId } }
      : { slug };
    
    const doc = await collection.findOne(query);
    if (!doc) {
      exists = false;
    } else {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
  }

  return slug;
}

async function migrateCollection(connection: Connection, collectionName: string, titleField: string) {
  console.log(`\nMigrating ${collectionName}...`);
  const collection = connection.collection(collectionName);

  // Supprimer l'index s'il existe
  try {
    await collection.dropIndex('slug_1');
    console.log('Dropped existing slug index');
  } catch (error) {
    console.log('No existing slug index to drop');
  }

  // Get all documents that need a slug
  const documents = await collection.find({
    $or: [
      { slug: { $exists: false } },
      { slug: null }
    ]
  }).toArray();
  
  console.log(`Found ${documents.length} documents that need slugs`);

  let updated = 0;
  for (const doc of documents) {
    if (!doc[titleField]) {
      console.warn(`Warning: Document ${doc._id} has no ${titleField}, skipping...`);
      continue;
    }

    const baseSlug = slugify(doc[titleField]);
    const uniqueSlug = await generateUniqueSlug(collection, baseSlug, doc._id);

    await collection.updateOne(
      { _id: doc._id },
      { $set: { slug: uniqueSlug } }
    );
    updated++;

    if (updated % 100 === 0) {
      console.log(`Updated ${updated} documents`);
    }
  }

  // Create the unique index after all documents have been updated
  await collection.createIndex({ slug: 1 }, { unique: true, sparse: true });
  console.log(`Created unique slug index`);

  console.log(`Completed migrating ${updated} documents in ${collectionName}`);
}

async function main() {
  let connection: Connection | null = null;
  
  try {
    // Connexion à MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sl3_beta';
    console.log('Connecting to MongoDB...');
    connection = (await connect(MONGODB_URI)).connection;
    console.log('Connected to MongoDB');

    // Migrer les événements
    await migrateCollection(connection, 'events', 'title');

    // Migrer les rooms
    await migrateCollection(connection, 'rooms', 'name');

    console.log('\nMigration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    if (connection) {
      await disconnect();
    }
  }
}

// Exécuter la migration
main();
