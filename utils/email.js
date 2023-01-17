const nodemailer = require('nodemailer');

const sendMail = async (options) => {
  //creacion de transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    user: 'smtp.gmail.com',
    port: process.env.EMAIL_PORT,
    secure: true,
    auth: {
      type: 'login',
      user: process.env.EMAIL_USERNAMEGMAIL,
      pass: process.env.EMAIL_PASSGMAIL,
    },
  });

  const mailOptions = {
    from: 'elviejoShop gjonn.coc@gmail.com',
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  //enviar email
  await transporter.sendMail(mailOptions);
};
module.exports = sendMail;
