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
const regTextRef = 'public/txt/visits.txt'

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

app.get('/regvisit', (req, res)=>{
	res.render('regvisit');
});

app.post('/regvisit', async (req, res)=>{
	try {
		//komad ja semikoolonid on failis eraldajad, seega asendan need nimes tühikuga ja eemaldan liigsed tühikud
		const visitorName = (req.body.nameInput || '').replace(/[,;]/g, ' ').replace(/\s+/g, ' ').trim();
		//tühja nimega külastust ei salvesta
		if(!visitorName){
			return res.render('regvisit');
		}
		//salvestan nime koos külastuse kuupäeva ja kellaajaga, väljad on komadega eraldatud
		await fs.appendFile(regTextRef, visitorName + ',' + dateET.fullDate() + ',' + dateET.fullTime() + ';');
		res.render('regvisit');
	}
	catch (err){
		console.log(err);
		res.render('regvisit');
	}
});

app.get('/visits', async (req, res)=>{
	let visitInfo = 'Ühtegi külastust ei ole registreeritud.';
	try {
		const visitsText = await fs.readFile(regTextRef, 'utf8');
		const visitList = visitsText.split(';');
		//iga kirje lõpus on semikoolon, seega listi viimane element on tühi ja viimane külastus on eelviimane element
		const lastVisit = visitList[visitList.length - 2];
		if(lastVisit){
			//kirje kuju on nimi,kuupäev,kellaaeg
			const visitParts = lastVisit.split(',');
			visitInfo = 'Viimati registreeriti külastus ' + visitParts[1] + ', kell ' + visitParts[2] + ' kui seda tegi ' + visitParts[0];
		}
	} catch (err) {
		//kui külastuste faili veel pole, siis pole ka ühtegi külastust registreeritud
		if(err.code !== 'ENOENT'){
			console.log(err);
			visitInfo = 'Külastuste lugemine ebaõnnestus.';
		}
	}
	res.render('visits', {visitInfo: visitInfo});
});

//Eesti filmi marsruudid
const eestifilmRouter = require('./routes/eestifilmRoutes');
app.use('/eestifilm', eestifilmRouter);

app.listen(5129);