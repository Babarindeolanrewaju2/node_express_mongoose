const assert = require('assert');
const mongoose = require('mongoose');
const Reservation = require('./code');

describe('Reservation', () => {
  before(async () => {
    // Connect to the database
    await mongoose.connect('mongodb://localhost/mydatabase', {
      useNewUrlParser: true,
    });
  });

  it('should check if a table has been reserved within a given date range', async () => {
    // Define the table and date range to check
    const table = 'Table 1';
    const startDate = new Date('2022-01-01');
    const endDate = new Date('2022-01-02');

    // Check if the table has been reserved within the given date range
    const reservations = await Reservation.find({
      table: table,
      date: { $gte: startDate, $lt: endDate },
    });

    // Assert that the table is available within the given date range
    assert.strictEqual(reservations.length, 0);
  });

  after(async () => {
    // Disconnect from the database
    await mongoose.disconnect();
  });
});
