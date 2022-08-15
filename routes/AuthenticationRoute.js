const express = require("express");

const router = express.Router();

//controllers
const {
  AddEmployee,
  Login,
  IsAdmin,
} = require("../controllers/AuthenticationController");

//Add new user/employee
router.post("/signup", IsAdmin, AddEmployee);

router.post("/login", Login);

module.exports = router;
