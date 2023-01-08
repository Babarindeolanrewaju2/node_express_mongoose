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

// Define the date range to check for availability
const startDate = new Date('2022-01-01');
const endDate = new Date('2022-01-07');

// Query the database for reservations that overlap the given date range
Reservation.find(
  {
    room: 'Room 1',
    $or: [
      { startDate: { $gte: startDate, $lt: endDate } },
      { endDate: { $gt: startDate, $lte: endDate } },
    ],
  },
  (err, reservations) => {
    if (err) {
      console.log(err);
    } else {
      if (reservations.length > 0) {
        console.log(
          `Room 1 is not available between ${startDate} and ${endDate}`
        );
      } else {
        console.log(`Room 1 is available between ${startDate} and ${endDate}`);
      }
    }
  }
);
