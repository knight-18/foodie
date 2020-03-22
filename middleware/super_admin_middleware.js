const superAdminAuth = function(req, res, next) {
  if (
    req.body.super.username === "admin" &&
    req.body.super.password === "password"
  ) {
    next();
  } else {
    res.status(403);
    res.send("invalid username or password");
  }
};
module.exports = superAdminAuth;
