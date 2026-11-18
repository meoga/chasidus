(function(){
function getQ(){ var m = location.search.match(/[?&]q=([^&]*)/); return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')) : ''; }
function render(q, idx){
  var box = document.getElementById('results');
  if(!box) return;
  q = (q || '').trim();
  if(!q){ box.innerHTML = '<p class="empty">כתבו מונח חיפוש — רבי, עיר, שושלת או ספר.</p>'; return; }
  var hits = idx.filter(function(e){ return (e.t + ' ' + e.x).indexOf(q) !== -1; });
  if(!hits.length){ box.innerHTML = '<p class="empty">לא נמצא דבר עבור ״' + q.replace(/</g, '&lt;') + '״.</p>'; return; }
  box.innerHTML = '<p>' + hits.length + ' תוצאות עבור ״' + q.replace(/</g, '&lt;') + '״:</p>' +
    hits.map(function(e){
      return '<a class="rrow" href="' + e.u + '"><span><span class="nm">' + e.t.replace(/</g, '&lt;') +
        '</span><br><span class="mt">' + e.k + '</span></span><span class="go">פתיחה ←</span></a>';
    }).join('');
}
var input = document.getElementById('q');
var q = getQ();
if(input) input.value = q;
fetch('search.json').then(function(r){ return r.json(); }).then(function(idx){
  render(q, idx);
  if(input) input.addEventListener('input', function(){ render(input.value, idx); });
});
})();
