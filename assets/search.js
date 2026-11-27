(function(){
var HE = {'js_search_empty':'כתבו מונח חיפוש — רבי, עיר, שושלת או ספר.', 'js_search_none':'לא נמצא דבר עבור', 'js_search_results':'תוצאות עבור', 'js_search_open':'פתיחה ←'};
function T(k){ return (typeof window.chsT === 'function') ? window.chsT(k) : (HE[k] || ''); }
function LG(){ return (typeof window.chsLang === 'function') ? window.chsLang() : 'he'; }
function getQ(){ var m = location.search.match(/[?&]q=([^&]*)/); return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : ''; }
function norm(s){
  return (s || '').toLowerCase()
    .replace(/[\u05f3\u2018\u2019`]/g, "'")
    .replace(/[\u05f4\u201c\u201d]/g, '"');
}
function esc(s){ return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

var activeKind = 'all';

function render(q, idx){
  var box = document.getElementById('results');
  if(!box) return;
  q = (q || '').trim();
  if(!q){ box.innerHTML = '<p class="empty">' + T('js_search_empty') + '</p>'; return; }
  var nq = norm(q);
  var hits = idx.filter(function(e){ return norm(e.t + ' ' + e.x).indexOf(nq) !== -1; });
  if(!hits.length){ box.innerHTML = '<p class="empty">' + T('js_search_none') + ' “' + esc(q) + '”.</p>'; return; }

  var counts = { all: hits.length };
  hits.forEach(function(e){
    var k = (LG() === 'en' && e.ke) ? e.ke : e.k;
    counts[k] = (counts[k] || 0) + 1;
  });
  if(activeKind !== 'all' && !counts[activeKind]){ activeKind = 'all'; }

  var tabsHtml = '<div class="search-tabs">' +
    '<button type="button" class="search-tab' + (activeKind === 'all' ? ' active' : '') + '" data-kind="all">' +
      (LG() === 'en' ? 'All' : 'הכל') + ' (' + counts.all + ')</button>' +
    Object.keys(counts).filter(function(k){ return k !== 'all'; }).map(function(k){
      return '<button type="button" class="search-tab' + (activeKind === k ? ' active' : '') + '" data-kind="' + esc(k) + '">' +
        esc(k) + ' (' + counts[k] + ')</button>';
    }).join('') +
  '</div>';

  var filtered = (activeKind === 'all') ? hits : hits.filter(function(e){
    var k = (LG() === 'en' && e.ke) ? e.ke : e.k;
    return k === activeKind;
  });

  box.innerHTML = '<p>' + hits.length + ' ' + T('js_search_results') + ' “' + esc(q) + '”:</p>' +
    tabsHtml +
    filtered.map(function(e){
      var kind = (LG() === 'en' && e.ke) ? e.ke : e.k;
      return '<a class="rrow" href="' + e.u + '"><span><span class="nm">' + esc(e.t) +
        '</span><br><span class="mt">' + esc(kind) + '</span></span><span class="go">' + T('js_search_open') + '</span></a>';
    }).join('');
}

var input = document.getElementById('q');
var q = getQ();
if(input) input.value = q;
fetch('search.json').then(function(r){ return r.json(); }).then(function(idx){
  render(q, idx);
  if(input) input.addEventListener('input', function(){
    activeKind = 'all';
    render(input.value, idx);
  });
  var box = document.getElementById('results');
  if(box) box.addEventListener('click', function(ev){
    var btn = ev.target.closest ? ev.target.closest('.search-tab') : null;
    if(!btn) return;
    activeKind = btn.getAttribute('data-kind') || 'all';
    render(input ? input.value : q, idx);
  });
});
})();
