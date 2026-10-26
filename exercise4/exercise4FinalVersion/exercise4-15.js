import fs from 'fs';

class WordFrequencyFramework {
	constructor() {
		this._load_event_handlers = [];
		this._dowork_event_handlers = [];
		this._end_event_handlers = [];
	}

	register_for_load_event(handler) {
		this._load_event_handlers.push(handler);
	}

	register_for_dowork_event(handler) {
		this._dowork_event_handlers.push(handler);
	}

	register_for_end_event(handler) {
		this._end_event_handlers.push(handler);
	}

	run(path_to_file) {
		for (const h of this._load_event_handlers) h(path_to_file);
		for (const h of this._dowork_event_handlers) h();
		for (const h of this._end_event_handlers) h();
	}
}

class DataStorage {
	constructor(wfapp, stop_word_filter) {
		this._data = '';
		this._stop_word_filter = stop_word_filter;
		this._word_event_handlers = [];
		wfapp.register_for_load_event((path_to_file) => this._load(path_to_file));
		wfapp.register_for_dowork_event(() => this._produce_words());
	}

	_load(path_to_file) {
		this._data = fs.readFileSync(path_to_file, 'utf8');
		this._data = this._data.replace(/[^\p{L}\p{N}]+/gu, ' ').toLowerCase();
	}

	_produce_words() {
		for (const w of this._data.match(/[^\s]+/g) ?? []) {
			if (!this._stop_word_filter.is_stop_word(w)) {
				for (const h of this._word_event_handlers) h(w);
			}
		}
	}

	register_for_word_event(handler) {
		this._word_event_handlers.push(handler);
	}
}

class StopWordFilter {
	constructor(wfapp) {
		this._stop_words = [];
		wfapp.register_for_load_event(() => this._load());
	}

	_load() {
		this._stop_words = fs.readFileSync('../stop_words.txt', 'utf8').split(',');
		this._stop_words.push(...'abcdefghijklmnopqrstuvwxyz');
	}

	is_stop_word(word) {
		return this._stop_words.includes(word);
	}
}

class WordFrequencyCounter {
	constructor(wfapp, data_storage) {
		this._word_freqs = Object.create(null);
		data_storage.register_for_word_event((word) => this._increment_count(word));
		wfapp.register_for_end_event(() => this._print_freqs());
	}

	_increment_count(word) {
		if (word in this._word_freqs) this._word_freqs[word] += 1;
		else this._word_freqs[word] = 1;
	}

	_print_freqs() {
		const word_freqs = Object.entries(this._word_freqs).sort(
			(a, b) => b[1] - a[1],
		);
		for (const [w, c] of word_freqs.slice(0, 25)) {
			console.log(w, '-', c);
		}
	}
}

const wfapp = new WordFrequencyFramework();
const stop_word_filter = new StopWordFilter(wfapp);
const data_storage = new DataStorage(wfapp, stop_word_filter);
new WordFrequencyCounter(wfapp, data_storage);
wfapp.run(process.argv[2]);
