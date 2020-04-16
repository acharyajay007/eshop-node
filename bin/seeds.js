#!/usr/bin/env node
// DB connection
require("dotenv").config();
var MONGODB_URL = process.env.MONGODB_URL;
var seeder = require('mongoose-seed');
const bcrypt = require("bcrypt");
console.log(MONGODB_URL);
// Connect to MongoDB via Mongoose
seeder.connect(MONGODB_URL, function() {
 
  seeder.loadModels([
    './models/UserModel.js',
    './models/CategoryModel.js',
    './models/ProductModel.js',
  ]);
 
  seeder.clearModels(['User', 'Category', 'Product'], function() {
	bcrypt.hash("Super@Admin", 10, function (err, hash) {
		var data = [
			{
				'model': 'User',
				documents : [
					{
						firstName:'Super',
						lastName:'Admin',
						email: 'super.admin@mailinator.com',
						password:hash
					}
				]
			},
			{
				'model': 'Category',
				documents : [
					{title:'Electronics'},
					{title:'Home Appliances'},
					{title:'Mens'},
					{title:'Womens'},
					{title:'Kids'},
					{title:'Home & Furnitures'},
					{title:'Sports & Books'},
					{title:'Offer zone'}
				]
			}
		]
		seeder.populateModels(data, function() {
		  seeder.disconnect();
		});
	});
	
 
  });
});
 