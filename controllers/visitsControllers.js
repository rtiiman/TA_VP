const fs = require('fs').promises;
const dateET = require('../src/dateAndTimeFormattedET.js');
//failitee on projekti juurkausta suhtes, sest fs otsib faile serveri käivitamise kaustast, mitte selle faili kaustast
const regTextRef = 'public/txt/visits.txt'

//@desc home page for visits section, shows the last registered visit
//@route GET /visits
//@access public

//app.get('/visits', async (req, res)=>{
const visits = async (req, res) => {
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
};

//@desc page for registering a visit
//@route GET /visits/regvisit
//@access public

//app.get('/regvisit', (req, res)=>{
const regvisit = (req, res) => {
	res.render('regvisit');
};

//@desc page for registering a visit
//@route POST /visits/regvisit
//@access public

//app.post('/regvisit', async (req, res)=>{
const regvisitPost = async (req, res) => {
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
};

module.exports = {
	visits,
	regvisit,
	regvisitPost
}