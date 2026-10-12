// Genera la página HTML (Leaflet + OpenStreetMap) que muestran LeafletMap.js (WebView)
// y LeafletMap.web.js (iframe). No requiere API keys.
const safe = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c');

export function buildMapHtml({ markers, user, center, zoom, dark, interactive, labels }) {
  const tiles = dark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
  const bg = dark ? '#0f1713' : '#dfe8e1';
  return `<!doctype html>
<html><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>
  html,body,#map{height:100%;margin:0;padding:0;background:${bg};}
  .leaflet-container{font-family:-apple-system,system-ui,Segoe UI,Roboto,sans-serif;}
  .pin{width:40px;height:40px;border-radius:50% 50% 50% 8%;transform:rotate(-45deg);display:flex;align-items:center;justify-content:center;border:3px solid #fff;box-shadow:0 4px 10px rgba(0,0,0,.35);transition:transform .15s}
  .pin span{transform:rotate(45deg);color:#fff;font-weight:800;font-size:14px}
  .pin.sel{transform:rotate(-45deg) scale(1.25);z-index:999}
  .me{width:18px;height:18px;border-radius:50%;background:#2F7BD6;border:3px solid #fff;box-shadow:0 0 0 0 rgba(47,123,214,.6);animation:pulse 2s infinite}
  @keyframes pulse{70%{box-shadow:0 0 0 16px rgba(47,123,214,0)}100%{box-shadow:0 0 0 0 rgba(47,123,214,0)}}
  .leaflet-control-attribution{font-size:9px;opacity:.8}
  #err{display:none;position:absolute;inset:0;align-items:center;justify-content:center;text-align:center;padding:24px;font-size:14px;color:#667569;z-index:2000}
</style>
</head><body>
<div id="map"></div><div id="err">${labels.error}</div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
(function(){
  function send(o){var m=JSON.stringify(o);if(window.ReactNativeWebView){window.ReactNativeWebView.postMessage(m);}else if(window.parent!==window){window.parent.postMessage(m,'*');}}
  if(!window.L){document.getElementById('err').style.display='flex';send({type:'error'});return;}
  var markers=${safe(markers)}, user=${safe(user)}, center=${safe(center)}, zoom=${zoom}, interactive=${interactive};
  var map=L.map('map',{zoomControl:interactive,dragging:interactive,scrollWheelZoom:interactive,doubleClickZoom:interactive,touchZoom:interactive,boxZoom:interactive,keyboard:interactive,attributionControl:true}).setView([center.lat,center.lng],zoom);
  var layer=L.tileLayer('${tiles}',{maxZoom:19,subdomains:'abc',attribution:'&copy; OpenStreetMap${dark ? ' &copy; CARTO' : ''}'}).addTo(map);
  var errs=0;layer.on('tileerror',function(){if(++errs===6){send({type:'error'});}});
  var byId={}, pts=[];
  markers.forEach(function(m){
    var html='<div class="pin" id="pin-'+m.id+'" style="background:'+m.color+'"><span>'+(m.label||'')+'</span></div>';
    var mk=L.marker([m.lat,m.lng],{icon:L.divIcon({html:html,className:'',iconSize:[40,40],iconAnchor:[8,38]})}).addTo(map);
    mk.on('click',function(){select(m.id);send({type:'select',id:m.id});});
    byId[m.id]=mk;pts.push([m.lat,m.lng]);
  });
  if(user){L.marker([user.lat,user.lng],{icon:L.divIcon({html:'<div class="me"></div>',className:'',iconSize:[18,18]}),interactive:false,zIndexOffset:-100}).addTo(map);pts.push([user.lat,user.lng]);}
  if(pts.length>1){map.fitBounds(L.latLngBounds(pts).pad(0.25),{maxZoom:16});}
  var current=null;
  function select(id){
    if(current){var p=document.getElementById('pin-'+current);if(p)p.classList.remove('sel');}
    current=id;
    if(id){var q=document.getElementById('pin-'+id);if(q)q.classList.add('sel');if(byId[id])map.panTo(byId[id].getLatLng(),{animate:true});}
  }
  map.on('click',function(){select(null);send({type:'deselect'});});
  function onMsg(e){try{var d=typeof e.data==='string'?JSON.parse(e.data):e.data;
    if(d&&d.flSelect!==undefined){select(d.flSelect);}
    if(d&&d.flCenter){map.flyTo([d.flCenter.lat,d.flCenter.lng],16);}
  }catch(_){}}
  window.addEventListener('message',onMsg);document.addEventListener('message',onMsg);
  send({type:'ready'});
})();
</script></body></html>`;
}
