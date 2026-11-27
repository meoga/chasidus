(function(){
'use strict';
/* Chasidus site UI: SVG theme toggle, picture lightbox, contents sidebar,
   '/' search shortcut, and instant filter bar for long directory lists. */

var MOON_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
var SUN_SVG = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>';

/* --- theme: light is the default; the saved choice wins --- */
var root = document.documentElement;
var toggle = document.getElementById('themeToggle');
function applyTheme(t){
  root.setAttribute('data-theme', t === 'dark' ? 'dark' : 'light');
  if(toggle){ toggle.innerHTML = (t === 'dark') ? SUN_SVG : MOON_SVG; }
}
var saved = null;
try{ saved = localStorage.getItem('chasidus-theme'); }catch(e){}
applyTheme(saved === 'dark' ? 'dark' : 'light');
if(toggle){
  toggle.addEventListener('click', function(){
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    try{ localStorage.setItem('chasidus-theme', next); }catch(e){}
    applyTheme(next);
  });
}

/* --- keyboard shortcut: press '/' to focus search --- */
document.addEventListener('keydown', function(e){
  if(e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey){ return; }
  var tag = (document.activeElement && document.activeElement.tagName || '').toLowerCase();
  if(tag === 'input' || tag === 'textarea' || tag === 'select'){ return; }
  var input = document.querySelector('.home-head .searchbar input, .topbar .searchbar input, #q');
  if(input){
    e.preventDefault();
    input.focus();
  }
});

/* --- lightbox: click any figure picture to see it larger --- */
var box = null;
function onKey(e){ if(e.key === 'Escape'){ closeBox(); } }
function closeBox(){
  if(box){ box.remove(); box = null; document.removeEventListener('keydown', onKey); }
}
document.addEventListener('click', function(e){
  var img = (e.target && e.target.closest) ? e.target.closest('figure img') : null;
  if(!img){ return; }
  e.preventDefault();
  closeBox();
  box = document.createElement('div');
  box.className = 'lightbox';
  box.setAttribute('role', 'dialog');
  box.setAttribute('aria-label', 'תמונה מוגדלת');
  var big = document.createElement('img');
  big.src = img.currentSrc || img.src;
  big.alt = img.alt || '';
  box.appendChild(big);
  var fig = img.closest('figure');
  var cap = fig ? fig.querySelector('figcaption') : null;
  if(cap && cap.textContent.trim()){
    var c = document.createElement('div');
    c.className = 'lb-cap';
    c.textContent = cap.textContent.trim();
    box.appendChild(c);
  }
  var x = document.createElement('button');
  x.className = 'lb-close';
  x.type = 'button';
  x.setAttribute('aria-label', 'סגירה');
  x.textContent = '\u00d7';
  box.appendChild(x);
  box.addEventListener('click', closeBox);
  document.body.appendChild(box);
  document.addEventListener('keydown', onKey);
});

/* --- contents sidebar: highlight the section currently in view --- */
var toc = document.querySelector('.toc');
if(toc && 'IntersectionObserver' in window){
  var links = {};
  toc.querySelectorAll('a[href^="#sec-"]').forEach(function(a){
    links[a.getAttribute('href').slice(1)] = a;
  });
  var heads = Object.keys(links).map(function(id){
    return document.getElementById(id);
  }).filter(function(h){ return !!h; });
  var current = null;
  var obs = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if(en.isIntersecting){
        var id = en.target.id;
        if(current){ current.classList.remove('active'); }
        current = links[id];
        if(current){ current.classList.add('active'); }
      }
    });
  }, {rootMargin: '-15% 0px -70% 0px'});
  heads.forEach(function(h){ obs.observe(h); });
}

/* --- directory quick filter for long lists (rebbes, towns, timeline) --- */
function norm(s){
  return (s || '').toLowerCase()
    .replace(/[\u05f3\u2018\u2019`]/g, "'")
    .replace(/[\u05f4\u201c\u201d]/g, '"');
}
function attachDirFilter(container, itemSelector){
  var items = Array.prototype.slice.call(container.querySelectorAll(itemSelector));
  if(items.length < 30){ return; }
  var isEn = (typeof window.chsLang === 'function' && window.chsLang() === 'en');
  var bar = document.createElement('div');
  bar.className = 'dir-filter';
  var inp = document.createElement('input');
  inp.type = 'search';
  inp.placeholder = isEn ? 'Filter this list...' : 'סינון מהיר ברשימה (שם, עיר, שנה)...';
  var cnt = document.createElement('span');
  cnt.className = 'dir-count';
  cnt.textContent = items.length + ' / ' + items.length;
  bar.appendChild(inp);
  bar.appendChild(cnt);
  container.parentNode.insertBefore(bar, container);
  inp.addEventListener('input', function(){
    var q = norm(inp.value).trim();
    var shown = 0;
    items.forEach(function(el){
      var match = !q || norm(el.textContent).indexOf(q) !== -1;
      el.style.display = match ? '' : 'none';
      if(match){ shown++; }
    });
    cnt.textContent = shown + ' / ' + items.length;
  });
}

function initDirEnhancements(){
  var rlist = document.querySelector('.rlist');
  if(rlist && !document.getElementById('results')){
    attachDirFilter(rlist, '.rrow');
  }
  var tlFirst = document.querySelector('.tl-row');
  if(tlFirst && tlFirst.parentNode){
    attachDirFilter(tlFirst.parentNode, '.tl-row');
  }
  /* Compact long dynasty descriptions on dynasties.html */
  if(location.pathname.indexOf('dynasties') !== -1){
    document.querySelectorAll('.dyn > p').forEach(function(p){
      if((p.textContent || '').length > 220){
        p.classList.add('dyn-excerpt');
      }
    });
  }
}
if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', initDirEnhancements);
} else {
  initDirEnhancements();
}
})();
