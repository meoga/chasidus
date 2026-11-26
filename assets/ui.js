(function(){
'use strict';
/* Chasidus site UI: theme toggle, picture lightbox, contents sidebar, '/' search shortcut.
   Generated at build time from build.py (UI_JS). No content lives here. */

/* --- theme: light is the default; the saved choice wins --- */
var root = document.documentElement;
var toggle = document.getElementById('themeToggle');
function applyTheme(t){
  root.setAttribute('data-theme', t === 'dark' ? 'dark' : 'light');
  if(toggle){ toggle.textContent = (t === 'dark') ? '\u2600' : '\u263E'; }
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
})();