const express = require('express');
const fs = require('fs').promises;
//moodul URL'i lahtiharutamiseks et saaks POST osa kätte
const bodyparser = require('body-parser');
//moodul andmebaasiga suhtlemiseks, promises osaga async programmeerimise jaoks
const mysql = require('mysql2/promise');
//moodul .env faili lugemiseks, keskkonnamuutujate parsimiseks
require('dotenv').config();

const dateET = require('./src/dateAndTimeFormattedET.js');
const folkWisdom = require('./src/folkWisdomET.js');

//käivitan express.js funktsiooni ja annan nimeks "app"
const app = express();

//määrame veebilehtede mallide renderdamise mootori
app.set('view engine', 'ejs');

//määran ühe päris kataloogi kättesaadavaks
app.use(express.static('public'));

//määran, et POST päringus saadetud andmed on kättesaadavad req.body kaudu
app.use(bodyparser.urlencoded({ extended: false }));

//marsruudid
app.get('/', (req, res)=>{
	//res.send('Express.js läks käima ja serveerib meile veebi');
	const dayNow = dateET.weekDay();
	const dateNow = dateET.fullDate();
	const timeNow = dateET.fullTime();
	res.render('index', {dayNow: dayNow, dateNow: dateNow, timeNow: timeNow});
});

app.get('/vanasona', async (req, res)=>{
	try {
		const randomWisdom = await folkWisdom.randomWisdom();
		res.render('vanasona', {wisdom: randomWisdom})
	} catch (err) {
		console.log(err);
		res.render('vanasona', {wisdom: 'Vanasõna lugemine ebaõnnestus.'})
	}
});

//Eesti filmi marsruudid
const eestifilmRouter = require('./routes/eestifilmRoutes');
app.use('/eestifilm', eestifilmRouter);

//külastuste marsruudid
const visitsRouter = require('./routes/visitsRoutes');
app.use('/visits', visitsRouter);

//galerii üleslaadimise marsruudid
const galleryUploadRouter = require('./routes/galleryUploadRoutes');
app.use('/galleryUpload', galleryUploadRouter);

app.listen(5129);