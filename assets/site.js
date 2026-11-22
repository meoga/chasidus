(function(){
function initMap(){
  var el = document.getElementById('map');
  if(!el || typeof L === 'undefined') return;
  var assets = (document.currentScript && document.currentScript.getAttribute('data-assets')) || 'assets/';
  var map;
  if(el.getAttribute('data-mode') === 'all'){
    map = L.map(el).setView([51.0, 26.0], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {maxZoom: 18, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
    fetch(assets + 'towns.json').then(function(r){ return r.json(); }).then(function(towns){
      towns.filter(function(t){ return t.lat !== null && t.lon !== null; }).forEach(function(t){
        var m = L.marker([t.lat, t.lon]).addTo(map);
        m.bindPopup('<b><a href="' + t.url + '">' + t.name + '</a></b><br>' + (t.country || ''));
      });
    });
    var eraLayer = null;
    function showEra(eras, key){
      if(eraLayer){ map.removeLayer(eraLayer); eraLayer = null; }
      var e = eras[key];
      if(!e) return;
      eraLayer = L.layerGroup();
      (e.regions || []).forEach(function(r){
        if(r.poly && r.poly.length > 3){
          var latlngs = r.poly.map(function(p){ return [p[1], p[0]]; });
          L.polygon(latlngs, {color: r.color || '#14532d', weight: 3,
            fillColor: r.color || '#14532d', fillOpacity: 0.16}).addTo(eraLayer);
        }
        if(r.label){
          L.marker([r.label[1], r.label[0]], {interactive: false,
            icon: L.divIcon({className: 'era-label', html: r.name, iconSize: null})}).addTo(eraLayer);
        }
      });
      eraLayer.addTo(map);
      var d = document.getElementById('eraDesc');
      if(d) d.textContent = e.desc || '';
      var bar = document.getElementById('eraBar');
      if(bar) Array.prototype.forEach.call(bar.querySelectorAll('button'), function(b){
        b.classList.toggle('on', b.getAttribute('data-era') === key);
      });
    }
    fetch(assets + 'eras.json').then(function(r){ return r.json(); }).then(function(eras){
      showEra(eras, 'y1914');
      var bar = document.getElementById('eraBar');
      if(bar) bar.addEventListener('click', function(ev){
        var b = ev.target.closest ? ev.target.closest('button[data-era]') : null;
        if(b) showEra(eras, b.getAttribute('data-era'));
      });
    });
  } else {
    var lat = parseFloat(el.getAttribute('data-lat')),
        lon = parseFloat(el.getAttribute('data-lon'));
    map = L.map(el).setView([lat, lon], 12);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      {maxZoom: 18, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(map);
    L.marker([lat, lon]).addTo(map).bindPopup(el.getAttribute('data-name') || '');
  }
}
function initHome(){
  var assets = (document.currentScript && document.currentScript.getAttribute('data-assets')) || 'assets/';
  var yz = document.getElementById('yahrtzeit');
  if(yz){
    var today = new Date();
    var iso = today.getFullYear() + '-' + String(today.getMonth()+1).padStart(2,'0') + '-' + String(today.getDate()).padStart(2,'0');
    Promise.all([
      fetch(assets + 'hebcal.json').then(function(r){ return r.json(); }),
      fetch(assets + 'yahrtzeit.json').then(function(r){ return r.json(); })
    ]).then(function(pair){
      var heb = pair[0], idx = pair[1];
      var h = heb[iso];
      if(!h){ yz.innerHTML = '<p>לא נמצא תאריך עברי להיום.</p>'; return; }
      var head = '<p class="hebrew-date">היום, ' + h.dh + ' ב' + h.mh + ' ' + h.yh + '</p>';
      var keys = [h.m + '-' + h.d];
      if(h.m === 'Adar II') keys.push('Adar-' + h.d);
      if((h.m === 'Cheshvan' || h.m === 'Kislev') && h.d === 29){
        var has30 = false;
        for(var k in heb){ var e = heb[k]; if(e.y === h.y && e.m === h.m && e.d === 30){ has30 = true; break; } }
        if(!has30) keys.push(h.m + '-30');
      }
      var names = [];
      keys.forEach(function(k){ (idx[k] || []).forEach(function(e){ names.push(e); }); });
      if(names.length){
        yz.innerHTML = head + '<ul class="yz-list">' + names.map(function(e){
          return '<li><a href="rebbe/' + e.id + '.html">' + e.name + '</a>' +
            ' <span class="muted">נפטר ' + e.dateH + '</span></li>';
        }).join('') + '</ul>';
      } else {
        var found = null;
        for(var i = 1; i <= 7 && !found; i++){
          var d2 = new Date(today.getTime() + i*86400000);
          var iso2 = d2.getFullYear() + '-' + String(d2.getMonth()+1).padStart(2,'0') + '-' + String(d2.getDate()).padStart(2,'0');
          var h2 = heb[iso2];
          if(!h2) continue;
          var k2 = [h2.m + '-' + h2.d];
          if(h2.m === 'Adar II') k2.push('Adar-' + h2.d);
          var list = [];
          k2.forEach(function(k){ (idx[k] || []).forEach(function(e){ list.push(e); }); });
          if(list.length) found = {h: h2, list: list};
        }
        var html = head + '<p>היום אין יארצייטן באתר.</p>';
        if(found){
          html += '<p>היארצייט הקרוב: ' + found.h.dh + ' ב' + found.h.mh + ' — ' +
            found.list.map(function(e){ return '<a href="rebbe/' + e.id + '.html">' + e.name + '</a>'; }).join(', ') + '</p>';
        }
        yz.innerHTML = html;
      }
    }).catch(function(){ yz.innerHTML = '<p>לא הצלחנו לטעון את היארצייטן.</p>'; });
  }
  var rb = document.getElementById('randomRebbe');
  if(rb){
    fetch('search.json').then(function(r){ return r.json(); }).then(function(ix){
      var rs = ix.filter(function(e){ return e.k === 'אדמו״ר'; });
      if(!rs.length) return;
      rb.addEventListener('click', function(ev){
        ev.preventDefault();
        var pick = rs[Math.floor(Math.random()*rs.length)];
        location.href = pick.u;
      });
    });
  }
}
if(document.readyState === 'loading'){ document.addEventListener('DOMContentLoaded', function(){ initMap(); initHome(); }); }
else { initMap(); initHome(); }
})();
