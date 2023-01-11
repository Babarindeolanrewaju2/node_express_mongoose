const express = require('express');
const mongoose = require('mongoose');
const Sales = require('./salesModel'); // sales model
const app = express();

app.get('/sales-per-day', async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const sales = await Sales.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(`${year}-01-01`),
            $lt: new Date(`${year + 1}-01-01`),
          },
        },
      }, // match for current year
      {
        $project: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
          total: 1,
        },
      }, // project date in format of YYYY-MM-DD
      { $group: { _id: '$date', total: { $sum: '$total' } } }, // group by day
      { $sort: { _id: 1 } },
    ]);
    res.json(sales);
  } catch (error) {
    res.status(500).send(error);
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});

const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('./app'); // Import the express app
const Sales = require('./salesModel'); // sales model
const expect = chai.expect;

chai.use(chaiHttp);

describe('/sales-per-day', () => {
  before(async () => {
    await Sales.deleteMany({}); // empty collection
    // insert some mock sales data
    await Sales.insertMany([
      { total: 10, date: new Date('2022-12-01') },
      { total: 20, date: new Date('2022-12-01') },
      { total: 15, date: new Date('2022-12-02') },
      { total: 12, date: new Date('2022-12-03') },
    ]);
  });
  it('should return the sales per day', (done) => {
    chai
      .request(app)
      .get('/sales-per-day')
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        expect(res).to.have.status(200);
        expect(res.body).to.be.an('array');
        expect(res.body).to.have.lengthOf(3);
        expect(res.body[0]).to.have.property('_id', '2022-12-01');
        expect(res.body[0]).to.have.property('total', 30);
        expect(res.body[1]).to.have.property('_id', '2022-12-02');
        expect(res.body[1]).to.have.property('total', 15);
        expect(res.body[2]).to.have.property('_id', '2022-12-03');
        expect(res.body[2]).to.have.property('total', 12);
        done();
      });
  });
});
