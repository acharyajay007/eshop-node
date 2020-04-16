var express = require("express");
const CategoryController = require("../controllers/CategoryController");

var router = express.Router();

router.get("/", CategoryController.categoryList);
router.get("/:id", CategoryController.categoryDetail);
router.post("/", CategoryController.categoryStore);
router.put("/:id", CategoryController.categoryUpdate);
router.delete("/:id", CategoryController.categoryDelete);

module.exports = router;