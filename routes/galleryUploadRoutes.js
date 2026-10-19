const express = require('express');
const router = express.Router();
const multer = require('multer');

const upload = multer({dest: 'public/gallery/originals/'});

//kontrollerid
const{
	galleryPhotoUpload,
	galleryUploadUploadPost} = require('../controllers/galleryPhotoUploadContollers');

router.route('/').get(galleryPhotoUpload);

// post osa suunatakse läbi vahevara
router.route('/').post(upload.single('photoInput'), galleryUploadUploadPost);

module.exports = router;