const nodemailer = require('nodemailer');

const sendMail = async (options) => {
  //creacion de transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  //definir opciones de email para
  const mailOptions = {
    from: 'gjonn gjonn.coc@gmail.com',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  //enviar email
  await transporter.sendMail(mailOptions);
};
module.exports = sendMail;
