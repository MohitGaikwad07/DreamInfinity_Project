import multer from 'multer';
import { AppError } from '../utils/AppError.js';

const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => callback(null, allowedTypes.includes(file.mimetype)),
});

export const uploadResume = (req, res, next) => upload.single('resume')(req, res, (error) => {
  if (error) return next(error);
  if (!req.file) return next(new AppError('Upload a PDF or DOCX resume up to 8 MB.', 400));
  return next();
});

const allowedMediaTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
const mediaUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, callback) => callback(null, allowedMediaTypes.includes(file.mimetype)),
});

export const uploadMedia = (req, res, next) => mediaUpload.single('file')(req, res, (error) => {
  if (error) return next(error);
  if (!req.file) return next(new AppError('Upload a PDF or an image (JPEG, PNG, WebP) up to 10 MB.', 400));
  return next();
});
