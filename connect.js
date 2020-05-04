const mongoose = require("mongoose");

function connectDB() {
  var url;
  switch (process.env.NODE_ENV) {
    case "dev":
      url = "mongodb://localhost:27017/foodie";
      break;
    case "production":
      /* make url your production connection string for database */
      url = process.env.MONGODB_URL;
      break;
    default:
      // In dev mode by default
      url = "mongodb://localhost:27017/foodie";
  }
  mongoose.connect(
    url,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
    (err) => {
      if (err) console.log(err);
      else console.log("Database Connected!");
    }
  );
}

module.exports = connectDB;
