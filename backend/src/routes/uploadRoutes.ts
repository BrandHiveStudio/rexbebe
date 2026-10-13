import { Router, Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { sendSuccess, sendError } from '../utils/response';

const router = Router();

const FRONTEND_UPLOADS_DIR = path.resolve(__dirname, '../../../frontend/public/uploads');
const BACKEND_UPLOADS_DIR = path.resolve(__dirname, '../../uploads');

// Ensure upload directories exist
[FRONTEND_UPLOADS_DIR, BACKEND_UPLOADS_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

/**
 * POST /api/upload
 * Accepts base64 encoded image or raw file buffer
 * Payload: { data: "data:image/png;base64,...", filename: "banner.png" }
 */
router.post('/', (req: Request, res: Response) => {
  try {
    const { data, filename } = req.body;

    if (!data) {
      return sendError(res, 'No image data provided', 400);
    }

    // Extract base64 payload
    let base64Data = data;
    let extension = 'jpg';

    if (data.includes(';base64,')) {
      const parts = data.split(';base64,');
      const mime = parts[0].replace('data:', '');
      if (mime.includes('png')) extension = 'png';
      else if (mime.includes('webp')) extension = 'webp';
      else if (mime.includes('svg')) extension = 'svg';
      else extension = 'jpg';
      base64Data = parts[1];
    }

    const cleanFilename = filename
      ? `${Date.now()}-${filename.toLowerCase().replace(/[^a-z0-9.]+/g, '-')}`
      : `upload-${Date.now()}.${extension}`;

    const buffer = Buffer.from(base64Data, 'base64');

    // Validate size (max 8MB)
    if (buffer.length > 8 * 1024 * 1024) {
      return sendError(res, 'Image size exceeds maximum limit of 8MB', 400);
    }

    // Write to frontend public directory so Next.js serves it immediately
    const frontendTarget = path.join(FRONTEND_UPLOADS_DIR, cleanFilename);
    fs.writeFileSync(frontendTarget, buffer);

    // Write duplicate to backend uploads
    const backendTarget = path.join(BACKEND_UPLOADS_DIR, cleanFilename);
    fs.writeFileSync(backendTarget, buffer);

    const publicUrl = `/uploads/${cleanFilename}`;

    return sendSuccess(
      res,
      {
        url: publicUrl,
        filename: cleanFilename,
        size: buffer.length,
      },
      'Image uploaded successfully'
    );
  } catch (err: any) {
    console.error('[Upload Error]', err);
    return sendError(res, `Failed to upload image: ${err.message}`, 500);
  }
});

export default router;
