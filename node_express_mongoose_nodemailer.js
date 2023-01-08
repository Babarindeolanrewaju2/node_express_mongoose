import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: 'smtp.example.com',
  port: 587,
  auth: {
    user: 'user@example.com',
    pass: 'password',
  },
});

const sendEmail = (to, subject, html) => {
  const mailOptions = {
    from: 'user@example.com',
    to,
    subject,
    html,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log(`Email sent: ${info.response}`);
    }
  });
};

sendEmail('recipient@example.com', 'Hello', '<h1>Hello World</h1>');
