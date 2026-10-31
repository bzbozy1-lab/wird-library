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
function environment(query='',width=390,screenBase) {
  const elements=new Map();
  const find=s=>{if(!elements.has(s))elements.set(s,new Element());return elements.get(s)};
  find('#spread').children=[new Element()];
  const timers=new Map(),images=[],events={};let counter=0;
  class Image extends Element {
    constructor(){super();images.push(this);this.naturalWidth=1715;this.naturalHeight=2400;}
    cloneNode(){return this;}
    decode(){return Promise.resolve();}
  }
  const context={window:{WIRD_BOOKS:[{id:'test',title:'Test',author:'Author',pages:27,file:'book.pdf',cover:'cover.webp',pageImages:{base:'pages/',screenBase,width:1715,height:2400}}],innerWidth:width,matchMedia:()=>({matches:false}),addEventListener(name,fn){events[name]=fn}},document:{querySelector:find,querySelectorAll:()=>[],createElement:()=>new Element(),addEventListener(){},fullscreenEnabled:false},Image,Map,URLSearchParams,location:{search:query},localStorage:{getItem(){return null},setItem(){}},setTimeout(fn,ms){timers.set(++counter,{fn,ms});return counter},clearTimeout(id){timers.delete(id)},console};
  vm.runInNewContext(code,context);
  return {find,timers,images,context,events};
}
const tick=()=>new Promise(resolve=>setImmediate(resolve));
(async()=>{
  const success=environment();
  success.images[0].onload();await tick();
  assert.match(success.find('#reader-status').textContent,/الصفحة 1 من 27/);
  assert.equal(success.find('#page-scroll').attributes['aria-busy'],'false');
  assert.equal(success.find('#spread').children.length,1);
  const paperBeforeResize=success.find('#spread').children[0];
  success.events.resize();[...success.timers.values()].filter(t=>t.ms===120).forEach(t=>t.fn());await tick();
  assert.equal(success.find('#spread').children[0],paperBeforeResize,'Unchanged resize should not rebuild pages');
  success.find('#page-scroll').clientWidth=420;
  success.events.resize();[...success.timers.values()].filter(t=>t.ms===120).forEach(t=>t.fn());await tick();
  assert.notEqual(success.find('#spread').children[0],paperBeforeResize,'Actual resize should update paper layout');
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
  const desktop=environment('',1353,'screen/');desktop.images[0].onload();await tick();
  assert(desktop.images.find(image=>image.src==='screen/02.webp'),'Prefetch first page of next spread');
  assert(desktop.images.find(image=>image.src==='screen/03.webp'),'Prefetch second page of next spread');
  desktop.images.find(image=>image.src==='screen/02.webp').onload();
  desktop.images.find(image=>image.src==='screen/03.webp').onload();await tick();
  desktop.find('#next').onclick();await tick();
  assert.equal(desktop.find('#spread').dataset.cacheHit,'true','Next spread must already be decoded');
  assert(desktop.images.find(image=>image.src==='screen/04.webp'));
  assert(desktop.images.find(image=>image.src==='screen/05.webp'));
  assert(!desktop.images.some(image=>image.src.startsWith('pages/')),'Normal reading must not download HD pages');
  desktop.find('#zoom-in').onclick();await tick();
  const detail=desktop.images.find(image=>image.src==='pages/02.webp');assert(detail,'Zoom should request HD');
  detail.onerror();await tick();
  assert.match(desktop.find('#reader-status').textContent,/الصفحتان 2 و3/,'HD failure keeps readable page');
  assert.equal(desktop.find('#reader-error').hidden,true);
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
  console.log('Reader integration: initial render, failed network, retry recovery, 12-second timeout, unknown-book handling, stale-response protection, fullscreen fallback, complete-spread prefetch, cache hits, progressive HD, and resize coalescing passed.');
})().catch(err=>{console.error(err);process.exitCode=1});
