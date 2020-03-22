const superAdminAuth = function(req, res, next) {
  if (req.body.username === "admin" && req.body.password === "password") {
    next();
  } else {
    res.status(403);
    res.send("invalid username or password");
  }
};
module.exports = superAdminAuth;
