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
if(document.readyState === 'loading'){ document.addEventListener('DOMContentLoaded', initMap); }
else { initMap(); }
})();
