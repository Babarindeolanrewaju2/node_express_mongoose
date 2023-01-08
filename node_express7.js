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

// Define the table and date range to check
const table = 'Table 1';
const startDate = new Date('2022-01-01');
const endDate = new Date('2022-01-02');

// Query the database for reservations with the given table and date range
Reservation.find(
  {
    table: table,
    date: { $gte: startDate, $lt: endDate },
  },
  (err, reservations) => {
    if (err) {
      console.log(err);
    } else {
      if (reservations.length > 0) {
        console.log(
          `Table ${table} has been reserved within the given date range`
        );
      } else {
        console.log(`Table ${table} is available within the given date range`);
      }
    }
  }
);
