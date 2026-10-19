const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const sharp = require('sharp');
const path = require('path');

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
	let connection;
	try {
		const baseName = 'vp' + Date.now();
		const originalExt = path.extname(req.file.originalname).toLowerCase() || '.jpg';
		const originalFileName = baseName + originalExt;
		const normalFileName = baseName + '.jpg';
		await fs.rename(req.file.path, req.file.destination + originalFileName);
		// suuruse muutmine
		await fs.mkdir('./public/gallery/normal/', { recursive: true });
		await sharp(req.file.destination + originalFileName).resize(800, 600, {fit: 'inside'}).jpeg({quality:90}).toFile('./public/gallery/normal/' + normalFileName);
		// teeme pisipildi (100x100) thumbnails directorisse
		await fs.mkdir('./public/gallery/thumbnails/', { recursive: true });
		await sharp(req.file.destination + originalFileName).resize(100, 100, {fit: 'inside'}).jpeg({quality:90}).toFile('./public/gallery/thumbnails/' + normalFileName);
		// db input
		let sqlReq = 'INSERT INTO galleryphoto (filename, origname, alttext, privacy, userid) VALUES (?, ?, ?, ?, ?)';
		const userId = 1; //ajutine kuni tehakse kasutajakontod
		// db connection
		connection = await mysql.createConnection({host: process.env.DB_HOST, user: process.env.DB_USER, database: process.env.DB_NAME, password: process.env.DB_PASSWORD});
		const [result] = await connection.execute(sqlReq, [normalFileName, req.file.originalname, req.body.altInput, req.body.privacyInput, userId]);
		console.log(result);
		await connection.end();
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