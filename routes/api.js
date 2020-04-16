var express = require("express");
var authRouter = require("./auth");
var categoryRouter = require("./category");
var productRouter = require("./product");

var app = express();

app.use("/auth/", authRouter);
app.use("/category/", categoryRouter);
app.use("/product/", productRouter);

module.exports = app;