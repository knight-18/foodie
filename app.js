const express = require("express");
const bodyParser = require("body-parser");

const PORT = process.env.PORT || 5000;

const app = express();

const routes = require("./routes/index");
const connectDB = require("./connect");

// Body Parser Middleware
app.use(bodyParser.json());

// Connecting to the database
connectDB();

// Using the routes
app.use("/", routes);

app.listen(PORT, () => {
  console.log(`Listening on PORT:${PORT}
You can look at it at http://localhost:5000/`);
});
