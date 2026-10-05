import fs from 'fs';

const STOP_WORDS = [
  'a', 'able', 'about', 'across', 'after', 'all', 'almost', 'also', 'am',
  'among', 'an', 'and', 'any', 'are', 'as', 'at', 'be', 'because', 'been',
  'but', 'by', 'can', 'cannot', 'could', 'dear', 'did', 'do', 'does',
  'either', 'else', 'ever', 'every', 'for', 'from', 'get', 'got', 'had',
  'has', 'have', 'he', 'her', 'hers', 'him', 'his', 'how', 'however', 'i',
  'if', 'in', 'into', 'is', 'it', 'its', 'just', 'least', 'let', 'like',
  'likely', 'may', 'me', 'might', 'most', 'must', 'my', 'neither', 'no',
  'nor', 'not', 'of', 'off', 'often', 'on', 'only', 'or', 'other', 'our',
  'own', 'rather', 'said', 'say', 'says', 'she', 'should', 'since', 'so',
  'some', 'than', 'that', 'the', 'their', 'them', 'then', 'there', 'these',
  'they', 'this', 'tis', 'to', 'too', 'twas', 'us', 'wants', 'was', 'we',
  'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why',
  'will', 'with', 'would', 'yet', 'you', 'your',
];

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
      if (STOP_WORDS.includes(normalizedWord)) {
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
