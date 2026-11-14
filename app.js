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

/* Sri Lankan hero video rotation with slide transitions */
(()=>{
 const hero=document.querySelector(".hero-video-backdrop");
 if(!hero)return;
 const videos=[...hero.querySelectorAll(".hero-bg-video")];
 const bars=[...hero.querySelectorAll(".hero-video-progress span")];
 if(!videos.length)return;
 let current=0, timer=null, pageHidden=document.hidden;
 const reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
 const PLAY_TIME=9500, FAILOVER_TIME=4500;
 const stop=()=>{if(timer!==null){clearTimeout(timer);timer=null;}};
 const schedule=(delay)=>{stop();if(!pageHidden)timer=setTimeout(()=>activate(current+1),delay);};
 videos.forEach((video,index)=>{
   video.muted=true; video.defaultMuted=true; video.playsInline=true; video.loop=true;
   video.controls=false;
   ["muted","playsinline","webkit-playsinline"].forEach(attr=>video.setAttribute(attr,""));
   video.addEventListener("playing",()=>{
     video.dataset.videoState="playing";
     video.classList.remove("has-video-error");
     if(index===current)schedule(PLAY_TIME);
   });
   video.addEventListener("error",()=>{
     video.dataset.videoState="error";
     video.classList.add("has-video-error");
     if(index===current)schedule(FAILOVER_TIME);
   });
 });
 function tryPlay(video,index){
   if(!video||pageHidden)return;
   video.muted=true;
   const result=video.play();
   if(result&&typeof result.catch==="function"){
     result.catch(()=>{
       video.dataset.videoState="blocked";
       if(index===current)schedule(FAILOVER_TIME);
     });
   }
 }
 function activate(index){
   stop();
   const next=(index+videos.length)%videos.length;
   current=next;
   videos.forEach((video,i)=>{
     const active=i===current;
     video.classList.toggle("is-visible",active);
     video.classList.remove("is-leaving");
     bars[i]?.classList.toggle("is-current",active);
     if(!active)video.pause();
   });
   const active=videos[current];
   if(!active)return;
   active.dataset.videoState="loading";
   if(active.readyState===0)active.load();
   tryPlay(active,current);
   schedule(FAILOVER_TIME);
 }
 document.addEventListener("visibilitychange",()=>{
   pageHidden=document.hidden;
   if(pageHidden){stop();videos.forEach(v=>v.pause());}
   else activate(current);
 });
 hero.addEventListener("mouseenter",stop);
 hero.addEventListener("mouseleave",()=>{if(!pageHidden)schedule(PLAY_TIME);});
 document.addEventListener("pointerdown",()=>{
   if(!pageHidden)tryPlay(videos[current],current);
 },{passive:true,once:true});
 if(reducedMotion){
   videos.forEach((video,i)=>{video.classList.toggle("is-visible",i===0);});
   bars[0]?.classList.add("is-current");
 }else{
   activate(0);
 }
})();
