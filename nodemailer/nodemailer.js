const nodemailer = require('nodemailer')
require('dotenv').config();

const orderAccept = () => {
    var transporter = nodemailer.createTransport({
        host:'smtp.gmail.com',
        port:465,
        secure:true,
        auth: {
          user: process.env.NODEMAILER_EMAIL,     
          pass: process.env.NODEMAILER_PASS         
        }
      });
      
      var mailOptions = {
        from: process.env.NODEMAILER_EMAIL,
        to: process.env.NODEMAILER_SECONDEMAIL,
        subject:`Order Placed`,
        html:`<p>Your order has been placed</p>`
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    }

module.exports = orderAccept