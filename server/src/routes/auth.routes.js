const express = require("express");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const { z } = require("zod");

const User = require("../models/User");
const { createToken } = require("../utils/token");

const router = express.Router();

const authSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const registerSchema = authSchema.extend({
  name: z.string().min(2)
});

router.post(
  "/register",
  asyncHandler(async (req, res) => {
    const payload = registerSchema.parse(req.body);
    const existing = await User.findOne({ email: payload.email });

    if (existing) {
      res.status(409);
      throw new Error("An account with this email already exists.");
    }

    const passwordHash = await bcrypt.hash(payload.password, 10);
    const user = await User.create({
      name: payload.name,
      email: payload.email,
      passwordHash
    });

    res.status(201).json({
      token: createToken(user),
      user: { id: user._id, name: user.name, email: user.email }
    });
  })
);

router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const payload = authSchema.parse(req.body);
    const user = await User.findOne({ email: payload.email });

    if (!user || !(await bcrypt.compare(payload.password, user.passwordHash))) {
      res.status(401);
      throw new Error("Invalid email or password.");
    }

    res.json({
      token: createToken(user),
      user: { id: user._id, name: user.name, email: user.email }
    });
  })
);

module.exports = router;

