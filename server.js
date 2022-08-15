require("dotenv").config();

const express = require("express"); //express import
const mongoose = require("mongoose"); //mongoose import
const DataQueryRoute = require("./routes/DataQueryRoute"); //Routes for querying employees and companies
const AuthenticationRoute = require("./routes/AuthenticationRoute"); //Routes for Authentication
const EmailRoute = require("./routes/EmailRoute");
const cors = require("cors");

const app = express();

///middlewares
app.use(express.json());
app.use(express.static("storage/app/public"));

//print in the console what kind of request was made
app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});
app.use(cors());

//routes

//Authentication
app.use("/", AuthenticationRoute);

//Data query for companies and employees
app.use("/api", DataQueryRoute);

//email sending
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
