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
User.findOne({ email: 'user@example.com' }, function (err, user) {
  if (err) {
    console.error(err);
  } else {
    // Send the notification
    const params = {
      Message: 'Hello, world!',
      Subject: 'Hello from Amazon SNS',
      TopicArn: 'arn:aws:sns:REGION:ACCOUNT_ID:my-topic',
    };
    sns.publish(params, function (err, data) {
      if (err) {
        console.error(err);
      } else {
        console.log('Notification sent!');
      }
    });
  }
});
