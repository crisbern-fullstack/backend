const mongoose = require("mongoose");
const CompanyModel = require("../models/CompanyModel");
const EmployeeModel = require("../models/EmployeeModel");
const sizeOf = require("image-size");
const fs = require("fs");
const bcrypt = require("bcrypt");
const { sendEmail } = require("../email-test");

//QUERIES FOR COMPANY DATA
//Get all companies
const GetAllCompanies = async (req, res) => {
  const sortBy = {};
  const field = req.query.field;
  const order = parseInt(req.query.order);
  const limit = req.query.limit;
  const skip = req.query.skip;

  sortBy[field] = order;

  try {
    const companies = await CompanyModel.find({})
      .skip(skip)
      .limit(limit)
      .sort(sortBy);

    return res.status(200).json(companies);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const GetPaginatedCompanies = async (req, res) => {};

const GetCompaniesCount = async (req, res) => {
  try {
    const companies = await CompanyModel.countDocuments();
    return res.status(200).json({ companies_count: companies });
  } catch (error) {
    return res.status(400).json({ message: "Error in loading data." });
  }
};

//Get one company
//uses _id
const GetOneCompany = async (req, res) => {
  const { id } = req.params;

  //checks if passed id is valid
  //invalid IDs can crash the server
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  const company = await CompanyModel.findById(id);

  if (!company) {
    return res.status(404).json({ message: "Company Not Found" });
  }

  const company_json = company.toJSON(); //done to attach employees properties

  const company_employees = await EmployeeModel.find({ company: id }); //get employees of the company
  company_json.employees = company_employees; //attaches the employees to the body

  return res.status(200).json(company_json);
};

//Add New Company
const AddCompany = async (req, res) => {
  let logo = "";

  //if no image is uploaded, the path will be blank
  if (req.file) {
    logo = req.file.path;
    const image_dimension = sizeOf(logo);

    //checks image dimensions if at least 100 x 100 pixels
    if (image_dimension.height < 100 || image_dimension.width < 100) {
      //deletes image if smaller than 100 x 100 px.
      fs.unlink(logo, (err) => {
        if (err) {
          return res.status(400).json({ message: err.message });
        }
      });

      //sends status and tells that the dimensions of the image is smaller than 100x100.
      return res.status(400).json({
        message: "Image is too small. Minimum dimensions are 100px by 100px.",
      });
    }

    logo = req.file.filename;
  }

  try {
    const new_company = await CompanyModel.create({
      name: req.body.name,
      email: req.body.email,
      logo: logo,
      website: req.body.website,
    });

    //get emails of all employees [{email: '<email value>'}]
    const employee_emails_objects = await EmployeeModel.find().select(
      "email -_id"
    );
    let employee_emails = []; //[email, email]

    employee_emails_objects.map((mapped_email) =>
      employee_emails.push(mapped_email.email)
    );

    await sendEmail({
      sender: '"Admin" admin@admin.com',
      subject: `A new company has been added - ${new_company.name}`,
      text: `<ul> <li><b>Company Name: </b>${new_company.name} </li> <li><b>Email:</b> ${new_company.email}</li> <li><b>Website:</b> ${new_company.website}</li> </ul>`,
      html: `<ul> <li><b>Company Name: </b>${new_company.name} </li> <li><b>Email:</b> ${new_company.email}</li> <li><b>Website:</b> ${new_company.website}</li> </ul>`,
      receivers: employee_emails,
      company: new_company.name,
    });

    return res.status(200).json(new_company);
  } catch (error) {
    //File uploads even other field validations failed
    //this if statemet deletes the image if other validations faiked
    if (req.file) {
      logo = req.file.path;

      fs.unlink(logo, (err) => {
        if (err) {
          return res.status(400).json({ message: err.message });
        }
      });
    }

    return res.status(400).json({ error: error.message });
  }
};

//Delete a Company
//uses _id
const DeleteCompany = async (req, res) => {
  const { id } = req.params;

  //checks if passed id is valid
  //invalid IDs can crash the server
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  const deleted_company = await CompanyModel.findByIdAndDelete(id);

  if (!deleted_company) {
    return res.status(404).json({ message: "Company not found" });
  }

  //deletes logo if it exists
  if (deleted_company.logo) {
    fs.unlink("storage/app/public/" + deleted_company.logo, (err) => {
      if (err) {
        console.log(err);
      }
    });
  }

  res.status(200).json(deleted_company);
};

//update company
const UpdateCompany = async (req, res) => {
  const { id } = req.params;
  let update = {};

  if (!req.file) {
    update = { ...req.body };
  } else {
    const image_dimension = sizeOf(req.file.path);

    //checks image dimensions if at least 100 x 100 pixels
    if (image_dimension.height < 100 && image_dimension.width < 100) {
      //deletes image if smaller than 100 x 100 px.
      fs.unlink(req.file.path, (err) => {
        if (err) {
          return res.status(400).json({ message: err.message });
        }
      });

      //sends status and tells that the dimensions of the image is smaller than 100x100.
      return res.status(400).json({
        message: "Image is too small. Minimum dimensions are 100px by 100px.",
      });
    }

    update = {
      name: req.body.name,
      email: req.body.email,
      logo: req.file.filename,
      website: req.body.website,
    };
  }

  //checks if passed id is valid
  //invalid IDs can crash the server
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  try {
    const old_photo = await CompanyModel.findOne({ _id: id }).select("logo");

    const company = await CompanyModel.findOneAndUpdate({ _id: id }, update, {
      runValidators: true, //runs validator
      new: true,
    });
    const company_json = await company.toJSON();

    if (!company) {
      return res.status(404).json({ error: "Company not found" });
    }

    //deletes past logo and replaces it with the new one
    if (company.logo && req.file) {
      fs.unlink("storage/app/public/" + old_photo.logo, (err) => {
        if (err) {
          console.log(err);
        }
      });
    }

    const company_employees = await EmployeeModel.find({ company: id }); //get employees of the company
    company_json.employees = company_employees; //attaches the employees to the body

    return res.status(200).json(company_json);
  } catch (error) {
    //File uploads even other field validations failed
    //this if statemet deletes the image if other validations faiked
    if (req.file) {
      logo = req.file.path;

      fs.unlink(logo, (err) => {
        if (err) {
          return res.status(400).json({ message: err.message });
        }
      });
    }
    return res.status(400).json({ error: error.message });
  }
};

//Employees Queries
//Get all Employees
const GetAllEmployees = async (req, res) => {
  try {
    const employees = await EmployeeModel.find({}).sort({ name: 1 });
    return res.status(200).json(employees);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

//Get one Employee
const GetOneEmployee = async (req, res) => {
  const { id } = req.params;

  //checks if passed id is valid
  //invalid IDs can crash the server
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  const employee = await EmployeeModel.findById(id);

  if (!employee) {
    return res.status(404).json({ message: "Company Not Found" });
  }

  return res.status(200).json(employee);
};

//Delete employee
const DeleteEmployee = async (req, res) => {
  const { id } = req.params;

  //checks if passed id is valid
  //invalid IDs can crash the server
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  const deleted_employee = await EmployeeModel.findByIdAndDelete(id);

  if (!deleted_employee) {
    return res.status(404).json({ message: "Employee not found." });
  }

  return res.status(200).json(deleted_employee);
};

//update employees
const UpdateEmployee = async (req, res) => {
  const { id } = req.params;

  //checks if passed id is valid
  //invalid IDs can crash the server
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid ID" });
  }

  if (req.body.hasOwnProperty("current_password")) {
    const fetched_employee = await EmployeeModel.findById(id);

    const matched = await bcrypt.compare(
      req.body.current_password,
      fetched_employee.password
    );

    if (!matched) {
      return res.status(400).json({ error: "Wrong password." });
    } else {
      //hash
      //pre does not run on update
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);

      req.body.password = await bcrypt.hash(req.body.password, salt);
    }
  }

  //runs validator
  try {
    const employee = await EmployeeModel.findOneAndUpdate(
      { _id: id },
      { ...req.body },
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    return res.status(200).json(employee);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};

const GetMeta = async (req, res) => {
  try {
    const companies = await CompanyModel.countDocuments();
    const employees = await EmployeeModel.countDocuments();
    return res.status(200).json({ companies: companies, employees: employees });
  } catch (error) {
    return res.status(400).json({ message: "Error in loading data." });
  }
};

module.exports = {
  GetAllCompanies,
  AddCompany,
  GetOneCompany,
  DeleteCompany,
  UpdateCompany,
  GetAllEmployees,
  GetOneEmployee,
  DeleteEmployee,
  UpdateEmployee,
  GetMeta,
  GetCompaniesCount,
  GetPaginatedCompanies,
};
