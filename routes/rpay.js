const express = require("express");
const router = express.Router();
const Razorpay = require('razorpay')
const superAdminAuth = require('../middleware/super_admin_middleware')

var instance = new Razorpay({
    key_id: 'rzp_test_FBhzettF0b2FZU',
    key_secret: 'eJA2LybH9bZ7GgKkvM1kXgsL'
  })
  
//Route to get all payments during a period
router.get('/all_payments', superAdminAuth,async (req, res) =>{
    try {
        const pay = await instance.payments.all({
            from: req.body.duration.from,
            to: req.body.duration.to
        })
        console.log(pay)
        res.send(pay)
    } catch (error) {
        console.log(error)
        res.send(error)
    }
})

//route to create order
router.post('/orders', async(req, res) => {
    try {
        const amount = req.body.amount
        const currency = 'INR'
        const payment_capture = true
        const receipt = 'inv_1'
        const order = await instance.orders.create({amount, currency, receipt, payment_capture})
        console.log(order)
        res.status(200).send(order)
    } catch (error) {
        console.log(error)
        res.status(400).send(error)
    }

})


//route to get all orders during a period
router.get('/orders', async(req, res) => {
    try {
        const orders = await instance.orders.all({
            from: req.body.duration.from,
            to: req.body.duration.to
        })
        console.log(orders)
        res.status(200).send(orders)
    } catch (error) {
        console.log(error)
        res.status(400).send(error)
    }    
})


//route to fetch order by order id
router.get('/orders/:id', async(req, res)=>{
    try {
        const order_id = req.params.id
        const order = await instance.orders.fetch(order_id)
        console.log(order)
        res.status(200).send(order)
    } catch (error) {
        console.log(error)
        res.status(400).send(error)
    }

})

//Route to fetch order's payment
router.get('/orders/:id/payments', async(req, res)=>{
    try {
        const order_id = req.params.id
        const order_payments = await instance.orders.fetchPayments(order_id)
        console.log(order_payments)
        res.status(200).send(order_payments)
    } catch (error) {
        console.log(error)
        res.status(400).send(error)
    }
})

  module.exports = router;