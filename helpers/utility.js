var imageFilter = function(req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|JPG|jpeg|JPEG|png|PNG|gif|GIF)$/)) {
        req.fileValidationError = {msg:'Only image files are allowed!', 'param':file.fieldname, 'location':'body', 'uploaded':file.originalname};
    }
    cb(null, true);
};

exports.imageFilter = imageFilter;