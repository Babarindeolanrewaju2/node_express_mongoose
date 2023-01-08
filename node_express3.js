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

// Create the Express app
const app = express();

// Define the API endpoint for checking room availability
app.get('/api/rooms/:room/availability', (req, res) => {
  // Parse the date range from the query parameters
  const startDate = new Date(req.query.startDate);
  const endDate = new Date(req.query.endDate);

  // Query the database for reservations that overlap the given date range
  Reservation.find(
    {
      room: req.params.room,
      $or: [
        { startDate: { $gte: startDate, $lt: endDate } },
        { endDate: { $gt: startDate, $lte: endDate } },
      ],
    },
    (err, reservations) => {
      if (err) {
        res.send(err);
      } else {
        if (reservations.length > 0) {
          res.send({ available: false });
        } else {
          res.send({ available: true });
        }
      }
    }
  );
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
