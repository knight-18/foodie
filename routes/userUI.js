const express =  require('express')
const router = express.Router()

//Route for user Login
router.get('/login',(req, res)=>{
    res.render('login')
})

//Route for user signup
router.get('/signup',(req, res)=>{
    res.render('userRegister')
})
module.exports = router