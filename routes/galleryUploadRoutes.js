const express = require('express');
const router = express.Router();

//kontrollerid
const{
	galleryPhotoUpload,
	galleryUploadUploadPost} = require('../controllers/galleryUploadController');

router.route('/').get(galleryPhotoUpload);

router.route('/').post(galleryUploadUploadPost);

module.exports = router;