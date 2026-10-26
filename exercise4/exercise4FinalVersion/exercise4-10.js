import fs from 'fs';

// Style #10 — The One.
// Wrap a value, bind functions in sequence, then unwrap.

class TFTheOne {
	constructor(v) {
		this._value = v;
	}

	bind(func) {
		this._value = func(this._value);
		return this;
	}

	printme() {
		console.log(this._value);
	}
}

function read_file(path_to_file) {
	return fs.readFileSync(path_to_file, 'utf8');
}

function filter_chars(str_data) {
	return str_data.replace(/[^\p{L}\p{N}]+/gu, ' ');
}

function normalize(str_data) {
	return str_data.toLowerCase();
}

function scan(str_data) {
	return str_data.match(/[^\s]+/g) ?? [];
}

function remove_stop_words(word_list) {
	const stop_words = fs
		.readFileSync('../stop_words.txt', 'utf8')
		.replace(/^\n+|\n+$/g, '')
		.split(',');
	stop_words.push(...'abcdefghijklmnopqrstuvwxyz');
	return word_list.filter((w) => !stop_words.includes(w));
}

function frequencies(word_list) {
	const word_freqs = Object.create(null);
	for (const w of word_list) {
		if (w in word_freqs) word_freqs[w] += 1;
		else word_freqs[w] = 1;
	}
	return word_freqs;
}

function sort(word_freq) {
	return Object.entries(word_freq).sort((a, b) => b[1] - a[1]);
}

function top25_freqs(word_freqs) {
	let top25 = '';
	for (const tf of word_freqs.slice(0, 25)) {
		top25 += tf[0] + ' - ' + tf[1] + '\n';
	}
	return top25;
}

new TFTheOne(process.argv[2])
	.bind(read_file)
	.bind(filter_chars)
	.bind(normalize)
	.bind(scan)
	.bind(remove_stop_words)
	.bind(frequencies)
	.bind(sort)
	.bind(top25_freqs)
	.printme();
