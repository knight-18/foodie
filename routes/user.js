const express = require("express");
const router = express.Router();

//=========================== Routes==================================

// To test if the routers are connected as desired
router.get("/test", (req, res) => {
  res.status(200);
  res.send("[SUCCESS]: User routes connected!");
});

module.exports = router;
