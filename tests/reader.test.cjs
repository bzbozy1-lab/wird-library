'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const code=fs.readFileSync('reader.js','utf8');
class Element {
  constructor(){this.style={};this.dataset={};this.hidden=true;this.children=[];this.attributes={};this.classList={toggle(){}};this.clientWidth=390;this.clientHeight=600;this.value='';}
  setAttribute(k,v){this.attributes[k]=v;}
  hasAttribute(){return false;}
  addEventListener(){}
  contains(){return false;}
  focus(){}
  querySelector(){return this.children[0]||new Element();}
  querySelectorAll(){return this.children;}
  getBoundingClientRect(){return {left:0,top:0,width:350,height:490};}
  cloneNode(){return new Element();}
  appendChild(child){this.children.push(child);return child;}
  replaceChildren(...nodes){this.children=nodes;}
  remove(){}
}
function environment(query='') {
  const elements=new Map();
  const find=s=>{if(!elements.has(s))elements.set(s,new Element());return elements.get(s)};
  find('#spread').children=[new Element()];
  const timers=new Map(),images=[];let counter=0;
  class Image extends Element {
    constructor(){super();images.push(this);this.naturalWidth=1715;this.naturalHeight=2400;}
    cloneNode(){return this;}
    decode(){return Promise.resolve();}
  }
  const context={window:{WIRD_BOOKS:[{id:'test',title:'Test',author:'Author',pages:27,file:'book.pdf',cover:'cover.webp',pageImages:{base:'pages/',width:1715,height:2400}}],innerWidth:390,matchMedia:()=>({matches:false}),addEventListener(){}},document:{querySelector:find,querySelectorAll:()=>[],createElement:()=>new Element(),addEventListener(){},fullscreenEnabled:false},Image,Map,URLSearchParams,location:{search:query},localStorage:{getItem(){return null},setItem(){}},setTimeout(fn,ms){timers.set(++counter,{fn,ms});return counter},clearTimeout(id){timers.delete(id)},console};
  vm.runInNewContext(code,context);
  return {find,timers,images,context};
}
const tick=()=>new Promise(resolve=>setImmediate(resolve));
(async()=>{
  const success=environment();
  success.images[0].onload();await tick();
  assert.match(success.find('#reader-status').textContent,/الصفحة 1 من 27/);
  assert.equal(success.find('#page-scroll').attributes['aria-busy'],'false');
  assert.equal(success.find('#spread').children.length,1);
  const racing=environment();racing.images[0].onload();await tick();
  racing.find('#next').onclick();racing.find('#next').onclick();
  const third=racing.images.find(image=>image.src==='pages/03.webp');third.onload();await tick();
  const second=racing.images.find(image=>image.src==='pages/02.webp');second.onload();await tick();
  assert.match(racing.find('#reader-status').textContent,/الصفحة 3 من 27/,'Late page response must not overwrite latest navigation');
  await success.find('#fullscreen').onclick();await tick();
  assert.equal(success.find('#fullscreen').attributes['aria-label'],'إنهاء وضع التركيز');
  assert.equal(success.find('#fullscreen').attributes['aria-pressed'],'true');
  await success.find('#fullscreen').onclick();await tick();
  assert.equal(success.find('#fullscreen').attributes['aria-pressed'],'false');
  const error=environment();error.images[0].onerror();await tick();
  assert.equal(error.find('#reader-error').hidden,false);
  assert.match(error.find('#reader-status').textContent,/تعذّر/);
  error.find('#retry').onclick();
  const retried=error.images[error.images.length-1];assert.match(retried.src,/retry=/);
  retried.onload();await tick();
  assert.equal(error.find('#reader-error').hidden,true);
  assert.match(error.find('#reader-status').textContent,/الصفحة 1 من 27/);
  const timeout=environment();
  [...timeout.timers.values()].filter(t=>t.ms===12000).forEach(t=>t.fn());await tick();
  assert.equal(timeout.find('#reader-error').hidden,false);
  assert.equal(timeout.find('#page-scroll').attributes['aria-busy'],'false');
  const unknown=environment('?id=missing');assert.equal(unknown.images.length,0);
  assert.match(unknown.find('#reader-status').textContent,/غير متاح/);
  assert.equal(unknown.find('#next').disabled,true);
  console.log('Reader integration: initial render, failed network, retry recovery, 12-second timeout, unknown-book handling, stale-response protection, and fullscreen fallback passed.');
})().catch(err=>{console.error(err);process.exitCode=1});
