const mongoose = require("mongoose");
const uri = "mongodb+srv://tvhubcambodia:AAaa123*@gametopup.lpyyqcz.mongodb.net/delykastore?retryWrites=true&w=majority";
mongoose.connect(uri)
  .then(() => mongoose.connection.db.collection("sliders").find().toArray())
  .then(res => { console.log(JSON.stringify(res, null, 2)); mongoose.disconnect(); })
  .catch(console.error);
