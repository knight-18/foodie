const express = require("express");
const router = express.Router();
var DeliveryGuy = require("../models/deliveryGuy");
const superAdminAuth = require("../middleware/super_admin_middleware");
const auth = require("../middleware/deliveryguyauth");

//==============Seeding===============
// if (process.env.NODE_ENV != "prod") {
//   const deliveryGuy_seed = require("../seeds/deliveryGuy_seed");
//   deliveryGuy_seed();
// }

//===========ROUTES==================================

/**
 * @swagger
 * tags:
 *   name: DeliveryGuy
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * path:
 *  /deliveryguy/test:
 *    get:
 *      summary: check if user router is configured correctly
 *      tags: [DeliveryGuy]
 *      responses:
 *        "200":
 *          description: Test successfull
 *          content:
 *            text/html:
 *              [SUCCESS]: deliveryGuy routes connected!
 */

router.get("/test", (req, res) => {
  res.status(200);
  res.send("[SUCCESS]: DeliveryGuy routes connected!");
});

//Router to access all delivery boys.Only SuperAdmin can access list of all delivery boys

router.get("/", superAdminAuth, async (req, res) => {
  try {
    var deliveryGuy = await DeliveryGuy.find({});
    if (!deliveryGuy) {
      res.status(404).send();
    }
    res.json(deliveryGuy);
  } catch (e) {
    res.status(500).send();
  }
});

//Route to create deliveryGuy. Requires superadmin authentication

/**
 * @swagger
 * path:
 *  /deliveryguy:
 *    post:
 *      summary: create a new deliveryguy
 *      tags: [DeliveryGuy]
 *
 *      requestBody:
 *        description: needs all the info about the deliveryguy
 *        required: true
 *
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - super
 *                - restaurant
 *              properties:
 *                super:
 *                 type: object
 *                 properties:
 *                   username:
 *                     type: string
 *                   password:
 *                     type: string
 *                     format: password
 *                deliveryGuy:
 *                  type: object
 *                  required:
 *                    - name
 *                    - phone
 *                    - username
 *                    - password
 *                  properties:
 *                    name:
 *                      type: string
 *                    phone:
 *                      type: string
 *                    username:
 *                      type: string
 *                    password:
 *                      type: string
 *                      description: minimum length of password must be 7
 *              example:
 *                super:
 *                  username: admin
 *                  password: password
 *                deliveryGuy:
 *                  name: deliveryGuy 1
 *                  phone: 8889998899
 *                  username: dguy1
 *                  password: "12345678"
 *      responses:
 *        "201":
 *          description: deliveryGuy Created
 *        "500":
 *          description: internal server error occured
 */


router.post("/", superAdminAuth, async (req, res) => {
  const deliveryGuy = new DeliveryGuy(req.body.deliveryGuy);
  try {
    await deliveryGuy.save();
    const token = await deliveryGuy.generateAuthToken();
    res.status(201).send({ deliveryGuy, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

//Login Route for deliveryGuy

/**
 * @swagger
 * path:
 *  /deliveryguy/login:
 *    post:
 *      summary: login a deliveryGuy
 *      tags: [DeliveryGuy]
 *
 *      requestBody:
 *        description: needs deliveryGuy username and password
 *        required: true
 *
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - password
 *                - username
 *                - regToken
 *              properties:
 *                username:
 *                  type: string
 *                password:
 *                  type: string
 *                  format: password
 *                regToken:
 *                  type: string
 *              example:
 *                username: dguy1
 *                password: "12345678"
 *                regToken: "abcd"
 *
 *      responses:
 *        "200":
 *          description: logged in
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                required:
 *                  - password
 *                  - username
 *                properties:
 *                  user:
 *                    type: object
 *                  token:
 *                    type: string
 *
 *        "400":
 *          description: An error occured
 */

router.post("/login", async (req, res) => {
  try {
    const deliveryGuy = await DeliveryGuy.findByCredentials(
      req.body.username,
      req.body.password
    );
    if(req.body.regToken)
    {
      deliveryGuy.regToken = req.body.regToken
      await deliveryGuy.save()
    }
    const token = await deliveryGuy.generateAuthToken();
    res.send({ deliveryGuy, token });
  } catch (e) {
    res.status(400).send();
  }
});

//Logout route for deliveryGuy

/**
 * @swagger
 * path:
 *  /deliveryguy/logout:
 *    post:
 *      security:
 *        - bearerAuth: []
 *      summary: logout a deliveryGuy, while using it here, please copy the token from the login route and add it to authorize button on top
 *      tags: [DeliveryGuy]
 *      responses:
 *        "200":
 *          description: logged out
 *        "400":
 *          description: please authenticate
 *        "401":
 *          $ref: '#/components/responses/UnauthorizedError'
 */

router.post("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => {
      return token.token !== req.token;
    });
    await req.user.save();

    res.send("Logged Out");
  } catch (e) {
    res.status(500).send();
  }
});

//Route to logout all sessions

/**
 * @swagger
 * path:
 *  /deliveryguy/logoutAll:
 *    post:
 *      security:
 *        - bearerAuth: []
 *      summary: logout a deliveryGuy from All devices, while using it here, please copy the token from the login route and add it to authorize button on top
 *      tags: [DeliveryGuy]
 *      responses:
 *        "200":
 *          description: logged out
 *        "400":
 *          description: please authenticate
 *        "500":
 *          description: internal server error
 */

router.post("/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = [];
    await req.user.save();
    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

//Route to read deliveryGuy profile

/**
 * @swagger
 * path:
 *  /deliveryguy/me:
 *    get:
 *      security:
 *        - bearerAuth: []
 *      summary: read the deliveryGuy profile
 *      tags: [DeliveryGuy]
 *      responses:
 *        "200":
 *          content:
 *            application/json:
 *              user:
 *                type: object
 *        "400":
 *         description: Please Authenticate
 */

router.get("/me", auth, async (req, res) => {
  res.send(req.user);
});

//Update route for delivery guy

/**
 * @swagger
 * path:
 *  /deliveryguy/me:
 *    patch:
 *      security:
 *        - bearerAuth: []
 *      summary: update the deliveryGUy profile
 *      tags: [DeliveryGuy]
 *      requestBody:
 *        description: needs info to be upated about the deliveryGuy
 *        required: true
 *
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - password
 *                - phone
 *              properties:
 *                password:
 *                  type: string
 *                  format: password
 *                phone:
 *                  type: string
 *              example:
 *                password: "87654321"
 *                phone: "+918602313604"
 *      responses:
 *        "200":
 *          content:
 *            application/json:
 *              user:
 *                type: object
 *        "400":
 *         description: Please Authenticate
 */

router.patch("/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["phone", "password"]; //Updates allowed for deliveryGuy
  const isValidOperation = updates.every(update =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    updates.forEach(update => (req.user[update] = req.body[update]));
    await req.user.save();
    res.status(200).send(req.user);
  } catch (e) {
    res.status(400).send(e);
  }
});

//Route to delete deliveryGuy profile
router.delete("/me", auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send(req.user);
  } catch (e) {
    res.status(500).send();
  }
});

//post request for registration token
router.post("/regToken",auth,async(req, res)=>{
  try {
    req.user.regToken = req.body.regToken
    await req.user.save()
    res.status(200).send(req.user)
  } catch (e) {
    res.status(500).send(e)
  }
})

module.exports = router;
