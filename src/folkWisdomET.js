const fs = require('fs').promises;
const path = require('path');

const textRef = path.join(__dirname, '..', 'pubic', 'txt', 'vanasonad.txt');

//lõikab semikoolonite kohalt array'ks, tühjad osad jäetakse välja
async function readFolkWisdom(referencedFile = textRef){
	const rawText = await fs.readFile(referencedFile, 'utf8');
	return rawText.split(';').map(item => item.trim()).filter(item => item.length > 0);
}

//tagastab juhuslikult valitud eelmisest funktsioonist saadud array'st ühe vanasõna
async function randomFolkWisdom(referencedFile = textRef){
	const wisdomList = await readFolkWisdom(referencedFile);
	return wisdomList[Math.floor(Math.random() * wisdomList.length)];
}

module.exports = {allWisdom:readFolkWisdom, randomWisdom:randomFolkWisdom};
