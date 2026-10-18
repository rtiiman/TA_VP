const mysql = require('mysql2/promise');
const dateET = require('../src/dateAndTimeFormattedET.js');

//andmebaasiühenduse seaded tulevad .env failist
const dbConfig = {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME
};

//abifunktsioonid vormide jaoks
//tekstisisend ilma ümbritsevate tühikuteta; kui sisendit pole või see pole tekst, siis tühi tekst
function textInput(value){
	return typeof value === 'string' ? value.trim() : '';
}

//täisarvu sisend: arv, kui sisend koosneb ainult numbritest, muul juhul NaN
function intInput(value){
	const text = textInput(value);
	return /^\d+$/.test(text) ? Number(text) : NaN;
}

//vormi andmed vaatele: teade ja kõigi väljade väärtused
//ilma sisestuseta (lehe laadimine, edukas salvestus) saavad väljad väärtuseks null, vea korral saadetakse sisestatu tagasi
function formData(notice, fieldNames, body){
	let data = {notice: notice};
	for(const fieldName of fieldNames){
		data[fieldName] = (body && typeof body[fieldName] === 'string') ? body[fieldName] : null;
	}
	return data;
}

//vormide väljade nimed
const personFields = ['firstNameInput', 'lastNameInput', 'bornInput', 'deceasedInput'];
const movieFields = ['titleInput', 'releaseYearInput', 'durationInput', 'descriptionInput'];
const professionFields = ['titleInput', 'descriptionInput'];
const relationFields = ['personInput', 'movieInput', 'professionInput', 'characterNameInput'];

//seoste vormi andmed vaatele: lisaks formData andmetele ka rippmenüüde valikud (isikud, filmid, ametid)
function relationFormData(notice, personList, movieList, professionList, body){
	let data = formData(notice, relationFields, body);
	data.personList = personList;
	data.movieList = movieList;
	data.professionList = professionList;
	return data;
}

//@desc home page for Estonian Film section
//@route GET /eestifilm
//@access public

//app.get('/eestifilm', (req,res)=>{
const eestifilm = (req, res) => {
	res.render('eestifilm');
};

//@desc page for list of people involved in Estonian Film industry
//@route GET /eestifilm/inimesed
//@access public

//app.get('/eestifilm/inimesed', async (req,res)=>{
const inimesed = async (req, res) => {
	//console.log('Andmebaasiserver on: ' + process.env.DB_HOST);
	let conn;
	try {
		conn = await mysql.createConnection(dbConfig);
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
};

//@desc page for adding people involved in Estonian Film industry
//@route GET /eestifilm/inimesed_add
//@access public

//app.get('/eestifilm/inimesed_add', (req, res)=>{
const inimesedAdd = (req, res) => {
	res.render('eestifilmiinimesed_add', formData('Ootan sisestust!', personFields));
};

//@desc page for adding people involved in Estonian Film industry
//@route POST /eestifilm/inimesed_add
//@access public

//app.post('/eestifilm/inimesed_add', async (req, res)=>{
const inimesedAddPost = async (req, res) => {
	console.log(req.body);
	const body = req.body || {};
	const firstName = textInput(body.firstNameInput);
	const lastName = textInput(body.lastNameInput);
	const now = new Date(); //fikseerib praeguse hetke
	//kodutöös antud new Date(req.body.bornInput) asemel kasutan dateET.fromInput funktsiooni, sest new Date teeb olematust kuupäevast (nt 31. veebruar)
	//järgmise kuu kuupäeva, mida isNaN ei taba, ning loeb kuupäeva UTC keskööks, mistõttu öösel kuni kella 2-3-ni oleks tänane kuupäev justkui tulevikus
	const bornDate = dateET.fromInput(body.bornInput);
	//kontrollime iga sisendit eraldi ja kogume veateated
	let errors = [];
	if(!firstName){
		errors.push('Eesnimi on puudu!');
	} else if(firstName.length > 100){
		errors.push('Eesnimi on liiga pikk (kuni 100 märki)!');
	}
	if(!lastName){
		errors.push('Perekonnanimi on puudu!');
	} else if(lastName.length > 100){
		errors.push('Perekonnanimi on liiga pikk (kuni 100 märki)!');
	}
	//kodutöö tingimus isNaN(bornDate.getTime()) || bornDate > now on jagatud kaheks, et veateade oleks täpsem
	if(isNaN(bornDate.getTime())){
		errors.push('Sünnikuupäev on puudu või vigane!');
	} else if(bornDate > now){
		errors.push('Sünnikuupäev ei saa olla tulevikus!');
	}
	if(body.deceasedInput){
		const deceasedDate = dateET.fromInput(body.deceasedInput);
		if(isNaN(deceasedDate.getTime())){
			errors.push('Surmakuupäev on vigane!');
		} else if(deceasedDate > now){
			errors.push('Surmakuupäev ei saa olla tulevikus!');
		} else if(deceasedDate < bornDate){
			errors.push('Surmakuupäev ei saa olla varasem kui sünnikuupäev!');
		}
	}
	if(errors.length > 0){
		console.log('Andmed pole korrektsed: ' + errors.join(' '));
		return res.render('eestifilmiinimesed_add', formData(errors.join(' '), personFields, body));
	}
	let conn;
	try {
		conn = await mysql.createConnection(dbConfig);
		let sqlReq = 'INSERT INTO person (first_name, last_name, born, deceased) VALUES (?,?,?,?)';
		//kuupäevad salvestan algsel tekstikujul (AAAA-KK-PP), tühi surmakuupäev salvestub NULL väärtusena
		await conn.execute(sqlReq, [firstName, lastName, body.bornInput, body.deceasedInput || null]);
		res.render('eestifilmiinimesed_add', formData('Andmed salvestati! Ootan uut sisestust!', personFields));
	}
	catch (err) {
		console.log('Viga andmebaasiga suhtlemisel: ' + err);
		res.render('eestifilmiinimesed_add', formData('Tekkis viga, andmeid ei salvestatud!', personFields, body));
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};

//@desc page for list Estonian Films
//@route GET /eestifilm/filmid
//@access public

//app.get('/eestifilm/filmid', async (req, res)=>{
const filmid = async (req, res) => {
	let conn;
	try {
		conn = await mysql.createConnection(dbConfig);
		const sqlReq = 'SELECT * FROM movie ORDER BY title';
		const [sqlRes] = await conn.execute(sqlReq);
		res.render('eestifilmid', {movieList: sqlRes});
	}
	catch (err){
		console.log('Viga andmebaasist lugemisel: ' + err);
		res.render('eestifilmid', {movieList: []});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};

//@desc page for adding Estonian Films
//@route GET /eestifilm/filmid_add
//@access public

//app.get('/eestifilm/filmid_add', (req, res)=>{
const filmidAdd = (req, res) => {
	res.render('eestifilmid_add', formData('Ootan sisestust!', movieFields));
};

//@desc page for adding Estonian Films
//@route POST /eestifilm/filmid_add
//@access public

//app.post('/eestifilm/filmid_add', async (req, res)=>{
const filmidAddPost = async (req, res) => {
	console.log(req.body);
	const body = req.body || {};
	const title = textInput(body.titleInput);
	const releaseYear = intInput(body.releaseYearInput);
	const duration = intInput(body.durationInput);
	//brauser saadab reavahetused kahe märgina (\r\n), teen need ühemärgiliseks, et märkide arv vastaks kasutaja nähtavale
	const description = textInput(body.descriptionInput).replace(/\r\n/g, '\n');
	const thisYear = new Date().getFullYear();
	//kontrollime iga sisendit eraldi ja kogume veateated
	let errors = [];
	if(!title){
		errors.push('Pealkiri on puudu!');
	} else if(title.length > 100){
		errors.push('Pealkiri on liiga pikk (kuni 100 märki)!');
	}
	//esimesed filmid valmisid 1888. aastal
	if(isNaN(releaseYear) || releaseYear < 1888 || releaseYear > thisYear){
		errors.push('Valmimisaasta peab olema täisarv vahemikus 1888 kuni ' + thisYear + '!');
	}
	if(isNaN(duration) || duration < 1 || duration > 1000){
		errors.push('Kestus minutites peab olema täisarv vahemikus 1 kuni 1000!');
	}
	if(description.length > 1000){
		errors.push('Kirjeldus on liiga pikk (kuni 1000 märki)!');
	}
	if(errors.length > 0){
		console.log('Andmed pole korrektsed: ' + errors.join(' '));
		return res.render('eestifilmid_add', formData(errors.join(' '), movieFields, body));
	}
	let conn;
	try {
		conn = await mysql.createConnection(dbConfig);
		const sqlReq = 'INSERT INTO movie (title, release_year, duration_minutes, description) VALUES (?,?,?,?)';
		//tühi kirjeldus salvestub NULL väärtusena
		await conn.execute(sqlReq, [title, releaseYear, duration, description || null]);
		res.render('eestifilmid_add', formData('Andmed salvestati! Ootan uut sisestust!', movieFields));
	}
	catch (err) {
		console.log('Viga andmebaasiga suhtlemisel: ' + err);
		res.render('eestifilmid_add', formData('Tekkis viga, andmeid ei salvestatud!', movieFields, body));
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};

//@desc page listing professions related to film
//@route GET /eestifilm/ametid
//@access public

//app.get('/eestifilm/ametid', async (req, res)=>{
const ametid = async (req, res) => {
	let conn;
	try {
		conn = await mysql.createConnection(dbConfig);
		const sqlReq = 'SELECT * FROM profession ORDER by id';
		const [sqlRes] = await conn.execute(sqlReq);
		console.log(sqlRes);
		res.render('eestifilmiametid', {professionList: sqlRes});
	}
	catch (err){
		console.log('Viga andmebaasist lugemisel: ' + err);
		res.render('eestifilmiametid', {professionList: []});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};

//@desc page for adding professions related to film
//@route GET /eestifilm/ametid_add
//@access public

//app.get('/eestifilm/ametid_add', (req, res)=>{
const ametidAdd = (req, res) => {
	res.render('eestifilmiametid_add', formData('Ootan sisestust!', professionFields));
};

//@desc page for adding professions related to film
//@route POST /eestifilm/ametid_add
//@access public

//app.post('/eestifilm/ametid_add', async (req, res)=>{
const ametidAddPost = async (req, res) => {
	console.log(req.body);
	const body = req.body || {};
	const title = textInput(body.titleInput);
	//brauser saadab reavahetused kahe märgina (\r\n), teen need ühemärgiliseks, et märkide arv vastaks kasutaja nähtavale
	const description = textInput(body.descriptionInput).replace(/\r\n/g, '\n');
	//kontrollime iga sisendit eraldi ja kogume veateated
	let errors = [];
	if(!title){
		errors.push('Ameti nimetus on puudu!');
	} else if(title.length > 50){
		errors.push('Ameti nimetus on liiga pikk (kuni 50 märki)!');
	}
	if(description.length > 1000){
		errors.push('Kirjeldus on liiga pikk (kuni 1000 märki)!');
	}
	if(errors.length > 0){
		console.log('Andmed pole korrektsed: ' + errors.join(' '));
		return res.render('eestifilmiametid_add', formData(errors.join(' '), professionFields, body));
	}
	let conn;
	try {
		conn = await mysql.createConnection(dbConfig);
		const sqlReq = 'INSERT INTO profession (title, description) VALUES (?,?)';
		//tühi kirjeldus salvestub NULL väärtusena
		await conn.execute(sqlReq, [title, description || null]);
		res.render('eestifilmiametid_add', formData('Andmed salvestati! Ootan uut sisestust!', professionFields));
	}
	catch (err) {
		console.log('Viga andmebaasiga suhtlemisel: ' + err);
		res.render('eestifilmiametid_add', formData('Tekkis viga, andmeid ei salvestatud!', professionFields, body));
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};

//@desc page listing relations between people and Estonian Films
//@route GET /eestifilm/seosed
//@access public

const seosed = async (req, res) => {
	let conn;
	try {
		conn = await mysql.createConnection(dbConfig);
		//seoste tabelis on ainult id-d, nimede näitamiseks liidan JOIN abil juurde isikute, filmide ja ametite tabelid
		//nii filmil kui ametil on veerg title, tulemuse rida on aga objekt, kus sama nimega veerud kirjutaksid üksteist üle, seega annan neile AS abil eri nimed
		const sqlReq = 'SELECT person.first_name, person.last_name, movie.title AS movie_title, movie.release_year, profession.title AS profession_title, person_in_movie.character_name FROM person_in_movie JOIN person ON person_in_movie.person_id = person.id JOIN movie ON person_in_movie.movie_id = movie.id JOIN profession ON person_in_movie.profession_id = profession.id ORDER BY person.last_name, person.first_name, movie.title';
		const [sqlRes] = await conn.execute(sqlReq);
		res.render('eestifilmiseosed', {relationList: sqlRes});
	}
	catch (err){
		console.log('Viga andmebaasist lugemisel: ' + err);
		res.render('eestifilmiseosed', {relationList: []});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};

//@desc page for adding relations between people and Estonian Films
//@route GET /eestifilm/seosed_add
//@access public

const seosedAdd = async (req, res) => {
	let conn;
	try {
		conn = await mysql.createConnection(dbConfig);
		//rippmenüüde jaoks loen isikud, filmid ja ametid samade päringutega nagu nende loetelu lehtedel
		const [personRes] = await conn.execute('SELECT * FROM person ORDER by last_name');
		const [movieRes] = await conn.execute('SELECT * FROM movie ORDER BY title');
		const [professionRes] = await conn.execute('SELECT * FROM profession ORDER by id');
		res.render('eestifilmiseosed_add', relationFormData('Ootan sisestust!', personRes, movieRes, professionRes));
	}
	catch (err){
		console.log('Viga andmebaasist lugemisel: ' + err);
		res.render('eestifilmiseosed_add', relationFormData('Isikute, filmide ja ametite lugemine ebaõnnestus!', [], [], []));
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};

//@desc page for adding relations between people and Estonian Films
//@route POST /eestifilm/seosed_add
//@access public

const seosedAddPost = async (req, res) => {
	console.log(req.body);
	const body = req.body || {};
	//valikute loetelud on väljaspool try plokki, et vea korral saaks vormi näidata nende valikutega, mis jõuti lugeda
	let personList = [];
	let movieList = [];
	let professionList = [];
	let conn;
	try {
		conn = await mysql.createConnection(dbConfig);
		//valikud loen enne kontrolli, sest nende järgi kontrollin sisestust ja vea korral on neid vaja vormi uuesti näitamiseks
		const [personRes] = await conn.execute('SELECT * FROM person ORDER by last_name');
		personList = personRes;
		const [movieRes] = await conn.execute('SELECT * FROM movie ORDER BY title');
		movieList = movieRes;
		const [professionRes] = await conn.execute('SELECT * FROM profession ORDER by id');
		professionList = professionRes;
		const personId = intInput(body.personInput);
		const movieId = intInput(body.movieInput);
		const professionId = intInput(body.professionInput);
		const characterName = textInput(body.characterNameInput);
		//valitud id peab olema andmebaasist loetud valikute hulgas, sest vormi andmeid saab saata ka rippmenüüst mööda minnes
		const person = personList.find((item) => item.id === personId);
		const movie = movieList.find((item) => item.id === movieId);
		const profession = professionList.find((item) => item.id === professionId);
		//kontrollime iga sisendit eraldi ja kogume veateated
		let errors = [];
		if(!person){
			errors.push('Isik on valimata!');
		}
		if(!movie){
			errors.push('Film on valimata!');
		}
		if(!profession){
			errors.push('Amet on valimata!');
		} else if(profession.title.trim().toLowerCase() === 'näitleja'){
			//tegelaskuju on ainult näitlejal ja näitleja puhul peab see olema
			if(!characterName){
				errors.push('Näitleja puhul on tegelaskuju nimi kohustuslik!');
			} else if(characterName.length > 100){
				errors.push('Tegelaskuju nimi on liiga pikk (kuni 100 märki)!');
			}
		} else if(characterName){
			errors.push('Tegelaskuju nime saab sisestada ainult näitlejale!');
		}
		if(errors.length > 0){
			console.log('Andmed pole korrektsed: ' + errors.join(' '));
			return res.render('eestifilmiseosed_add', relationFormData(errors.join(' '), personList, movieList, professionList, body));
		}
		//enne salvestamist kontrollin, kas täpselt samade väärtustega seos on juba olemas
		let sqlReq;
		let sqlValues;
		if(characterName){
			sqlReq = 'SELECT id FROM person_in_movie WHERE person_id = ? AND movie_id = ? AND profession_id = ? AND character_name = ?';
			sqlValues = [personId, movieId, professionId, characterName];
		} else {
			//tegelaskujuta seosel on character_name NULL, aga SQL-is ei ole võrdlus = NULL kunagi tõene, seega tuleb kasutada IS NULL
			sqlReq = 'SELECT id FROM person_in_movie WHERE person_id = ? AND movie_id = ? AND profession_id = ? AND character_name IS NULL';
			sqlValues = [personId, movieId, professionId];
		}
		const [sqlRes] = await conn.execute(sqlReq, sqlValues);
		if(sqlRes.length > 0){
			console.log('Selline seos on juba olemas');
			return res.render('eestifilmiseosed_add', relationFormData('Selline seos on juba olemas, andmeid ei salvestatud!', personList, movieList, professionList, body));
		}
		sqlReq = 'INSERT INTO person_in_movie (person_id, movie_id, profession_id, character_name) VALUES (?,?,?,?)';
		//tühi tegelaskuju nimi salvestub NULL väärtusena
		await conn.execute(sqlReq, [personId, movieId, professionId, characterName || null]);
		res.render('eestifilmiseosed_add', relationFormData('Andmed salvestati! Ootan uut sisestust!', personList, movieList, professionList));
	}
	catch (err) {
		console.log('Viga andmebaasiga suhtlemisel: ' + err);
		res.render('eestifilmiseosed_add', relationFormData('Tekkis viga, andmeid ei salvestatud!', personList, movieList, professionList, body));
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};

module.exports = {
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
	seosedAddPost
}