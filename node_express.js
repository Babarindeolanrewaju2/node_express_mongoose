const mongoose = require('mongoose');

// Connect to the database
mongoose.connect('mongodb://localhost/mydatabase', { useNewUrlParser: true });

// Define the room schema
const roomSchema = new mongoose.Schema({
  name: String,
  available: Boolean,
});

// Create the Room model
const Room = mongoose.model('Room', roomSchema);

// Query the database for a room that is available
Room.findOne({ available: true }, (err, room) => {
  if (err) {
    console.log(err);
  } else {
    if (room) {
      console.log(`Room ${room.name} is available`);
    } else {
      console.log('No available rooms found');
    }
  }
});
