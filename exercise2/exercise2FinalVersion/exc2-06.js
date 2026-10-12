import fs from 'fs';

function readFile(pathToFile) {
	return fs.readFileSync(pathToFile, 'utf8');
}

function filterCharsAndNormalize(strData) {
	// alpha numeric with Unicode
	const pattern = /[^\p{L}\p{N}]+/gu;
	return strData.replace(pattern, ' ').toLowerCase();
}

function scan(strData) {
	// drop empty words
	return strData.split(' ').filter((w) => w.length > 0);
}

function removeStopWords(wordList) {
	const stopWords = new Set([
		...fs.readFileSync('../stop_words.txt', 'utf8').split(','),
		...'abcdefghijklmnopqrstuvwxyz',
	]);
	return wordList.filter((w) => !stopWords.has(w));
}

function frequencies(wordList) {
	const wordFreqs = new Map();
	for (const word of wordList) {
		if (wordFreqs.has(word)) {
			wordFreqs.set(word, wordFreqs.get(word) + 1);
		} else {
			wordFreqs.set(word, 1);
		}
	}
	return wordFreqs;
}

function sort(wordFreq) {
	return [...wordFreq.entries()].sort((a, b) => b[1] - a[1]);
}

function printAll(wordFreqs) {
	if (wordFreqs.length > 0) {
		console.log(wordFreqs[0][0], '-', wordFreqs[0][1]);
		printAll(wordFreqs.slice(1));
	}
}

// top 25 print
printAll(
	sort(
		frequencies(
			removeStopWords(scan(filterCharsAndNormalize(readFile(process.argv[2])))),
		),
	).slice(0, 25),
);
