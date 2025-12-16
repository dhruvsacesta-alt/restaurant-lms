const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');

const axios = require('axios');
const router = express.Router();

// Determine whether to use Bunny storage (if configured)
const useBunny = !!(process.env.BUNNY_STORAGE_ZONE && process.env.BUNNY_API_KEY);

// Create uploads directory only if not using Bunny (local fallback)
const uploadDir = process.env.UPLOAD_PATH || './uploads';
if (!useBunny) {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
}

// Configure multer storage: use memoryStorage when Bunny is configured to avoid local writes
const storage = useBunny ? multer.memoryStorage() : multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Accept images and videos
  if (file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images and videos are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 100000000 // 100MB default
  }
});

// Helper to upload file to Bunny Storage if configured
// opts: { buffer?, localPath?, filename, mimetype }
const uploadToBunny = async (opts) => {
  const storageZone = process.env.BUNNY_STORAGE_ZONE;
  const apiKey = process.env.BUNNY_API_KEY;
  const pullZone = process.env.BUNNY_PULL_ZONE; // optional

  if (!storageZone || !apiKey) return null;

  const storageUrl = `https://storage.bunnycdn.com/${storageZone}/${opts.filename}`;

  try {
    const data = opts.buffer ? opts.buffer : fs.createReadStream(opts.localPath);
    await axios.put(storageUrl, data, {
      headers: {
        AccessKey: apiKey,
        'Content-Type': opts.mimetype
      },
      maxBodyLength: Infinity,
      maxContentLength: Infinity
    });

    // Build final URL: prefer pull zone if provided, otherwise use storage URL
    const finalUrl = pullZone ? `https://${pullZone}/${opts.filename}` : storageUrl;

    // Remove local file after successful upload (if there is one)
    if (opts.localPath && fs.existsSync(opts.localPath)) {
      try { fs.unlinkSync(opts.localPath); } catch (e) { /* ignore */ }
    }

    return finalUrl;
  } catch (err) {
    console.error('Error uploading to Bunny:', err?.message || err);
    return null;
  }
};

// @route   POST /api/upload/image
// @desc    Upload image file
// @access  Private
router.post('/image', protect, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // Try uploading to Bunny if configured, otherwise return local file URL
    (async () => {
      let finalUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

      if (useBunny) {
        const buffer = req.file.buffer; // available when using memoryStorage
        const bunnyUrl = await uploadToBunny({ buffer, filename: req.file.filename, mimetype: req.file.mimetype });
        if (bunnyUrl) finalUrl = bunnyUrl;
      }

      res.json({
        success: true,
        message: 'Image uploaded successfully',
        data: {
          filename: req.file.filename,
          url: finalUrl,
          size: req.file.size,
          mimetype: req.file.mimetype
        }
      });
    })();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error during image upload'
    });
  }
});

// @route   POST /api/upload/video
// @desc    Upload video file
// @access  Private
router.post('/video', protect, upload.single('video'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No video file provided'
      });
    }

    // Try uploading to Bunny if configured, otherwise return local file URL
    (async () => {
      let finalUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

      if (useBunny) {
        const buffer = req.file.buffer;
        const bunnyUrl = await uploadToBunny({ buffer, filename: req.file.filename, mimetype: req.file.mimetype });
        if (bunnyUrl) finalUrl = bunnyUrl;
      }

      res.json({
        success: true,
        message: 'Video uploaded successfully',
        data: {
          filename: req.file.filename,
          url: finalUrl,
          size: req.file.size,
          mimetype: req.file.mimetype
        }
      });
    })();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error during video upload'
    });
  }
});

// @route   DELETE /api/upload/:filename
// @desc    Delete uploaded file
// @access  Private
router.delete('/:filename', protect, (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);

    // If Bunny configured, try deleting from Bunny storage
    (async () => {
      const storageZone = process.env.BUNNY_STORAGE_ZONE;
      const apiKey = process.env.BUNNY_API_KEY;
      if (storageZone && apiKey) {
        const url = `https://storage.bunnycdn.com/${storageZone}/${filename}`;
        try {
          await axios.delete(url, { headers: { AccessKey: apiKey } });
        } catch (err) {
          console.error('Error deleting from Bunny (continuing):', err?.message || err);
        }
      }

      // Also remove local file if exists and not using Bunny-only mode
      if (!useBunny && fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (e) { /* ignore */ }
      }

      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    })();
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error during file deletion'
    });
  }
});

// Serve uploaded files statically only when using local storage fallback
if (!useBunny) {
  router.use('/files', express.static(uploadDir));
}

module.exports = router;