const jwt = require("jsonwebtoken");

function createToken(user) {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email
    },
    process.env.JWT_SECRET || "dev_secret",
    { expiresIn: "7d" }
  );
}

module.exports = { createToken };

