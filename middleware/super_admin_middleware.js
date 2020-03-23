const superAdminAuth = function(req, res, next) {
  if (req.body.super) {
    if (
      req.body.super.username === "admin" &&
      req.body.super.password === "password"
    ) {
      next();
    } else {
      res.status(401);
      res.send("invalid username or password");
    }
  } else {
    res.status(400).send("No auth parameters sent");
  }
};
module.exports = superAdminAuth;
