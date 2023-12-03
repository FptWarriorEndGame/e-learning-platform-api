const express = require("express");
const blogController = require("../controllers/blog");
const uploadMiddleware = require("../middleware/upload");
const isAuth = require("../middleware/is-auth");
const router = express.Router();
const { check, body } = require("express-validator");

// GET All blog
router.get("/all", blogController.getAll);

module.exports = router;
