const mongoose = require('mongoose');

// Connect to the database
mongoose.connect('mongodb://localhost/mydatabase', { useNewUrlParser: true });

// Define the reservation schema
const reservationSchema = new mongoose.Schema({
  customer: String,
  table: String,
  date: Date,
  time: String,
});

// Create the Reservation model
const Reservation = mongoose.model('Reservation', reservationSchema);

// Define the date and time for the reservation
const date = new Date('2022-01-01');
const time = '7:00 PM';

// Create a new reservation document
const reservation = new Reservation({
  customer: 'John Doe',
  table: 'Table 1',
  date: date,
  time: time,
});

// Save the reservation to the database
reservation.save((err, reservation) => {
  if (err) {
    console.log(err);
  } else {
    console.log(
      `Table 1 successfully reserved for ${date} at ${time} for ${reservation.customer}`
    );
  }
});
