import fs from 'fs';

//
// Functions for map reduce
//
function* partition(data_str, nlines) {
	// Partitions the input data_str (a big string) into chunks of nlines.
	const lines = data_str.split('\n');
	for (let i = 0; i < lines.length; i += nlines) {
		yield lines.slice(i, i + nlines).join('\n');
	}
}

function split_words(data_str) {
	// Takes a string, returns a list of pairs [word, 1],
	// one for each word in the input.
	function _scan(str_data) {
		return str_data
			.replace(/[\W_]+/g, ' ')
			.toLowerCase()
			.split(' ')
			.filter((w) => w.length > 0);
	}

	function _remove_stop_words(word_list) {
		const stop_words = fs.readFileSync('../stop_words.txt', 'utf8').split(',');
		stop_words.push(...'abcdefghijklmnopqrstuvwxyz');
		return word_list.filter((w) => !stop_words.includes(w));
	}

	// The actual work of the mapper
	return _remove_stop_words(_scan(data_str)).map((w) => [w, 1]);
}

function regroup(pairs_list) {
	// Takes a list of lists of [word, 1] pairs and returns a map
	// from each unique word to the list of its pairs.
	const mapping = new Map();
	for (const pairs of pairs_list) {
		for (const p of pairs) {
			if (mapping.has(p[0])) mapping.get(p[0]).push(p);
			else mapping.set(p[0], [p]);
		}
	}
	return mapping;
}

function count_words([word, pairs]) {
	// Takes [word, [[word, 1], [word, 1], ...]] and returns [word, frequency],
	// where frequency is the sum of all the reported occurrences.
	const add = (x, y) => x + y;
	return [word, pairs.map((pair) => pair[1]).reduce(add)];
}

//
// Auxiliary functions
//
function read_file(path_to_file) {
	return fs.readFileSync(path_to_file, 'utf8');
}

function sort(word_freq) {
	return word_freq.sort((a, b) => b[1] - a[1]);
}

//
// The main function
//
// Map: split each 200-line chunk into [word, 1] pairs
const splits = [...partition(read_file(process.argv[2]), 200)].map(split_words);
// Shuffle: group the pairs by word
const splits_per_word = regroup(splits);
// Reduce: sum each word's pairs, then sort by frequency
const word_freqs = sort([...splits_per_word.entries()].map(count_words));

for (const [w, c] of word_freqs.slice(0, 25)) {
	console.log(w, '-', c);
}
