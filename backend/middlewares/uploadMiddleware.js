import multer from 'multer';
import path from 'path';

// Determining where and how to save the file
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/'); // backend/uploads/ It will be saved in the folder named 'uploads' in the backend.
  },
  filename(req, file, cb) {
    // File name will be in the format: doc-timestamp.ext (e.g. doc-17182938.jpg)
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Determining the types of files that can be uploaded (Images and PDFs only)
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|pdf/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    // Correctly passing an Error Object and false value to the Callback to prevent Express from crashing
    cb(new Error('Images or PDFs only!'), false);
  }
}

export const uploadDoc = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});