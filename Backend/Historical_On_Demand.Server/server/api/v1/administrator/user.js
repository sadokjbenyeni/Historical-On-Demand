const router = require("express").Router();
const mongoose = require("mongoose");
const crypto = require("crypto");
const request = require("request");
const fs = require("fs");
const User = mongoose.model("User");

const userService = require("../../../service/userService");
const jwtService = require("../../../service/jwtService");

router.get("/:id", async (req, res) => {
  if (!req.headers.authorization) return res.status(401).json({ error: "No token provided" });
  try {
    var user = await userService.getUserById(req.params.id);
    if (user) return res.status(200).json({ user: user });
    else return res.status(200).json({ error: "User not found" });
  }
  catch (error) {
    req.logger.error({ message: error.message, className: "User API" });
    req.logger.error({ message: JSON.stringify(error) + "\n" + error.stacktrace, className: "User API" });
    return res.status(501).json({ error: error });
  }
});

router.put("/", async (req, res) => {
  if (!req.headers.authorization) return res.status(401).json({ error: "No token provided" });
  try {
    jwtService.verifyToken(req.headers.authorization);
    await userService.UpdateUser(req.body.user);
    return res.status(200).json({ response: "ok" });
  }
  catch (error) {
    req.logger.error({ message: error.message, className: "User API" });
    req.logger.error({ message: JSON.stringify(error) + "\n" + error.stacktrace, className: "User API" });
    return res.status(304).json({ error: error.message });
  }
});

module.exports = router;
