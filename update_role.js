db = db.getSiblingDB('sl3');
db.users.updateOne({ email: 'info@ark.swiss' }, { $set: { role: 'admin' } }, { upsert: false });
db.users.find({ email: 'info@ark.swiss' }).pretty();
