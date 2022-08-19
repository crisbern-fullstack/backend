require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const DataQueryRoute = require("./routes/DataQueryRoute");
const AuthenticationRoute = require("./routes/AuthenticationRoute");
const EmailRoute = require("./routes/EmailRoute");
const cors = require("cors");

const app = express();

///middlewares
app.use(express.json());
app.use(express.static("storage/app/public"));

//prints in the console what kind of request was made
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});
app.use(cors());

//routes

//Authentication Routes
app.use("/", AuthenticationRoute);

//Data query routes for companies and employees
app.use("/api", DataQueryRoute);

//email related routes
app.use("/", EmailRoute);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT || 4000, () => {
      console.log("Listening on port", process.env.PORT);
    });
  })
  .catch((error) => {
    console.log(error);
  });
