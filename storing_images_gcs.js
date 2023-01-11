const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const { Storage } = require('@google-cloud/storage');

const ImageSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
});

const Image = mongoose.model('Image', ImageSchema);

const app = express();

const upload = multer({ dest: 'uploads/' });

const storage = new Storage({
  projectId: process.env.GCP_PROJECT_ID,
  keyFilename: process.env.GCP_KEY_FILE,
});

const bucket = storage.bucket(process.env.GCS_BUCKET);

app.post('/image', upload.single('image'), async (req, res) => {
  const file = req.file;
  const options = {
    destination: file.originalname,
    public: true,
  };

  try {
    const [response] = await bucket.upload(file.path, options);
    const imageUrl = `https://storage.googleapis.com/${response.bucket}/${response.name}`;
    const newImage = new Image({ url: imageUrl });
    await newImage.save();
    res.status(201).send('Image saved and url stored in the database');
  } catch (error) {
    res.status(500).send(error);
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
