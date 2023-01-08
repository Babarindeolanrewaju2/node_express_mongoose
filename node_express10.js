const mongoose = require('mongoose');

// Create a Mongoose schema for our car rental data
const rentalSchema = new mongoose.Schema({
  car: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Car',
  },
  startDate: Date,
  endDate: Date,
  location: String,
});

// Create a Mongoose model for our car rental data
const Rental = mongoose.model('Rental', rentalSchema);

// Connect to our MongoDB database
mongoose.connect('mongodb://localhost/mydatabase', { useNewUrlParser: true });

// Add a new car rental to the database
const newRental = new Rental({
  car: '5f9d6e64ce847a2b34b05e84', // ID of the car being rented
  startDate: '2022-01-01',
  endDate: '2022-01-07',
  location: 'New York, NY',
});
newRental.save((error) => {
  if (error) {
    console.log(error);
  } else {
    console.log('Rental saved successfully!');
  }
});

// Retrieve a list of all car rentals in the database
Rental.find((error, rentals) => {
  if (error) {
    console.log(error);
  } else {
    console.log(rentals);
  }
});
