const mongoose = require('mongoose');

async function main() {
  try {
    await mongoose.connect('mongodb+srv://tvhubcambodia:AAaa123*@gametopup.lpyyqcz.mongodb.net/delykastore?retryWrites=true&w=majority');
    console.log("Connected to MongoDB.");
    
    // Create the schema
    const DebugLog = mongoose.models.DebugLog || mongoose.model("DebugLog", new mongoose.Schema({ data: Object }, { strict: false, timestamps: true }));
    
    // Fetch the latest 3 logs
    const logs = await DebugLog.find({ event: "TELEGRAM_AUTH_FAILED" }).sort({ createdAt: -1 }).limit(3);
    
    console.log(`Found ${logs.length} logs.`);
    
    for (let log of logs) {
      console.log("-----------------------------------------");
      console.log(`Time: ${log.createdAt}`);
      console.log(`Bot Prefix: ${log.get('bot_token_prefix')}`);
      console.log(`Received Hash: ${log.get('received_hash')}`);
      console.log(`Computed HMAC: ${log.get('computed_hmac')}`);
      console.log(`Data Check String: \n${log.get('dataCheckString')}`);
      console.log(`Raw Credentials: ${JSON.stringify(log.get('raw_credentials'), null, 2)}`);
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await mongoose.disconnect();
  }
}

main();
