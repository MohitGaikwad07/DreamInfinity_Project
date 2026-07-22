import { Readable } from 'node:stream';
import { cloudinary } from '../../config/cloudinary.js';
import fs from 'fs';
import path from 'path';

const isCloudinaryConfigured = () => {
  return !!(process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_SECRET);
};

export const uploadResumeFile = async (file) => {
  if (!isCloudinaryConfigured()) {
    const local = await saveFileLocally(file, 'resumes');
    return {
      secure_url: local.secure_url,
      public_id: local.public_id,
      bytes: local.bytes,
      format: local.format,
    };
  }
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { 
        resource_type: 'raw', 
        folder: 'favour-ai/resumes', 
        public_id: `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, '').replace(/[^a-zA-Z0-9-_]/g, '-')}` 
      }, 
      (error, result) => error ? reject(error) : resolve(result)
    );
    Readable.from(file.buffer).pipe(stream);
  });
};

export const deleteStoredFile = async (publicId) => {
  if (!isCloudinaryConfigured()) {
    return deleteFileLocally(publicId);
  }
  return cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
};

// Local Storage Fallback Helpers
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
