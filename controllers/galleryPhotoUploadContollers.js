const mysql = require('mysql2/promise');

//@desc home page for gallery photo uploading
//@route GET /galleryPhotoUpload
// access public

const galleryPhotoUpload = (req, res) => {
	res.render('galleryPhotoUpload');
}

//@desc gallery photo upload form submission
//@route POST /galleryUpload
//@access public

const galleryUploadUploadPost = async (req, res) => {
	try {
		res.render('galleryPhotoUpload');
	}
	catch (err){
		console.log(err);
		res.render('galleryPhotoUpload');
	}
};

module.exports = {
	galleryPhotoUpload,
	galleryUploadUploadPost
}

