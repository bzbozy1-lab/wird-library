/* Prepared original PDF pages: no module/worker or full-PDF download on reader entry. */
(function () {
  'use strict';
  window.wirdReaderStarted = true;
  var $ = function (s) { return document.querySelector(s); };
  var storage = {
    get: function (key) { try { return localStorage.getItem(key); } catch (_) { return null; } },
    set: function (key, value) { try { localStorage.setItem(key, String(value)); } catch (_) {} }
  };
  var requested = new URLSearchParams(location.search).get('id');
  var books = window.WIRD_BOOKS || [];
  var book = books.find(function (b) { return b.id === requested; }) || (!requested ? books[0] : null);
  var status = $('#reader-status'), error = $('#reader-error'), stage = $('#page-scroll'), spread = $('#spread');
  var errorText = $('#reader-error-text');
  function say(text) { status.textContent = text; }
  if (!book || !book.pageImages) {
    say('هذا الكتاب غير متاح في القارئ حاليًا');
    error.hidden = false;
    errorText.textContent = 'عُد إلى المكتبة لاختيار كتاب، أو افتح ملف PDF الأصلي.';
    $('#prev').disabled = true; $('#next').disabled = true;
    return;
  }
  var total = book.pages, key = 'wird-progress-' + book.id;
  function clamp(n) { return Math.max(1, Math.min(total, Math.floor(Number(n) || 1))); }
  var current = clamp(storage.get(key)), wanted = current, zoom = 1, generation = 0;
  var mode = storage.get('wird-spread') || 'auto';
  if (['auto', 'single', 'double'].indexOf(mode) < 0) mode = 'auto';
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  var motion = storage.get('wird-motion') !== 'off';
  var cache = new Map(), activeLeaf = null, leafTimer, resizeTimer, focusMode = false;
  document.title = 'قراءة ' + book.title + ' | وِرد';
  $('#reader-app h1').textContent = book.title;
  $('.reader-header p').textContent = book.author;
  $('.reader-back').href = 'book.html?id=' + encodeURIComponent(book.id);
  $('#page-number').max = total;
  document.querySelectorAll('[data-book-file]').forEach(function (a) {
    a.href = book.file;
    if (a.hasAttribute('download')) a.download = book.title + '.pdf';
  });
  $('.paper img').src = book.cover;
  $('#spread-mode').value = mode;
  $('#motion').checked = motion && !reduced.matches;
  function doubleMode() {
    return window.innerWidth >= 900 && mode !== 'single' && (mode === 'double' || window.innerWidth >= 1100);
  }
  function visiblePages(n) { return doubleMode() && n > 1 && n < total ? [n, n + 1] : [n]; }
  function sync() {
    var pages = visiblePages(current);
    $('#page-number').value = current;
    $('#prev').disabled = current <= 1;
    $('#next').disabled = pages[pages.length - 1] >= total;
    $('#page-total').textContent = pages.length === 2 ? '– ' + (current + 1) + ' من ' + total : 'من ' + total;
    $('#zoom-reset').textContent = Math.round(zoom * 100) + '%';
    $('#zoom-out').disabled = zoom <= .75;
    $('#zoom-in').disabled = zoom >= 2.5;
  }
  function pageURL(n) {
    return book.pageImages.base + String(n).padStart(2, '0') + '.' + (book.pageImages.extension || 'webp');
  }
  function loadPage(n, retry) {
    if (retry) cache.delete(n);
    if (cache.has(n)) return cache.get(n);
    var promise = new Promise(function (resolve, reject) {
      var image = new Image(), finished = false;
      var timer = setTimeout(function () { finish(new Error('page-timeout')); }, 12000);
      function finish(err) {
        if (finished) return;
        finished = true; clearTimeout(timer); image.onload = null; image.onerror = null;
        if (err) { cache.delete(n); reject(err); } else resolve(image);
      }
      image.decoding = 'sync';
      image.onload = function () {
        if (!image.naturalWidth) { finish(new Error('empty-page')); return; }
        if (image.decode) image.decode().then(function () { finish(); }, function () { finish(); });
        else finish();
      };
      image.onerror = function () { finish(new Error('page-unavailable')); };
      image.src = pageURL(n) + (retry ? '?retry=' + Date.now() : '');
    });
    cache.set(n, promise);
    // Keep a bounded working set; browser HTTP caching handles older pages.
    if (cache.size > 8) cache.delete(cache.keys().next().value);
    return promise;
  }
  function paperSize(count) {
    var ratio = book.pageImages.width / book.pageImages.height;
    var horizontalPadding = window.innerWidth <= 620 ? 24 : 56;
    var width = Math.min((stage.clientWidth - horizontalPadding - (count - 1) * 2) / count, (stage.clientHeight - 22) * ratio);
    return { width: Math.max(100, width * zoom), height: Math.max(100, width * zoom) / ratio };
  }
  function stopTurn() {
    clearTimeout(leafTimer);
    if (activeLeaf) { activeLeaf.remove(); activeLeaf = null; }
    spread.dataset.turnState = 'idle';
  }
  function turnLeaf(oldPaper, oldBox, nextPapers, direction) {
    if (!oldPaper || !motion || reduced.matches || zoom !== 1) return;
    var box = spread.getBoundingClientRect();
    var leaf = document.createElement('div');
    leaf.className = 'turn-leaf ' + (direction > 0 ? 'forward' : 'backward');
    leaf.setAttribute('aria-hidden', 'true');
    leaf.style.width = oldBox.width + 'px'; leaf.style.height = oldBox.height + 'px';
    leaf.style.left = (oldBox.left - box.left) + 'px'; leaf.style.top = (oldBox.top - box.top) + 'px';
    var front = document.createElement('div'), back = document.createElement('div');
    front.className = 'leaf-front'; back.className = 'leaf-back';
    var oldImage = oldPaper.querySelector('img');
    if (oldImage) front.appendChild(oldImage.cloneNode(true));
    var backPaper = direction > 0 ? nextPapers[0] : nextPapers[nextPapers.length - 1];
    back.appendChild(backPaper.querySelector('img').cloneNode(true));
    leaf.appendChild(front); leaf.appendChild(back); spread.appendChild(leaf); activeLeaf = leaf;
    leaf.addEventListener('animationstart', function (event) { if (event.target === leaf) spread.dataset.turnState = 'turning'; });
    leaf.addEventListener('animationend', function (event) {
      if (event.target !== leaf) return;
      spread.dataset.turnState = 'idle';
      spread.dataset.lastTurn = direction > 0 ? 'forward' : 'backward';
      spread.dataset.completedTurns = String(Number(spread.dataset.completedTurns || 0) + 1);
      stopTurn();
    });
    leafTimer = setTimeout(stopTurn, 800);
  }
  async function render(number, animate, retry) {
    var next = clamp(number), ticket = ++generation, list = visiblePages(next);
    stage.setAttribute('aria-busy', 'true'); error.hidden = true;
    say('جارٍ تحميل الصفحة ' + next + '…');
    try {
      var images = await Promise.all(list.map(function (n) { return loadPage(n, retry); }));
      if (ticket !== generation) return;
      var oldPapers = spread.querySelectorAll('.paper');
      var direction = next - current;
      var oldPaper = oldPapers.length ? oldPapers[direction > 0 ? oldPapers.length - 1 : 0] : null;
      var oldBox = oldPaper ? oldPaper.getBoundingClientRect() : null;
      if (oldPaper) oldPaper = oldPaper.cloneNode(true);
      var dimensions = paperSize(list.length);
      var nodes = images.map(function (source, i) {
        var paper = document.createElement('div'), image = source;
        paper.className = 'paper'; paper.style.width = dimensions.width + 'px'; paper.style.height = dimensions.height + 'px';
        image.alt = 'الصفحة ' + list[i] + ' من ' + total + '، ' + book.title;
        image.width = book.pageImages.width; image.height = book.pageImages.height;
        image.draggable = false; paper.appendChild(image); return paper;
      });
      stopTurn(); spread.replaceChildren.apply(spread, nodes);
      stage.scrollTop = 0; stage.scrollLeft = 0;
      if (animate && direction && oldPaper && oldPapers.length === nodes.length) turnLeaf(oldPaper, oldBox, nodes, direction);
      current = next; wanted = next; sync(); storage.set(key, current);
      stage.setAttribute('aria-busy', 'false');
      say(list.length === 2 ? 'الصفحتان ' + current + ' و' + (current + 1) + ' · يُحفظ موضعك تلقائيًا' : 'الصفحة ' + current + ' من ' + total + ' · يُحفظ موضعك تلقائيًا');
      [list[list.length - 1] + 1, current - 1].forEach(function (n) { if (n >= 1 && n <= total) loadPage(n).catch(function () {}); });
    } catch (err) {
      if (ticket !== generation) return;
      stage.setAttribute('aria-busy', 'false');
      say('تعذّر تحميل الصفحة ' + next);
      errorText.textContent = 'لم تصل صفحة الكتاب من الشبكة. أعد المحاولة، أو افتح ملف PDF الأصلي.';
      error.hidden = false;
    }
  }
  function go(number) { wanted = clamp(number); render(wanted, true, false); }
  function nextPage() { go(wanted + visiblePages(wanted).length); }
  function previousPage() { go(wanted - (doubleMode() && wanted > 2 ? 2 : 1)); }
  $('#next').onclick = nextPage; $('#prev').onclick = previousPage;
  $('#page-form').onsubmit = function (event) { event.preventDefault(); if ($('#page-number').checkValidity()) go($('#page-number').value); };
  $('#retry').onclick = function () { render(wanted, false, true); };
  $('#zoom-in').onclick = function () { zoom = Math.min(2.5, +(zoom + .25).toFixed(2)); render(current, false, false); };
  $('#zoom-out').onclick = function () { zoom = Math.max(.75, +(zoom - .25).toFixed(2)); render(current, false, false); };
  $('#zoom-reset').onclick = function () { zoom = 1; render(current, false, false); };
  function closeOptions() { $('#options-panel').hidden = true; $('#reader-options').setAttribute('aria-expanded', 'false'); }
  $('#reader-options').onclick = function () {
    var hidden = !$('#options-panel').hidden;
    $('#options-panel').hidden = hidden; $('#reader-options').setAttribute('aria-expanded', String(!hidden));
  };
  $('#close-options').onclick = function () { closeOptions(); $('#reader-options').focus(); };
  document.addEventListener('click', function (event) {
    if (!$('#options-panel').hidden && !$('#options-panel').contains(event.target) && !$('#reader-options').contains(event.target)) closeOptions();
  });
  $('#spread-mode').onchange = function (event) { mode = event.target.value; storage.set('wird-spread', mode); render(current, false, false); };
  $('#motion').onchange = function (event) { motion = event.target.checked; storage.set('wird-motion', motion ? 'on' : 'off'); if (!motion) stopTurn(); };
  function focusLayout() {
    $('#reader-app').classList.toggle('focus-reading', focusMode);
    $('#fullscreen').setAttribute('aria-label', focusMode ? 'إنهاء وضع التركيز' : document.fullscreenElement ? 'إنهاء ملء الشاشة' : 'ملء الشاشة');
    $('#fullscreen').setAttribute('aria-pressed', String(focusMode || !!document.fullscreenElement));
    render(current, false, false);
  }
  $('#fullscreen').onclick = async function () {
    if (document.fullscreenElement) { await document.exitFullscreen(); return; }
    if (focusMode) { focusMode = false; focusLayout(); return; }
    if ($('#reader-app').requestFullscreen && document.fullscreenEnabled) {
      try { await $('#reader-app').requestFullscreen(); return; } catch (_) {}
    }
    focusMode = true; closeOptions(); focusLayout();
  };
  document.addEventListener('fullscreenchange', focusLayout);
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') { closeOptions(); if (focusMode) { focusMode = false; focusLayout(); } }
    if (/INPUT|SELECT|TEXTAREA|BUTTON|A/.test(event.target.tagName) || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'ArrowLeft') { event.preventDefault(); nextPage(); }
    if (event.key === 'ArrowRight') { event.preventDefault(); previousPage(); }
  });
  var touch;
  stage.addEventListener('touchstart', function (event) {
    touch = event.touches.length === 1 && zoom === 1 ? { x: event.touches[0].clientX, y: event.touches[0].clientY } : null;
  }, { passive: true });
  stage.addEventListener('touchend', function (event) {
    if (!touch || zoom !== 1) return;
    var dx = event.changedTouches[0].clientX - touch.x, dy = event.changedTouches[0].clientY - touch.y;
    touch = null; if (Math.abs(dx) > 60 && Math.abs(dy) < 55) { dx > 0 ? nextPage() : previousPage(); }
  }, { passive: true });
  window.addEventListener('resize', function () { clearTimeout(resizeTimer); resizeTimer = setTimeout(function () { render(current, false, false); }, 160); });
  sync();
  var initial = paperSize(1), cover = spread.querySelector('.paper');
  cover.style.width = initial.width + 'px'; cover.style.height = initial.height + 'px';
  render(current, false, false);
})();
