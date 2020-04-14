const express = require("express");
const bodyParser = require("body-parser");

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
require("dotenv").config();

const PORT = process.env.PORT;

const app = express();

const routes = require("./routes/index");
const connectDB = require("./connect");

//==========================Swagger set up========================
const options = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "Foodie backend",
      version: "1.0.0",
      description: "Backend for the foodie app",
      contact: {
        name: "Foodie",
        url: "https://www.github.com/KaviiSuri/foodie",
      },
    },
    servers: [
      {
        url: `https://foodie-test-deployment.herokuapp.com/api/`,
      },
    ],
  },
  apis: ["./routes/*.js", "./models/*.js"],
};

const specs = swaggerJsdoc(options);
app.use("/api/docs", swaggerUi.serve);
app.get(
  "/api/docs",
  swaggerUi.setup(specs, {
    explorer: true,
  })
);

// Body Parser Middleware
app.use(bodyParser.json());

// Connecting to the database
connectDB();

// Using the routes
app.use("/", routes);

app.listen(PORT, () => {
  console.log(`Listening on PORT:${PORT}
You can look at it at http://localhost:${PORT}/`);
});
