(() => {
  "use strict";

  const SETTINGS_KEY = "xscapeSettings";
  const CACHE_KEY = "xscapeGitHubRegistryCache";
  const CONTEXT = 'article,[data-testid="UserCell"],[data-testid="HoverCard"],[data-testid="cellInnerDiv"],[role="dialog"]';
  const RESERVED = new Set([
    "home","explore","notifications","messages","i","search","compose","settings",
    "tos","privacy","login","signup","share","intent","hashtag","jobs","communities"
  ]);
  const EFFECTS = new Set(["solid","gradient","glow","rainbow","flash","wave","pulse","fire","ice","toxic"]);
  const SHUFFLE_STYLES = [
    {effect:"wave",color1:"#57d9ff",color2:"#f4c95d",speed:1.08,intensity:1},
    {effect:"wave",color1:"#8b5cf6",color2:"#22d3ee",speed:.92,intensity:.9},
    {effect:"rainbow",color1:"#ff69d4",color2:"#57d9ff",speed:1.35,intensity:.95},
    {effect:"glow",color1:"#57d9ff",color2:"#8b5cf6",speed:1.6,intensity:.85},
    {effect:"gradient",color1:"#f4c95d",color2:"#79ff97",speed:1.55,intensity:.82},
    {effect:"pulse",color1:"#8b5cf6",color2:"#ff69d4",speed:1.4,intensity:.85},
    {effect:"fire",color1:"#ff4a00",color2:"#ffd000",speed:.85,intensity:1},
    {effect:"ice",color1:"#74ddff",color2:"#737dff",speed:1.45,intensity:.92},
    {effect:"toxic",color1:"#76ff00",color2:"#00ffd5",speed:.68,intensity:.9},
    {effect:"flash",color1:"#ff1744",color2:"#f4c95d",speed:1.75,intensity:.72},
    {effect:"gradient",color1:"#57d9ff",color2:"#ff69d4",speed:1.2,intensity:.88},
    {effect:"glow",color1:"#79ff97",color2:"#22d3ee",speed:1.3,intensity:.78}
  ];
  const DEFAULTS = {
    enabled:true,
    demoMode:false,
    demoEffect:"rainbow",
    demoColor1:"#ff3cac",
    demoColor2:"#00f5ff",
    demoSpeed:1,
    demoIntensity:.82,
    shuffleMode:false,
    shuffleSeed:1,
    communityEnabled:false,
    mutedHandles:[],
    mutedEffects:[],
    profiles:{}
  };

  let settings = {...DEFAULTS,profiles:{}};
  let community = {};
  let queued = false;
  const running = new WeakMap();

  const norm = value => String(value || "").trim().replace(/^@/,"").toLowerCase().replace(/[^a-z0-9_]/g,"").slice(0,15);
  const clamp = (value,min,max,fallback) => Number.isFinite(Number(value)) ? Math.min(max,Math.max(min,Number(value))) : fallback;
  const validColor = (value,fallback) => /^#[0-9a-f]{6}$/i.test(String(value || "")) ? String(value).toLowerCase() : fallback;

  function merge(value) {
    const incoming = value && typeof value === "object" ? value : {};
    return {
      ...DEFAULTS,
      ...incoming,
      shuffleSeed:Number.isFinite(Number(incoming.shuffleSeed)) ? Math.floor(Number(incoming.shuffleSeed)) : DEFAULTS.shuffleSeed,
      profiles:incoming.profiles && typeof incoming.profiles === "object" ? incoming.profiles : {},
      mutedHandles:Array.isArray(incoming.mutedHandles) ? incoming.mutedHandles.map(norm).filter(Boolean) : [],
      mutedEffects:Array.isArray(incoming.mutedEffects) ? incoming.mutedEffects.map(value => String(value).toLowerCase()) : []
    };
  }

  function hashHandle(handle,seed) {
    let hash=(2166136261 ^ (seed >>> 0)) >>> 0;
    for(let index=0;index<handle.length;index+=1){
      hash^=handle.charCodeAt(index);
      hash=Math.imul(hash,16777619)>>>0;
    }
    hash^=hash>>>16;
    hash=Math.imul(hash,2246822507)>>>0;
    hash^=hash>>>13;
    return hash>>>0;
  }

  function styleFor(handle) {
    const local=settings.profiles?.[handle];
    if(local && local.enabled!==false)return local;
    const shared=community?.[handle];
    if(settings.communityEnabled && shared && !settings.mutedHandles.includes(handle) && !settings.mutedEffects.includes(shared.effect))return shared;
    if(settings.shuffleMode && !settings.mutedHandles.includes(handle)){
      const pool=SHUFFLE_STYLES.filter(style=>!settings.mutedEffects.includes(style.effect));
      if(pool.length)return pool[hashHandle(handle,settings.shuffleSeed)%pool.length];
    }
    if(settings.demoMode)return {
      effect:settings.demoEffect,
      color1:settings.demoColor1,
      color2:settings.demoColor2,
      speed:settings.demoSpeed,
      intensity:settings.demoIntensity
    };
    return null;
  }

  function handleFromLink(link) {
    const raw=link.getAttribute("href") || "";
    const match=raw.match(/^\/([A-Za-z0-9_]{1,15})\/?(?:[?#].*)?$/);
    if(!match)return "";
    const handle=norm(match[1]);
    return handle && !RESERVED.has(handle) ? handle : "";
  }

  function visible(node) {
    const rect=node.getBoundingClientRect();
    const style=getComputedStyle(node);
    return rect.width>0 && rect.height>0 && style.display!=="none" && style.visibility!=="hidden";
  }

  function nameCandidate(link,handle) {
    if(link.querySelector(".xscape-fx") || link.querySelector(".xscape-compat-fx"))return null;
    const candidates=[...link.querySelectorAll("span")].filter(span=>{
      if(span.closest("svg") || span.querySelector("svg"))return false;
      const text=(span.textContent || "").trim();
      if(!text || text.startsWith("@") || text==="·" || norm(text)===handle)return false;
      if(/^(follow|following|subscribe|message)$/i.test(text))return false;
      return visible(span);
    });
    if(!candidates.length)return null;
    candidates.sort((a,b)=>{
      const ar=a.getBoundingClientRect();
      const br=b.getBoundingClientRect();
      const aLeaf=a.querySelector("span")?0:1;
      const bLeaf=b.querySelector("span")?0:1;
      return (bLeaf-aLeaf) || ((br.width*br.height)-(ar.width*ar.height));
    });
    return candidates[0];
  }

  function stop(element) {
    for(const animation of running.get(element) || []){
      try{animation.cancel();}catch{}
    }
    running.delete(element);
    if(element.dataset.xscapeCompatOriginal!=null){
      element.textContent=element.dataset.xscapeCompatOriginal;
      delete element.dataset.xscapeCompatOriginal;
    }
    element.className=element.className
      .replace(/\bxscape-(?:compat-fx|solid|gradient|glow|rainbow|flash|wave|pulse|fire|ice|toxic)\b/g,"")
      .replace(/\s+/g," ")
      .trim();
    delete element.dataset.xscapeCompat;
    delete element.dataset.xscapeCompatHandle;
    element.style.removeProperty("--x1");
    element.style.removeProperty("--x2");
  }

  function animate(element,keyframes,options,list) {
    try{
      const animation=element.animate(keyframes,{iterations:Infinity,fill:"both",...options});
      list.push(animation);
    }catch{}
  }

  function apply(element,handle,raw) {
    if(!raw || !settings.enabled || element.classList.contains("xscape-fx"))return stop(element);
    const effect=EFFECTS.has(String(raw.effect).toLowerCase()) ? String(raw.effect).toLowerCase() : "rainbow";
    const c1=validColor(raw.color1,"#ff3cac");
    const c2=validColor(raw.color2,"#00f5ff");
    const speed=clamp(raw.speed,.25,4,1);
    const intensity=clamp(raw.intensity,.1,1,.82);
    const sig=[handle,effect,c1,c2,speed,intensity].join("|");
    if(element.dataset.xscapeCompat===sig)return;

    stop(element);
    element.dataset.xscapeCompat=sig;
    element.dataset.xscapeCompatHandle=handle;
    element.classList.add("xscape-compat-fx",`xscape-${effect}`);
    element.style.setProperty("--x1",c1);
    element.style.setProperty("--x2",c2);
    const ms=speed*1000;
    const list=[];

    if(["gradient","rainbow","ice","toxic"].includes(effect)){
      animate(element,[{backgroundPosition:"0% 50%"},{backgroundPosition:"300% 50%"}],{duration:ms*(effect==="rainbow"?2.2:1.7),easing:"linear"},list);
    }
    if(effect==="glow"){
      animate(element,[
        {filter:`drop-shadow(0 0 2px ${c1})`,textShadow:`0 0 2px ${c1}`},
        {filter:`drop-shadow(0 0 ${8+8*intensity}px ${c2})`,textShadow:`0 0 ${5+8*intensity}px ${c2}`,offset:.5},
        {filter:`drop-shadow(0 0 2px ${c1})`,textShadow:`0 0 2px ${c1}`}
      ],{duration:ms*1.5,easing:"ease-in-out"},list);
    }
    if(effect==="flash"){
      animate(element,[
        {color:c1,textShadow:`0 0 ${6+8*intensity}px ${c1}`},
        {color:c1,offset:.45},
        {color:"#fff",offset:.49},
        {color:c2,offset:.53,textShadow:`0 0 ${6+8*intensity}px ${c2}`},
        {color:c2,offset:.96},
        {color:"#fff"}
      ],{duration:ms,easing:"steps(1,end)"},list);
    }
    if(effect==="wave"){
      const text=element.textContent || "";
      element.dataset.xscapeCompatOriginal=text;
      element.textContent="";
      [...text].forEach((letter,index)=>{
        const span=document.createElement("span");
        span.className="xscape-char";
        span.textContent=letter===" "?"\u00a0":letter;
        element.append(span);
        const amp=2.5+3.5*intensity;
        animate(span,[
          {transform:"translateY(0)",color:c1},
          {transform:`translateY(${-amp}px)`,color:c2,offset:.25},
          {transform:"translateY(0)",color:c1,offset:.5},
          {transform:`translateY(${amp*.45}px)`,color:c2,offset:.75},
          {transform:"translateY(0)",color:c1}
        ],{duration:ms*1.2,delay:-(index/Math.max(text.length,1))*ms,easing:"ease-in-out"},list);
      });
    }
    if(effect==="pulse"){
      animate(element,[
        {transform:"scale(1)",letterSpacing:"0px"},
        {transform:`scale(${1+.09*intensity})`,letterSpacing:`${.8*intensity}px`,filter:`drop-shadow(0 0 ${8+8*intensity}px ${c2})`,offset:.5},
        {transform:"scale(1)",letterSpacing:"0px"}
      ],{duration:ms*1.35,easing:"cubic-bezier(.2,.8,.25,1)"},list);
    }
    if(effect==="fire"){
      animate(element,[
        {backgroundPosition:"50% 100%",transform:"translateY(0) skewX(0)",filter:"brightness(1)"},
        {backgroundPosition:"50% 0%",transform:"translateY(-2px) skewX(1deg)",filter:"brightness(1.5)",offset:.55},
        {backgroundPosition:"50% 100%",transform:"translateY(0) skewX(0)",filter:"brightness(1)"}
      ],{duration:ms*1.2,easing:"ease-in-out"},list);
    }
    if(effect==="toxic"){
      animate(element,[
        {transform:"translate(0,0) rotate(-.3deg)"},
        {transform:"translate(1px,-1px) rotate(.4deg)",offset:.3},
        {transform:"translate(-1px,1px) rotate(-.4deg)",offset:.65},
        {transform:"translate(0,0) rotate(-.3deg)"}
      ],{duration:ms*.8,easing:"steps(2,end)"},list);
    }
    running.set(element,list);
  }

  function scan() {
    const seen=new WeakSet();
    for(const context of document.querySelectorAll(CONTEXT)){
      for(const link of context.querySelectorAll('a[href^="/"]')){
        if(seen.has(link))continue;
        seen.add(link);
        const handle=handleFromLink(link);
        if(!handle)continue;
        const candidate=nameCandidate(link,handle);
        if(candidate)apply(candidate,handle,styleFor(handle));
      }
    }
    for(const element of document.querySelectorAll(".xscape-compat-fx")){
      const link=element.closest('a[href^="/"]');
      const handle=link?handleFromLink(link):"";
      if(!element.isConnected || !handle || handle!==element.dataset.xscapeCompatHandle || element.classList.contains("xscape-fx")){
        stop(element);
      }
    }
  }

  function queue() {
    if(queued)return;
    queued=true;
    requestAnimationFrame(()=>{
      queued=false;
      scan();
    });
  }

  async function load() {
    const stored=await chrome.storage.local.get([SETTINGS_KEY,CACHE_KEY]);
    settings=merge(stored[SETTINGS_KEY]);
    const cache=stored[CACHE_KEY];
    community=cache && cache.themes && typeof cache.themes==="object" ? cache.themes : {};
    queue();
  }

  chrome.storage.onChanged.addListener((changes,area)=>{
    if(area!=="local")return;
    if(changes[SETTINGS_KEY])settings=merge(changes[SETTINGS_KEY].newValue);
    if(changes[CACHE_KEY]){
      const cache=changes[CACHE_KEY].newValue;
      community=cache && cache.themes && typeof cache.themes==="object" ? cache.themes : {};
    }
    if(changes[SETTINGS_KEY] || changes[CACHE_KEY])queue();
  });

  chrome.runtime.onMessage.addListener(message=>{
    if(message?.type==="XSCAPE_RESCAN" || message?.type==="XSCAPE_OVERLAY_REFRESH")queue();
  });

  load()
    .then(()=>new MutationObserver(queue).observe(document.documentElement,{childList:true,subtree:true,characterData:true}))
    .catch(error=>console.error("[Xscape Compat]",error));
})();
