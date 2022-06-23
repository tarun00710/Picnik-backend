const mongoose = require("mongoose");
const mongooseURL =
  "mongodb+srv://Tarun:Tarun%406750@picnik.cdqkf.mongodb.net/test?authSource=admin&replicaSet=atlas-11chc7-shard-0&readPreference=primary&appname=MongoDB%20Compass&ssl=true";

const ConnectionDB = async () => {
  try {
    const Connection = await mongoose.connect(mongooseURL);
    if (Connection) 
      console.log("connected to DB");
    else 
      console.log("Couldn't connect to MongoDB");
  } catch (error) {
    console.log(error);
  }
};

module.exports = { ConnectionDB };
