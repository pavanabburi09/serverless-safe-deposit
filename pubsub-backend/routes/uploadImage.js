
const Multer = require("multer");
const express = require("express");
const { Storage } = require("@google-cloud/storage");

const router = express.Router();

const multer = Multer({
  storage: Multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, 
  },
});

const storage = new Storage({
  keyFilename: './pavan_key.json',
  projectId: "serverless-329200",
});
const bucket = storage.bucket('box1test1')

router.post('/uploadImage', multer.single('image'), (req, res, next) => {
    if (!req.file) {
    res.status(400).send('No file uploaded.');
    return;
  }
  const blob = bucket.file(req.file.originalname);
  const blobStream = blob.createWriteStream();

  blobStream.on('error', err => {
    next(err);
  });

  blobStream.on('finish', () => {
    res.status(200).send('publicUrl');
  });

  blobStream.end(req.file.buffer);
});

module.exports = router;