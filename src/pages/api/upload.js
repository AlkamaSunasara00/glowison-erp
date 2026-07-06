import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '@/lib/cloudinary';
import { withAuth } from '@/lib/auth';

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'glowison-erp/uploads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'pdf'],
    resource_type: 'auto'
  },
});

const upload = multer({ storage: storage });

export const config = {
  api: {
    bodyParser: false, // Disallow Next.js body parser since we are using multer
  },
};

const handler = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  // Use standard multer middleware in a Promise
  const multerUpload = upload.array('images', 10); // max 10 images at once

  await new Promise((resolve, reject) => {
    multerUpload(req, res, (err) => {
      if (err) {
        return reject(err);
      }
      resolve();
    });
  }).catch((err) => {
    console.error("Multer upload error:", err);
    return res.status(500).json({ success: false, message: 'File upload failed' });
  });

  // After multer parses the request, files are in req.files
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No images provided' });
  }

  const urls = req.files.map(file => file.path); // Cloudinary URL is stored in file.path

  return res.status(200).json({ success: true, urls });
};

export default withAuth(handler);
