const express = require('express')
const dateET = require('./src/dateAndTimeFormattedET.js');
const folkWisdom = require('./src/folkWisdomET.js');

//käivitan express.js funktsiooni ja annan nimeks "app"
const app = express();

//määrame veebilehtede mallide renderdamise mootori
app.set('view engine', 'ejs');

//määran ühe päris kataloogi kättesaadavaks
app.use(express.static('public'));

//marsruudid
app.get('/', (req, res)=>{
	//res.send('Express.js läks käima ja serveerib meile veebi');
	const dayNow = dateET.weekDay
	const dateNow = dateET.fullDate
	const timeNow = dateET.fullTime
	res.render('index', {dayNow: dayNow, dateNow: dateNow, timeNow: timeNow});
})

app.listen(5129);