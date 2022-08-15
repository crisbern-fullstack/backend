const express = require("express");
const { uploadMiddleware } = require("./multer-initialization");

//controllers
const {
  GetAllCompanies,
  GetPaginatedCompanies,
  GetCompaniesCount,
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
} = require("../controllers/AuthenticationController");

//import the express router
const router = express.Router();

//routers start here
router.use(CheckAuthentication);

//Get All Companies
router.get("/all-companies", GetAllCompanies);

//Get Companies but Paginated

router.get("/companies-count", GetCompaniesCount);

//Get one company
router.get("/company/:id", GetOneCompany);

//Add New Company (admin only)
router.post("/new-company", IsAdmin, uploadMiddleware, AddCompany);

//Delete a company (admin only)
router.delete("/delete-company/:id", IsAdmin, DeleteCompany);

//Update a company (admin only)
router.patch("/update-company/:id", IsAdmin, uploadMiddleware, UpdateCompany);

//Employees
//Get All Employees
router.get("/all-employees", GetAllEmployees);

//Get one employee
router.get("/employee/:id", GetOneEmployee);

//Delete employee
router.delete("/delete-employee/:id", IsAdmin, DeleteEmployee);

//Update employee
router.patch("/update-employee/:id", IsAdmin, UpdateEmployee);

router.get("/meta", GetMeta);

//exporting created routes
module.exports = router;
