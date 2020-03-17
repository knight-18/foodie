const express = require("express");
const bodyParser = require("body-parser");

const PORT = process.env.PORT || 5000;

const app = express();

const routes = require("./routes/index");

// Body Parser Middleware
app.use(bodyParser.json());

// Using the routes
app.use("/", routes);

app.listen(PORT, () => {
  console.log(`Listening on PORT:${PORT}
You can look at it at http://localhost:5000/`);
});
