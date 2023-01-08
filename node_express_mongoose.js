import mongoose from 'mongoose';
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';

const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/myapp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

const User = mongoose.model('User', UserSchema);

app.post('/register', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = new User({ email, password });
    await user.save();
    const token = jwt.sign({ userId: user._id }, 'mysecretkey');
    res.send({ token });
  } catch (error) {
    return res.status(422).send(error.message);
  }
});

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(422).send({ error: 'Must provide email and password' });
  }
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(422).send({ error: 'Invalid email or password' });
  }
  try {
    await bcrypt.compare(password, user.password);
    const token = jwt.sign({ userId: user._id }, 'mysecretkey');
    res.send({ token });
  } catch (error) {
    return res.status(422).send({ error: 'Invalid email or password' });
  }
});

app.listen(3000, () => {
  console.log('Listening on port 3000');
});
