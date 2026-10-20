import fs from 'fs';

let data = [];
let f = null;
let word_freqs = null;

// Load the list of stop words. data[0] holds them.
f = fs.openSync('../stop_words.txt', 'r');
data[0] = Buffer.alloc(1024);
data[1] = fs.readSync(f, data[0], 0, 1024, 0);
data = [data[0].toString('utf8', 0, data[1]).split(',')];
fs.closeSync(f);

data.push([]); // data[1] is line (max 80 characters)
data.push(null); // data[2] is index of the start_char of word
data.push(0); // data[3] is index on characters
data.push(false); // data[4] is flag indicating if word was found
data.push(''); // data[5] is the word
data.push(''); // data[6] is word,NNNN
data.push(0); // data[7] is frequency

try {
	fs.unlinkSync('word_freqs');
} catch (err) {
	// no previous secondary-memory file
}
fs.closeSync(fs.openSync('word_freqs', 'a'));
// Records are fixed 26 bytes. Read them in blocks, not one byte at a time.
word_freqs = {
	fd: fs.openSync('word_freqs', 'r+'),
	pos: 0,
	buf: Buffer.alloc(26 * 128),
	got: 0,
	at: 0,
	end: 0,
};

// Open the input file. Lines are under 80 characters.
f = {
	fd: fs.openSync(process.argv[2], 'r'),
	pos: 0,
	buf: Buffer.alloc(256),
	n: 0,
	at: 0,
};

// Loop over input file's lines
while (true) {
	// readline -> data[1][0]
	data[1] = [''];
	while (true) {
		f.n = fs.readSync(f.fd, f.buf, 0, f.buf.length, f.pos);
		if (f.n === 0) break;
		f.at = 0;
		while (f.at < f.n && f.buf[f.at] !== 10) f.at += 1;
		if (f.at < f.n) f.at += 1;
		data[1][0] += f.buf.toString('utf8', 0, f.at);
		f.pos += f.at;
		if (f.at < f.n || f.buf[f.at - 1] === 10) break;
	}
	if (data[1][0] === '') break; // end of input file
	if (data[1][0][data[1][0].length - 1] !== '\n') {
		data[1][0] = data[1][0] + '\n';
	}
	data[2] = null;
	data[3] = 0;
	// Loop over characters in the line. Current char lives in data[6]
	// (elimination of symbol c).
	while (data[3] < data[1][0].length) {
		data[6] = data[1][0][data[3]];
		if (data[2] === null) {
			if (/^[0-9A-Za-z]$/.test(data[6])) {
				// We found the start of a word
				data[2] = data[3];
			}
		} else {
			if (!/^[0-9A-Za-z]$/.test(data[6])) {
				// We found the end of a word. Process it
				data[4] = false;
				data[5] = data[1][0].slice(data[2], data[3]).toLowerCase();
				// Ignore words with len < 2, and stop words
				if (data[5].length >= 2 && data[0].indexOf(data[5]) < 0) {
					// Let's see if it already exists. Scan 26-byte records from the start.
					word_freqs.pos = 0;
					while (!data[4]) {
						word_freqs.got = fs.readSync(
							word_freqs.fd,
							word_freqs.buf,
							0,
							word_freqs.buf.length,
							word_freqs.pos,
						);
						if (word_freqs.got < 26) break;
						word_freqs.at = 0;
						word_freqs.end = word_freqs.got - (word_freqs.got % 26);
						while (word_freqs.at < word_freqs.end) {
							data[6] = word_freqs.buf
								.toString('utf8', word_freqs.at, word_freqs.at + 26)
								.trim();
							word_freqs.at += 26;
							word_freqs.pos += 26;
							data[7] = parseInt(data[6].split(',')[1], 10);
							// word, no white space
							data[6] = data[6].split(',')[0].trim();
							if (data[5] === data[6]) {
								data[7] += 1;
								data[4] = true;
								break;
							}
						}
						if (word_freqs.got < word_freqs.buf.length) break;
					}
					data[6] = Buffer.from(
						data[5].padStart(20, ' ') +
							',' +
							String(data[4] ? data[7] : 1).padStart(4, '0') +
							'\n',
						'utf8',
					);
					if (!data[4]) {
						// seek(0, 1) — no move; needed on Windows between read and write
						fs.writeSync(
							word_freqs.fd,
							data[6],
							0,
							data[6].length,
							word_freqs.pos,
						);
						word_freqs.pos += data[6].length;
					} else {
						word_freqs.pos -= 26;
						fs.writeSync(
							word_freqs.fd,
							data[6],
							0,
							data[6].length,
							word_freqs.pos,
						);
						word_freqs.pos += data[6].length;
					}
					word_freqs.pos = 0; // seek(0, 0)
				}
				// Let's reset
				data[2] = null;
			}
		}
		data[3] += 1;
	}
}

// We're done with the input file
fs.closeSync(f.fd);
fs.fsyncSync(word_freqs.fd);

// PART 2
// Find the 25 most frequently occurring words.
// Nothing from the previous values in memory is kept.
data.length = 0;

// First 25 entries are the top 25 words
while (data.length < 25) data.push([]);
data.push(''); // data[25] is word,freq from file
data.push(0); // data[26] is freq

word_freqs.pos = 0;
while (true) {
	word_freqs.got = fs.readSync(
		word_freqs.fd,
		word_freqs.buf,
		0,
		26,
		word_freqs.pos,
	);
	if (word_freqs.got < 26) break; // EOF
	word_freqs.pos += 26;
	data[25] = word_freqs.buf.toString('utf8', 0, 26).trim();
	data[26] = parseInt(data[25].split(',')[1], 10);
	data[25] = data[25].split(',')[0].trim(); // word
	// Check if this word has more counts than the ones in memory
	for (let i = 0; i < 25; i++) {
		// elimination of symbol i is exercise
		if (data[i].length === 0 || data[i][1] < data[26]) {
			data.splice(i, 0, [data[25], data[26]]);
			data.splice(26, 1); // delete the shifted word,freq tail
			break;
		}
	}
}

// data[0..24] is already in count order, highest first.
// Write that sorted top 25 back over the secondary file and drop the rest.
word_freqs.pos = 0;
for (let tf = 0; tf < 25; tf++) {
	// elimination of symbol tf is exercise
	if (data[tf].length === 2) {
		console.log(data[tf][0], '-', data[tf][1]);
		data[25] = Buffer.from(
			data[tf][0].padStart(20, ' ') +
				',' +
				String(data[tf][1]).padStart(4, '0') +
				'\n',
			'utf8',
		);
		fs.writeSync(word_freqs.fd, data[25], 0, data[25].length, word_freqs.pos);
		word_freqs.pos += data[25].length;
	}
}
fs.ftruncateSync(word_freqs.fd, word_freqs.pos);

// We're done
fs.closeSync(word_freqs.fd);
