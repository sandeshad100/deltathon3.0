const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  var transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: "Mahesh Basnet <basnetmanish089@gmail.com>",
    to: options.email,
    subject: options.subject,
    text: "Here is the form you submitted for book apppointment",
    attachments: options.message,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
