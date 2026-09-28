function dateFormattedET(monthNameType = 0){
	let timeNow = new Date();
	let dateNow = timeNow.getDate();
	let monthNow = timeNow.getMonth();
	//let yearNow = timeNow.getYear();
	let yearNow = timeNow.getFullYear();
	const monthNamesET = ['jaanuar', 'veebruar', 'märts', 'aprill', 'mai', 'juuni', 'juuli', 'august', 'september', 'oktoober', 'november', 'detsember']
	//tegemist on array'ga, ehk igal teguril on oma enda järjekorra number, aga array hakkab nulliga ja nulltegurit ei ole ehk ei pea lisama ühte juurde kui valida kuu nime array'st
	const monthFolkNamesET = ['näärikuu', 'küünlakuu', 'paastukuu', 'jürikuu', 'lehekuu', 'jaanikuu', 'heinakuu', 'lõikuskuu', 'mihklikuu', 'viinakuu', 'talvekuu', 'jõulukuu']
	//argument 1 annab rahvakalendri kuunime, 0 või argumendi puudumine annab tavalise kuunime
	let monthName = monthNamesET[monthNow];
	if(monthNameType === 1){
		monthName = monthFolkNamesET[monthNow];
	}
	return dateNow + '.' + ' ' + monthName + ' ' + yearNow;
}

function timeFormattedET(){
	let timeNow = new Date();
	let hourNow = timeNow.getHours();
	let minuteNow = timeNow.getMinutes();
	let secondNow = timeNow.getSeconds();
	
	if(hourNow < 10){
		hourNow = '0' + hourNow;
	}
	if(minuteNow < 10){
		minuteNow = '0' + minuteNow;
	}
	if(secondNow < 10){
		secondNow = '0' + secondNow;
	}
	
	let timeFormatted = hourNow + ':' + minuteNow + ':' + secondNow
	return timeFormatted;
}

function weekDayET(){
	let weekDay = new Date().getDay();
	const weekDayNamesET = ['pühapäev', 'esmaspäev', 'teisipäev', 'kolmapäev', 'neljapäev', 'reede', 'laupäev']
	return weekDayNamesET[weekDay];
}

module.exports = {fullDate:dateFormattedET, fullTime:timeFormattedET, weekDay:weekDayET}