(() => {
  "use strict";

  const KEY = "xscapeSettings";
  const USER = '[data-testid="User-Name"],[data-testid="UserName"]';
  const EFFECTS = new Set(["solid","gradient","glow","rainbow","flash","wave","pulse","fire","ice","toxic"]);
  const DEFAULTS = {
    enabled: true,
    demoMode: false,
    demoEffect: "rainbow",
    demoColor1: "#ff3cac",
    demoColor2: "#00f5ff",
    demoSpeed: 1,
    demoIntensity: .82,
    communityEnabled: false,
    communityRegistryUrl: "https://raw.githubusercontent.com/NovasPlace/Xscape/main/themes/community.json",
    mutedHandles: [],
    mutedEffects: [],
    profiles: {}
  };

  let settings = {...DEFAULTS, profiles:{}};
  let community = new Map();
  let scanning = false;
  let lookupTimer = 0;
  const running = new WeakMap();

  const norm = value => String(value || "").trim().replace(/^@/,"").toLowerCase().replace(/[^a-z0-9_]/g,"").slice(0,15);
  const clamp = (value,min,max,fallback) => Number.isFinite(Number(value)) ? Math.min(max,Math.max(min,Number(value))) : fallback;
  const color = (value,fallback) => /^#[0-9a-f]{6}$/i.test(String(value || "")) ? value : fallback;

  function merge(value) {
    const incoming = value && typeof value === "object" ? value : {};
    return {
      ...DEFAULTS,
      ...incoming,
      profiles: incoming.profiles && typeof incoming.profiles === "object" ? incoming.profiles : {},
      mutedHandles: Array.isArray(incoming.mutedHandles) ? incoming.mutedHandles.map(norm).filter(Boolean) : [],
      mutedEffects: Array.isArray(incoming.mutedEffects) ? incoming.mutedEffects.map(x => String(x).toLowerCase()) : []
    };
  }

  async function load() {
    const stored = await chrome.storage.local.get(KEY);
    settings = merge(stored[KEY]);
  }

  function findHandle(box) {
    for (const span of box.querySelectorAll("span")) {
      const text = (span.textContent || "").trim();
      if (/^@[A-Za-z0-9_]{1,15}$/.test(text)) return norm(text);
    }
    for (const link of box.querySelectorAll('a[href^="/"]')) {
      const match = (link.getAttribute("href") || "").match(/^\/([A-Za-z0-9_]{1,15})(?:\/|$)/);
      if (match) return norm(match[1]);
    }
    return "";
  }

  function findName(box, handle) {
    const leaves = [...box.querySelectorAll("span")].filter(span => !span.children.length);
    return leaves.find(span => {
      const text=(span.textContent || "").trim();
      const rect=span.getBoundingClientRect();
      return text && !text.startsWith("@") && text !== "·" && norm(text) !== handle && rect.width && rect.height;
    }) || null;
  }

  function stop(element) {
    for (const animation of running.get(element) || []) {
      try { animation.cancel(); } catch {}
    }
    running.delete(element);
    if (element.dataset.xscapeOriginal != null) {
      element.textContent = element.dataset.xscapeOriginal;
      delete element.dataset.xscapeOriginal;
    }
    element.className = element.className.replace(/\bxscape-[\w-]+\b/g,"").replace(/\s+/g," ").trim();
    delete element.dataset.xscape;
    delete element.dataset.xscapeHandle;
    element.style.removeProperty("--x1");
    element.style.removeProperty("--x2");
  }

  function animate(element, keyframes, options, list) {
    try {
      const animation=element.animate(keyframes,{iterations:Infinity,fill:"both",...options});
      list.push(animation);
    } catch {}
  }

  function apply(element, handle, raw) {
    if (!raw || !settings.enabled) return stop(element);
    const effect=EFFECTS.has(String(raw.effect).toLowerCase()) ? String(raw.effect).toLowerCase() : "rainbow";
    const c1=color(raw.color1,"#ff3cac");
    const c2=color(raw.color2,"#00f5ff");
    const speed=clamp(raw.speed,.25,4,1);
    const intensity=clamp(raw.intensity,.1,1,.82);
    const sig=[handle,effect,c1,c2,speed,intensity].join("|");
    if (element.dataset.xscape === sig) return;

    stop(element);
    element.dataset.xscape=sig;
    element.dataset.xscapeHandle=handle;
    element.classList.add("xscape-fx",`xscape-${effect}`);
    element.style.setProperty("--x1",c1);
    element.style.setProperty("--x2",c2);
    const ms=speed*1000;
    const list=[];

    if (effect==="gradient" || effect==="rainbow" || effect==="ice" || effect==="toxic") {
      animate(element,[{backgroundPosition:"0% 50%"},{backgroundPosition:"300% 50%"}],{duration:ms*(effect==="rainbow"?2.2:1.7),easing:"linear"},list);
    }
    if (effect==="glow") {
      animate(element,[
        {filter:`drop-shadow(0 0 2px ${c1})`,textShadow:`0 0 2px ${c1}`},
        {filter:`drop-shadow(0 0 ${8+8*intensity}px ${c2})`,textShadow:`0 0 ${5+8*intensity}px ${c2}`,offset:.5},
        {filter:`drop-shadow(0 0 2px ${c1})`,textShadow:`0 0 2px ${c1}`}
      ],{duration:ms*1.5,easing:"ease-in-out"},list);
    }
    if (effect==="flash") {
      animate(element,[
        {color:c1,textShadow:`0 0 ${6+8*intensity}px ${c1}`},
        {color:c1,offset:.45},
        {color:"#fff",offset:.49},
        {color:c2,offset:.53,textShadow:`0 0 ${6+8*intensity}px ${c2}`},
        {color:c2,offset:.96},
        {color:"#fff"}
      ],{duration:ms,easing:"steps(1,end)"},list);
    }
    if (effect==="wave") {
      const text=element.textContent || "";
      element.dataset.xscapeOriginal=text;
      element.textContent="";
      [...text].forEach((letter,index) => {
        const span=document.createElement("span");
        span.className="xscape-char";
        span.textContent=letter===" " ? "\u00a0" : letter;
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
    if (effect==="pulse") {
      animate(element,[
        {transform:"scale(1)",letterSpacing:"0px"},
        {transform:`scale(${1+.09*intensity})`,letterSpacing:`${.8*intensity}px`,filter:`drop-shadow(0 0 ${8+8*intensity}px ${c2})`,offset:.5},
        {transform:"scale(1)",letterSpacing:"0px"}
      ],{duration:ms*1.35,easing:"cubic-bezier(.2,.8,.25,1)"},list);
    }
    if (effect==="fire") {
      animate(element,[
        {backgroundPosition:"50% 100%",transform:"translateY(0) skewX(0)",filter:"brightness(1)"},
        {backgroundPosition:"50% 0%",transform:"translateY(-2px) skewX(1deg)",filter:"brightness(1.5)",offset:.55},
        {backgroundPosition:"50% 100%",transform:"translateY(0) skewX(0)",filter:"brightness(1)"}
      ],{duration:ms*1.2,easing:"ease-in-out"},list);
    }
    if (effect==="toxic") {
      animate(element,[
        {transform:"translate(0,0) rotate(-.3deg)"},
        {transform:"translate(1px,-1px) rotate(.4deg)",offset:.3},
        {transform:"translate(-1px,1px) rotate(-.4deg)",offset:.65},
        {transform:"translate(0,0) rotate(-.3deg)"}
      ],{duration:ms*.8,easing:"steps(2,end)"},list);
    }
    running.set(element,list);
  }

  function styleFor(handle) {
    const local=settings.profiles?.[handle];
    if (local && local.enabled !== false) return local;
    const shared=community.get(handle);
    if (shared && !settings.mutedHandles.includes(handle) && !settings.mutedEffects.includes(shared.effect)) return shared;
    if (settings.demoMode) return {
      effect:settings.demoEffect,color1:settings.demoColor1,color2:settings.demoColor2,
      speed:settings.demoSpeed,intensity:settings.demoIntensity
    };
    return null;
  }

  async function lookup(handles) {
    if (!settings.communityEnabled) { community.clear(); return; }
    try {
      const response=await chrome.runtime.sendMessage({type:"XSCAPE_LOOKUP_THEMES",handles:[...new Set(handles)].slice(0,100)});
      if (!response?.ok) return;
      community=new Map(Object.entries(response.themes || {}));
      queue();
    } catch {}
  }

  function scan() {
    const handles=[];
    for (const box of document.querySelectorAll(USER)) {
      const handle=findHandle(box);
      if (!handle) continue;
      handles.push(handle);
      const name=findName(box,handle);
      if (name) apply(name,handle,styleFor(handle));
    }
    clearTimeout(lookupTimer);
    lookupTimer=setTimeout(() => lookup(handles),150);
    for (const element of document.querySelectorAll(".xscape-fx")) {
      const box=element.closest(USER);
      if (!box || findHandle(box)!==element.dataset.xscapeHandle) stop(element);
    }
  }

  function queue() {
    if (scanning) return;
    scanning=true;
    requestAnimationFrame(() => { scanning=false; scan(); });
  }

  chrome.storage.onChanged.addListener((changes,area) => {
    if (area==="local" && changes[KEY]) {
      settings=merge(changes[KEY].newValue);
      community.clear();
      queue();
    }
  });

  chrome.runtime.onMessage.addListener((message,_sender,send) => {
    if (message?.type==="XSCAPE_RESCAN") { queue(); send({ok:true}); }
    if (message?.type==="XSCAPE_GET_CONTEXT") {
      const match=location.pathname.match(/^\/([A-Za-z0-9_]{1,15})(?:\/|$)/);
      send({ok:true,pageHandle:match?norm(match[1]):"",styledCount:document.querySelectorAll(".xscape-fx").length});
    }
  });

  load().then(() => {
    scan();
    new MutationObserver(queue).observe(document.documentElement,{childList:true,subtree:true,characterData:true});
  }).catch(console.error);
})();