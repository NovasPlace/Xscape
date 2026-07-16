"use strict";
import { DEFAULT_REGISTRY_URL, normalizeHandle } from "./registry-core.js";

const KEY="xscapeSettings";
const PRESETS={
  "rune-surge":{name:"Rune Surge",effect:"wave",color1:"#57d9ff",color2:"#f4c95d",speed:1.08,intensity:1},
  "party-hat":{name:"Party Hat",effect:"rainbow",color1:"#ff69d4",color2:"#57d9ff",speed:1.35,intensity:.95},
  "ice-barrage":{name:"Ice Barrage",effect:"ice",color1:"#74ddff",color2:"#737dff",speed:1.45,intensity:.92},
  "toxic-pk":{name:"Toxic PK",effect:"toxic",color1:"#76ff00",color2:"#00ffd5",speed:.68,intensity:.9},
  "infernal-cape":{name:"Infernal Cape",effect:"fire",color1:"#ff4a00",color2:"#ffd000",speed:.85,intensity:1},
  "void-pulse":{name:"Void Pulse",effect:"pulse",color1:"#8b5cf6",color2:"#a78bfa",speed:1.4,intensity:.85},
  "ancient-glow":{name:"Ancient Glow",effect:"glow",color1:"#57d9ff",color2:"#8b5cf6",speed:1.6,intensity:.85}
};
const UI_THEMES={
  "neon-rune":{bg:"#08090c",panel:"#11131a",panel2:"#171a22",field:"#0b0d12",line:"#2b2e37",muted:"#9299a5",text:"#f7f7f8",a:"#8b5cf6",b:"#22d3ee"},
  "grand-exchange":{bg:"#17110b",panel:"#25190e",panel2:"#302112",field:"#100c08",line:"#5d4528",muted:"#b9a982",text:"#fff5d6",a:"#f4c95d",b:"#79ff97"},
  "void":{bg:"#030408",panel:"#0a0c13",panel2:"#101521",field:"#05060a",line:"#242b3d",muted:"#7f8798",text:"#eef0f7",a:"#6d28d9",b:"#334155"},
  "frozen":{bg:"#06131c",panel:"#0b2230",panel2:"#102d3c",field:"#06151e",line:"#245267",muted:"#8fb8c8",text:"#effcff",a:"#74ddff",b:"#5b78ff"},
  "inferno":{bg:"#160804",panel:"#271008",panel2:"#35150a",field:"#100603",line:"#65301d",muted:"#c49a82",text:"#fff5e8",a:"#ff4a00",b:"#ffd000"},
  "toxic":{bg:"#071006",panel:"#101e0d",panel2:"#172a12",field:"#071006",line:"#315d2b",muted:"#91b98a",text:"#f0ffe9",a:"#76ff00",b:"#00ffd5"},
  "party":{bg:"#160817",panel:"#28102b",panel2:"#35133a",field:"#100611",line:"#623363",muted:"#c9a0c9",text:"#fff2ff",a:"#ff69d4",b:"#57d9ff"},
  "custom":{bg:"#08090c",panel:"#11131a",panel2:"#171a22",field:"#0b0d12",line:"#2b2e37",muted:"#9299a5",text:"#f7f7f8",a:"#8b5cf6",b:"#22d3ee"}
};
const D={
  enabled:true,demoMode:false,demoEffect:"wave",demoColor1:"#00f5ff",demoColor2:"#8b5cf6",
  demoSpeed:.92,demoIntensity:.9,communityEnabled:false,communityRegistryUrl:DEFAULT_REGISTRY_URL,
  mutedHandles:[],mutedEffects:[],profiles:{},
  uiTheme:"neon-rune",uiAccent1:"#8b5cf6",uiAccent2:"#22d3ee",uiGlass:true,uiCompact:false,uiMotion:true
};
const $=s=>document.querySelector(s);
const el={
  enabled:$("#enabled"),handle:$("#handle"),preset:$("#preset"),effect:$("#effect"),color1:$("#color1"),color2:$("#color2"),
  speed:$("#speed"),intensity:$("#intensity"),speedOut:$("#speedOut"),intensityOut:$("#intensityOut"),
  save:$("#save"),remove:$("#remove"),usePage:$("#usePage"),demoMode:$("#demoMode"),
  communityEnabled:$("#communityEnabled"),registryUrl:$("#registryUrl"),saveRegistry:$("#saveRegistry"),
  refresh:$("#refresh"),registryStatus:$("#registryStatus"),copyTheme:$("#copyTheme"),openRegistry:$("#openRegistry"),
  mutedHandles:$("#mutedHandles"),mutedEffects:$("#mutedEffects"),saveMutes:$("#saveMutes"),
  uiTheme:$("#uiTheme"),uiAccent1:$("#uiAccent1"),uiAccent2:$("#uiAccent2"),uiGlass:$("#uiGlass"),
  uiCompact:$("#uiCompact"),uiMotion:$("#uiMotion"),saveInterface:$("#saveInterface"),resetInterface:$("#resetInterface"),
  preview:$("#preview"),previewHandle:$("#previewHandle"),status:$("#status")
};
let settings={...D,profiles:{}};
let previewAnimations=[];

function merge(v){const x=v&&typeof v==="object"?v:{};return {...D,...x,profiles:x.profiles&&typeof x.profiles==="object"?x.profiles:{},mutedHandles:Array.isArray(x.mutedHandles)?x.mutedHandles:[],mutedEffects:Array.isArray(x.mutedEffects)?x.mutedEffects:[]}}
async function persist(rescan=true){await chrome.storage.local.set({[KEY]:settings});if(!rescan)return;try{const [tab]=await chrome.tabs.query({active:true,currentWindow:true});if(tab?.id)await chrome.tabs.sendMessage(tab.id,{type:"XSCAPE_RESCAN"})}catch{}}
function note(text,bad=false){el.status.textContent=text;el.status.style.color=bad?"#fca5a5":"var(--muted)";setTimeout(()=>{if(el.status.textContent===text)el.status.textContent=""},2500)}
function formStyle(){return {enabled:true,effect:el.effect.value,color1:el.color1.value,color2:el.color2.value,speed:Number(el.speed.value),intensity:Number(el.intensity.value)}}
function matchesPreset(style,preset){return style.effect===preset.effect&&style.color1.toLowerCase()===preset.color1&&style.color2.toLowerCase()===preset.color2&&Math.abs(style.speed-preset.speed)<.006&&Math.abs(style.intensity-preset.intensity)<.006}
function syncPreset(){const style=formStyle();el.preset.value=Object.entries(PRESETS).find(([,preset])=>matchesPreset(style,preset))?.[0]||"custom"}
function setForm(style={}){el.effect.value=style.effect||"wave";el.color1.value=style.color1||"#00f5ff";el.color2.value=style.color2||"#8b5cf6";el.speed.value=style.speed??.92;el.intensity.value=style.intensity??.9;syncPreset();preview()}
function editorStyle(handle){return settings.profiles[handle]||(handle==="novasplace"?PRESETS["rune-surge"]:{effect:settings.demoEffect,color1:settings.demoColor1,color2:settings.demoColor2,speed:settings.demoSpeed,intensity:settings.demoIntensity})}
function stopPreview(){for(const a of previewAnimations)try{a.cancel()}catch{};previewAnimations=[];el.preview.textContent=(normalizeHandle(el.handle.value)||"novasplace").replace(/^./,c=>c.toUpperCase());el.preview.className="fx"}
function play(target,frames,options){previewAnimations.push(target.animate(frames,{iterations:Infinity,fill:"both",...options}))}
function preview(){
  stopPreview();
  const h=normalizeHandle(el.handle.value)||"novasplace",s=formStyle(),ms=s.speed*1000;
  el.preview.textContent=h.replace(/^./,c=>c.toUpperCase());el.previewHandle.textContent="@"+h;
  el.preview.classList.add("fx-"+s.effect);el.preview.style.setProperty("--c1",s.color1);el.preview.style.setProperty("--c2",s.color2);
  el.speedOut.textContent=s.speed.toFixed(2)+"s";el.intensityOut.textContent=Math.round(s.intensity*100)+"%";
  if(["gradient","rainbow","ice","toxic"].includes(s.effect)){el.preview.style.backgroundImage=s.effect==="rainbow"?"linear-gradient(90deg,red,#ff0,#0f8,#0cf,#85f,#f0c,red)":`linear-gradient(90deg,${s.color1},#fff,${s.color2},${s.color1})`;el.preview.style.backgroundSize="300% 100%";play(el.preview,[{backgroundPosition:"0% 50%"},{backgroundPosition:"300% 50%"}],{duration:ms*1.8,easing:"linear"})}
  if(s.effect==="glow")play(el.preview,[{filter:`drop-shadow(0 0 2px ${s.color1})`},{filter:`drop-shadow(0 0 15px ${s.color2})`,offset:.5},{filter:`drop-shadow(0 0 2px ${s.color1})`}],{duration:ms*1.5});
  if(s.effect==="flash")play(el.preview,[{color:s.color1},{color:s.color1,offset:.45},{color:"#fff",offset:.49},{color:s.color2,offset:.53},{color:s.color2,offset:.96},{color:"#fff"}],{duration:ms,easing:"steps(1,end)"});
  if(s.effect==="wave"){const t=el.preview.textContent;el.preview.textContent="";[...t].forEach((c,i)=>{const span=document.createElement("span");span.textContent=c;el.preview.append(span);play(span,[{transform:"translateY(0)",color:s.color1,textShadow:`0 0 5px ${s.color1}`},{transform:"translateY(-6px) scale(1.04)",color:"#ffffff",textShadow:`0 0 12px ${s.color2}`,offset:.2},{transform:"translateY(-4px)",color:s.color2,offset:.3},{transform:"translateY(0)",color:s.color1,offset:.52},{transform:"translateY(3px)",color:s.color2,offset:.75},{transform:"translateY(0)",color:s.color1,textShadow:`0 0 5px ${s.color1}`}],{duration:ms*1.2,delay:-(i/t.length)*ms,easing:"ease-in-out"})})}
  if(s.effect==="pulse")play(el.preview,[{transform:"scale(1)"},{transform:"scale(1.1)",filter:`drop-shadow(0 0 14px ${s.color2})`,offset:.5},{transform:"scale(1)"}],{duration:ms*1.35});
  if(s.effect==="fire")play(el.preview,[{color:"#ff6a00",transform:"translateY(0)"},{color:"#ffd000",transform:"translateY(-2px)",offset:.5},{color:"#ff6a00",transform:"translateY(0)"}],{duration:ms});
}
function themeJson(){const h=normalizeHandle(el.handle.value);if(!h)throw new Error("Enter a handle first.");return JSON.stringify({[h]:formStyle()},null,2).replace('"enabled": true,\n    ',"")}
async function status(force=false){const r=await chrome.runtime.sendMessage({type:"XSCAPE_REGISTRY_STATUS",force,url:el.registryUrl.value});if(!r?.ok)throw new Error(r?.error||"Registry failed.");const s=r.status;el.registryStatus.textContent=`${s.count} theme${s.count===1?"":"s"} · ${s.fallback?"bundled fallback":s.cached?"cached":"fresh"}${s.stale?" · stale":""}${s.error?" · "+s.error:""}`;return s}
async function refreshCommunity(){await status(true);settings.registryRefreshNonce=Date.now();await persist();note("Registry refreshed and page rescanned.")}
function applyInterface(){
  const theme=UI_THEMES[settings.uiTheme]||UI_THEMES["neon-rune"];
  const custom=settings.uiTheme==="custom";
  const a=custom?settings.uiAccent1:theme.a,b=custom?settings.uiAccent2:theme.b;
  const root=document.documentElement;
  for(const [key,value] of Object.entries({...theme,a,b}))root.style.setProperty(`--${key}`,value);
  document.body.classList.toggle("glass",Boolean(settings.uiGlass));
  document.body.classList.toggle("compact",Boolean(settings.uiCompact));
  document.body.classList.toggle("motion",Boolean(settings.uiMotion));
  el.uiTheme.value=settings.uiTheme;el.uiAccent1.value=a;el.uiAccent2.value=b;
  el.uiGlass.checked=Boolean(settings.uiGlass);el.uiCompact.checked=Boolean(settings.uiCompact);el.uiMotion.checked=Boolean(settings.uiMotion);
  document.querySelectorAll("[data-ui-theme]").forEach(button=>button.classList.toggle("active",button.dataset.uiTheme===settings.uiTheme));
}
function chooseInterfaceTheme(name){
  if(!UI_THEMES[name])return;
  settings.uiTheme=name;
  const theme=UI_THEMES[name];
  if(name!=="custom"){settings.uiAccent1=theme.a;settings.uiAccent2=theme.b}
  applyInterface();
}
async function init(){
  const stored=await chrome.storage.local.get(KEY);settings=merge(stored[KEY]);applyInterface();
  el.enabled.checked=settings.enabled;el.demoMode.checked=settings.demoMode;el.communityEnabled.checked=settings.communityEnabled;
  el.registryUrl.value=settings.communityRegistryUrl;el.mutedHandles.value=settings.mutedHandles.join(", ");el.mutedEffects.value=settings.mutedEffects.join(", ");
  try{const [tab]=await chrome.tabs.query({active:true,currentWindow:true});const c=tab?.id?await chrome.tabs.sendMessage(tab.id,{type:"XSCAPE_GET_CONTEXT"}):null;if(c?.pageHandle)el.handle.value=c.pageHandle}catch{}
  const h=normalizeHandle(el.handle.value);setForm(editorStyle(h));
  if(settings.communityEnabled)status().catch(()=>{});
}
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab,.pane").forEach(x=>x.classList.remove("active"));b.classList.add("active");$("#"+b.dataset.tab).classList.add("active")});
["handle","effect","color1","color2","speed","intensity"].forEach(k=>el[k].addEventListener("input",()=>{if(k!=="handle")syncPreset();preview()}));
el.preset.onchange=async()=>{const style=PRESETS[el.preset.value];if(!style)return;setForm(style);const h=normalizeHandle(el.handle.value);if(!h)return note(style.name+" loaded. Enter a handle to apply it.");settings.profiles[h]=formStyle();await persist();note(style.name+" applied to @"+h)};
el.enabled.onchange=async()=>{settings.enabled=el.enabled.checked;await persist()};
el.demoMode.onchange=async()=>{settings.demoMode=el.demoMode.checked;Object.assign(settings,{demoEffect:el.effect.value,demoColor1:el.color1.value,demoColor2:el.color2.value,demoSpeed:Number(el.speed.value),demoIntensity:Number(el.intensity.value)});await persist();note(settings.demoMode?"Grand Exchange mode on.":"Grand Exchange mode off.")};
el.save.onclick=async()=>{const h=normalizeHandle(el.handle.value);if(!h)return note("Enter a handle.",true);settings.profiles[h]=formStyle();await persist();note("Saved @"+h)};
el.remove.onclick=async()=>{const h=normalizeHandle(el.handle.value);delete settings.profiles[h];await persist();setForm(editorStyle(h));note("Removed local override for @"+h)};
el.usePage.onclick=async()=>{try{const [tab]=await chrome.tabs.query({active:true,currentWindow:true});const c=await chrome.tabs.sendMessage(tab.id,{type:"XSCAPE_GET_CONTEXT"});if(!c?.pageHandle)throw 0;el.handle.value=c.pageHandle;setForm(editorStyle(c.pageHandle))}catch{note("Open an X profile first.",true)}};
el.communityEnabled.onchange=async()=>{settings.communityEnabled=el.communityEnabled.checked;await persist();if(settings.communityEnabled)refreshCommunity().catch(e=>note(e.message,true))};
el.saveRegistry.onclick=async()=>{try{const r=await chrome.runtime.sendMessage({type:"XSCAPE_NORMALIZE_REGISTRY_URL",url:el.registryUrl.value});if(!r?.ok)throw new Error(r?.error);settings.communityRegistryUrl=r.url;el.registryUrl.value=r.url;await chrome.runtime.sendMessage({type:"XSCAPE_CLEAR_COMMUNITY_CACHE"});await persist();await refreshCommunity();note("Registry saved.")}catch(e){note(e.message,true)}};
el.refresh.onclick=()=>refreshCommunity().catch(e=>note(e.message,true));
el.copyTheme.onclick=async()=>{try{await navigator.clipboard.writeText(themeJson());note("Theme JSON copied.")}catch(e){note(e.message,true)}};
el.openRegistry.onclick=async()=>{try{const s=await status();chrome.tabs.create({url:s.browseUrl})}catch(e){note(e.message,true)}};
el.saveMutes.onclick=async()=>{settings.mutedHandles=el.mutedHandles.value.split(",").map(normalizeHandle).filter(Boolean);settings.mutedEffects=el.mutedEffects.value.split(",").map(x=>x.trim().toLowerCase()).filter(Boolean);await persist();note("Mutes saved.")};
el.uiTheme.onchange=()=>chooseInterfaceTheme(el.uiTheme.value);
document.querySelectorAll("[data-ui-theme]").forEach(button=>button.onclick=()=>chooseInterfaceTheme(button.dataset.uiTheme));
["uiAccent1","uiAccent2"].forEach(key=>el[key].oninput=()=>{settings.uiTheme="custom";settings.uiAccent1=el.uiAccent1.value;settings.uiAccent2=el.uiAccent2.value;applyInterface()});
el.uiGlass.onchange=()=>{settings.uiGlass=el.uiGlass.checked;applyInterface()};
el.uiCompact.onchange=()=>{settings.uiCompact=el.uiCompact.checked;applyInterface()};
el.uiMotion.onchange=()=>{settings.uiMotion=el.uiMotion.checked;applyInterface()};
el.saveInterface.onclick=async()=>{await persist(false);note("Interface saved locally.")};
el.resetInterface.onclick=async()=>{Object.assign(settings,{uiTheme:D.uiTheme,uiAccent1:D.uiAccent1,uiAccent2:D.uiAccent2,uiGlass:D.uiGlass,uiCompact:D.uiCompact,uiMotion:D.uiMotion});applyInterface();await persist(false);note("Interface reset to Neon Rune.")};
init().catch(e=>note(e.message,true));
