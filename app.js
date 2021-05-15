const express = require("express");
var bodyParser = require("body-parser");
var cookieparser = require("cookie-parser");

const connectDB = require("./config/db");
const path = require("path");
let mongoose = require("mongoose");

const app = express();
let port = 5000;

// db connection
connectDB();

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static("public"));
app.use(cookieparser());

app.get("/", function (req, res) {
  res.redirect("/auth/login");
});

var auth = require("./api/auth");
app.use("/auth", auth);

var emp = require("./api/employer");
app.use("/emp", emp);

var can = require("./api/candidate");
app.use("/cand", can);

app.listen(port);
console.log("Listening on port " + port);

module.exports = app;
