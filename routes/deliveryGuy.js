const express = require("express");
const router = express.Router();
var DeliveryGuy = require("../models/deliveryGuy");
const superAdminAuth = require("../middleware/super_admin_middleware");
const auth = require("../middleware/deliveryguyauth");

//==============Seeding===============
if (process.env.NODE_ENV != "prod") {
  const deliveryGuy_seed = require("../seeds/deliveryGuy_seed");
  deliveryGuy_seed();
}

//===========ROUTES==================================

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
router.post("/login", async (req, res) => {
  try {
    const deliveryGuy = await DeliveryGuy.findByCredentials(
      req.body.username,
      req.body.password
    );
    const token = await deliveryGuy.generateAuthToken();
    res.send({ deliveryGuy, token });
  } catch (e) {
    res.status(400).send();
  }
});

//Logout route for deliveryGuy
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
router.get("/me", auth, async (req, res) => {
  res.send(req.user);
});

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
module.exports = router;
