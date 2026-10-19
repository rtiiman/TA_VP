const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const sharp = require('sharp');

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
		const fileName = 'vp' + Date.now() + '.jpg';
		await fs.mkdir('./public/gallery/normal/', { recursive: true });
		await fs.rename(req.file.path, req.file.destination + fileName);
		// suuruse muutmine
		await sharp(req.file.destination + fileName).resize(800, 600, {fit: 'inside'}).jpeg({quality:90}).toFile('./public/gallery/normal/' + fileName);
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

