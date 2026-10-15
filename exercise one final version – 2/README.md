# Exercise 1 final version 2

JavaScript copy of Style #1 (`working folder/tf-01.py`): numbered `data[]` cells, counts in a `word_freqs` file, top 25 printed as `word - count`.

## How to run

Use Node.js v18 or newer.

Open a terminal in **this folder** (`exercise one final version – 2`). `package.json` has to sit next to the program so Node treats the file as an ES module.

`package.json`:

```json
{
  "name": "exercise-one-final-version-2",
  "version": "1.0.0",
  "private": true,
  "type": "module"
}
```

`tf-01.py` opens `../stop_words.txt` relative to the current directory (that path is the repo root when Python is started inside `working folder`). This repo does not have that file. From this folder the program reads the stop-word list that is in the repo:

`../exercise2/stop_words.txt`

The book path is the first argument (`process.argv[2]`, same role as Python's `sys.argv[1]`). Counts are written to `word_freqs` in this folder.

Sample (short Pride and Prejudice portion):

```bash
node "exercise one final version – two.js" "../working folder/test Pride and Prejudice text.txt"
```

Full book:

```bash
node "exercise one final version – two.js" "../working folder/pride-and-prejudice.txt"
```

The full book is slow on purpose: every kept word rescans `word_freqs`.
