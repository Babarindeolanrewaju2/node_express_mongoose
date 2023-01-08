const mongoose = require('mongoose');

// Connect to our MongoDB database
mongoose.connect('mongodb://localhost/mydatabase', { useNewUrlParser: true });

// Define the name of the car and the start and end dates of the desired rental period
const carName = 'Toyota Corolla';
const startDate = '2022-01-01';
const endDate = '2022-01-07';

// Find all rentals that overlap with the desired rental period and involve the specified car
Rental.find(
  {
    $and: [
      { startDate: { $lt: endDate } },
      { endDate: { $gt: startDate } },
      { 'car.name': carName },
    ],
  },
  (error, rentals) => {
    if (error) {
      console.log(error);
    } else {
      // If no rentals are found, the car is available for rent
      if (rentals.length === 0) {
        console.log(
          'The car is available for rent during the specified dates.'
        );
      } else {
        console.log(
          'The car is not available for rent during the specified dates.'
        );
      }
    }
  }
);
