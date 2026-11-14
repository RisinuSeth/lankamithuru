const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const modal=$("#searchModal"),searchInput=$("#siteSearch"),results=$("#searchResults"),toast=$("#toast");let toastTimer;
$("#year").textContent=new Date().getFullYear();
const searchable=[
{title:"Explore Sri Lanka",terms:"explore destinations places travel tourism island",target:"explore.html",type:"EXPLORE"},{title:"Beaches & coast",terms:"beach sea ocean surf coast",target:"explore.html#categories",type:"EXPLORE"},{title:"Hills & nature",terms:"mountain hills nature forest waterfall",target:"explore.html#categories",type:"EXPLORE"},{title:"Culture & heritage",terms:"culture heritage history ancient",target:"explore.html#categories",type:"EXPLORE"},{title:"Food & flavour",terms:"food restaurants cuisine flavour",target:"explore.html#categories",type:"EXPLORE"},{title:"Places to stay",terms:"hotels accommodation stays guest houses",target:"explore.html#categories",type:"EXPLORE"},{title:"Local businesses",terms:"business shop local directory companies",target:"hub.html#directory",type:"HUB"},{title:"Services",terms:"services professionals repair help",target:"hub.html#directory",type:"HUB"},{title:"Jobs & opportunities",terms:"jobs careers opportunities vacancies",target:"hub.html#opportunities",type:"HUB"},{title:"Events & happenings",terms:"events happenings activities calendar",target:"hub.html#opportunities",type:"HUB"},{title:"Advanced Level resources",terms:"a/l al advanced level subjects notes",target:"edu.html#resources",type:"EDU"},{title:"Ordinary Level resources",terms:"o/l ol ordinary level subjects notes",target:"edu.html#resources",type:"EDU"},{title:"Past papers",terms:"past papers exam answers revision",target:"edu.html#resources",type:"EDU"},{title:"Study guides",terms:"study guides learning resources",target:"edu.html#resources",type:"EDU"},{title:"Courses & skills",terms:"courses skills training learning",target:"edu.html#resources",type:"EDU"}];
function openSearch(q=""){if(!modal)return;modal.classList.add("open");modal.setAttribute("aria-hidden","false");document.body.style.overflow="hidden";searchInput.value=q;renderSearch(q);setTimeout(()=>searchInput.focus(),80)}
function closeSearch(){if(!modal)return;modal.classList.remove("open");modal.setAttribute("aria-hidden","true");document.body.style.overflow=""}
function renderSearch(q){const term=q.trim().toLowerCase(),matches=term?searchable.filter(x=>(x.title+" "+x.terms).toLowerCase().includes(term)):searchable.slice(0,5);results.innerHTML='<span class="results-label">'+(term?(matches.length?"MATCHING DISCOVERIES":"NO MATCHES YET"):"QUICK DISCOVERIES")+'</span>';if(!matches.length){const p=document.createElement("p");p.className="search-hint";p.textContent="Try travel, business, jobs or study.";results.append(p);return}matches.slice(0,8).forEach(x=>{const a=document.createElement("a");a.href=x.target;a.className="search-result-link";const t=document.createElement("span");t.textContent=x.title;const m=document.createElement("small");m.textContent=x.type;const b=document.createElement("b");b.textContent="↗";a.append(t,m,b);results.append(a)})}
$("#openSearch")?.addEventListener("click",()=>openSearch());$("#heroSearch")?.addEventListener("click",()=>openSearch());$("#closeSearch")?.addEventListener("click",closeSearch);searchInput?.addEventListener("input",e=>renderSearch(e.target.value));modal?.addEventListener("click",e=>{if(e.target===modal)closeSearch()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&modal?.classList.contains("open"))closeSearch();if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==="k"){e.preventDefault();openSearch()}});
$$("[data-search-term]").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();openSearch(a.dataset.searchTerm||"")}));
const menu=$("#menuToggle"),nav=$(".main-nav");menu?.addEventListener("click",()=>{const open=menu.getAttribute("aria-expanded")==="true";menu.setAttribute("aria-expanded",String(!open));nav?.classList.toggle("open",!open)});$$(".main-nav a").forEach(a=>a.addEventListener("click",()=>{nav?.classList.remove("open");menu?.setAttribute("aria-expanded","false")}));

/* Reliable Sri Lankan hero video rotation */
(()=>{
 const hero=document.querySelector(".hero-video-backdrop");
 if(!hero)return;
 const videos=[...hero.querySelectorAll(".hero-bg-video")];
 const bars=[...hero.querySelectorAll(".hero-video-progress span")];
 if(!videos.length)return;

 let current=0;
 let timer=null;
 let hovered=false;
 let pageHidden=document.hidden;
 let reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
 const PLAY_TIME=9500;
 const RETRY_TIME=5500;

 videos.forEach((video,index)=>{
   video.muted=true;
   video.defaultMuted=true;
   video.playsInline=true;
   video.loop=true;
   video.controls=false;
   video.setAttribute("muted","");
   video.setAttribute("playsinline","");
   video.setAttribute("webkit-playsinline","");
   video.addEventListener("error",()=>{
     video.dataset.videoState="error";
     video.classList.add("has-video-error");
     if(index===current) schedule(RETRY_TIME);
   });
   video.addEventListener("playing",()=>{
     video.dataset.videoState="playing";
     video.classList.remove("has-video-error");
   });
 });

 function stop(){
   if(timer!==null){clearTimeout(timer);timer=null;}
 }
 function schedule(delay=PLAY_TIME){
   stop();
   if(!pageHidden&&!hovered&&!reducedMotion){
     timer=setTimeout(()=>activate(current+1),delay);
   }
 }
 function tryPlay(video){
   if(!video || pageHidden || reducedMotion)return;
   video.muted=true;
   const promise=video.play();
   if(promise && typeof promise.catch==="function"){
     promise.catch(()=>{
       video.dataset.videoState="blocked";
       video.classList.add("has-video-error");
       schedule(RETRY_TIME);
     });
   }
 }
 function activate(index){
   stop();
   current=(index+videos.length)%videos.length;
   videos.forEach((video,i)=>{
     const active=i===current;
     video.classList.toggle("is-visible",active);
     bars[i]?.classList.toggle("is-current",active);
     if(!active)video.pause();
   });
   const active=videos[current];
   if(!active)return;
   if(active.dataset.videoState==="error"){
     schedule(RETRY_TIME);
     return;
   }
   if(active.readyState===0)active.load();
   tryPlay(active);
   schedule(PLAY_TIME);
 }
 function pauseAll(){videos.forEach(video=>video.pause());}
 document.addEventListener("visibilitychange",()=>{
   pageHidden=document.hidden;
   if(pageHidden){stop();pauseAll();}
   else if(!reducedMotion){activate(current);}
 });
 hero.addEventListener("mouseenter",()=>{hovered=true;stop();});
 hero.addEventListener("mouseleave",()=>{hovered=false;if(!pageHidden&&!reducedMotion)tryPlay(videos[current]);schedule();});
 document.addEventListener("pointerdown",()=>{
   if(!pageHidden&&!reducedMotion)tryPlay(videos[current]);
 },{passive:true,once:true});
 if(reducedMotion){
   videos.forEach((video,i)=>{video.classList.toggle("is-visible",i===0);});
   bars[0]?.classList.add("is-current");
 }else{
   activate(0);
 }
})();
