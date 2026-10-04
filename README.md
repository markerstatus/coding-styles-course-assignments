# Coding Styles — Exercise 1

Counts word frequency in one or more text files (stop words are skipped).

## Requirements

- [Node.js](https://nodejs.org/) (v18 or newer recommended)

This project uses ES module `import` syntax. Create a `package.json` in this folder (if you do not already have one) with:

```json
{
  "type": "module"
}
```

## How to run

From this folder in a terminal:

```bash
node "exercise 1.js" "path/to/book.txt"
```

### Examples

Small test file:

```bash
node "exercise 1.js" "test Pride and Prejudice text.txt"
```

Full book:

```bash
node "exercise 1.js" "pride-and-prejudice.txt"
```

Multiple files at once:

```bash
node "exercise 1.js" "test Pride and Prejudice text.txt" "pride-and-prejudice.txt"
```

## Output

For each file path you pass after the script name, the program prints a word-frequency object (word → count). Stop words listed in the script (common words like `the`, `and`, `of`) are excluded.
