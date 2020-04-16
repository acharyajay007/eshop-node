const Product = require("../models/ProductModel");
const Category = require("../models/CategoryModel");
const { body, validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const fileuploader = require("../helpers/fileuploader");
const utility = require("../helpers/utility");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
var Schema = mongoose.Schema;

// Product Schema
function ProductData(data) {
	this.id = data._id;
	this.title = data.title;
	this.description = data.description;
	this.category = data.category;
	this.image = data.image;
	this.price = data.price;
	this.discount = data.discount;
	this.netprice = data.netprice;
	this.createdAt = data.createdAt;
}

/**
 * Product List.
 * 
 * @returns {Object}
 */
exports.productList = [
	auth,
	function (req, res) {
		try {
			var query ={};
			const options = {
				offset: req.body.offset?(parseInt(req.body.offset)):0,
				limit: req.body.limit?parseInt(req.body.limit):10,
				populate: {path:'category', select:'title'}
			};
			if(req.body.query) {
				query.title =  { $regex: '.*' + req.body.query + '.*' };
				options.populate.match =  {title :{ $regex: '.*' + req.body.query + '.*' }};
			} 
			if(req.body.min_price) {
				query.netprice =  { $gte: req.body.min_price };
			} 
			if(req.body.max_price) {
				query.netprice =  { $lte: req.body.max_price };
			} 
			Product.paginate(query, options)
			.then((products) => {
				products.docs.map((v,i)=>{
					v.image = v.image;
				})
				return apiResponse.successResponseWithData(res, "Operation success", products);	
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Product Detail.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */
exports.productDetail = [
	auth,
	function (req, res) {
		if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			return apiResponse.successResponseWithData(res, "Operation success", {});
		}
		try {
			Product.findOne({ _id: req.params.id }, "_id title description category image price discount netprice createdAt")
			.populate({path:'category', select:'title'})
			.then((product) => {
				if (product !== null) {
					let productData = new ProductData(product);
					return apiResponse.successResponseWithData(res, "Operation success", productData);
				} else {
					return apiResponse.successResponseWithData(res, "Operation success", {});
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Product store.
 * 
 * @param {string}      title 
 * @param {string}      description
 * @param {float}      price
 * @param {float}      discount
 * @param {string}      category
 * @returns {Object}
 */
exports.productStore = [
	auth,
	fileuploader.upload("product", "product",utility.imageFilter).single("image"),
	body("title", "Title must not be empty.").isLength({ min: 1 }).trim(),
	body("description", "Description must not be empty.").isLength({ min: 1 }).trim(),
	body("price", "Price must be entered.").isFloat({ gt: 0 }).trim(),
	body("discount", "Valid Discount be entered.").isFloat().trim(),
	body("category", "Category must not be empty").trim().custom((value, { req }) => {
		return Category.findOne({ id: value }).then(category => {
			if (category) {
				return Promise.reject("Select valid category");
			}
		});
	}),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			
			const errors = validationResult(req);
			var product = {
				title: req.body.title,
				user: req.user,
				description: req.body.description,
				price: req.body.price,
				discount: req.body.discount,
				netprice: req.body.price - req.body.discount,
				category: new mongoose.Types.ObjectId(req.body.category),
			};

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				if (req.file) {
					var err = false;
					if (req.fileValidationError) {
						err = req.fileValidationError;
					}						
					if (err) {
						return apiResponse.validationErrorWithData(res, "Validation Error.", err);
					} else {
						product.image = req.file.filename;
					}
				}
				var product = new Product(product);
				product.save(function (err) {
					if (err) { return apiResponse.ErrorResponse(res, err); }
					console.log(product);
					let productData = new ProductData(product);
					return apiResponse.successResponseWithData(res, "Product add Success.", productData);
				});
			}
		} catch (err) {
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

function saveProduct(req, res, product) {
	//Save product.
	
}
/**
 * Product update.
 * 
 * @param {string}      title 
 * @param {string}      description
 * @param {float}      price
 * @param {float}      discount
 * @param {string}      category
 * @returns {Object}
 */
exports.productUpdate = [
	auth,
	fileuploader.upload("product", "product",utility.imageFilter).single("image"),
	body("title", "Title must not be empty.").isLength({ min: 1 }).trim(),
	body("description", "Description must not be empty.").isLength({ min: 1 }).trim(),
	body("price", "Price must be entered.").isFloat({ gt: 0 }).trim(),
	body("discount", "Valid Discount be entered.").isFloat().trim(),
	body("category", "Category must not be empty").trim().custom((value, { req }) => {
		return Category.findOne({ id: value }).then(category => {
			if (category) {
				return Promise.reject("Select valid category");
			}
		});
	}),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			var product = {
				title: req.body.title,
				description: req.body.description,
				price: req.body.price,
				discount: req.body.discount,
				netprice: req.body.price - req.body.discount,
				category: new mongoose.Types.ObjectId(req.body.category),
				_id: req.params.id
			};

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				
				if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
					return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
				} else {
					Product.findById(req.params.id, function (err, foundProduct) {
						if (foundProduct === null) {
							return apiResponse.notFoundResponse(res, "Product not exists with this id");
						} else {
							if (req.file) {
								var err = false;
								if (req.fileValidationError) {
									err = req.fileValidationError;
								}						
								if (err) {
									return apiResponse.validationErrorWithData(res, "Validation Error.", err);
								} else {
									product.image = req.file.filename;
								}
							} else {
								product.image = foundProduct.image;
							}
							//update product.
							Product.findByIdAndUpdate(req.params.id, new Product(product), {}, function (err) {
								if (err) {
									return apiResponse.ErrorResponse(res, err);
								} else {
									let productData = new ProductData(product);
									return apiResponse.successResponseWithData(res, "Product update Success.", productData);
								}
							});

						}
					});
				}
			}
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Product Delete.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */
exports.productDelete = [
	auth,
	function (req, res) {
		if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
			return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
		}
		try {
			Product.findById(req.params.id, function (err, foundProduct) {
				if (foundProduct === null) {
					return apiResponse.notFoundResponse(res, "Product not exists with this id");
				} else {
					//delete product.
					Product.findByIdAndRemove(req.params.id, function (err) {
						if (err) {
							return apiResponse.ErrorResponse(res, err);
						} else {
							return apiResponse.successResponse(res, "Product delete Success.");
						}
					});
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];