var mongoose = require("mongoose");
const { constants } = require("../helpers/constants");
var Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');

var ProductSchema = new Schema({
	title: {type: String, required: true},
	description: {type: String, required: true},
	price: {type: Number, required: true},
	discount: {type: Number, required: true},
	netprice: {type: Number, required: true},
	category: { type: Schema.ObjectId, ref: "Category", required: true },
	image: {type: String},
}, {timestamps: true});
ProductSchema.plugin(mongoosePaginate);
ProductSchema.path('image').get(function (image) {
	return constants.upload_folder_public_url+"product/"+image;
});
module.exports = mongoose.model("Product", ProductSchema);