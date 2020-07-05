const express = require("express");
const bodyParser = require("body-parser");

const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const cors = require("cors");
require("dotenv").config();

const PORT = process.env.PORT || 5000;

const app = express();
app.use(cors());

//Setting EJS view engine
// app.set('view engine','ejs');

//body parser
app.use(express.urlencoded({extended:true}));

//Setup for rendering static pages
//for static page
// app.use(express.static("public"))
// app.use(methodOverride("_method"));


const routes = require("./routes/index");
const connectDB = require("./connect");

// test version 2
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
        url: `https://knight-foodji.herokuapp.com/api`,
      },
      {
        url: `https://localhost:${PORT}/api/`,
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
