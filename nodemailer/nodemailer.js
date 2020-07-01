const nodemailer = require('nodemailer')
require('dotenv').config();

//Mail to restaurant when the order is placed
const orderPlaced = (data) => {
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
        to: data.email,
        subject:`New Order`,
        html:`<p>A new order has been placed by ${data.name}. <a href="https://foodji.co.in/acceptorder.html">Click here</a> to accept or decline the order.</p>`
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


//Mail to user when the order is accepted
    const orderAccepted = (data) => {
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
          to: data.email,
          subject:`Order Accepted`,
          html:`<p>Dear ${data.name}, Your order is being processed and will be delivered within ${data.time}.</p>`
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

      //Mail to user when the order is rejected
      const orderRejected = (data) => {
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
            to: data.email,
            subject:`Order Declined`,
            html:`<p>Dear ${data.name}, Your order is declined by the restaurant. Please try to order from a different restaurant.</p>`
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
        //Mail to all delivery guys when the order is accepted by the restaurant
        const contactDeliveryBoy = (data) => {
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
              to: data.email,
              subject:`New Order`,
              html:`<p>A new order has been placed. <a href="https://www.foodji.co.in/assigndelguy.html?id=${data.orderId}">Click here</a> to accept the order for delivery.</p></p>`
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
module.exports = {orderPlaced, orderAccepted, orderRejected, contactDeliveryBoy}