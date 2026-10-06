import fs from 'fs';

// Style #1 — only a few globals: data, f, word_freqs (+ touchopen)
// No helper namespaces / objects-with-methods.

function touchopen(filename) {
  try {
    fs.unlinkSync(filename);
  } catch {
    // ignore
  }
  fs.writeFileSync(filename, '');
  return { fd: fs.openSync(filename, 'r+'), pos: 0 };
}

// ≤1024 cells. Stop words ≤556 chars; each line <80 chars.

let data = [];
let f = null;
let word_freqs = null;

// data[0] = stop words
f = fs.openSync('../stop_words.txt', 'r');
data[0] = Buffer.alloc(1024);
data[1] = fs.readSync(f, data[0], 0, 1024, 0);
data[0] = data[0].toString('utf8', 0, data[1]).split(',');
fs.closeSync(f);

data[1] = ''; // line
data[2] = null; // word start
data[3] = 0; // char index
data[4] = false; // found?
data[5] = ''; // word
data[6] = ''; // file record / scratch
data[7] = 0; // frequency / scratch

word_freqs = touchopen('word_freqs');
f = { fd: fs.openSync(process.argv[2], 'r'), pos: 0 };

// ---------- Part 1 ----------
while (true) {
  // read one line -> data[1]
  data[6] = Buffer.alloc(0);
  data[7] = Buffer.alloc(1);
  while (true) {
    data[4] = fs.readSync(f.fd, data[7], 0, 1, f.pos);
    if (data[4] === 0) break;
    f.pos += 1;
    data[6] = Buffer.concat([data[6], data[7]]);
    if (data[7][0] === 10) break;
  }
  if (data[6].length === 0) break;
  data[1] = data[6].toString('utf8');
  if (data[1][data[1].length - 1] !== '\n') data[1] += '\n';

  data[2] = null;
  data[3] = 0;

  while (data[3] < data[1].length) {
    data[6] = data[1][data[3]];
    if (data[2] === null) {
      if (/[a-zA-Z0-9]/.test(data[6])) data[2] = data[3];
    } else if (!/[a-zA-Z0-9]/.test(data[6])) {
      data[4] = false;
      data[5] = data[1].slice(data[2], data[3]).toLowerCase();

      if (data[5].length >= 2 && data[0].indexOf(data[5]) < 0) {
        while (true) {
          data[6] = Buffer.alloc(0);
          data[7] = Buffer.alloc(1);
          while (true) {
            data[8] = fs.readSync(
              word_freqs.fd,
              data[7],
              0,
              1,
              word_freqs.pos,
            );
            if (data[8] === 0) break;
            word_freqs.pos += 1;
            data[6] = Buffer.concat([data[6], data[7]]);
            if (data[7][0] === 10) break;
          }
          data[6] =
            data[6].length === 0 ? '' : data[6].toString('utf8').trim();
          if (data[6] === '') break;

          data[7] = parseInt(data[6].split(',')[1], 10);
          data[6] = data[6].split(',')[0].trim();
          if (data[5] === data[6]) {
            data[7] += 1;
            data[4] = true;
            break;
          }
        }

        data[6] = Buffer.from(
          data[5].padStart(20, ' ') +
            ',' +
            String(data[4] ? data[7] : 1).padStart(4, '0') +
            '\n',
          'utf8',
        );
        if (!data[4]) {
          fs.writeSync(
            word_freqs.fd,
            data[6],
            0,
            data[6].length,
            word_freqs.pos,
          );
          word_freqs.pos += data[6].length;
        } else {
          word_freqs.pos -= 26;
          fs.writeSync(
            word_freqs.fd,
            data[6],
            0,
            data[6].length,
            word_freqs.pos,
          );
          word_freqs.pos += data[6].length;
        }
        word_freqs.pos = 0;
      }
      data[2] = null;
    }
    data[3] += 1;
  }
}

fs.closeSync(f.fd);
fs.fsyncSync(word_freqs.fd);

// ---------- Part 2 ----------
data.length = 0;
while (data.length < 25) data.push([]);
data.push(''); // data[25] word
data.push(0); // data[26] freq

word_freqs.pos = 0;
while (true) {
  data[25] = '';
  while (true) {
    data[26] = Buffer.alloc(1);
    if (fs.readSync(word_freqs.fd, data[26], 0, 1, word_freqs.pos) === 0) {
      break;
    }
    word_freqs.pos += 1;
    data[25] += String.fromCharCode(data[26][0]);
    if (data[26][0] === 10) break;
  }
  data[25] = data[25].trim();
  if (data[25] === '') break;

  data[26] = parseInt(data[25].split(',')[1], 10);
  data[25] = data[25].split(',')[0].trim();

  for (let i = 0; i < 25; i++) {
    // elimination of symbol i is exercise
    if (data[i].length === 0 || data[i][1] < data[26]) {
      data.splice(i, 0, [data[25], data[26]]);
      data.splice(26, 1);
      break;
    }
  }
}

for (let tf = 0; tf < 25; tf++) {
  // elimination of symbol tf is exercise
  if (data[tf].length === 2) {
    console.log(data[tf][0], '-', data[tf][1]);
  }
}

fs.closeSync(word_freqs.fd);
