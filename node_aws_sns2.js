const mongoose = require('mongoose');
const AWS = require('aws-sdk');

// Connect to the MongoDB database
mongoose.connect('mongodb://localhost/mydatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Set up the AWS SNS client
AWS.config.update({
  accessKeyId: 'ACCESS_KEY_ID',
  secretAccessKey: 'SECRET_ACCESS_KEY',
  region: 'REGION',
});

const sns = new AWS.SNS({ apiVersion: '2010-03-31' });

// Find the user in the database
User.findOne({ phoneNumber: '+1234567890' }, function (err, user) {
  if (err) {
    console.error(err);
  } else {
    // Send the SMS message
    const params = {
      Message: 'Hello, world!',
      PhoneNumber: user.phoneNumber,
    };
    sns.publish(params, function (err, data) {
      if (err) {
        console.error(err);
      } else {
        console.log('SMS sent!');
      }
    });
  }
});

Order.aggregate(
  [
    {
      $match: {
        'products.category': { $exists: true },
      },
    },
    {
      $unwind: '$products',
    },
    {
      $group: {
        _id: '$products.category',
        totalSales: { $sum: '$products.price' },
      },
    },
    {
      $sort: {
        totalSales: -1,
      },
    },
  ],
  function (err, results) {
    if (err) {
      console.error(err);
    } else {
      console.log(results);
    }
  }
);

Order.aggregate(
  [
    {
      $match: {
        'adminUser.name': { $exists: true },
      },
    },
    {
      $group: {
        _id: '$adminUser.name',
        totalSales: { $sum: '$total' },
      },
    },
    {
      $sort: {
        totalSales: -1,
      },
    },
  ],
  function (err, results) {
    if (err) {
      console.error(err);
    } else {
      console.log(results);
    }
  }
);
