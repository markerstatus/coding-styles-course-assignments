import fs from 'fs';

function read_file(path_to_file, func) {
	const data = fs.readFileSync(path_to_file, 'utf8');
	func(data, normalize);
}

function filter_chars(str_data, func) {
	func(str_data.replace(/[^\p{L}\p{N}]+/gu, ' '), scan);
}

function normalize(str_data, func) {
	func(str_data.toLowerCase(), remove_stop_words);
}

function scan(str_data, func) {
	func(str_data.match(/[^\s]+/g) ?? [], frequencies);
}

function remove_stop_words(word_list, func) {
	const stop_words = fs
		.readFileSync('../stop_words.txt', 'utf8')
		.replace(/^\n+|\n+$/g, '')
		.split(',');
	stop_words.push(...'abcdefghijklmnopqrstuvwxyz');
	func(
		word_list.filter((w) => !stop_words.includes(w)),
		sort,
	);
}

function frequencies(word_list, func) {
	const wf = Object.create(null);
	for (const w of word_list) {
		if (w in wf) wf[w] += 1;
		else wf[w] = 1;
	}
	func(wf, print_text);
}

function sort(wf, func) {
	func(
		Object.entries(wf).sort((a, b) => b[1] - a[1]),
		no_op,
	);
}

function print_text(word_freqs, func) {
	for (const [w, c] of word_freqs.slice(0, 25)) {
		console.log(w, '-', c);
	}
	func(null);
}

function no_op(func) {
	return;
}

read_file(process.argv[2], filter_chars);
