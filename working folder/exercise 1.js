import fs from 'fs';

const STOP_WORDS = new Set(
  fs
    .readFileSync('../stop_words.txt', 'utf8')
    .split(',')
    .map((w) => w.trim())
    .filter(Boolean),
);

console.log(STOP_WORDS);

process.argv.forEach(function (val, index, array) {
  // skip ind 0 and 1
  //     cuz 0 is node. and 1 is this file
  if (index >= 2) {
    const result = getWordsFrequency(val);
    console.log('Frequency map:', result);
  }
});

function getWordsFrequency(bookName) {
  const bookContent = fs.readFileSync(bookName, 'utf8');
  return prepWordsFromContent(bookContent);
}

function prepWordsFromContent(bookContent) {
  const segmenter = new Intl.Segmenter('en', { granularity: 'word' });
  const frequencyMap = {};

  // processing each word
  for (const item of segmenter.segment(bookContent)) {
    if (item.isWordLike) {
      // normalize the word
      const normalizedWord = item.segment.toLowerCase().trim();
      if (STOP_WORDS.has(normalizedWord)) {
        // skip stop words
        continue;
      }
      // add to the frequency map
      if (!frequencyMap[normalizedWord]) {
        frequencyMap[normalizedWord] = 0;
      }
      frequencyMap[normalizedWord]++;
    }
  }

  return frequencyMap;
}
