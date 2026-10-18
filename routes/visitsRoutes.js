const express = require('express');
const router = express.Router();

//kontrollerid
const{
	visits,
	regvisit,
	regvisitPost} = require('../controllers/visitsControllers');

router.route('/').get(visits);

router.route('/regvisit').get(regvisit);

router.route('/regvisit').post(regvisitPost);

module.exports = router;