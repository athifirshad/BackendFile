const File = require('../models/File');
const multer = require('multer');

// Configure Multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage }).single('file');

// Upload a file
exports.uploadFile = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: 'File upload failed' });
    }

    const { userId } = req.user;
    const { filename, size } = req.file;

    try {
      const file = new File({
        fileName: filename,
        size: `${(size / 1024 / 1024).toFixed(2)}MB`,
        userId,
      });
      await file.save();

      res.status(201).json({ message: 'File uploaded successfully', file });
    } catch (err) {
      res.status(500).json({ message: 'Something went wrong' });
    }
  });
};

// Get recent transfers
exports.getRecentTransfers = async (req, res) => {
  const { userId } = req.user;

  try {
    const files = await File.find({ userId }).sort({ date: -1 });
    res.status(200).json(files);
  } catch (err) {
    res.status(500).json({ message: 'Something went wrong' });
  }
};