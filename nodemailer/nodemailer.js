const nodemailer = require('nodemailer')
require('dotenv').config();

const orderAccept = (data) => {
    var transporter = nodemailer.createTransport({
        host:'smtp.gmail.com',
        port:465,
        secure:true,
        auth: {
          user: process.env.NODEMAILER_EMAIL,     
          pass: process.env.NODEMAILER_PASSWORD         
        }
      });
      
      var mailOptions = {
        from: process.env.NODEMAILER_EMAIL,
        to: process.env.NODEMAILER_SECONDEMAIL,
        subject:`New Order`,
        html:`<p>A new order has been placed by ${data.name}. <a href="https://www.google.com/">Click here</a> to accept or decline the order.</p>`
      };
      console.log("Mail options: ", mailOptions)
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    }

module.exports = orderAccept