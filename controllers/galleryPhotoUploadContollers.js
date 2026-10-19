const mysql = require('mysql2/promise');

//@desc home page for gallery photo uploading
//@route GET /galleryPhotoUpload
// access public

const galleryPhotoUpload = (req, res) => {
	res.render('galleryPhotoUpload');
}

module.exports = {
	galleryPhotoUpload
}

