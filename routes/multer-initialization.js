const multer = require("multer");
const path = require("path");

//Multer Initialization
//Multer File Filter
const fileFilter = async (req, file, callback) => {
  const mime_type = file.mimetype;

  if (mime_type === "image/jpeg" || mime_type === "image/png") {
    return callback(null, true);
  } else {
    return callback(
      new Error(
        "Invalid file format. Please upload an image with .jpeg or .png extension"
      )
    );
  }
};

//needs fixing
//study express error handler
const uploadMiddleware = (req, res, next) => {
  //multer storage
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "./storage/app/public");
    },
    filename: (req, file, cb) => {
      let company_name = req.body.name;
      company_name = company_name.replaceAll(" ", "-");

      const file_name =
        Date.now() + "-" + company_name + path.extname(file.originalname); //name format: <date in milliseconds>-<company name>-<file extension>
      cb(null, file_name);
    },
  });

  //initialize multer
  const upload = multer({
    storage: storage,
    limits: {
      fileSize: 2097152,
    },
    fileFilter: fileFilter,
  }).single("company-logo");

  //error handling
  upload(req, res, async (error) => {
    if (error instanceof multer.MulterError) {
      const err = new Error("Multer Error");
      next(err);
      return res.status(400).json({ error: error.message });
    } else if (error) {
      const err = new Error("Error Unknown");
      next(err);
      return res.status(400).json({ error: error.message });
    }
    next();
  });
};

module.exports = { uploadMiddleware };
