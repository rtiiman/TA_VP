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

app.get('/eestifilm', (req,res)=>{
	res.render('eestifilm');
});

app.get('/eestifilm/inimesed', async (req,res)=>{
	//console.log('Andmebaasiserver on: ' + process.env.DB_HOST);
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		const sqlReq = 'SELECT * FROM person ORDER by last_name';
		const [sqlRes] = await conn.execute(sqlReq);
		console.log(sqlRes);
		res.render('eestifilminimesed', {personList: sqlRes});
	}
	catch (err){
		console.log('Viga andmebaasist lugemisel: ' + err);
		res.render('eestifilminimesed', {personList: []});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
});

app.get('/eestifilm/inimesed_add', (req, res)=>{
	res.render('eestifilmiinimesed_add', {notice: 'Ootan sisestust!'});
});

app.post('/eestifilm/inimesed_add', async (req, res)=>{
	console.log(req.body);
	//kontrollime andmete olemasolu
	if(!req.body.firstNameInput || !req.body.lastNameInput || !req.body.bornInput || new Date(req.body.bornInput + 'T00:00:00') >= new Date()){
		console.log('Andmed pole korrektsed');
		return res.render('eestifilmiinimesed_add', {notice: 'Andmed on puudulikud!'});
	}
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME
		});
		let sqlReq = 'INSERT INTO person (first_name, last_name, born, deceased) VALUES (?,?,?,?)';
		let deceacedDate = null;
		if(req.body.deceasedInput){
			deceacedDate = req.body.deceasedInput;
		}
		await conn.execute(sqlReq, [
			req.body.firstNameInput,
			req.body.lastNameInput,
			req.body.bornInput,
			deceacedDate
		]);
		res.render('eestifilmiinimesed_add', {notice: 'Andmed salvestati! Ootan uut sisestust!'});
	}
	catch (err) {
		console.log('Viga andmebaasiga suhtlemisel: ' + err);
		res.render('eestifilmiinimesed_add', {notice: 'Tekkis viga, andmeid ei salvestatud!'});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
});

app.listen(5129);