const mongoose = require("mongoose");
const { customEmailValidator } = require("./custom-validators");
const bcrypt = require("bcrypt");

const Schema = mongoose.Schema;

/* Employree Schema fields are as follows
1. First Name (required)
2. Last Name (required)
3. Company (foreign key)
4. Email
5. Password
6. Phone
*/
const EmployeeSchema = new Schema(
  {
    first_name: {
      type: String,
      required: [true, "First name is required."],
    },
    last_name: {
      type: String,
      required: [true, "Last name is required."],
    },
    company: {
      type: String,
    },
    email: {
      type: String,
      validate: [customEmailValidator, "Invalid email address."],
      unique: [true, "Email already exists."],
      required: [true, "Email is required!"],
    },
    password: {
      type: String,
      required: [true, "Password"],
    },
    phone: {
      type: String,
    },
    is_admin: {
      type: Boolean,
      required: [true, "is admin role is required"],
    },
  },
  { timestamps: true }
);

//hashes passwords
EmployeeSchema.pre("save", async function (next) {
  const saltRounds = 10;
  const salt = await bcrypt.genSalt(saltRounds);

  this.password = await bcrypt.hash(this.password, salt);

  next();
});

module.exports = mongoose.model("EmployeeSchema", EmployeeSchema);
