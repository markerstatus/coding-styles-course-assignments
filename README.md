# Coding Styles — Exercise 1 (Style #1: “Good old times”)

Word-frequency counter constrained like early-1950s programming:

- Primary memory ≤ **1024 cells**, addressed by number (`data[0]`, `data[1]`, …)
- Word counts live in **secondary memory** (a file), not a big in-memory map
- Stop words come from `../stop_words.txt` (parent folder; ≤ ~556 characters)
- Each book line is assumed &lt; 80 characters

## Quick start

1. Install [Node.js](https://nodejs.org/) v18 or newer.
2. Open a terminal in **this repo folder**.
3. Run:

```bash
node exercise1_final_version.js "working folder/test Pride and Prejudice text.txt"
```

Full book (slow — Style #1 intentionally rescans the frequency file for every word):

```bash
node exercise1_final_version.js "working folder/pride-and-prejudice.txt"
```

<details>
<summary><strong>Requirements</strong></summary>

- Node.js v18 or newer
- `../stop_words.txt` in the parent directory of this repo
- Book text path passed as the first CLI argument

</details>
