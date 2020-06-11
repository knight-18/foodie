const jwt = require("jsonwebtoken");
require("dotenv").config();

const superAdminAuth = function(req, res, next) {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const superAdmin = decoded.superAdmin
    if(superAdmin != `${process.env.superUsername}${process.env.superPassword}`){
      throw new Error()
    }
    req.token = token;
    next();
  } catch (e) {
    res.status(401).send({ error: "Please authenticate." });
  }

};

module.exports = superAdminAuth;

// const superAdminAuth = function(req, res, next) {
//   if (req.body.super) {
//     if (
//       req.body.super.username === "admin" &&
//       req.body.super.password === "password"
//     ) {
//       next();
//     } else {
//       res.status(401);
//       res.send("invalid username or password");
//     }
//   } else {
//     res.status(400).send("No auth parameters sent");
//   }
// };
// module.exports = superAdminAuth;
