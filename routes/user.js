const express = require("express");
const User = require('../models/user')
const auth = require('../middleware/userauth')
const router = express.Router();

//=========================== Routes==================================

/**
 * @swagger
 * tags:
 *   name: user
 */

/**
 * @swagger
 * path:
 *  /user/test:
 *    get:
 *      summary: check if user router is configured correctly
 *      tags: [user]
 *      responses:
 *        "200":
 *          description: Test successfull
 *          content:
 *            text/html:
 *              [SUCCESS]: user routes connected!
 */
router.get("/test", (req, res) => {
  res.status(200);
  res.send("[SUCCESS]: User routes connected!");
});

//Route to create User
router.post('/', async (req, res) => {
  const user = new User(req.body)

  try {
      await user.save()
      const token = await user.generateAuthToken()
      res.status(201).send({ user, token })
  } catch (e) {
      res.status(400).send(e)
  }
})

//Login Route for user
router.post('/login', async (req, res) => {
  try {
      const user = await User.findByCredentials(req.body.email, req.body.password)
      const token = await user.generateAuthToken()
      res.send({ user, token })
  } catch (e) {
      res.status(400).send()
  }
})

//Logout route for user
router.post('/logout', auth, async (req, res) => {
  try {
      req.user.tokens = req.user.tokens.filter((token) => {
          return token.token !== req.token
      })
      await req.user.save()

      res.send()
  } catch (e) {
      res.status(500).send()
  }
})

//Route to logout all sessions
router.post('/logoutAll', auth, async (req, res) => {
  try {
      req.user.tokens = []
      await req.user.save()
      res.send()
  } catch (e) {
      res.status(500).send()
  }
})

//Route to read user profile
router.get('/me', auth, async (req, res) => {
  res.send(req.user)
})


//Route for updating user profile
router.patch('/me', auth, async (req, res) => {
  const updates = Object.keys(req.body)
  const allowedUpdates = ['name', 'email', 'password','address','phone']
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

  if (!isValidOperation) {
      return res.status(400).send({ error: 'Invalid updates!' })
  }

  try {
      updates.forEach((update) => req.user[update] = req.body[update])
      await req.user.save()
      res.send(req.user)
  } catch (e) {
      res.status(400).send(e)
  }
})

//Route to delete user profile
router.delete('/me', auth, async (req, res) => {
  try {
      await req.user.remove()
      res.send(req.user)
  } catch (e) {
      res.status(500).send()
  }
})

module.exports = router