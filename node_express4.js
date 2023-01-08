const express = require('express');
const mongoose = require('mongoose');

// Connect to the database
mongoose.connect('mongodb://localhost/mydatabase', { useNewUrlParser: true });

// Define the reservation schema
const reservationSchema = new mongoose.Schema({
  room: String,
  startDate: Date,
  endDate: Date,
});

// Create the Reservation model
const Reservation = mongoose.model('Reservation', reservationSchema);

// Define the room schema
const roomSchema = new mongoose.Schema({
  name: String,
});

// Create the Room model
const Room = mongoose.model('Room', roomSchema);

// Create the Express app
const app = express();

// Define the API endpoint for returning available rooms
app.get('/api/rooms/availability', (req, res) => {
  // Parse the date range from the query parameters
  const startDate = new Date(req.query.startDate);
  const endDate = new Date(req.query.endDate);

  // Query the database for rooms with no reservations that overlap the given date range
  Room.find(
    {
      name: {
        $nin: [
          {
            $elemMatch: {
              startDate: { $lt: endDate },
              endDate: { $gt: startDate },
            },
          },
        ],
      },
    },
    (err, rooms) => {
      if (err) {
        res.send(err);
      } else {
        res.send(rooms);
      }
    }
  );
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
