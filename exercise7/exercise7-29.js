import fs from 'fs';

// Async mailbox: get() waits until a message is put().
class EventQueue {
	constructor() {
		this._items = [];
		this._waiters = [];
	}

	put(item) {
		if (this._waiters.length > 0) this._waiters.shift()(item);
		else this._items.push(item);
	}

	get() {
		if (this._items.length > 0) return Promise.resolve(this._items.shift());
		return new Promise((resolve) => this._waiters.push(resolve));
	}
}

// Base actor: owns a queue and processes its messages one at a time
// until it receives 'die'.
class ActiveWFObject {
	constructor() {
		this.name = this.constructor.name;
		this.queue = new EventQueue();
		this._stopMe = false;
		this.done = this.run();
	}

	async run() {
		while (!this._stopMe) {
			const message = await this.queue.get();
			this._dispatch(message);
			if (message[0] === 'die') this._stopMe = true;
		}
	}
}

// Messages are arrays: [tag, ...args].
function send(receiver, message) {
	receiver.queue.put(message);
}

// Reads and normalizes the input file, then streams its words
// to the stop word manager.
class DataStorageManager extends ActiveWFObject {
	_data = '';

	_dispatch(message) {
		if (message[0] === 'init') this._init(message.slice(1));
		else if (message[0] === 'send_word_freqs')
			this._process_words(message.slice(1));
		else send(this._stop_word_manager, message);
	}

	_init(message) {
		const path_to_file = message[0];
		this._stop_word_manager = message[1];
		this._data = fs.readFileSync(path_to_file, 'utf8');
		this._data = this._data.replace(/[\W_]+/g, ' ').toLowerCase();
	}

	_process_words(message) {
		const recipient = message[0];
		const words = this._data.split(/\s+/).filter((w) => w.length > 0);
		for (const w of words) send(this._stop_word_manager, ['filter', w]);
		send(this._stop_word_manager, ['top25', recipient]);
	}
}

// Drops stop words and forwards the rest to the word frequency manager.
class StopWordManager extends ActiveWFObject {
	_stop_words = [];

	_dispatch(message) {
		if (message[0] === 'init') this._init(message.slice(1));
		else if (message[0] === 'filter') this._filter(message.slice(1));
		else send(this._word_freqs_manager, message);
	}

	_init(message) {
		this._stop_words = fs.readFileSync('../stop_words.txt', 'utf8').split(',');
		this._stop_words.push(...'abcdefghijklmnopqrstuvwxyz');
		this._word_freqs_manager = message[0];
	}

	_filter(message) {
		const word = message[0];
		if (!this._stop_words.includes(word)) {
			send(this._word_freqs_manager, ['word', word]);
		}
	}
}

// Counts words and replies with the sorted frequencies.
class WordFrequencyManager extends ActiveWFObject {
	_word_freqs = new Map();

	_dispatch(message) {
		if (message[0] === 'word') this._increment_count(message.slice(1));
		else if (message[0] === 'top25') this._top25(message.slice(1));
	}

	_increment_count(message) {
		const word = message[0];
		this._word_freqs.set(word, (this._word_freqs.get(word) ?? 0) + 1);
	}

	_top25(message) {
		const recipient = message[0];
		const freqs_sorted = [...this._word_freqs.entries()].sort(
			(a, b) => b[1] - a[1],
		);
		send(recipient, ['top25', freqs_sorted]);
	}
}

// Kicks off the pipeline, prints the top 25, then shuts everything down.
class WordFrequencyController extends ActiveWFObject {
	_dispatch(message) {
		if (message[0] === 'run') this._run(message.slice(1));
		else if (message[0] === 'top25') this._display(message.slice(1));
		else throw new Error('Message not understood ' + message[0]);
	}

	_run(message) {
		this._storage_manager = message[0];
		send(this._storage_manager, ['send_word_freqs', this]);
	}

	_display(message) {
		const word_freqs = message[0];
		for (const [w, f] of word_freqs.slice(0, 25)) console.log(w, '-', f);
		send(this._storage_manager, ['die']);
		this._stopMe = true;
	}
}

// Wire up the actors.
const word_freq_manager = new WordFrequencyManager();

const stop_word_manager = new StopWordManager();
send(stop_word_manager, ['init', word_freq_manager]);

const storage_manager = new DataStorageManager();
send(storage_manager, ['init', process.argv[2], stop_word_manager]);

const wfcontroller = new WordFrequencyController();
send(wfcontroller, ['run', storage_manager]);

// Wait for every actor to finish.
await Promise.all(
	[word_freq_manager, stop_word_manager, storage_manager, wfcontroller].map(
		(t) => t.done,
	),
);
