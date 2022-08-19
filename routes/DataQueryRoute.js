const express = require("express");
const { fileUpload } = require("../middlewares/file-upload");

//controllers
const {
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
} = require("../controllers/DataQueryController");

const {
  CheckAuthentication,
  IsAdmin,
} = require("../middlewares/authentication");

//import the express router
const router = express.Router();

//routers start here
router.use(CheckAuthentication);

//Get All Companies
router.get("/companies", GetAllCompanies);

//Get one company
router.get("/company/:id", GetOneCompany);

//Add New Company (admin only)
router.post("/company", IsAdmin, fileUpload, AddCompany);

//Delete a company (admin only)
router.delete("/company/:id", IsAdmin, DeleteCompany);

//Update a company (admin only)
router.patch("/company/:id", IsAdmin, fileUpload, UpdateCompany);

//Employees
//Get All Employees
router.get("/all-employees", GetAllEmployees);

//Get one employee
router.get("/employee/:id", GetOneEmployee);

//Delete employee
router.delete("/delete-employee/:id", IsAdmin, DeleteEmployee);

//Update employee
router.patch("/update-employee/:id", IsAdmin, UpdateEmployee);

//gets data such as number of users and employees
router.get("/meta", GetMeta);

//exporting created routes
module.exports = router;
