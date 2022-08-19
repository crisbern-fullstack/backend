const jwt = require("jsonwebtoken");
const EmployeeModel = require("../models/EmployeeModel");
const bcrypt = require("bcrypt");
require("dotenv").config();

const createToken = async (_id) => {
  return jwt.sign({ _id }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });
};

//Add Employee or sign up. Only admin can add employees
const AddEmployee = async (req, res) => {
  try {
    req.body.password = "password";
    const new_employee = await EmployeeModel.create(req.body);

    const token = await createToken(new_employee._id);

    return res.status(200).json(new_employee);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

//Login
const Login = async (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  const user = await EmployeeModel.findOne({ email: email });

  //finds user by email
  //return a response if no such user found
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  //executes if there is a user
  const passwords_matched = await bcrypt.compare(password, user.password);

  if (passwords_matched) {
    const token = await createToken(user._id);
    return res.status(200).json({
      email: user.email,
      token: token,
      isAdmin: user.is_admin,
    });
  }

  return res
    .status(400)
    .json({ message: "Credentials did not match our records." });
};

module.exports = {
  AddEmployee,
  Login,
};
