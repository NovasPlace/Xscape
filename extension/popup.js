"use strict";
import { DEFAULT_REGISTRY_URL, normalizeHandle } from "./registry-core.js";

const KEY="xscapeSettings";
const D={
  enabled:true,demoMode:false,demoEffect:"wave",demoColor1:"#00f5ff",demoColor2:"#8b5cf6",
  demoSpeed:.92,demoIntensity:.9,communityEnabled:false,communityRegistryUrl:DEFAULT_REGISTRY_URL,
  mutedHandles:[],mutedEffects:[],profiles:{}
};
const $=s=>document.querySelector(s);
const el={
  enabled:$("#enabled"),handle:$("#handle"),effect:$("#effect"),color1:$("#color1"),color2:$("#color2"),
  speed:$("#speed"),intensity:$("#intensity"),speedOut:$("#speedOut"),intensityOut:$("#intensityOut"),
  save:$("#save"),remove:$("#remove"),usePage:$("#usePage"),demoMode:$("#demoMode"),
  communityEnabled:$("#communityEnabled"),registryUrl:$("#registryUrl"),saveRegistry:$("#saveRegistry"),
  refresh:$("#refresh"),registryStatus:$("#registryStatus"),copyTheme:$("#copyTheme"),openRegistry:$("#openRegistry"),
  mutedHandles:$("#mutedHandles"),mutedEffects:$("#mutedEffects"),saveMutes:$("#saveMutes"),
  preview:$("#preview"),previewHandle:$("#previewHandle"),status:$("#status")
};
let settings={...D,profiles:{}};
let previewAnimations=[];

function merge(v){const x=v&&typeof v==="object"?v:{};return {...D,...x,profiles:x.profiles&&typeof x.profiles==="object"?x.profiles:{},mutedHandles:Array.isArray(x.mutedHandles)?x.mutedHandles:[],mutedEffects:Array.isArray(x.mutedEffects)?x.mutedEffects:[]}}
async function persist(){await chrome.storage.local.set({[KEY]:settings});try{const [tab]=await chrome.tabs.query({active:true,currentWindow:true});if(tab?.id)await chrome.tabs.sendMessage(tab.id,{type:"XSCAPE_RESCAN"})}catch{}}
function note(text,bad=false){el.status.textContent=text;el.status.style.color=bad?"#fca5a5":"#9299a5";setTimeout(()=>{if(el.status.textContent===text)el.status.textContent=""},2500)}
function formStyle(){return {enabled:true,effect:el.effect.value,color1:el.color1.value,color2:el.color2.value,speed:Number(el.speed.value),intensity:Number(el.intensity.value)}}
function setForm(style={}){el.effect.value=style.effect||"wave";el.color1.value=style.color1||"#00f5ff";el.color2.value=style.color2||"#8b5cf6";el.speed.value=style.speed??.92;el.intensity.value=style.intensity??.9;preview()}
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
  if(s.effect==="wave"){const t=el.preview.textContent;el.preview.textContent="";[...t].forEach((c,i)=>{const span=document.createElement("span");span.textContent=c;el.preview.append(span);play(span,[{transform:"translateY(0)",color:s.color1},{transform:"translateY(-6px)",color:s.color2,offset:.25},{transform:"translateY(0)",color:s.color1,offset:.5},{transform:"translateY(3px)",color:s.color2,offset:.75},{transform:"translateY(0)",color:s.color1}],{duration:ms*1.2,delay:-(i/t.length)*ms})})}
  if(s.effect==="pulse")play(el.preview,[{transform:"scale(1)"},{transform:"scale(1.1)",filter:`drop-shadow(0 0 14px ${s.color2})`,offset:.5},{transform:"scale(1)"}],{duration:ms*1.35});
  if(s.effect==="fire")play(el.preview,[{color:"#ff6a00",transform:"translateY(0)"},{color:"#ffd000",transform:"translateY(-2px)",offset:.5},{color:"#ff6a00",transform:"translateY(0)"}],{duration:ms});
}
function themeJson(){const h=normalizeHandle(el.handle.value);if(!h)throw new Error("Enter a handle first.");return JSON.stringify({[h]:formStyle()},null,2).replace('"enabled": true,\n    ',"")}
async function status(force=false){const r=await chrome.runtime.sendMessage({type:"XSCAPE_REGISTRY_STATUS",force,url:el.registryUrl.value});if(!r?.ok)throw new Error(r?.error||"Registry failed.");const s=r.status;el.registryStatus.textContent=`${s.count} theme${s.count===1?"":"s"} · ${s.fallback?"bundled fallback":s.cached?"cached":"fresh"}${s.stale?" · stale":""}${s.error?" · "+s.error:""}`;return s}
async function init(){
  const stored=await chrome.storage.local.get(KEY);settings=merge(stored[KEY]);
  el.enabled.checked=settings.enabled;el.demoMode.checked=settings.demoMode;el.communityEnabled.checked=settings.communityEnabled;
  el.registryUrl.value=settings.communityRegistryUrl;el.mutedHandles.value=settings.mutedHandles.join(", ");el.mutedEffects.value=settings.mutedEffects.join(", ");
  try{const [tab]=await chrome.tabs.query({active:true,currentWindow:true});const c=tab?.id?await chrome.tabs.sendMessage(tab.id,{type:"XSCAPE_GET_CONTEXT"}):null;if(c?.pageHandle)el.handle.value=c.pageHandle}catch{}
  const h=normalizeHandle(el.handle.value);setForm(settings.profiles[h]||{effect:settings.demoEffect,color1:settings.demoColor1,color2:settings.demoColor2,speed:settings.demoSpeed,intensity:settings.demoIntensity});
  if(settings.communityEnabled)status().catch(()=>{});
}
document.querySelectorAll(".tab").forEach(b=>b.onclick=()=>{document.querySelectorAll(".tab,.pane").forEach(x=>x.classList.remove("active"));b.classList.add("active");$("#"+b.dataset.tab).classList.add("active")});
["handle","effect","color1","color2","speed","intensity"].forEach(k=>el[k].addEventListener("input",preview));
el.enabled.onchange=async()=>{settings.enabled=el.enabled.checked;await persist()};
el.demoMode.onchange=async()=>{settings.demoMode=el.demoMode.checked;Object.assign(settings,{demoEffect:el.effect.value,demoColor1:el.color1.value,demoColor2:el.color2.value,demoSpeed:Number(el.speed.value),demoIntensity:Number(el.intensity.value)});await persist();note(settings.demoMode?"Grand Exchange mode on.":"Grand Exchange mode off.")};
el.save.onclick=async()=>{const h=normalizeHandle(el.handle.value);if(!h)return note("Enter a handle.",true);settings.profiles[h]=formStyle();await persist();note("Saved @"+h)};
el.remove.onclick=async()=>{const h=normalizeHandle(el.handle.value);delete settings.profiles[h];await persist();note("Removed @"+h)};
el.usePage.onclick=async()=>{try{const [tab]=await chrome.tabs.query({active:true,currentWindow:true});const c=await chrome.tabs.sendMessage(tab.id,{type:"XSCAPE_GET_CONTEXT"});if(!c?.pageHandle)throw 0;el.handle.value=c.pageHandle;setForm(settings.profiles[c.pageHandle]||{})}catch{note("Open an X profile first.",true)}};
el.communityEnabled.onchange=async()=>{settings.communityEnabled=el.communityEnabled.checked;await persist();if(settings.communityEnabled)status(true).catch(e=>note(e.message,true))};
el.saveRegistry.onclick=async()=>{try{const r=await chrome.runtime.sendMessage({type:"XSCAPE_NORMALIZE_REGISTRY_URL",url:el.registryUrl.value});if(!r?.ok)throw new Error(r?.error);settings.communityRegistryUrl=r.url;el.registryUrl.value=r.url;await chrome.runtime.sendMessage({type:"XSCAPE_CLEAR_COMMUNITY_CACHE"});await persist();await status(true);note("Registry saved.")}catch(e){note(e.message,true)}};
el.refresh.onclick=()=>status(true).then(()=>note("Registry refreshed.")).catch(e=>note(e.message,true));
el.copyTheme.onclick=async()=>{try{await navigator.clipboard.writeText(themeJson());note("Theme JSON copied.")}catch(e){note(e.message,true)}};
el.openRegistry.onclick=async()=>{try{const s=await status();chrome.tabs.create({url:s.browseUrl})}catch(e){note(e.message,true)}};
el.saveMutes.onclick=async()=>{settings.mutedHandles=el.mutedHandles.value.split(",").map(normalizeHandle).filter(Boolean);settings.mutedEffects=el.mutedEffects.value.split(",").map(x=>x.trim().toLowerCase()).filter(Boolean);await persist();note("Mutes saved.")};
init().catch(e=>note(e.message,true));