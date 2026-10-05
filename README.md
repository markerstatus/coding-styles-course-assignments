# Coding Styles — Exercise 1

Counts word frequency in one or more text files. Common stop words (like `the`, `and`, `of`) are skipped.

## Quick start

1. Install [Node.js](https://nodejs.org/) v18 or newer.
2. Open a terminal in this folder.
3. Run:

```bash
node "exercise 1.js" "test Pride and Prejudice text.txt"
```

<details>
<summary><strong>More run examples</strong></summary>

Full book:

```bash
node "exercise 1.js" "pride-and-prejudice.txt"
```

Multiple files at once:

```bash
node "exercise 1.js" "test Pride and Prejudice text.txt" "pride-and-prejudice.txt"
```

Any file path:

```bash
node "exercise 1.js" "path/to/book.txt"
```

</details>

<details>
<summary><strong>Requirements</strong></summary>

- [Node.js](https://nodejs.org/) v18 or newer
- A `package.json` with `"type": "module"` (already included in this repo)

</details>

<details>
<summary><strong>How it works</strong></summary>

1. Reads each file path passed after the script name (`process.argv`).
2. Splits the text into words with `Intl.Segmenter` (`granularity: 'word'`).
3. Keeps only word-like segments, lowercases them, and drops stop words.
4. Builds a frequency map (`word → count`) and prints it.

</details>

<details>
<summary><strong>Output</strong></summary>

For each input file, the program prints:

```text
Frequency map: { word1: count1, word2: count2, ... }
```

</details>

<details>
<summary><strong>Project files</strong></summary>

| File | Purpose |
|------|---------|
| `exercise 1.js` | Main word-frequency script |
| `package.json` | Enables ES module `import` syntax |
| `test Pride and Prejudice text.txt` | Small sample text for quick runs |
| `pride-and-prejudice.txt` | Full book text |
| `stop_words exercise1.txt` | Stop-word list reference (script currently uses the list hardcoded in `exercise 1.js`) |

</details>
