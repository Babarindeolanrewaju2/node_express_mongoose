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

// Define the table to check
const table = 'Table 1';

// Query the database for reservations with the given table
Reservation.find({ table: table }, (err, reservations) => {
  if (err) {
    console.log(err);
  } else {
    if (reservations.length > 0) {
      console.log(`Table ${table} has been reserved`);
    } else {
      console.log(`Table ${table} is available`);
    }
  }
});
