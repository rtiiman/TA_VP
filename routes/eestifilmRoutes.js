const express = require('express');
const router = express.Router();

//kontrollerid
const{
	eestifilm,
	inimesed,
	inimesedAdd,
	inimesedAddPost,
	filmid,
	filmidAdd,
	filmidAddPost,
	ametid,
	ametidAdd,
	ametidAddPost,
	seosed,
	seosedAdd,
	seosedAddPost} = require('../controllers/eestifilmControllers');

router.route('/').get(eestifilm);

router.route('/inimesed').get(inimesed);

router.route('/inimesed_add').get(inimesedAdd);

router.route('/inimesed_add').post(inimesedAddPost);

router.route('/filmid').get(filmid);

router.route('/filmid_add').get(filmidAdd);

router.route('/filmid_add').post(filmidAddPost);

router.route('/ametid').get(ametid);

router.route('/ametid_add').get(ametidAdd);

router.route('/ametid_add').post(ametidAddPost);

router.route('/seosed').get(seosed);

router.route('/seosed_add').get(seosedAdd);

router.route('/seosed_add').post(seosedAddPost);

module.exports = router;