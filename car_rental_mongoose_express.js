const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const carSchema = new Schema({
  make: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  year: {
    type: Number,
    required: true,
  },
  availability: {
    type: Boolean,
    default: true,
  },
});

const rentalSchema = new Schema({
  customer: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  car: {
    type: Schema.Types.ObjectId,
    ref: 'Car',
  },
});

const Car = mongoose.model('Car', carSchema);
const Rental = mongoose.model('Rental', rentalSchema);

const express = require('express');
const router = express.Router();

router.post('/rentals', async (req, res) => {
  const startDate = req.body.startDate;
  const endDate = req.body.endDate;
  const carId = req.body.carId;

  //Check if car is available for that range of date
  const car = await Car.findById(carId);

  const availability = await Rental.find({
    car: car._id,
    startDate: { $lte: startDate },
    endDate: { $gte: endDate },
  });

  if (availability.length > 0) {
    return res
      .status(400)
      .send({ error: 'Car is already rented in that date range' });
  }

  //if the car is available
  const rental = new Rental({
    customer: req.body.customer,
    startDate,
    endDate,
    car: car._id,
  });
  await rental.save();

  //update the availability of the car
  car.availability = false;
  await car.save();

  res.send(rental);
});

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('../app');
const should = chai.should();

chai.use(chaiHttp);

describe('Rentals', () => {
  let carId = '';
  before(async () => {
    //create a car
    const car = new Car({
      make: 'Toyota',
      model: 'Camry',
      year: 2020,
      availability: true,
    });
    await car.save();
    carId = car._id;
  });

  after(async () => {
    //delete the car and rental
    await Car.deleteMany();
    await Rental.deleteMany();
  });

  it('it should rent a car', (done) => {
    chai
      .request(app)
      .post('/rentals')
      .send({
        customer: 'John Doe',
        startDate: '2022-12-01',
        endDate: '2022-12-15',
        carId,
      })
      .end((err, res) => {
        res.should.have.status(200);
        res.body.should.have.property('customer');
        res.body.customer.should.be.eql('John Doe');
        done();
      });
  });
});
