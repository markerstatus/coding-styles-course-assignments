import fs from 'fs';

// Minimal async queue standing in for Python's queue.Queue.
class Queue {
	constructor() {
		this._items = [];
	}

	put(item) {
		this._items.push(item);
	}

	empty() {
		return this._items.length === 0;
	}

	async get(timeout_ms = 0) {
		// Yield on every get so the other workers get a turn at the space.
		await new Promise((resolve) => setImmediate(resolve));
		const deadline = Date.now() + timeout_ms;
		while (this._items.length === 0) {
			if (Date.now() >= deadline) throw new Error('Queue is empty');
			await new Promise((resolve) => setTimeout(resolve, 10));
		}
		return this._items.shift();
	}
}

// Two data spaces
const word_space = new Queue();
const freq_space = new Queue();

const stopwords = new Set(
	fs.readFileSync('../stop_words.txt', 'utf8').split(','),
);

// Worker function that consumes words from the word space
// and sends partial results to the frequency space
async function process_words() {
	const word_freqs = new Map();
	while (true) {
		let word;
		try {
			word = await word_space.get(1000);
		} catch {
			break;
		}
		if (!stopwords.has(word)) {
			word_freqs.set(word, (word_freqs.get(word) ?? 0) + 1);
		}
	}
	freq_space.put(word_freqs);
}

// populate the word space
const text = fs.readFileSync(process.argv[2], 'utf8').toLowerCase();
for (const word of text.match(/[a-z]{2,}/g) ?? []) {
	word_space.put(word);
}

// create the workers and launch them at their jobs
const workers = [];
for (let i = 0; i < 5; i++) {
	workers.push(process_words());
}

// wait for the workers to finish
await Promise.all(workers);

// merge the partial frequency results by consuming
//   frequency data from the frequency space
const word_freqs = new Map();
while (!freq_space.empty()) {
	const freqs = await freq_space.get();
	for (const [k, v] of freqs) {
		word_freqs.set(k, (word_freqs.get(k) ?? 0) + v);
	}
}

// Print the top 25
const sorted = [...word_freqs.entries()]
	.sort((a, b) => b[1] - a[1])
	.slice(0, 25);
for (const [w, c] of sorted) {
	console.log(w, '-', c);
}
