'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const crypto = require('node:crypto');
const context = {window:{}};
vm.runInNewContext(fs.readFileSync('catalog.js','utf8'),context);
for (const book of context.window.WIRD_BOOKS) {
  assert(fs.statSync(book.file).size > 0, 'PDF missing');
  assert(fs.statSync(book.cover).size > 0, 'Cover missing');
  for (let number=1;number<=book.pages;number++) {
    const file=path.join(book.pageImages.base,String(number).padStart(2,'0')+'.webp');
    const bytes=fs.readFileSync(file);
    assert.equal(bytes.toString('ascii',0,4),'RIFF',file);
    assert.equal(bytes.toString('ascii',8,12),'WEBP',file);
    assert(bytes.length > 1000,file+' is empty or truncated');
  }
}
assert.equal(crypto.createHash('sha256').update(fs.readFileSync('books/rawdat-al-uns.pdf')).digest('hex'),'9aec4a8dab713419e059466ec8ccb6229ea73fb14d53ed133b655c1da232b582');
for(const file of fs.readdirSync('.').filter(f=>f.endsWith('.html'))) {
  const html=fs.readFileSync(file,'utf8');
  for(const m of html.matchAll(/(?:src|href)="([^"#]+)"/g)) {
    if (/^(?:https?:|data:)/.test(m[1]))continue;
    const resource=m[1].split(/[?#]/)[0];
    assert(fs.statSync(resource).isFile(),file+' -> '+resource);
  }
}
console.log('Validated all 27 prepared pages, original PDF checksum, and HTML assets/navigation.');
