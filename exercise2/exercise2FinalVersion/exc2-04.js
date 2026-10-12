import fs from 'fs';
import readline from 'readline';

// letter or number, including Unicode, same as Python isalnum()
const isAlnum = /^[\p{L}\p{N}]$/u;
// the global list of [word, frequency] pairs
const wordFreqs = [];
// the list of stop words
const stopWords = new Set([
	...fs.readFileSync('../stop_words.txt', 'utf8').split(','),
	...'abcdefghijklmnopqrstuvwxyz',
]);
// iterate through the file one line at a time
const book = readline.createInterface({
	input: fs.createReadStream(process.argv[2]),
	crlfDelay: Infinity, // always wait for \n
});
for await (const rawLine of book) {
	const line = rawLine + '\n'; // force add new line char
	let startChar = null; // start of a word
	let i = 0;
	for (const c of line) {
		if (startChar === null) {
			if (isAlnum.test(c)) startChar = i; // start of a word
		} else if (!isAlnum.test(c)) {
			// process a character after the start of a word
			let foundWrodInWordFrequencyList = false;
			const word = line.slice(startChar, i).toLowerCase();
			// stop word found, skip
			if (!stopWords.has(word)) {
				let wordIndex = 0;
				// if word already in frequency list, increment count
				for (const pair of wordFreqs) {
					if (word === pair[0]) {
						pair[1] += 1;
						foundWrodInWordFrequencyList = true;
						break;
					}
					wordIndex += 1;
				}
				// if new, append at end. else inc cnt and bubble sort it.
				if (!foundWrodInWordFrequencyList) {
					wordFreqs.push([word, 1]);
				} else if (wordFreqs.length > 1) {
					// re-order frequency list
					for (let n = wordIndex - 1; n >= 0; n--) {
						// bubble sort, moving our word forward one by one.
						if (wordFreqs[wordIndex][1] > wordFreqs[n][1]) {
							// swap
							const tmp = wordFreqs[n];
							wordFreqs[n] = wordFreqs[wordIndex];
							wordFreqs[wordIndex] = tmp;
							wordIndex = n;
						}
					}
				}
			}
			// reset for next word
			startChar = null;
		}
		i += 1;
	}
}

for (const [word, freq] of wordFreqs.slice(0, 25)) {
	console.log(word, '-', freq);
}
