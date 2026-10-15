import fs from 'fs';

// Node stand-in for Python's file object (readline / seek / write).
// word_freqs is mirrored in memory after each write so the rescan
// stays on the same bytes that were stored in the file.

function touchopen(filename) {
	try {
		fs.unlinkSync(filename);
	} catch (err) {
		// no previous secondary-memory file
	}
	fs.closeSync(fs.openSync(filename, 'a'));
	return {
		fd: fs.openSync(filename, 'r+'),
		pos: 0,
		length: 0,
		mem: Buffer.alloc(4096),
	};
}

function openInput(filename) {
	return {
		fd: fs.openSync(filename, 'r'),
		pos: 0,
		buf: Buffer.alloc(65536),
		bufPos: 0,
		bufLen: 0,
	};
}

function readLine(file) {
	const chunks = [];
	while (true) {
		if (file.pos < file.bufPos || file.pos >= file.bufPos + file.bufLen) {
			file.bufPos = file.pos;
			file.bufLen = fs.readSync(file.fd, file.buf, 0, file.buf.length, file.pos);
			if (file.bufLen === 0) {
				if (chunks.length === 0) return '';
				return Buffer.concat(chunks).toString('utf8');
			}
		}
		const start = file.pos - file.bufPos;
		let nl = -1;
		for (let i = start; i < file.bufLen; i++) {
			if (file.buf[i] === 10) {
				nl = i;
				break;
			}
		}
		if (nl === -1) {
			chunks.push(Buffer.from(file.buf.subarray(start, file.bufLen)));
			file.pos = file.bufPos + file.bufLen;
			if (file.bufLen < file.buf.length) return Buffer.concat(chunks).toString('utf8');
			continue;
		}
		const end = nl + 1;
		if (chunks.length === 0) {
			const line = file.buf.toString('utf8', start, end);
			file.pos = file.bufPos + end;
			return line;
		}
		chunks.push(Buffer.from(file.buf.subarray(start, end)));
		file.pos = file.bufPos + end;
		return Buffer.concat(chunks).toString('utf8');
	}
}

function readFreqLine(file) {
	if (file.pos >= file.length) return '';
	const mem = file.mem;
	const start = file.pos;
	let i = start;
	while (i < file.length && mem[i] !== 10) i++;
	const line = mem.toString('latin1', start, i);
	file.pos = i < file.length ? i + 1 : i;
	return line.trim();
}

function seek(file, offset, whence) {
	if (whence === 0) file.pos = offset;
	else if (whence === 1) file.pos += offset;
	else file.pos = file.length + offset;
}

function writeFreq(file, text) {
	const bytes = Buffer.from(text, 'utf8');
	fs.writeSync(file.fd, bytes, 0, bytes.length, file.pos);
	const end = file.pos + bytes.length;
	if (file.mem.length < end) {
		const grown = Buffer.alloc(Math.max(end, file.mem.length * 2));
		file.mem.copy(grown, 0, 0, file.length);
		file.mem = grown;
	}
	bytes.copy(file.mem, file.pos);
	if (end > file.length) file.length = end;
	file.pos = end;
}

function isAlnum(c) {
	const code = c.charCodeAt(0);
	if (code >= 48 && code <= 57) return true;
	if (code >= 65 && code <= 90) return true;
	if (code >= 97 && code <= 122) return true;
	if (code < 128) return false;
	return c.toLowerCase() !== c.toUpperCase();
}

// The constrained memory should have no more than 1024 cells.
let data = [];

// data[0] holds the stop words (first 1024 characters, split on commas)
let f = fs.openSync('../exercise2/stop_words.txt', 'r');
const stopBuf = Buffer.alloc(1024);
const stopN = fs.readSync(f, stopBuf, 0, 1024, 0);
fs.closeSync(f);
data = [stopBuf.toString('utf8', 0, stopN).replace(/\r\n/g, '\n').replace(/\r/g, '\n').split(',')];

data.push([]); // data[1] is line (max 80 characters)
data.push(null); // data[2] is index of the start_char of word
data.push(0); // data[3] is index on characters
data.push(false); // data[4] is flag indicating if word was found
data.push(''); // data[5] is the word
data.push(''); // data[6] is word,NNNN
data.push(0); // data[7] is frequency

const word_freqs = touchopen('word_freqs');
f = openInput(process.argv[2]);

// PART 1: one line at a time; counts go to the word_freqs file
while (true) {
	let line = readLine(f);
	if (line.endsWith('\r\n')) line = line.slice(0, -2) + '\n';
	data[1] = [line];
	if (data[1][0] === '') break;
	if (data[1][0][data[1][0].length - 1] !== '\n') data[1][0] = data[1][0] + '\n';
	data[2] = null;
	data[3] = 0;
	while (data[3] < data[1][0].length) {
		const c = data[1][0][data[3]];
		if (data[2] === null) {
			if (isAlnum(c)) data[2] = data[3];
		} else if (!isAlnum(c)) {
			data[4] = false;
			data[5] = data[1][0].slice(data[2], data[3]).toLowerCase();
			if (data[5].length >= 2 && data[0].indexOf(data[5]) === -1) {
				while (true) {
					data[6] = readFreqLine(word_freqs);
					if (data[6] === '') break;
					data[7] = parseInt(data[6].split(',')[1], 10);
					data[6] = data[6].split(',')[0].trim();
					if (data[5] === data[6]) {
						data[7] += 1;
						data[4] = true;
						break;
					}
				}
				const count = data[4] ? data[7] : 1;
				const record = data[5].padStart(20, ' ') + ',' + String(count).padStart(4, '0') + '\n';
				if (!data[4]) {
					seek(word_freqs, 0, 1); // needed between read and write on Windows
					writeFreq(word_freqs, record);
				} else {
					seek(word_freqs, -26, 1);
					writeFreq(word_freqs, record);
				}
				seek(word_freqs, 0, 0);
			}
			data[2] = null;
		}
		data[3] += 1;
	}
}

fs.closeSync(f.fd);
fs.fsyncSync(word_freqs.fd);

// PART 2: top 25. Nothing from part 1 is kept.
data.length = 0;
while (data.length < 25) data.push([]);
data.push(''); // data[25] is word,freq from file
data.push(0); // data[26] is freq

seek(word_freqs, 0, 0);
while (true) {
	data[25] = readFreqLine(word_freqs);
	if (data[25] === '') break;
	data[26] = parseInt(data[25].split(',')[1], 10);
	data[25] = data[25].split(',')[0].trim();
	for (let i = 0; i < 25; i++) {
		if (data[i].length === 0 || data[i][1] < data[26]) {
			data.splice(i, 0, [data[25], data[26]]);
			data.splice(26, 1);
			break;
		}
	}
}

for (const tf of data.slice(0, 25)) {
	if (tf.length === 2) console.log(tf[0], '-', tf[1]);
}

fs.closeSync(word_freqs.fd);
