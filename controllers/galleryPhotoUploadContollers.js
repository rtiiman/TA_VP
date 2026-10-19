const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const sharp = require('sharp');
const path = require('path');

//@desc home page for gallery photo uploading
//@route GET /galleryUpload
//@access public

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
		const originalPath = path.join(req.file.destination, originalFileName);
		const normalDir = path.join('public', 'gallery', 'normal');
		const thumbDir = path.join('public', 'gallery', 'thumbnails');
		await fs.rename(req.file.path, originalPath);
		// suuruse muutmine
		await fs.mkdir(normalDir, { recursive: true });
		await sharp(originalPath).resize(800, 600, {fit: 'inside', withoutEnlargement: true}).jpeg({quality:90}).toFile(path.join(normalDir, normalFileName));
		// teeme pisipildi (100x100) thumbnails directorisse
		await fs.mkdir(thumbDir, { recursive: true });
		await sharp(originalPath).resize(100, 100, {fit: 'cover'}).jpeg({quality:90}).toFile(path.join(thumbDir, normalFileName));
		// db input
		let sqlReq = 'INSERT INTO galleryphoto (filename, origname, alttext, privacy, userid) VALUES (?, ?, ?, ?, ?)';
		const userId = 1; //ajutine kuni tehakse kasutajakontod
		// db connection
		connection = await mysql.createConnection({host: process.env.DB_HOST, user: process.env.DB_USER, database: process.env.DB_NAME, password: process.env.DB_PASS});
		const [result] = await connection.execute(sqlReq, [normalFileName, req.file.originalname, req.body.altInput, req.body.privacyInput, userId]);
		console.log(result);
		res.render('galleryPhotoUpload');
	
	}
	catch (err){
		console.log(err);
		res.render('galleryPhotoUpload');
	}
	finally {
		if (connection){
			await connection.end();
		}
	}
};

module.exports = {
	galleryPhotoUpload,
	galleryUploadUploadPost
}