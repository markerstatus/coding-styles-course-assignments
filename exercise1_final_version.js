import fs from 'fs';

// allocate data buffer
const data = [];
// 0 for stop words array
// load stop words
let f = fs.openSync('../stop_words.txt', 'r');
data[0] = Buffer.alloc(1024);
data[1] = fs.readSync(f, data[0], 0, 1024, 0);
data[0] = new Set(data[0].toString('utf8', 0, data[1]).split(','));
fs.closeSync(f);
// 1 for current line. Reading the book line by line
data[1] = '';
let readLine = '';
// 2 for word start index. in Reading Book. null if not a word, else the start index of a word
data[2] = 0;
let wordStartIndex = 0;
// 3 for word end index. in Reading Book. current char index scanning the line.
data[3] = 0;
let wordEndIndex = 0;
// 4 for is word found. found the word in Writing Book.
data[4] = false;
let isWordFound = false;
// 5 for word. storage for the word found in Reading Book.
data[5] = '';
let word = '';
// 6 for word frequency e.g. (hello, 0021) found in Writing Book
data[6] = '';
let wordFrequency = '';
// 7 for frequency found in Writing Book
data[7] = 0;
let frequency = 0;
// 8 for line buffer
data[8] = Buffer.alloc(0);
let lineBuffer = Buffer.alloc(0);
// 9 for one byte buffer
data[9] = Buffer.alloc(1);
let oneByteBuffer = Buffer.alloc(1);
// 10 for word frequency file position in Writing Book
data[10] = 0;
let wordFreqPos = 0;

let book = fs.openSync(process.argv[2], 'r');
let bookPos = 0;
// secondary storage file
try {
	fs.unlinkSync('word_frequency.txt');
} catch {
	// ignore if missing
}
fs.writeFileSync('word_frequency.txt', '');
let word_frequency = fs.openSync('word_frequency.txt', 'r+');

// read book
while (true) {
	// read one line (char by char until \n)
	while (true) {
		const n = fs.readSync(book, oneByteBuffer, 0, 1, bookPos);
		if (n === 0) break; // EOF nothing is left to read
		bookPos += 1;
		lineBuffer = Buffer.concat([lineBuffer, oneByteBuffer]);
		if (oneByteBuffer[0] === '\n'.charCodeAt(0)) break; // \n
	}
	if (lineBuffer.length === 0) break; // EOF with nothing left
	data[1] = lineBuffer.toString('utf8');
	lineBuffer = Buffer.alloc(0); // reset for next line
	// nothing — end of input
	if (data[1] === '') break;
	// ensure last char is \n
	if (data[1][data[1].length - 1] !== '\n') data[1] += '\n';

	// load data in data buffer
	const line = data[1];

	// iterate through each char of the line
	data[2] = null; // word start index
	data[3] = 0; // current char index

	while (data[3] < line.length) {
		const eachChar = line[data[3]];

		if (data[2] === null) {
			// not in a word yet — look for first letter/digit
			if (eachChar.match(/^[a-z0-9]+$/i)) {
				data[2] = data[3]; // start of word
			}
		} else {
			// word end.
			if (!eachChar.match(/^[a-z0-9]+$/i)) {
				data[5] = line.slice(data[2], data[3]).toLowerCase(); // word buffer
				data[2] = null; // ready for next word

				// word found. validate against stop words
				if (!data[0].has(data[5]) && data[5].length > 1) {
					// reset isWordFound flag in Writing Book
					data[4] = false;

					// 2. scan Writing Book from the start
					wordFreqPos = 0;
					while (true) {
						data[6] = Buffer.alloc(0); // word
						data[7] = Buffer.alloc(1); // one byte buffer
						while (true) {
							data[8] = fs.readSync(word_frequency, data[7], 0, 1, wordFreqPos);
							if (data[8] === 0) break; // EOF
							wordFreqPos += 1;
							// piece chars together to form word
							data[6] = Buffer.concat([data[6], data[7]]);
							if (data[7][0] === '\n'.charCodeAt(0)) break; // EOF
						}
						// convert buffer to string and trim whitespace
						data[6] =
							data[6].length === 0 ? '' : data[6].toString('utf8').trim();
						if (data[6] === '') break; // EOF

						// parse it to get word and frequency found in Writing Book
						data[7] = parseInt(data[6].split(',')[1], 10);
						data[6] = data[6].split(',')[0].trim();
						if (data[6] === data[5]) {
							// if word found in Writing Book, increment frequency
							data[7] += 1;
							data[4] = true;
							break;
						}
					}

					// prepare our new word frequency record for Writing Book
					data[6] = Buffer.from(
						data[5].padStart(20, ' ') +
							',' +
							String(data[4] ? data[7] : 1).padStart(4, '0') +
							'\n',
						'utf8',
					);
					// if word not found in Writing Book, just append at EOF (wordFreqPos)
					if (!data[4]) {
						// new word → append at EOF
						fs.writeSync(
							word_frequency,
							data[6],
							0,
							data[6].length,
							wordFreqPos,
						);
						wordFreqPos += data[6].length;
					} else {
						// found → seek back 26 bytes and overwrite
						//    26 bytes = 20 (word) + 1 (comma) + 4 (freq) + 1 (\n)
						wordFreqPos -= 26;
						fs.writeSync(
							word_frequency,
							data[6],
							0,
							data[6].length,
							wordFreqPos,
						);
						wordFreqPos += data[6].length;
					}

					// rewind back for next word
					wordFreqPos = 0;
				}
			}
		}

		data[3] += 1;
	}
}

// close the book file and sync the word frequency file
fs.closeSync(book);

// sync the word frequency file
fs.fsyncSync(word_frequency);

// Get top 25 most frequently occurring words from Writing Book
// Reset data buffer.
//    Allocate 25 spaces for our top 25 words with frequency count.
//    Set up our last two slots for word and frequency.
data.length = 0;
while (data.length < 25) data.push([]);
data.push(''); // data[25] word
data.push(0); // data[26] freq

wordFreqPos = 0;
while (true) {
	data[25] = '';
	// read one line (char by char until \n)
	while (true) {
		data[26] = Buffer.alloc(1); // one byte buffer
		// EOF
		if (fs.readSync(word_frequency, data[26], 0, 1, wordFreqPos) === 0) break;

		wordFreqPos += 1;
		data[25] += String.fromCharCode(data[26][0]); // piece chars together to form word
		if (data[26][0] === '\n'.charCodeAt(0)) break; // detected end of line
		// move on to next char
	}
	data[25] = data[25].trim(); // trim whitespace
	if (data[25] === '') break; // EOF if only whitespace is left

	// parse our findings to get word and frequency
	data[26] = parseInt(data[25].split(',')[1], 10); // parse for frequency
	data[25] = data[25].split(',')[0].trim(); // parse for word

	// insert the word and frequency into the data buffer
	for (let i = 0; i < 25; i++) {
		// if the word and frequency is less than the current word and frequency, insert it at the current index
		// and delete the last element automatically since we dont need it anymore
		if (data[i].length === 0 || data[i][1] < data[26]) {
			// insert the word and frequency at the current index
			//     and this will push the rest of the elements to the right
			data.splice(i, 0, [data[25], data[26]]);
			data.splice(26, 1); // delete the last element automatically since we dont need it anymore
			break;
		}
	}
}

// print the top 25 words and frequencies
for (let n = 0; n < 25; n++) {
	if (data[n].length === 2) {
		console.log(data[n][0], '-', data[n][1]);
	}
}

// close the word frequency file
fs.closeSync(word_frequency);
