const express = require('express');
const multer = require('multer');
const cloudinary = require('../utils/cloudinary');
const fs = require('fs');

const router = express.Router();

const upload = multer({ dest: 'uploads/' }); // lưu file tạm

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Chưa gửi file" });

    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'documents'
    });

    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      url: result.secure_url,
      public_id: result.public_id
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Upload thất bại' });
  }
});

module.exports = router;
