## Quick start

1. Install [Node.js](https://nodejs.org/) v18 or newer.
2. Put `../stop_words.txt` in the parent directory of this repo
3. Copy paste package.json file into the same dir.

```bash
node exercise1.js book.txt
```

For package.json put these code in so node interpreter know it is es6 not common js
{
"name": "exercise1",
"version": "1.0.0",
"private": true,
"type": "module"
}
