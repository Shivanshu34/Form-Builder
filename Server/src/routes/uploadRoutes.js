import { Router } from 'express';
import multer from 'multer';
import cloudinary from '../config/cloudinary.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post('/image', upload.single('file'), async (req, res) => {
  if (!process.env.CLOUDINARY_CLOUD_NAME) return res.status(400).json({ message: 'Cloudinary not configured' });
  const b64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
  const r = await cloudinary.uploader.upload(b64, { folder: 'form_builder' });
  res.json({ url: r.secure_url });
});

export default router;