const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/userauth");
const router = express.Router();

//==============Seeding===============
if (process.env.NODE_ENV != "prod") {
  const user_seed = require("../seeds/user_seed");
  user_seed();
}

//=========================== Routes==================================

/**
 * @swagger
 * tags:
 *   name: user
 * components:
 *  securitySchemes:
 *    bearerAuth:
 *      type: http
 *      scheme: bearer
 *      bearerFormat: JWT
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

/**
 * @swagger
 * path:
 *  /user:
 *    post:
 *      summary: create a new user
 *      tags: [user]
 *
 *      requestBody:
 *        description: needs all info about the user
 *        required: true
 *
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - name
 *                - password
 *                - email
 *                - phonne
 *              properties:
 *                name:
 *                  type: string
 *                password:
 *                  type: string
 *                  format: password
 *                email:
 *                  type: string
 *                address:
 *                  type: string
 *                phone:
 *                  type: string
 *              example:
 *                name: test
 *                email: test@test.com
 *                password: testtest
 *                address: test address
 *                phone: "+918602313604"
 *
 *      responses:
 *        "201":
 *          description: User Created
 *          content:
 *            application/json:
 *              schema:
 *                type: object
 *                properties:
 *                  user:
 *                    type: object
 *                  token:
 *                    type: string
 *
 *        "400":
 *          description: internal server error occured
 */

//Route to create User
router.post("/", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();
    const token = await user.generateAuthToken();
    res.status(201).send({ user, token });
  } catch (e) {
    res.status(400).send(e);
  }
});

/**
 * @swagger
 * path:
 *  /user/login:
 *    post:
 *      summary: login a user
 *      tags: [user]
 *
 *      requestBody:
 *        description: needs all info about the user
 *        required: true
 *
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - password
 *                - email
 *              properties:
 *                email:
 *                  type: string
 *                password:
 *                  type: string
 *                  format: password
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
 *                  - email
 *                properties:
 *                  user:
 *                    type: object
 *                  token:
 *                    type: string
 *
 *        "400":
 *          description: An error occured
 */

//Login Route for user
router.post("/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();
    res.status(200);
    res.send({ user, token });
  } catch (e) {
    res.status(400).send();
  }
});

/**
 * @swagger
 * path:
 *  /user/logout:
 *    post:
 *      security:
 *        - bearerAuth: []
 *      summary: logout a user, while using it here, please copy the token from the login route and add it to authorize button on top
 *      tags: [user]
 *      responses:
 *        "200":
 *          description: logged out
 *        "400":
 *          description: please authenticate
 *        "401":
 *          $ref: '#/components/responses/UnauthorizedError'
 */

//Logout route for user
router.post("/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => {
      return token.token !== req.token;
    });
    await req.user.save();

    res.send();
  } catch (e) {
    res.status(500).send();
  }
});

/**
 * @swagger
 * path:
 *  /user/logoutAll:
 *    post:
 *      security:
 *        - bearerAuth: []
 *      summary: logout a user from All devices, while using it here, please copy the token from the login route and add it to authorize button on top
 *      tags: [user]
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
/**
 * @swagger
 * path:
 *  /user/me:
 *    get:
 *      security:
 *        - bearerAuth: []
 *      summary: read the user profile
 *      tags: [user]
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
  res.status(200);
  res.send(req.user);
});
/**
 * @swagger
 * path:
 *  /user/me:
 *    patch:
 *      security:
 *        - bearerAuth: []
 *      summary: update the user profile
 *      tags: [user]
 *      requestBody:
 *        description: needs all info about the user
 *        required: true
 *
 *        content:
 *          application/json:
 *            schema:
 *              type: object
 *              required:
 *                - name
 *                - password
 *                - email
 *                - address
 *                - phone
 *              properties:
 *                name:
 *                  type: string
 *                password:
 *                  type: string
 *                  format: password
 *                email:
 *                  type: string
 *                address:
 *                  type: string
 *                phone:
 *                  type: string
 *              example:
 *                name: test
 *                email: test@test.com
 *                password: testtest
 *                address: test address
 *                phone: "+917346348343"
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
  const allowedUpdates = ["name", "email", "password", "address", "phone"];
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

/**
 * @swagger
 * path:
 *  /user/me:
 *    delete:
 *      security:
 *        - bearerAuth: []
 *      summary: read the user profile
 *      tags: [user]
 *      responses:
 *        "200":
 *          content:
 *            application/json:
 *              user:
 *                type: object
 *        "400":
 *         description: Please Authenticate
 */

module.exports = router;
