const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const aws = require('aws-sdk');

const SoundSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
});
const Sound = mongoose.model('Sound', SoundSchema);

const app = express();
const upload = multer({ dest: 'uploads/' });

aws.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new aws.S3();

app.post('/sound', upload.single('sound'), (req, res) => {
  const file = req.file;
  const s3Params = {
    Bucket: process.env.AWS_BUCKET,
    Key: file.originalname,
    Body: file.buffer,
    ContentType: file.mimetype,
    ACL: 'public-read',
  };

  s3.upload(s3Params, (err, data) => {
    if (err) {
      return res.status(500).send(err);
    }
    const soundUrl = data.Location;
    const newSound = new Sound({ url: soundUrl });
    newSound.save((err) => {
      if (err) {
        return res.status(500).send(err);
      }
      res.status(201).send('Sound saved and url stored in the database');
    });
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
