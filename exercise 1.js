import fs from 'fs';
const STOP_WORDS = ['a','able','about','across','after','all','almost','also','am','among','an','and','any','are','as','at','be','because','been','but','by','can','cannot','could','dear','did','do','does','either','else','ever','every','for','from','get','got','had','has','have','he','her','hers','him','his','how','however','i','if','in','into','is','it','its','just','least','let','like','likely','may','me','might','most','must','my','neither','no','nor','not','of','off','often','on','only','or','other','our','own','rather','said','say','says','she','should','since','so','some','than','that','the','their','them','then','there','these','they','this','tis','to','too','twas','us','wants','was','we','were','what','when','where','which','while','who','whom','why','will','with','would','yet','you','your']
const SPLIT_CHARS = [',', '.', '!', '?', ' ', '\n', '\r', '\t', '\b', '\f', '\v', '\u0000', '\u0001', '\u0002', '\u0003', '\u0004', '\u0005', '\u0006', '\u0007', '\u0008', '\u0009', '\u000A', '\u000B', '\u000C', '\u000D', '\u000E', '\u000F', '\u0010', '\u0011', '\u0012', '\u0013', '\u0014', '\u0015', '\u0016', '\u0017', '\u0018', '\u0019', '\u001A', '\u001B', '\u001C', '\u001D', '\u001E', '\u001F']

process.argv.forEach(function(val, index, array) {
    // skip ind 0 and 1 
    //     cuz 0 is node. and 1 is this file
    if (index >= 2) {
        const result = getWordsFrequency(val);
        console.log(result);
    }
});

function getWordsFrequency(bookName) {
    const bookContent = fs.readFileSync(bookName, 'utf8');
    const normalizedWords = prepWordsFromContent(bookContent);

    return normalizedWords;
}

function prepWordsFromContent(bookContent, splitChars = SPLIT_CHARS) {
    const words = bookContent.split(new RegExp(`[${splitChars.join('')}]+`));
    console.log(words)
    const normalizedWords = words.reduce((acc, word) => {
        if (STOP_WORDS.includes(word.toLowerCase().trim())) {
            return acc;
        }
        if (!acc[word.toLowerCase().trim()]) {
            acc[word.toLowerCase().trim()] = 0;
        }
        acc[word.toLowerCase().trim()]++;
        return acc;
    }, {});
    return normalizedWords;
}

