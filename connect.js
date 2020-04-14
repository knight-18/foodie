const mongoose = require("mongoose");

function connectDB() {
  var url;
  switch (process.env.NODE_ENV) {
    case "dev":
      url = "mongodb://localhost:27017/foodie";
      break;
    case "production":
      /* make url your production connection string for database */
      url =
        "mongodb+srv://test-user:2I4Llmp05T53EejP@cluster0-sndxq.mongodb.net/test?retryWrites=true&w=majority";
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
