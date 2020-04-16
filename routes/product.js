var express = require("express");
const ProductController = require("../controllers/ProductController");

var router = express.Router();

router.post("/", ProductController.productList);
router.get("/:id", ProductController.productDetail);
router.post("/add", ProductController.productStore);
router.put("/:id", ProductController.productUpdate);
router.delete("/:id", ProductController.productDelete);

module.exports = router;