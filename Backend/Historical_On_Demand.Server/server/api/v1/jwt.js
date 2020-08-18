const router = require("express").Router();
const jwtService = require("../../service/jwtService");


router.post("/checkTokenValidity", async (req, res) => {
  try {
    const payload = jwtService.verifyToken(req.body.token);
    if (payload) return res.status(200).json({ valid: true });
    else return res.status(304).json({ valid: false });
  }
  catch (error) {
    req.logger.error({ message: error.message, className: "User API" });
    req.logger.error({ message: JSON.stringify(error) + "\n", className: "User API" });
    return res.status(403).json({ error: error.message });
  }
});

module.exports = router;