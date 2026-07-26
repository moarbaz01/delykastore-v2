const mongoose = require('mongoose');

async function main() {
  await mongoose.connect('mongodb+srv://tvhubcambodia:AAaa123*@gametopup.lpyyqcz.mongodb.net/delykastore?retryWrites=true&w=majority');
  
  const db = mongoose.connection.db;
  const users = await db.collection('users').find({ role: { $regex: /admin/i } }).toArray();
  console.log("Admin Users in DB:", users);
  process.exit(0);
}

main().catch(console.error);
