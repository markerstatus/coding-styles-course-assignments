import fs from 'fs';
const isAlnum = /^[\p{L}\p{N}]$/u;

let data = [];
let words = [];
const wordFreqs = [];

function readFile(pathToFile) {
	const text = fs.readFileSync(pathToFile, 'utf8');
	data = data.concat([...text]);
}

function filterCharsAndNormalize() {
	// Replaces all nonalphanumeric chars in data with white space
	for (let i = 0; i < data.length; i++) {
		if (!isAlnum.test(data[i])) {
			data[i] = ' ';
		} else {
			data[i] = data[i].toLowerCase();
		}
	}
}

function scan() {
	// Scans data for words, filling the global variable words
	const dataStr = data.join('');
	words = words.concat(dataStr.split(' ').filter((w) => w.length > 0));
}

function removeStopWords() {
	const stopWords = new Set([
		...fs.readFileSync('../stop_words.txt', 'utf8').split(','),
		...'abcdefghijklmnopqrstuvwxyz'.split(''),
	]);
	const indexes = [];
	for (let i = 0; i < words.length; i++) {
		if (stopWords.has(words[i])) {
			indexes.push(i);
		}
	}
	// remove/splice the words at index.
	//     do it reversely to avoid index shifting causing issues.
	for (let i = indexes.length - 1; i >= 0; i--) {
		words.splice(indexes[i], 1);
	}
}

function frequencies() {
	// build wordFreqs from words array.
	for (const w of words) {
		const keys = wordFreqs.map((wd) => wd[0]);
		if (keys.includes(w)) {
			wordFreqs[keys.indexOf(w)][1] += 1;
		} else {
			wordFreqs.push([w, 1]);
		}
	}
}

function sort() {
	wordFreqs.sort((a, b) => b[1] - a[1]);
}

readFile(process.argv[2]);
filterCharsAndNormalize();
scan();
removeStopWords();
frequencies();
sort();

for (const [word, freq] of wordFreqs.slice(0, 25)) {
	console.log(word, '-', freq);
}
