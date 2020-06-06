const express =  require('express')
const router = express.Router()

//Route for user Login
router.get('/login',(req, res)=>{
    res.render('login')
})

module.exports = router