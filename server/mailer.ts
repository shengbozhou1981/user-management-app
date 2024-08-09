// server/mailer.ts
import nodemailer from 'nodemailer';


console.log('HOTMAIL_PASSWORD:', process.env.HOTMAIL_PASSWORD); 
const transporter = nodemailer.createTransport({
  service: 'hotmail',
  auth: {
    user: 'shengbozhou@hotmail.com',
    pass: process.env.HOTMAIL_PASSWORD,
  },
});

export const sendEmail = (to: string, subject: string, text: string) => {
  console.log('HOTMAIL_PASSWORD:', process.env.HOTMAIL_PASSWORD); 
  const mailOptions = {
    from: 'shengbozhou@hotmail.com',
    to,
    subject,
    text,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.log(error);
    }
    console.log('Email sent: ' + info.response);
  });
};
