var multer  = require('multer')
const path = require('path');
const { constants } = require("../helpers/constants");

var prepareStorage = function (directory,prefix="") {
	return multer.diskStorage({
		destination: function(req, file, cb) {
			cb(null, constants.upload_folder+directory);
		},
		filename: function(req, file, cb) {
			cb(null, prefix+'-'+file.fieldname + '-' + Date.now() + path.extname(file.originalname));
		}
	});
}


exports.upload = function (directory, prefix="",fileFilter=null)
{
	var storage = prepareStorage(directory, prefix);
	return multer({ storage:storage, dest: constants.upload_folder, fileFilter:fileFilter })
};