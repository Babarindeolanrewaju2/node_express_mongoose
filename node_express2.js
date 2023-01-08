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

// Define the date range for the reservation
const startDate = new Date('2022-01-01');
const endDate = new Date('2022-01-07');

// Create a new reservation document
const reservation = new Reservation({
  room: 'Room 1',
  startDate: startDate,
  endDate: endDate,
});

// Save the reservation to the database
reservation.save((err, reservation) => {
  if (err) {
    console.log(err);
  } else {
    console.log(
      `Reservation successfully booked for Room 1 between ${startDate} and ${endDate}`
    );
  }
});
