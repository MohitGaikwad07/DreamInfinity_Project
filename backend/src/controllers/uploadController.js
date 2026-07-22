import { cloudinary } from '../config/cloudinary.js';
import { AppError } from '../utils/AppError.js';
import fs from 'fs';
import path from 'path';

const isCloudinaryConfigured = () => {
  return !!(process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_SECRET);
};

// Local storage helpers
const saveFileLocally = async (file, subfolder = 'general') => {
  const uploadDir = path.join(process.cwd(), 'uploads', subfolder);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
  const ext = path.extname(file.originalname);
  const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '-');
  const fileName = `${Date.now()}-${baseName}${ext}`;
  const filePath = path.join(uploadDir, fileName);
  
  await fs.promises.writeFile(filePath, file.buffer);
  
  const serverUrl = process.env.SERVER_URL || 'http://localhost:5000';
  return {
    secure_url: `${serverUrl}/uploads/${subfolder}/${fileName}`,
    public_id: `${subfolder}/${fileName}`,
    bytes: file.size,
    format: ext.replace(/^\./, ''),
  };
};

const deleteFileLocally = async (publicId) => {
  try {
    const filePath = path.join(process.cwd(), 'uploads', publicId);
    if (fs.existsSync(filePath)) {
      await fs.promises.unlink(filePath);
    }
  } catch (err) {
    console.error('Local delete failed:', err.message);
  }
  return { result: 'ok' };
};

export const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) throw new AppError('No file uploaded.', 400);

    const folder = req.body.folder || 'favour-ai/general';

    if (!isCloudinaryConfigured()) {
      const local = await saveFileLocally(req.file, folder.replace(/^favour-ai\//, ''));
      return res.status(200).json({
        success: true,
        url: local.secure_url,
        publicId: local.public_id,
        bytes: local.bytes,
        format: local.format,
      });
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',
      },
      (error, result) => {
        if (error) {
          return next(new AppError('Cloudinary upload failed: ' + error.message, 500));
        }
        return res.status(200).json({
          success: true,
          url: result.secure_url,
          publicId: result.public_id,
          bytes: result.bytes,
          format: result.format,
        });
      }
    );

    uploadStream.end(req.file.buffer);
  } catch (error) {
    return next(error);
  }
};

export const deleteFile = async (req, res, next) => {
  try {
    const { publicId } = req.body;
    if (!publicId) throw new AppError('Provide a publicId to delete.', 400);

    if (!isCloudinaryConfigured()) {
      await deleteFileLocally(publicId);
      return res.status(200).json({ success: true, result: 'ok' });
    }

    const result = await cloudinary.uploader.destroy(publicId);
    return res.status(200).json({ success: true, result });
  } catch (error) {
    return next(error);
  }
};
