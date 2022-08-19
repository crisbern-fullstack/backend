const jwt = require("jsonwebtoken");
const EmployeeModel = require("../models/EmployeeModel");

//Checks if user is authenticated
const CheckAuthentication = async (req, res, next) => {
  const { authorization } = req.headers;

  if (!authorization) {
    return res.status(401).json({ message: "Authorization is required." });
  }

  const token = authorization.split(" ")[1];

  try {
    const { _id } = jwt.verify(token, process.env.JWT_SECRET);

    const user = await EmployeeModel.findById(_id).select("_id email");
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized." });
  }
};

const IsAdmin = async (req, res, next) => {
  const { authorization } = req.headers;

  const token = authorization.split(" ")[1];

  try {
    const { _id } = jwt.verify(token, process.env.JWT_SECRET);

    const user = await EmployeeModel.findById(_id).select("_id email is_admin");

    if (user.is_admin) {
      next();
    } else {
      return res
        .status(401)
        .json({ message: "Logged in. But unauthorized to make this request." });
    }
  } catch (err) {
    return res
      .status(401)
      .json({ message: "Logged in. But unauthorized to make this request." });
  }
};

module.exports = {
  CheckAuthentication,
  IsAdmin,
};
