const Category = require("../models/CategoryModel");
const { body,validationResult } = require("express-validator");
const { sanitizeBody } = require("express-validator");
const apiResponse = require("../helpers/apiResponse");
const auth = require("../middlewares/jwt");
var mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);

// Category Schema
function CategoryData(data) {
	this.id = data._id;
	this.title= data.title;
	this.createdAt = data.createdAt;
}

/**
 * Category List.
 * 
 * @returns {Object}
 */
exports.categoryList = [
	auth,
	function (req, res) {
		try {
			Category.find({},"_id title createdAt").then((categories)=>{
				if(categories.length > 0){
					return apiResponse.successResponseWithData(res, "Operation success", categories);
				}else{
					return apiResponse.successResponseWithData(res, "Operation success", []);
				}
			});
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Category Detail.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */
exports.categoryDetail = [
	auth,
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.successResponseWithData(res, "Operation success", {});
		}
		try {
			Category.findOne({_id: req.params.id},"_id title createdAt").then((category)=>{                
				if(category !== null){
					let categoryData = new CategoryData(category);
					return apiResponse.successResponseWithData(res, "Operation success", categoryData);
				}else{
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
 * Category store.
 * 
 * @param {string}      title 
 * 
 * @returns {Object}
 */
exports.categoryStore = [
	auth,
	body("title", "Title must not be empty.").isLength({ min: 1 }).trim(),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			var category = new Category(
				{ title: req.body.title,
					user: req.user,
					description: req.body.description,
					isbn: req.body.isbn
				});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				//Save category.
				category.save(function (err) {
					if (err) { return apiResponse.ErrorResponse(res, err); }
					let categoryData = new CategoryData(category);
					return apiResponse.successResponseWithData(res,"Category add Success.", categoryData);
				});
			}
		} catch (err) {
			//throw error in json response with status 500. 
			return apiResponse.ErrorResponse(res, err);
		}
	}
];

/**
 * Category update.
 * 
 * @param {string}      title 
 * @param {string}      description
 * @param {string}      isbn
 * 
 * @returns {Object}
 */
exports.categoryUpdate = [
	auth,
	body("title", "Title must not be empty.").isLength({ min: 1 }).trim(),
	sanitizeBody("*").escape(),
	(req, res) => {
		try {
			const errors = validationResult(req);
			var category = new Category(
				{ title: req.body.title,
					description: req.body.description,
					isbn: req.body.isbn,
					_id:req.params.id
				});

			if (!errors.isEmpty()) {
				return apiResponse.validationErrorWithData(res, "Validation Error.", errors.array());
			}
			else {
				if(!mongoose.Types.ObjectId.isValid(req.params.id)){
					return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
				}else{
					Category.findById(req.params.id, function (err, foundCategory) {
						if(foundCategory === null){
							return apiResponse.notFoundResponse(res,"Category not exists with this id");
						}else{
							//update category.
							Category.findByIdAndUpdate(req.params.id, category, {},function (err) {
								if (err) { 
									return apiResponse.ErrorResponse(res, err); 
								}else{
									let categoryData = new CategoryData(category);
									return apiResponse.successResponseWithData(res,"Category update Success.", categoryData);
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
 * Category Delete.
 * 
 * @param {string}      id
 * 
 * @returns {Object}
 */
exports.categoryDelete = [
	auth,
	function (req, res) {
		if(!mongoose.Types.ObjectId.isValid(req.params.id)){
			return apiResponse.validationErrorWithData(res, "Invalid Error.", "Invalid ID");
		}
		try {
			Category.findById(req.params.id, function (err, foundCategory) {
				if(foundCategory === null){
					return apiResponse.notFoundResponse(res,"Category not exists with this id");
				}else{
					//delete category.
					Category.findByIdAndRemove(req.params.id,function (err) {
						if (err) { 
							return apiResponse.ErrorResponse(res, err); 
						}else{
							return apiResponse.successResponse(res,"Category delete Success.");
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