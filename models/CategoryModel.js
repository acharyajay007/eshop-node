var mongoose = require("mongoose");

var Schema = mongoose.Schema;

var CategorySchema = new Schema({
	title: {type: String, required: true},
}, {timestamps: true});

module.exports = mongoose.model("Category", CategorySchema);