(function(){
if(screen.width>700)return;document.documentElement.classList.add('tel');
function f(fs){return fs<=12?fs*1.45:fs<=17?fs*1.32:fs<=24?fs*1.15:fs}
function boost(root){
 var els=(root.querySelectorAll?root.querySelectorAll('*'):[]);
 var list=[root].concat([].slice.call(els));
 for(var i=0;i<list.length;i++){var e=list[i];if(!e.style||e.dataset&&e.dataset.tb)continue;
  var hasText=false;for(var n=e.firstChild;n;n=n.nextSibling){if(n.nodeType===3&&n.nodeValue.trim()){hasText=true;break}}
  if(!hasText||e.closest('header,.cht-onglet,.mm'))continue;var fs=parseFloat(getComputedStyle(e).fontSize);if(!fs||fs>24)continue;
  e.style.setProperty('font-size',f(fs).toFixed(1)+'px','important');e.dataset.tb='1'}
}

function menu(){if(document.querySelector('.mm-btn'))return;var S=[['Entreprise','/video-entreprise-besancon/','#12805C'],['Marque','/video-publicitaire-besancon/','#378ADD'],['Événementiel','/video-evenement-besancon/','#7F77DD'],['Réseaux sociaux','/video-reseaux-sociaux-besancon/','#D4537E'],['Restaurants','/video-restaurant-besancon/','#BA7517'],['Immobilier','/video-immobiliere-besancon/','#639922'],['Mariages','/videaste-mariage-besancon/','#E07A93'],['Créateurs','/tournage-montage-createurs/','#E24B4A']];var h='<a class="mm-p" href="/">Accueil</a><div class="mm-t">Services</div><div class="mm-s">';S.forEach(function(x){h+='<a href="'+x[1]+'"><i style="background:'+x[2]+'"></i>'+x[0]+'</a>'});h+='</div><a class="mm-p" href="/realisations/" style="margin-top:24px">Réalisations</a><a class="mm-p" href="/a-propos/">Qui suis-je</a><a class="mm-p" href="/conseils/">Conseils</a><a class="mm-c" href="/contact/">Me contacter</a>';var m=document.createElement('nav');m.className='mm';m.setAttribute('aria-label','Menu');m.innerHTML=h;var b=document.createElement('button');b.className='mm-btn';b.type='button';b.setAttribute('aria-label','Ouvrir le menu');b.innerHTML='<span></span>';b.onclick=function(){document.documentElement.classList.toggle('mm-open')};document.body.appendChild(m);document.body.appendChild(b)}
function run(){menu();boost(document.body);new MutationObserver(function(m){m.forEach(function(r){r.addedNodes.forEach(function(n){if(n.nodeType===1)boost(n)})})}).observe(document.body,{childList:true,subtree:true})}
if(document.readyState==='complete')run();else window.addEventListener('load',run);
})();
