const compression = require("compression");
const express = require("express");
const router = express.Router();
const pool = require("./../mysqlconnect");
const bodyParser = require("body-parser");

const urlencodedParser = bodyParser.urlencoded({ extended: false });

router.use(compression());

router.get("/", function (req, res) {
  //res.render("index");
});

module.exports = router;
