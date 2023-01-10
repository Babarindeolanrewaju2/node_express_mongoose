const AWS = require('aws-sdk');
const mongoose = require('mongoose');

// Connect to your MongoDB database
mongoose.connect('mongodb://localhost/mydatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Load your model
const User = mongoose.model('User', {
  name: String,
  email: String,
});

// Find the user that you want to send an email to
User.findOne({ name: 'John' }, function (err, user) {
  if (err) {
    console.error(err);
  } else {
    // Create an instance of the AWS.SES service
    const ses = new AWS.SES({
      region: 'us-east-1', // Replace with your region
    });

    // Prepare the email parameters
    const params = {
      Destination: {
        ToAddresses: [user.email],
      },
      Message: {
        Body: {
          Text: {
            Charset: 'UTF-8',
            Data: 'Hello, John! This is a test email from Amazon SES.',
          },
        },
        Subject: {
          Charset: 'UTF-8',
          Data: 'Test Email from Amazon SES',
        },
      },
      Source: 'sender@example.com', // Replace with your verified email address
    };

    // Send the email
    ses.sendEmail(params, function (err, data) {
      if (err) {
        console.error(err);
      } else {
        console.log(data);
      }
    });
  }
});

const mongoose = require('mongoose');
const AWS = require('aws-sdk');

// Connect to the MongoDB database
mongoose.connect('mongodb://localhost/mydatabase', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Set up the AWS SES client
AWS.config.update({
  accessKeyId: 'ACCESS_KEY_ID',
  secretAccessKey: 'SECRET_ACCESS_KEY',
  region: 'REGION',
});

const ses = new AWS.SES({ apiVersion: '2010-12-01' });

// Find the user in the database
User.findOne({ email: 'user@example.com' }, function (err, user) {
  if (err) {
    console.error(err);
  } else {
    // Send the email
    const params = {
      Destination: {
        ToAddresses: [user.email],
      },
      Message: {
        Body: {
          Text: {
            Data: 'Hello, world!',
          },
        },
        Subject: {
          Data: 'Hello from Amazon SES',
        },
      },
      Source: 'noreply@example.com',
    };
    ses.sendEmail(params, function (err, data) {
      if (err) {
        console.error(err);
      } else {
        console.log('Email sent!');
      }
    });
  }
});
