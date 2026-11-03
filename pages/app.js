(() => {
"use strict";
const $ = id => document.getElementById(id);
const q = v => JSON.stringify(String(v ?? ""));
const bool = v => v ? "true" : "false";

let source=null, sourceText="", currentFormat="native", helperText="", cooldownTimer=null;
let bridgeUuid=crypto.randomUUID?crypto.randomUUID():"11111111-1111-4111-8111-111111111111";

const ENDPOINTS={
  cf198:"162.159.198.2",
  cf198a:"162.159.198.1",
  cf199:"162.159.199.2",
  "v6-103":"2606:4700:103::2",
  "v6-103a":"2606:4700:103::1",
  "v6-104":"2606:4700:104::2",
  "v6-104a":"2606:4700:104::1",
  bestcf0:"masque.bestcf.eu.cc",
  bestcf1:"masque1.bestcf.eu.cc",
  bestcf2:"masque2.bestcf.eu.cc"
};
const DNS_PRESETS={
  "cf-google-dual":["1.1.1.1","8.8.8.8","2606:4700:4700::1111","2001:4860:4860::8888"],
  "cf-dual":["1.1.1.1","1.0.0.1","2606:4700:4700::1111","2606:4700:4700::1001"],
  cf1:["1.1.1.1"], google8:["8.8.8.8"], quad9:["9.9.9.9"],
  "cf-google":["1.1.1.1","8.8.8.8"], "cf-quad9":["1.1.1.1","9.9.9.9"],
  "cf-pair":["1.1.1.1","1.0.0.1"], triple:["1.1.1.1","8.8.8.8","9.9.9.9"],
  "cf-backup":["1.0.0.1"], "google-backup":["8.8.4.4"], "quad9-backup":["149.112.112.112"],
  "cf-v6":["2606:4700:4700::1111"], "google-v6":["2001:4860:4860::8888"]
};

const CLASH_DOMAIN_RULESETS=[
["bilibili","https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/bilibili.mrs"],
["cn","https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/cn.mrs"],
["category-ai-!cn","https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/category-ai-!cn.mrs"],
["youtube","https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/youtube.mrs"],
["netflix","https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/netflix.mrs"],
["disney","https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/disney.mrs"],
["spotify","https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/spotify.mrs"],
["tiktok","https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/tiktok.mrs"],
["primevideo","https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/primevideo.mrs"],
["hbo","https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/hbo.mrs"],
["emby","https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/category-emby.mrs"],
["telegram","https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/telegram.mrs"],
["microsoft","https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/microsoft.mrs"],
["apple","https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/apple.mrs"],
["cloudflare","https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/cloudflare.mrs"],
["geolocation-!cn","https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/geolocation-!cn.mrs"],
["category-ads-all","https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/category-ads-all.mrs"]
];
const CLASH_IP_RULESETS=[
["private_ip","https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo-lite/geoip/private.mrs"],
["netflix_ip","https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo-lite/geoip/netflix.mrs"],
["telegram_ip","https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/telegram.mrs"],
["cloudflare_ip","https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/cloudflare.mrs"],
["cn_ip","https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo-lite/geoip/cn.mrs"],
["ad_ip","https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geoip/ad.mrs"]
];

function download(name,text,type="text/plain"){
 try{
  const b=new Blob([text],{type:type+";charset=utf-8"}),u=URL.createObjectURL(b),a=document.createElement("a");
  a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),900);
  toast(`已开始下载：${name}`,"success","下载已触发");
 }catch(e){
  toast("下载失败："+e.message,"error","下载失败");
 }
}
async function copyText(text,btn){
 try{
  await navigator.clipboard.writeText(text);
  const old=btn.textContent;btn.textContent="已复制";
  toast("内容已经复制到剪贴板。","success","复制成功");
  setTimeout(()=>btn.textContent=old,900);
 }catch(e){toast("复制失败："+e.message,"error","复制失败")}
}
function setStatus(msg,kind=""){
 const el=$("regStatus");el.className="status"+(kind?" "+kind:"");el.innerHTML='<span class="dot"></span><span></span>';el.lastChild.textContent=msg;
}
function setNotice(html,kind=""){
 const el=$("compatNotice");el.className="compat-notice"+(kind?" "+kind:"");el.innerHTML=html;
}
function hideNotice(){$("compatNotice").className="compat-notice hidden"}

let settingsDirty=false;

function toast(message,type="success",title=""){
 const stack=$("toastStack"); if(!stack)return;
 const el=document.createElement("div"); el.className=`toast ${type}`;
 const icons={success:"✅",warning:"⚠️",error:"❌",info:"ℹ️"};
 const titles={success:"操作成功",warning:"需要注意",error:"操作失败",info:"提示"};
 el.innerHTML=`<span class="toast-icon">${icons[type]||"ℹ️"}</span><div class="toast-body"><strong>${title||titles[type]||"提示"}</strong><span></span></div><button class="toast-close" type="button" aria-label="关闭">×</button>`;
 el.querySelector(".toast-body span").textContent=String(message);
 el.querySelector(".toast-close").addEventListener("click",()=>el.remove());
 stack.appendChild(el); while(stack.children.length>4)stack.firstElementChild.remove();
 setTimeout(()=>{if(el.isConnected)el.remove()},type==="error"?6500:3500);
}
function setSettingsState(state,message){
 const box=$("settingsStatus"),txt=$("settingsStatusText"),btn=$("applySettings"); if(!box||!txt||!btn)return;
 box.className=`settings-status ${state}`; txt.textContent=message; btn.classList.toggle("pending",state==="dirty");
}
function settingLabel(id){
 const el=$(id),label=el?.closest("label"),span=label?.querySelector(":scope > span"); return span?.textContent?.trim()||id;
}
function settingValueText(id){
 const el=$(id); if(!el)return ""; if(el.type==="checkbox")return el.checked?"开启":"关闭";
 if(el.tagName==="SELECT")return el.selectedOptions?.[0]?.textContent?.trim()||el.value; return el.value||"(空)";
}
function markDirty(id,showToast=true){
 settingsDirty=true; const name=settingLabel(id),value=settingValueText(id);
 setSettingsState("dirty",`已修改：${name} → ${value}；点击“应用设置并重新生成”后生效`);
 if(showToast)toast(`${name} 已改为：${value}`,"info","设置已修改");
}
function pemBody(v){return String(v||"").replace(/-----BEGIN PUBLIC KEY-----/g,"").replace(/-----END PUBLIC KEY-----/g,"").replace(/\s+/g,"").trim()}
function cidr4(v){return !v?"":String(v).includes("/")?String(v):String(v)+"/32"}
function cidr6(v){return !v?"":String(v).includes("/")?String(v):String(v)+"/128"}
function uniq(a){return [...new Set(a.filter(Boolean))]}

const CUSTOM_IP_TARGETS=new Set(["US","JP","SG","HK","TW","KR","FREE","WARP","DIRECT"]);
function normalizeCustomIpTarget(v){
 const t=String(v||"").trim().toUpperCase();
 const aliases={"免费":"FREE","免费自动":"FREE","自动":"FREE","直连":"DIRECT","美国":"US","日本":"JP","新加坡":"SG","香港":"HK","台湾":"TW","韩国":"KR"};
 return aliases[t]||t;
}
function normalizeIpCidr(v){
 let s=String(v||"").trim();
 if(!s)return "";
 if(s.includes(":"))return s.includes("/")?s:s+"/128";
 if(/^\d{1,3}(?:\.\d{1,3}){3}(?:\/\d{1,2})?$/.test(s))return s.includes("/")?s:s+"/32";
 return "";
}
function parseCustomIpRules(text){
 const rules=[],errors=[];
 String(text||"").split(/\r?\n/).forEach((raw,idx)=>{
   const line=raw.trim();
   if(!line||line.startsWith("#"))return;
   const m=line.match(/^(.+?)\s*(?:=>|,|，|\s+)\s*([^\s,，]+)\s*$/);
   if(!m){errors.push(`第 ${idx+1} 行格式错误：${line}`);return}
   const cidr=normalizeIpCidr(m[1]),target=normalizeCustomIpTarget(m[2]);
   if(!cidr){errors.push(`第 ${idx+1} 行 IP/CIDR 无效：${m[1]}`);return}
   if(!CUSTOM_IP_TARGETS.has(target)){errors.push(`第 ${idx+1} 行目标无效：${m[2]}`);return}
   rules.push({cidr,target});
 });
 return {rules,errors,countries:uniq(rules.map(r=>["US","JP","SG","HK","TW","KR"].includes(r.target)?r.target:"") )};
}
function customCountryGroup(code){
 const meta=FREE_COUNTRY_META[code]||{flag:"🌐"};
 return `${meta.flag} ${code}落地`;
}
function customIpTargetGroup(target){
 if(["US","JP","SG","HK","TW","KR"].includes(target))return customCountryGroup(target);
 if(target==="FREE")return "⚡ 免费落地自动";
 if(target==="WARP")return "🚀 WARP自动";
 return "DIRECT";
}

function parseUsque(text){
 const d=JSON.parse(text);
 if(!d.private_key||!d.endpoint_pub_key)throw new Error("config.json 缺少 private_key / endpoint_pub_key");
 if(!d.endpoint_v4&&!d.endpoint_v6&&!d.endpoint_h2_v4&&!d.endpoint_h2_v6)throw new Error("config.json 没有可用 endpoint");
 return d;
}
function enableOutputs(){
 $("subQrArea")?.classList.remove("hidden");
 ["fmtNative","fmtClash","fmtShadowrocket","fmtSingbox","fmtVless"].forEach(id=>$(id).disabled=false);
 ["downloadOriginal","showNative","copyNative","downloadNative2"].forEach(id=>$(id).disabled=false);
}
function nativeLoaded(label){
 enableOutputs();
 $("loadedFile").className="loaded-file";
 $("loadedFile").textContent="✓ "+label;
 $("filePill").className="file-pill hidden";
 updateEstimate();
 setFormat("native");
}

function selectedSni(){
 return $("sniPreset").value==="custom"?($("customSni").value.trim()||"consumer-masque.cloudflareclient.com"):$("sniPreset").value;
}
function selectedDns(){
 if($("dnsPreset").value==="custom")return uniq($("customDns").value.split(",").map(x=>x.trim()));
 return DNS_PRESETS[$("dnsPreset").value]||["1.1.1.1"];
}
function selectedMtu(){return Number($("mtuPreset").value==="custom"?$("customMtu").value:$("mtuPreset").value)||1280}

function extraEndpointList(){
 return uniq(
   String($("extraEndpoints")?.value||"")
     .split(/[\s,，;；]+/)
     .map(x=>x.trim())
 );
}

function endpointList(){
 const p=$("endpointPreset").value;
 const tests=$("includeTestEndpoints").checked;
 const extra=extraEndpointList();

 let list=[];
 if(p==="custom")list=[$("customEndpoint").value.trim()];
 else if(p==="source-auto")list=[source?.endpoint_v4,source?.endpoint_v6];
 else if(p==="auto-v4"){
   list=[source?.endpoint_v4,ENDPOINTS.cf198a,ENDPOINTS.cf198,ENDPOINTS.cf199];
 }
 else if(p==="auto-v6"){
   list=[source?.endpoint_v6,ENDPOINTS["v6-103a"],ENDPOINTS["v6-103"],ENDPOINTS["v6-104a"],ENDPOINTS["v6-104"]];
 }
 else if(p==="auto-curated"){
   // QUIC: include the measured ::1/::2 and 162.159.198.1/.2 candidates,
   // plus the account endpoints returned in config.json.
   list=[
     source?.endpoint_v4,
     source?.endpoint_v6,
     ENDPOINTS.cf198a,ENDPOINTS.cf198,
     ENDPOINTS["v6-103a"],ENDPOINTS["v6-103"],
     ENDPOINTS["v6-104a"],ENDPOINTS["v6-104"]
   ];
   // Community/test candidates remain optional because they are not guaranteed.
   if(tests)list.push(ENDPOINTS.cf199,ENDPOINTS.bestcf0,ENDPOINTS.bestcf1,ENDPOINTS.bestcf2);
 }else{
   list=[ENDPOINTS[p]];
 }

 return uniq([...list,...extra]);
}
function portList(){
 const p=$("portPreset").value;
 if(p==="recommended")return [500,4500,8095,443];
 if(p==="all")return [443,500,1701,4500,4443,8095,8443];
 if(p==="custom")return [Math.max(1,Math.min(65535,Number($("customPort").value)||443))];
 return [Number(p)||443];
}
function curatedPairs(){
 const pairs=[
  ["162.159.198.1",443],
  ["162.159.198.1",500],
  ["162.159.198.2",443],
  ["162.159.198.2",500],
  ["162.159.198.2",4500],
  ["162.159.198.2",8095],
  ["2606:4700:103::1",443],
  ["2606:4700:103::2",4500],
  ["2606:4700:104::1",500],
  ["2606:4700:104::2",443]
 ];
 if($("includeTestEndpoints").checked){
   pairs.push(
     ["162.159.199.2",443],
     ["masque.bestcf.eu.cc",500],
     ["masque1.bestcf.eu.cc",500]
   );
 }
 return pairs;
}

function targetNodeCount(){
 const mode=$("nodeCountMode")?.value||"13";
 if(mode==="custom"){
   return Math.max(1,Math.min(500,Number($("customNodeCount")?.value)||100));
 }
 return Math.max(1,Number(mode)||13);
}

function dedupePairs(pairs){
 const seen=new Set(),out=[];
 for(const pair of pairs){
   const server=String(pair?.[0]||"").trim();
   const port=Number(pair?.[1]||0);
   if(!server||!port)continue;
   const key=`${server.toLowerCase()}|${port}`;
   if(seen.has(key))continue;
   seen.add(key);
   out.push([server,port]);
 }
 return out;
}

function stableShuffle(arr){
 const out=[...arr];
 let seed=2166136261>>>0;
 const material=String($("profileName")?.value||"MASQUE-Pro")+"|"+String($("nodeTag")?.value||"CDN");
 for(let i=0;i<material.length;i++){
   seed^=material.charCodeAt(i);
   seed=Math.imul(seed,16777619)>>>0;
 }
 for(let i=out.length-1;i>0;i--){
   seed=(Math.imul(seed,1664525)+1013904223)>>>0;
   const j=seed%(i+1);
   [out[i],out[j]]=[out[j],out[i]];
 }
 return out;
}

function expandedPortList(){
 const p=$("portPreset").value;
 const target=targetNodeCount();
 if(p==="recommended" && target>13){
   return [443,500,1701,4500,4443,8095,8443];
 }
 return portList();
}

function h2Ipv4Endpoints(limit=508){
 const out=[];
 // warpscout currently treats these two /24s as the H2 IPv4 pool.
 for(const prefix of ["162.159.198","162.159.199"]){
   for(let host=1;host<=254;host++){
     out.push(`${prefix}.${host}`);
     if(out.length>=limit)return out;
   }
 }
 return out;
}

function h2ConnectionPairs(target,build){
 const ports=expandedPortList();
 const sourceH2=uniq([source?.endpoint_h2_v4,source?.endpoint_v4]);
 let endpoints=[];

 if($("h2ExtendedPool")?.checked){
   endpoints=uniq([...sourceH2,...h2Ipv4Endpoints(508),...extraEndpointList()]);
 }else{
   endpoints=uniq([...sourceH2,...extraEndpointList()]);
 }

 let pairs=[];
 if(build==="balanced"){
   for(const port of ports){
     for(const endpoint of endpoints)pairs.push([endpoint,port]);
   }
 }else{
   for(const endpoint of endpoints){
     for(const port of ports)pairs.push([endpoint,port]);
   }
 }
 pairs=dedupePairs(pairs);
 if(build==="shuffle")pairs=stableShuffle(pairs);
 return pairs.slice(0,target);
}

function connectionPairs(){
 const ep=$("endpointPreset").value;
 const pp=$("portPreset").value;
 const net=$("networkMode").value;
 const build=$("nodeBuildMode")?.value||"balanced";
 const target=targetNodeCount();

 if(net==="h2"){
   return h2ConnectionPairs(target,build);
 }

 let pairs=[];

 // 13 节点推荐模式优先保持原来的精选组合。
 if(ep==="auto-curated" && pp==="recommended"){
   pairs.push(...curatedPairs());
 }

 // 目标超过精选池时，自动扩展为 Endpoint × 常用 Port。
 if(target>pairs.length || build==="full" || build==="shuffle"){
   const eps=endpointList();
   const ports=expandedPortList();
   const expanded=[];

   if(build==="balanced"){
     // 按端口轮询 Endpoint，避免前几十个节点全部挤在同一个入口。
     for(const port of ports){
       for(const endpoint of eps)expanded.push([endpoint,port]);
     }
   }else{
     for(const endpoint of eps){
       for(const port of ports)expanded.push([endpoint,port]);
     }
   }

   pairs.push(...expanded);
 }

 if($("dedupeNodes")?.checked!==false)pairs=dedupePairs(pairs);
 if(build==="shuffle")pairs=stableShuffle(pairs);

 // 不复制相同 Endpoint:Port 来伪造节点。
 return pairs.slice(0,target);
}
function nodeName(server,port,i){
 const tag=$("nodeTag").value.trim()||"CDN",mode=$("nodeNaming").value;
 if(mode==="index")return `${tag}-MASQUE-${String(i+1).padStart(2,"0")}`;
 if(mode==="short")return `${server}:${port}`;
 return `${tag} | ${server} | ${port}`;
}
function innerIps(){
 const mode=$("innerIpMode").value;
 if(mode==="custom")return {v4:cidr4($("customInner4").value.trim()),v6:cidr6($("customInner6").value.trim())};
 return {
   v4:mode==="v6"?"":cidr4(source?.ipv4||""),
   v6:mode==="v4"?"":cidr6(source?.ipv6||"")
 };
}
function opts(){
 const customParsed=parseCustomIpRules($("customIpRoutingRules")?.value||"");
 const baseFreeCountries=[
   $("freeUS").checked?"US":"",$("freeJP").checked?"JP":"",$("freeSG").checked?"SG":"",
   $("freeHK").checked?"HK":"",$("freeTW").checked?"TW":"",$("freeKR").checked?"KR":""
 ].filter(Boolean);
 return {
  sni:selectedSni(),dns:selectedDns(),mtu:selectedMtu(),network:$("networkMode").value,
  stack:$("stackMode").value,cc:$("ccMode").value,outerCc:$("outerCc").value,bbrProfile:$("bbrProfile").value,
  handshake:Number($("handshakeTimeout").value)||0,udp:$("udpForward").checked,remoteDns:$("remoteDns").checked,
  autoSelect:$("autoSelect").checked,icons:$("showIcons").checked,adBlock:$("adBlock").checked,
  ruleMode:$("ruleMode").value,healthUrl:$("healthUrl").value,healthInterval:Number($("healthInterval").value),
  tolerance:Number($("healthTolerance").value),aiHealth:$("aiHealthMode").value,
  chatgptRoute:$("chatgptRouteMode").value,
  otherAiRoute:$("otherAiRouteMode").value,
  chatgptDirectFallback:$("chatgptDirectFallback").checked,
  egressCountries:uniq([$("egressCountry1").value,$("egressCountry2").value,$("egressCountry3").value]),
  egressChatgptFirst:$("egressChatgptFirst").checked,
  egressApplyAll:$("egressApplyAll").checked,
  enableControllerApi:$("enableControllerApi").checked,
  controllerUrl:$("controllerUrl").value.trim()||"http://127.0.0.1:9090",
  controllerSecret:$("controllerSecret").value,
  localProxyUrl:$("localProxyUrl").value.trim()||"http://127.0.0.1:7890",
  freeEnabled:$("freeEgressEnabled").checked,
  freeUseWarp:$("freeUseWarp").checked,
  freeScope:$("freeScope").value,
  freeProtocolMode:$("freeProtocolMode").value,
  freeMultiSource:$("freeMultiSource")?.checked??true,
  freeCustomSources:parseFreeCustomSources(),
  freeCountries:uniq([...baseFreeCountries,...($("customIpRoutingEnabled")?.checked?customParsed.countries:[])]),
  customIpEnabled:$("customIpRoutingEnabled")?.checked||false,
  customIpRules:customParsed.rules,
  customIpErrors:customParsed.errors,
  profile:$("profileName").value.trim()||"MASQUE-Pro"
 };
}
function controllerHostPort(url){
 try{
   const u=new URL(url);
   return {
     host:u.hostname||"127.0.0.1",
     port:Number(u.port||9090)
   };
 }catch(e){
   return {host:"127.0.0.1",port:9090};
 }
}

function egressPreferences(){
 const countries=uniq([
   $("egressCountry1").value,
   $("egressCountry2").value,
   $("egressCountry3").value
 ]);
 return {
   version:"6.5",
   preferred_countries:countries,
   chatgpt_first:$("egressChatgptFirst").checked,
   apply_all:$("egressApplyAll").checked,
   controller:$("controllerUrl").value.trim()||"http://127.0.0.1:9090",
   secret:$("controllerSecret").value,
   proxy:$("localProxyUrl").value.trim()||"http://127.0.0.1:7890"
 };
}

function buildEgressBat(){
 const cfg=egressPreferences();
 const countries=(cfg.preferred_countries||[]).join(",");
 const secretArg=cfg.secret?` --secret "${cfg.secret.replace(/"/g,'""')}"`:"";
 const preferArg=countries?` --prefer "${countries}"`:"";
 const chatArg=cfg.chatgpt_first?" --chatgpt-first":"";
 const allArg=cfg.apply_all?" --apply-all":"";
 return `@echo off
chcp 65001 >nul
title Usque WARP Egress Selector v6.5
echo ==========================================
echo   WARP 出口国家/地区检测与优选 v6.5
echo ==========================================
echo.
where python >nul 2>nul
if errorlevel 1 (
  echo [错误] 没有找到 Python。
  echo 请先安装 Python 3，并勾选 Add Python to PATH。
  pause
  exit /b 1
)
if not exist "warp-egress-selector.py" (
  echo [错误] 当前目录找不到 warp-egress-selector.py
  pause
  exit /b 1
)
echo Controller: ${cfg.controller}
echo Local Proxy: ${cfg.proxy}
echo Preferred: ${countries||"ANY"}
echo.
python "warp-egress-selector.py" --controller "${cfg.controller}" --proxy "${cfg.proxy}"${secretArg}${preferArg}${chatArg}${allArg}
echo.
echo 检测完成后会在当前目录生成 JSON 和 CSV 报告。
pause
`;
}

function updateEstimate(){
 let actual=0,target=13;
 try{
   target=targetNodeCount();
   actual=connectionPairs().length;
 }catch(e){}
 const net=$("networkMode").value;
 let shortage=actual<target?` · 唯一组合不足：${actual}/${target}`:"";
 if(actual<target && net!=="h2"){
   shortage+=" · 想要 100+ 可切换 H2 / TCP 扩展池";
 }
 $("nodeEstimate").textContent=
   `预计生成：${actual} 个节点${shortage} · ${$("networkMode").selectedOptions[0].textContent} · ${$("ruleMode").selectedOptions[0].textContent}`;
}

function makeNode(a,name,server,port,o){
 const ips=innerIps();
 const udp=o.network==="h3-l4proxy"?false:o.udp;
 a.push(
  `  - name: ${q(name)}`,"    type: masque",`    server: ${q(server)}`,`    port: ${Number(port)}`,
  `    private-key: ${q(source.private_key)}`,`    public-key: ${q(pemBody(source.endpoint_pub_key))}`
 );
 if(ips.v4)a.push(`    ip: ${q(ips.v4)}`);
 if(ips.v6)a.push(`    ipv6: ${q(ips.v6)}`);
 a.push(`    mtu: ${o.mtu}`,`    udp: ${bool(udp)}`,`    sni: ${q(o.sni)}`);
 if(o.network!=="quic")a.push(`    network: ${o.network}`);
 a.push("    ip-stack:",`      mode: ${o.stack}`,`      congestion-controller: ${o.cc}`);
 if(o.remoteDns){
   a.push("    remote-dns-resolve: true","    dns:");
   for(const d of o.dns)a.push(`      - ${q(d)}`);
 }
 if(o.outerCc){
   a.push(`    congestion-controller: ${o.outerCc}`);
   if(o.outerCc==="bbr")a.push(`    bbr-profile: ${q(o.bbrProfile)}`);
 }
 if(o.handshake)a.push(`    handshake-timeout: ${o.handshake}`);
}

function iconUrl(name){
 const base="https://raw.githubusercontent.com/Koolson/Qure/master/IconSet/Color/";
 const map={
  "自动选择":"Rocket.png","AI自动选择":"ChatGPT.png","地区优选":"Global.png","出口检测":"Speedtest.png","PROXY":"Proxy.png","AI":"ChatGPT.png","YouTube":"YouTube.png","Emby":"Emby.png","TikTok":"TikTok.png",
  "Netflix":"Netflix.png","Disney":"Disney.png","Spotify":"Spotify.png","GitHub":"GitHub.png","Telegram":"Telegram.png",
  "Google":"Google_Search.png","Twitter":"Twitter.png","Instagram":"Instagram.png","Facebook":"Facebook.png","Apple":"Apple_1.png",
  "Microsoft":"Microsoft.png","Steam":"Steam.png","Xbox":"Xbox.png","PlayStation":"PlayStation_1.png","Nintendo":"Nintendo.png",
  "Porn":"Pornhub_1.png","国外网站":"Global.png","🐟 漏网之鱼":"Final.png","Bilibili":"bilibili.png"
 };
 return base+(map[name]||"Proxy.png");
}
function groupHeader(a,name,type="select"){
 a.push(`  - name: ${q(name)}`,`    type: ${type}`);
 if(opts().icons)a.push(`    icon: ${q(iconUrl(name))}`);
}
function appendRawNodes(a,names,indent="      "){
 for(const n of names)a.push(`${indent}- ${q(n)}`);
}

function aiHealthUrl(mode){
 if(mode==="openai")return "https://openai.com/";
 return "https://chatgpt.com/";
}

const FREE_COUNTRY_META={
 US:{flag:"🇺🇸",name:"美国"},JP:{flag:"🇯🇵",name:"日本"},SG:{flag:"🇸🇬",name:"新加坡"},
 HK:{flag:"🇭🇰",name:"香港"},TW:{flag:"🇹🇼",name:"台湾"},KR:{flag:"🇰🇷",name:"韩国"}
};
function freeProviderId(code,kind="general"){return `FREE-${code}-${kind.toUpperCase()}`}
function freeProviderUrl(code){
 return `https://raw.githubusercontent.com/Au1rxx/free-vpn-subscriptions/main/output/by-country/clash-${code}.yaml`;
}
// 多源合并：主源 Au1rxx（按国家）之外，再并入 4 个公共链接源（无国家归属）。
// 与主源一样走 mihomo proxy-provider：客户端分别拉取、在同一批 url-test 组里
// 一起测活竞速。这些源是 vless/vmess/trojan/ss 等链接列表，mihomo 可直接解析。
const FREE_MIX_SOURCES=[
 {key:"ermaozi",label:"ermaozi",url:"https://raw.githubusercontent.com/ermaozi/get_subscribe/main/subscribe/v2ray.txt"},
 {key:"cbusifab",label:"cbusifabcap",url:"https://raw.githubusercontent.com/cbusifabcap/daily_free_vpn/main/Z.txt"},
 {key:"leilao",label:"LeilaoMi真测",url:"https://raw.githubusercontent.com/LeilaoMi/AutoMergePublicNodes-Optimized/main/output/global.urls"},
 {key:"aliilapro",label:"ALIILAPRO",url:"https://raw.githubusercontent.com/ALIILAPRO/v2rayNG-Config/main/sub.txt"}
];
function mixProviderId(srcKey,kind="general",prefix="FREE-MIX"){return `${prefix}-${srcKey.toUpperCase()}-${kind.toUpperCase()}`}
function appendOneMixProvider(a,o,src,kind,prefix="FREE-MIX",seg="free-mix",icon="🌐"){
 const hc=providerHealth(kind);
 const pid=mixProviderId(src.key,kind,prefix);
 a.push(
   `  ${pid}:`,
   "    type: http",
   `    url: ${q(src.url)}`,
   `    path: ${q(`./providers/${seg}-${src.key}-${kind}.yaml`)}`,
   "    interval: 3600",
   "    size-limit: 8388608"
 );
 if(o.freeUseWarp)a.push('    proxy: "WARP中转"');
 if(o.freeProtocolMode==="stable"){
   a.push('    exclude-type: "hysteria2|tuic|wireguard|http|https|socks4|socks5"');
 }
 a.push(
   "    health-check:",
   "      enable: true",
   `      url: ${q(hc.url)}`,
   `      expected-status: ${q(hc.expected)}`,
   `      interval: ${hc.interval}`,
   `      timeout: ${hc.timeout}`,
   "      lazy: false",
   "    override:",
   `      additional-prefix: ${q(`${icon} ${src.label} | `)}`
 );
 if(o.freeUseWarp)a.push('      dialer-proxy: "WARP中转"');
}
// 自定义源：面板里每行一个 http(s) 订阅地址（Clash YAML 或链接列表均可），
// 去重、去空行、最多 10 个；与内置多源走同一套 provider 生成逻辑。
function parseFreeCustomSources(){
 const raw=$("freeCustomSources")?.value||"";
 const seen=new Set(),out=[];
 for(const line of String(raw).split(/\r?\n/)){
   const url=line.trim();
   if(!/^https?:\/\/\S+$/i.test(url)||seen.has(url))continue;
   seen.add(url);
   out.push({key:String(out.length+1),label:`自定义${out.length+1}`,url});
   if(out.length>=10)break;
 }
 return out;
}
function freeForService(o,name){
 if(!o.freeEnabled||(!o.freeCountries.length&&!(o.freeCustomSources||[]).length))return false;
 const s=o.freeScope||"ai-streaming";
 if(s==="all-foreign")return name!=="Bilibili";
 if(s==="ai-only")return name==="AI";
 if(s==="streaming-only")return ["Netflix","Disney","TikTok","Spotify","PrimeVideo","HBO","Emby"].includes(name);
 return ["AI","Netflix","Disney","TikTok","Spotify","PrimeVideo","HBO","Emby"].includes(name);
}
function freeGroupEntries(name){
 if(name==="AI")return ["🤖 AI自动优选","🌍 免费落地可手动"];
 if(["Netflix","Disney","TikTok","Spotify","PrimeVideo","HBO","Emby"].includes(name))return ["🎬 流媒体自动优选","🌍 免费落地可手动"];
 return ["⚡ 免费落地自动","🌍 免费落地可手动"];
}
function providerHealth(kind){
 if(kind==="ai")return {
   url:"https://chatgpt.com/",
   expected:"200-399",
   interval:120,
   timeout:9000
 };
 if(kind==="stream")return {
   url:"https://www.netflix.com/",
   expected:"200-399",
   interval:120,
   timeout:9000
 };
 return {
   url:"https://www.gstatic.com/generate_204",
   expected:"204",
   interval:120,
   timeout:5000
 };
}
function appendOneFreeProvider(a,o,code,kind){
 const meta=FREE_COUNTRY_META[code]||{flag:"🌐",name:code};
 const hc=providerHealth(kind);
 const pid=freeProviderId(code,kind);
 a.push(
   `  ${pid}:`,
   "    type: http",
   `    url: ${q(freeProviderUrl(code))}`,
   `    path: ${q(`./providers/free-${code}-${kind}.yaml`)}`,
   "    interval: 3600",
   "    size-limit: 8388608"
 );
 if(o.freeUseWarp)a.push('    proxy: "WARP中转"');
 if(o.freeProtocolMode==="stable"){
   a.push('    exclude-type: "hysteria2|tuic|wireguard|http|https|socks4|socks5"');
 }
 a.push(
   "    health-check:",
   "      enable: true",
   `      url: ${q(hc.url)}`,
   `      expected-status: ${q(hc.expected)}`,
   `      interval: ${hc.interval}`,
   `      timeout: ${hc.timeout}`,
   "      lazy: false",
   "    override:",
   `      additional-prefix: ${q(`${meta.flag} ${code} | `)}`
 );
 if(o.freeUseWarp)a.push('      dialer-proxy: "WARP中转"');
}
function appendFreeProviders(a,o){
 if(!o.freeEnabled)return;
 if(!o.freeCountries.length&&!(o.freeCustomSources||[]).length)throw new Error("已启用免费落地，但没有选择任何国家/地区，也没有填写自定义源");
 a.push("","proxy-providers:");
 for(const code of o.freeCountries){
   // Same source, three independent health gates:
   // general = basic connectivity, ai = ChatGPT reachability, stream = Netflix reachability.
   appendOneFreeProvider(a,o,code,"general");
   appendOneFreeProvider(a,o,code,"ai");
   appendOneFreeProvider(a,o,code,"stream");
 }
 if(o.freeMultiSource){
   for(const src of FREE_MIX_SOURCES){
     appendOneMixProvider(a,o,src,"general");
     appendOneMixProvider(a,o,src,"ai");
     appendOneMixProvider(a,o,src,"stream");
   }
 }
 for(const src of o.freeCustomSources||[]){
   appendOneMixProvider(a,o,src,"general","FREE-CUSTOM","free-custom","🧩");
   appendOneMixProvider(a,o,src,"ai","FREE-CUSTOM","free-custom","🧩");
   appendOneMixProvider(a,o,src,"stream","FREE-CUSTOM","free-custom","🧩");
 }
}
function appendProviderUse(a,o,kind="general",indent="      "){
 for(const code of o.freeCountries)a.push(`${indent}- ${q(freeProviderId(code,kind))}`);
 if(o.freeMultiSource)for(const src of FREE_MIX_SOURCES)a.push(`${indent}- ${q(mixProviderId(src.key,kind))}`);
 for(const src of o.freeCustomSources||[])a.push(`${indent}- ${q(mixProviderId(src.key,kind,"FREE-CUSTOM"))}`);
}

function countryRuleName(code){
 const meta=FREE_COUNTRY_META[code]||{flag:"🌐"};
 return `${meta.flag} ${code}`;
}
function appendCountryChoices(a,o,indent="      "){
 for(const code of o.freeCountries)a.push(`${indent}- ${q(countryRuleName(code))}`);
}

function appendServiceSelector(a,name,names,o,{directFirst=false}={}){
 groupHeader(a,name);
 a.push("    proxies:");
 if(directFirst)a.push("      - DIRECT");
 if(freeForService(o,name)){
   for(const n of freeGroupEntries(name))a.push(`      - ${q(n)}`);
 }
 if(name==="AI" && o.aiHealth!=="off")a.push('      - "AI自动选择"');
 a.push('      - "地区优选"');
 if(o.autoSelect)a.push('      - "自动选择"');
 a.push('      - "PROXY"');
 appendRawNodes(a,names);
 if(!directFirst)a.push("      - DIRECT");
}

function appendCustomIpRules(a,o){
 if(!o.customIpEnabled||!o.customIpRules.length)return;
 a.push("  # Custom IP / CIDR routing");
 for(const r of o.customIpRules){
   const kind=r.cidr.includes(":")?"IP-CIDR6":"IP-CIDR";
   a.push(`  - ${kind},${r.cidr},${customIpTargetGroup(r.target)},no-resolve`);
 }
 a.push("");
}

function clashGroupsAndRules(names,o){
 const a=["","proxy-groups:"];
 const freeOn=o.freeEnabled&&(o.freeCountries.length>0||(o.freeCustomSources||[]).length>0);

 groupHeader(a,"🚀 WARP自动","url-test");
 a.push(
   "    hidden: true",
   `    url: ${q(o.healthUrl)}`,
   `    interval: ${Math.min(Number(o.healthInterval)||300,180)}`,
   `    tolerance: ${Math.min(Number(o.tolerance)||30,40)}`,
   "    timeout: 5000","    lazy: false","    max-failed-times: 2","    proxies:"
 );
 appendRawNodes(a,names);

 groupHeader(a,"🌎 WARP可手动");
 a.push("    proxies:",'      - "🚀 WARP自动"');
 appendRawNodes(a,names);

 groupHeader(a,"WARP中转");
 a.push("    hidden: true","    proxies:",'      - "🚀 WARP自动"','      - "🌎 WARP可手动"');

 if(freeOn){
   groupHeader(a,"⚡ 免费落地自动","url-test");
   a.push(
     "    hidden: true","    url: https://www.gstatic.com/generate_204","    expected-status: 204",
     "    interval: 120","    tolerance: 30","    timeout: 5000","    lazy: false","    max-failed-times: 2","    use:"
   );
   appendProviderUse(a,o,"general");

   groupHeader(a,"🤖 AI自动优选","url-test");
   a.push(
     "    hidden: true","    url: https://chatgpt.com/","    expected-status: 200-399",
     "    interval: 120","    tolerance: 30","    timeout: 9000","    lazy: false","    max-failed-times: 2","    use:"
   );
   appendProviderUse(a,o,"ai");

   groupHeader(a,"🎬 流媒体自动优选","url-test");
   a.push(
     "    hidden: true","    url: https://www.netflix.com/","    expected-status: 200-399",
     "    interval: 120","    tolerance: 30","    timeout: 9000","    lazy: false","    max-failed-times: 2","    use:"
   );
   appendProviderUse(a,o,"stream");

   groupHeader(a,"🌍 免费落地可手动");
   a.push("    proxies:",'      - "🤖 AI自动优选"','      - "🎬 流媒体自动优选"','      - "⚡ 免费落地自动"',"    use:");
   appendProviderUse(a,o,"general");

   // Only countries checked on the web panel are generated.
   for(const code of o.freeCountries){
     groupHeader(a,countryRuleName(code),"url-test");
     a.push(
       "    hidden: true",
       "    url: https://www.gstatic.com/generate_204","    expected-status: 204",
       "    interval: 120","    tolerance: 20","    timeout: 5000","    lazy: false","    max-failed-times: 2",
       "    use:",`      - ${q(freeProviderId(code,"general"))}`
     );
   }
 }

 // Reference-style common strategies
 groupHeader(a,"♻️ 自动选择","url-test");
 a.push(
   "    url: https://www.gstatic.com/generate_204","    expected-status: 204",
   "    interval: 120","    tolerance: 20","    timeout: 5000","    lazy: false","    max-failed-times: 2","    proxies:"
 );
 if(freeOn)appendCountryChoices(a,o);
 a.push('      - "🚀 WARP自动"');

 groupHeader(a,"🛡️ 故障转移","fallback");
 a.push(
   "    url: https://www.gstatic.com/generate_204","    expected-status: 204",
   "    interval: 60","    timeout: 5000","    lazy: false","    max-failed-times: 1","    proxies:"
 );
 if(freeOn)appendCountryChoices(a,o);
 a.push('      - "🚀 WARP自动"');

 groupHeader(a,"⚖️ 负载均衡","load-balance");
 a.push(
   "    strategy: consistent-hashing",
   "    url: https://www.gstatic.com/generate_204","    interval: 180","    timeout: 5000","    lazy: false"
 );
 if(freeOn){
   a.push("    use:");
   appendProviderUse(a,o,"general");
 }else{
   a.push("    proxies:",'      - "🚀 WARP自动"');
 }

 groupHeader(a,"🚀 节点选择");
 a.push("    proxies:",'      - "♻️ 自动选择"','      - "🛡️ 故障转移"','      - "⚖️ 负载均衡"');
 if(freeOn)appendCountryChoices(a,o);
 if(freeOn)a.push('      - "🌍 免费落地可手动"');
 a.push('      - "🌎 WARP可手动"','      - "🚀 WARP自动"',"      - DIRECT");

 groupHeader(a,"🎯 全球直连");
 a.push("    proxies:","      - DIRECT");

 groupHeader(a,"🛑 全球拦截");
 a.push("    proxies:","      - REJECT","      - REJECT-DROP");

 // AI
 groupHeader(a,"🤖 AI");
 a.push("    proxies:");
 if(freeOn&&freeForService(o,"AI"))a.push('      - "🤖 AI自动优选"');
 if(freeOn)appendCountryChoices(a,o);
 a.push('      - "🚀 节点选择"');
 if(freeOn)a.push('      - "🌍 免费落地可手动"');
 a.push('      - "🌎 WARP可手动"','      - "🎯 全球直连"');

 // Streaming
 groupHeader(a,"🎬 流媒体");
 a.push("    proxies:");
 if(freeOn)a.push('      - "🎬 流媒体自动优选"');
 if(freeOn)appendCountryChoices(a,o);
 a.push('      - "🚀 节点选择"');
 if(freeOn)a.push('      - "🌍 免费落地可手动"');
 a.push('      - "🌎 WARP可手动"','      - "🎯 全球直连"');

 // YouTube stays speed-first by default.
 groupHeader(a,"⚡ YouTube-WARP极速","url-test");
 a.push(
   "    hidden: true","    url: https://www.gstatic.com/generate_204","    expected-status: 204",
   "    interval: 60","    tolerance: 10","    timeout: 4000","    lazy: false","    max-failed-times: 1","    proxies:"
 );
 appendRawNodes(a,names);

 if(freeOn){
   groupHeader(a,"⚡ YouTube-免费极速","url-test");
   a.push(
     "    hidden: true","    url: https://www.gstatic.com/generate_204","    expected-status: 204",
     "    interval: 60","    tolerance: 10","    timeout: 5000","    lazy: false","    max-failed-times: 1","    use:"
   );
   appendProviderUse(a,o,"general");
 }

 groupHeader(a,"▶️ YouTube高速");
 a.push("    proxies:",'      - "⚡ YouTube-WARP极速"');
 if(freeOn){
   a.push('      - "⚡ YouTube-免费极速"');
   appendCountryChoices(a,o);
 }
 a.push('      - "🚀 节点选择"','      - "🌎 WARP可手动"','      - "🎯 全球直连"');

 // Reference-style service groups
 groupHeader(a,"✈️ 电报信息");
 a.push("    proxies:",'      - "🚀 节点选择"');
 if(freeOn)appendCountryChoices(a,o);
 a.push('      - "♻️ 自动选择"','      - "🌎 WARP可手动"','      - "🎯 全球直连"');

 groupHeader(a,"Ⓜ️ 微软服务");
 a.push("    proxies:",'      - "🎯 全球直连"','      - "🚀 节点选择"');
 if(freeOn)appendCountryChoices(a,o);
 a.push('      - "♻️ 自动选择"','      - "🌎 WARP可手动"');

 groupHeader(a,"🍎 苹果服务");
 a.push("    proxies:",'      - "🚀 节点选择"','      - "🎯 全球直连"');
 if(freeOn)appendCountryChoices(a,o);
 a.push('      - "♻️ 自动选择"','      - "🌎 WARP可手动"');

 groupHeader(a,"☁️ CloudflareCDN");
 a.push("    proxies:",'      - "🚀 节点选择"','      - "♻️ 自动选择"');
 if(freeOn)appendCountryChoices(a,o);
 a.push('      - "🌎 WARP可手动"','      - "🎯 全球直连"');

 groupHeader(a,"🌐 国外网站");
 a.push("    proxies:",'      - "🚀 WARP自动"','      - "🚀 节点选择"','      - "♻️ 自动选择"');
 if(freeOn)appendCountryChoices(a,o);
 a.push('      - "🌎 WARP可手动"','      - "🎯 全球直连"');

 groupHeader(a,"🐟 漏网之鱼");
 a.push("    proxies:",'      - "🚀 节点选择"','      - "♻️ 自动选择"');
 if(freeOn)appendCountryChoices(a,o);
 a.push('      - "🌎 WARP可手动"','      - "🎯 全球直连"');

 groupHeader(a,"PROXY");
 a.push("    hidden: true","    proxies:",'      - "🚀 节点选择"','      - "🌐 国外网站"','      - "🚀 WARP自动"',"      - DIRECT");

 if(o.ruleMode==="global"){
   a.push("","rules:","  - MATCH,🚀 节点选择","");
   return a;
 }

 if(o.ruleMode==="lite"){
   a.push(
     "","rule-providers:",
     "  cn:","    type: http","    behavior: domain","    format: mrs","    interval: 43200",
     "    url: https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/cn.mrs"
   );
   if(freeOn&&o.freeUseWarp)a.push('    proxy: "WARP中转"');
   a.push(
     "  cn_ip:","    type: http","    behavior: ipcidr","    format: mrs","    interval: 43200",
     "    url: https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo-lite/geoip/cn.mrs"
   );
   if(freeOn&&o.freeUseWarp)a.push('    proxy: "WARP中转"');
   a.push(
     "  youtube:","    type: http","    behavior: domain","    format: mrs","    interval: 43200",
     "    url: https://raw.githubusercontent.com/MetaCubeX/meta-rules-dat/meta/geo/geosite/youtube.mrs"
   );
   if(freeOn&&o.freeUseWarp)a.push('    proxy: "WARP中转"');
   a.push(
     "","rules:",
     "  - RULE-SET,youtube,▶️ YouTube高速",
     "  - RULE-SET,cn,🎯 全球直连",
     "  - RULE-SET,cn_ip,🎯 全球直连,no-resolve",
     "  - MATCH,🐟 漏网之鱼",""
   );
   return a;
 }

 a.push(
   "",
   "rule-anchor:",
   "  ip: &ip {type: http, interval: 43200, behavior: ipcidr, format: mrs}",
   "  domain: &domain {type: http, interval: 43200, behavior: domain, format: mrs}",
   "",
   "rule-providers:"
 );
 for(const [tag,url] of CLASH_DOMAIN_RULESETS){
   a.push(`  ${tag}:`,`    <<: *domain`,`    url: ${url}`);
   if(freeOn&&o.freeUseWarp)a.push('    proxy: "WARP中转"');
 }
 for(const [tag,url] of CLASH_IP_RULESETS){
   a.push(`  ${tag}:`,`    <<: *ip`,`    url: ${url}`);
   if(freeOn&&o.freeUseWarp)a.push('    proxy: "WARP中转"');
 }

 a.push("","rules:");
 if(o.adBlock){
   a.push("  - RULE-SET,category-ads-all,🛑 全球拦截","  - RULE-SET,ad_ip,🛑 全球拦截,no-resolve");
 }
 a.push(
   "  - RULE-SET,private_ip,🎯 全球直连,no-resolve",
   "",
   "  # AI",
   "  - DOMAIN-SUFFIX,chatgpt.com,🤖 AI",
   "  - DOMAIN-SUFFIX,openai.com,🤖 AI",
   "  - DOMAIN-SUFFIX,oaistatic.com,🤖 AI",
   "  - DOMAIN-SUFFIX,oaiusercontent.com,🤖 AI",
   "  - RULE-SET,category-ai-!cn,🤖 AI",
   "",
   "  # YouTube",
   "  - RULE-SET,youtube,▶️ YouTube高速",
   "",
   "  # Streaming",
   "  - RULE-SET,netflix,🎬 流媒体",
   "  - RULE-SET,netflix_ip,🎬 流媒体,no-resolve",
   "  - RULE-SET,disney,🎬 流媒体",
   "  - RULE-SET,primevideo,🎬 流媒体",
   "  - RULE-SET,hbo,🎬 流媒体",
   "  - RULE-SET,spotify,🎬 流媒体",
   "  - RULE-SET,tiktok,🎬 流媒体",
   "  - RULE-SET,emby,🎬 流媒体",
   "",
   "  # Telegram",
   "  - RULE-SET,telegram,✈️ 电报信息",
   "  - RULE-SET,telegram_ip,✈️ 电报信息,no-resolve",
   "",
   "  # Microsoft / Apple",
   "  - RULE-SET,microsoft,Ⓜ️ 微软服务",
   "  - RULE-SET,apple,🍎 苹果服务",
   "",
   "  # Cloudflare",
   "  - RULE-SET,cloudflare,☁️ CloudflareCDN",
   "  - RULE-SET,cloudflare_ip,☁️ CloudflareCDN,no-resolve",
   "",
   "  # Mainland / local",
   "  - RULE-SET,bilibili,🎯 全球直连",
   "  - RULE-SET,cn,🎯 全球直连",
   "  - RULE-SET,cn_ip,🎯 全球直连,no-resolve",
   "",
   "  # Remaining foreign / final",
   "  - RULE-SET,geolocation-!cn,🌐 国外网站",
   "  - MATCH,🐟 漏网之鱼",
   ""
 );
 return a;
}

function buildClash(){
 if(!source)throw new Error("请先加载原生 config.json");
 const o=opts(),pairs=connectionPairs(),names=[];
 if(o.customIpEnabled&&o.customIpErrors.length)throw new Error("自定义 IP 分流规则有误："+o.customIpErrors[0]);
 if(o.customIpEnabled&&!o.freeEnabled&&o.customIpRules.some(r=>["US","JP","SG","HK","TW","KR","FREE"].includes(r.target))){
   throw new Error("自定义 IP 规则使用了地区/免费出口，但免费落地节点已关闭。请启用免费落地，或把目标改成 WARP / DIRECT。");
 }
 const a=[
  `# ${o.profile} - Clash / Mihomo MASQUE v6.21 QR-Subscription`,
  "mixed-port: 7890","allow-lan: false","mode: rule","log-level: info","ipv6: true","unified-delay: true","tcp-concurrent: true","keep-alive-interval: 15","keep-alive-idle: 15"
 ];
 if(o.enableControllerApi){
   const ctl=controllerHostPort(o.controllerUrl);
   a.push(`external-controller: ${ctl.host}:${ctl.port}`,`secret: ${q(o.controllerSecret)}`);
 }
 a.push("",
  "dns:","  enable: true","  ipv6: true","  enhanced-mode: fake-ip","  listen: 0.0.0.0:7874","  fake-ip-range: 198.18.0.1/16",
  "  fake-ip-filter:",'    - "*.lan"','    - "*.local"','    - "*.arpa"','    - "*.msftncsi.com"','    - "www.msftconnecttest.com"',
  "  default-nameserver:","    - 223.5.5.5","    - 223.6.6.6",
  "  nameserver:","    - https://doh.pub/dns-query","    - https://dns.alidns.com/dns-query",
  "","proxies:"
 );
 pairs.forEach(([server,port],i)=>{const n=nodeName(server,port,i);names.push(n);makeNode(a,n,server,port,o)});
 appendFreeProviders(a,o);
 a.push(...clashGroupsAndRules(names,o));
 return a.join("\n");
}

function buildShadowrocket(){
 // Shadowrocket 2.2.90+ supports MASQUE and has improved Clash parsing.
 // Use a compact Clash-compatible YAML to avoid relying on undocumented native line syntax.
 const o=opts(),pairs=connectionPairs(),names=[];
 const a=[`# ${o.profile} - Shadowrocket 2.2.90+ MASQUE (Clash-compatible YAML)`,
 "mixed-port: 7890","mode: rule","ipv6: true","","proxies:"];
 pairs.forEach(([server,port],i)=>{const n=nodeName(server,port,i);names.push(n);makeNode(a,n,server,port,o)});
 a.push("","proxy-groups:",'  - name: "PROXY"',"    type: select","    proxies:");
 names.forEach(n=>a.push(`      - ${q(n)}`));a.push("      - DIRECT","","rules:","  - GEOIP,CN,DIRECT","  - MATCH,PROXY","");
 return a.join("\n");
}

function singRuleSet(tag,kind="geosite"){
 const repo=kind==="geosite"?"sing-geosite":"sing-geoip";
 return {type:"remote",tag:`${kind}-${tag}`,format:"binary",url:`https://raw.githubusercontent.com/SagerNet/${repo}/rule-set/${kind}-${tag}.srs`,http_client:"rule-download",update_interval:"1d"};
}
function buildSingbox(){
 const rs=[singRuleSet("category-ads-all"),singRuleSet("cn"),singRuleSet("geolocation-!cn"),singRuleSet("category-ai-!cn"),singRuleSet("youtube"),singRuleSet("google"),singRuleSet("telegram"),singRuleSet("netflix"),singRuleSet("github"),singRuleSet("private","geoip"),singRuleSet("cn","geoip")];
 return JSON.stringify({
  "$schema":"https://sing-box.sagernet.org/schema.json",
  log:{level:"info",timestamp:true},
  dns:{servers:[{type:"local",tag:"local-dns"},{type:"https",tag:"proxy-dns",server:"1.1.1.1",server_port:443,detour:"WARP-USQUE"}],rules:[{rule_set:["geosite-cn","geoip-cn"],action:"route",server:"local-dns"}],final:"proxy-dns"},
  http_clients:[{tag:"rule-download",engine:"go",version:2,detour:"direct"}],
  inbounds:[{type:"mixed",tag:"mixed-in",listen:"127.0.0.1",listen_port:2080}],
  outbounds:[{type:"socks",tag:"WARP-USQUE",server:"127.0.0.1",server_port:1080,version:"5"},{type:"direct",tag:"direct"}],
  route:{auto_detect_interface:true,default_domain_resolver:"local-dns",default_http_client:"rule-download",rule_set:rs,rules:[
   {rule_set:"geosite-category-ads-all",action:"reject"},
   {rule_set:"geoip-private",action:"route",outbound:"direct"},
   {rule_set:["geosite-cn","geoip-cn"],action:"route",outbound:"direct"},
   {rule_set:["geosite-category-ai-!cn","geosite-youtube","geosite-google","geosite-telegram","geosite-netflix","geosite-github","geosite-geolocation-!cn"],action:"route",outbound:"WARP-USQUE"}
  ],final:"WARP-USQUE"},experimental:{cache_file:{enabled:true}}
 },null,2);
}
function buildVlessBridge(){
 return JSON.stringify({"$schema":"https://sing-box.sagernet.org/schema.json",log:{level:"info",timestamp:true},
 inbounds:[{type:"vless",tag:"vless-local-in",listen:"127.0.0.1",listen_port:2081,users:[{uuid:bridgeUuid,name:"Usque-WARP-Local"}]}],
 outbounds:[{type:"socks",tag:"WARP-USQUE",server:"127.0.0.1",server_port:1080,version:"5"},{type:"direct",tag:"direct"}],route:{final:"WARP-USQUE"}},null,2);
}
function vlessUri(){return `vless://${bridgeUuid}@127.0.0.1:2081?encryption=none&type=tcp#Usque-WARP-Local-Bridge`}

function buildVlessWindowsBat(){
 return `@echo off
chcp 65001 >nul
title Usque WARP VLESS Local Bridge

echo ==========================================
echo   Usque WARP - VLESS 本地桥接启动器
echo ==========================================
echo.

if not exist "usque.exe" (
  echo [错误] 当前目录找不到 usque.exe
  echo 请把 usque.exe 放到本 BAT 同一目录。
  pause
  exit /b 1
)

if not exist "sing-box.exe" (
  echo [错误] 当前目录找不到 sing-box.exe
  echo 请把 sing-box.exe 放到本 BAT 同一目录。
  pause
  exit /b 1
)

if not exist "usque-config.json" (
  echo [错误] 当前目录找不到 usque-config.json
  pause
  exit /b 1
)

if not exist "usque-vless-bridge.json" (
  echo [错误] 当前目录找不到 usque-vless-bridge.json
  pause
  exit /b 1
)

echo [1/2] 启动 Usque SOCKS 127.0.0.1:1080...
start "Usque SOCKS" cmd /k ""%cd%\\usque.exe" -c "%cd%\\usque-config.json" socks -b 127.0.0.1 -p 1080"

timeout /t 2 /nobreak >nul

echo [2/2] 启动 sing-box VLESS 127.0.0.1:2081...
start "VLESS Bridge" cmd /k ""%cd%\\sing-box.exe" run -c "%cd%\\usque-vless-bridge.json""

echo.
echo 已启动。
echo 现在 v2rayN 中的 127.0.0.1:2081 才能正常连接/测速。
echo 两个黑色窗口都不要关闭。
pause
`;
}

function setFormat(fmt){
 if(!source)return;
 currentFormat=fmt;helperText="";resetSubQr();
 document.querySelectorAll(".format-card").forEach(x=>x.classList.remove("active"));
 ({native:"fmtNative",clash:"fmtClash",shadowrocket:"fmtShadowrocket",singbox:"fmtSingbox",vless:"fmtVless"}[fmt]&&$(({native:"fmtNative",clash:"fmtClash",shadowrocket:"fmtShadowrocket",singbox:"fmtSingbox",vless:"fmtVless"})[fmt]).classList.add("active"));
 $("downloadHelper").className="hidden";$("downloadVlessBat").className="hidden";$("runGuide").className="run-guide hidden";hideNotice();

 if(fmt==="native"){
  $("outputTitle").textContent="原生 Usque config.json";$("outputDesc").textContent="所有转换的源文件，建议优先备份。";$("mainOutput").value=sourceText;
 }
 if(fmt==="clash"){
  $("outputTitle").textContent="Clash / Mihomo 完整智能分流";$("outputDesc").textContent=`${connectionPairs().length} 个 MASQUE 节点；ChatGPT/OpenAI 当前出口：${$("chatgptRouteMode").selectedOptions[0].textContent}。`;
  $("mainOutput").value=buildClash();setNotice(
   $("chatgptRouteMode").value==="DIRECT"
   ? "<b>AI 简单模式：</b>ChatGPT/OpenAI 已单独走 DIRECT；YouTube/Netflix/Google 等仍按原 WARP 分流。无需运行 Python/BAT 出口检测器。"
   : "<b>AI 出口模式：</b>ChatGPT/OpenAI 当前使用所选 WARP/AI 策略。若仍出现 Unable to load site，可切回 DIRECT，或使用高级出口检测器筛选可用 WARP 出口。",
   "ok"
  );
 }
 if(fmt==="shadowrocket"){
  $("outputTitle").textContent="小火箭 / Shadowrocket 2.2.90+";$("outputDesc").textContent="MASQUE H3/H2 + Clash 兼容 YAML。";
  $("mainOutput").value=buildShadowrocket();setNotice("<b>Shadowrocket 2.2.90+：</b>当前版本已加入 MASQUE outbound（H3/H2）和自定义 SNI。这里导出简化 Clash-compatible YAML，减少 Mihomo 专属 rule-provider 兼容问题。","ok");
 }
 if(fmt==="singbox"){
  $("outputTitle").textContent="sing-box 官方版兼容配置";$("outputDesc").textContent="sing-box → 本机 Usque SOCKS5 → WARP MASQUE。";
  $("mainOutput").value=buildSingbox();setNotice("<b>官方 sing-box 当前没有 MASQUE outbound。</b>因此这里使用本地 Usque SOCKS5 作为真实上游，不伪造不存在的 type: masque。");
  $("runGuide").className="run-guide";$("runCommands").textContent=`1) 启动 Usque SOCKS:\nWindows: usque.exe -c usque-config.json socks -b 127.0.0.1 -p 1080\nLinux/macOS: ./usque -c usque-config.json socks -b 127.0.0.1 -p 1080\n\n2) sing-box run -c sing-box-usque.json`;
 }
 if(fmt==="vless"){
  $("outputTitle").textContent="VLESS 本地桥接链接";$("outputDesc").textContent="VLESS → sing-box 本地 inbound → Usque SOCKS → WARP MASQUE。";
  $("mainOutput").value=vlessUri();helperText=buildVlessBridge();$("downloadHelper").className="";$("downloadHelper").textContent="下载 VLESS 桥接 JSON";
  $("downloadVlessBat").className="";$("downloadVlessBat").textContent="下载 Windows 一键启动 BAT";
  setNotice("<b>为什么直接测速是 -1：</b>这个节点地址是 127.0.0.1:2081，只在你的电脑本地有效。必须先启动 Usque SOCKS 和 sing-box Bridge，让 1080/2081 端口开始监听；只导入 vless:// 而不启动桥接，v2rayN 一定显示 -1。");
  $("compatNotice").classList.add("local-bridge-warning");
  $("runGuide").className="run-guide";$("runCommands").textContent=`Windows 最简单：\n1) 下载 usque-config.json\n2) 下载 usque-vless-bridge.json\n3) 下载 Windows 一键启动 BAT\n4) 把 usque.exe、sing-box.exe 和这 3 个文件放在同一文件夹\n5) 双击 BAT\n6) 两个窗口都运行后，再在 v2rayN 测速 127.0.0.1:2081\n\n手动启动：\nusque.exe -c usque-config.json socks -b 127.0.0.1 -p 1080\nsing-box.exe run -c usque-vless-bridge.json`;
 }
 const ok=!!$("mainOutput").value;$("copyMain").disabled=!ok;$("downloadMain").disabled=!ok;
}

function loadSource(text,label){
 source=parseUsque(text);sourceText=JSON.stringify(source,null,2);enableOutputs();nativeLoaded(label);
 $("regSummary").classList.remove("hidden");$("regSummary").textContent=`已加载：${label}\nendpoint_v4: ${source.endpoint_v4||"(无)"}\nendpoint_v6: ${source.endpoint_v6||"(无)"}\nipv4: ${source.ipv4||"(无)"}\nipv6: ${source.ipv6||"(无)"}`;
 setStatus("原生 config.json 已加载，可以直接自定义和转换。","ok");
 settingsDirty=false;setSettingsState("clean","原生配置加载成功，当前设置已应用");
 toast(`已加载 ${label}，无需重新注册。`,"success","原生配置加载成功");
}

async function register(){
 if(!$("regTos").checked){setStatus("请先勾选条款确认框","error");return}
 if(!window.UsqueRegister){setStatus("注册模块未加载","error");return}
 $("regStart").disabled=true;
 try{
  const d=await window.UsqueRegister.registerDevice({deviceName:$("regDeviceName").value.trim()||"Web-Usque",onStep:(n,msg)=>setStatus(`步骤 ${n}/4：${msg}`,"working")});
  source=d;sourceText=JSON.stringify(d,null,2);enableOutputs();nativeLoaded("网页注册生成的 usque-config.json");
  $("regSummary").classList.remove("hidden");$("regSummary").textContent=`注册成功\nendpoint_v4: ${d.endpoint_v4||"(无)"}\nendpoint_v6: ${d.endpoint_v6||"(无)"}\nipv4: ${d.ipv4||"(无)"}\nipv6: ${d.ipv6||"(无)"}`;
  setStatus("注册成功！已先生成原生 config.json。保存后以后无需再次注册。","ok");
  settingsDirty=false;setSettingsState("clean","注册成功，当前设置已应用");
  toast("Usque 注册成功，原生 config.json 已生成。","success","注册成功");
  $("regStart").textContent="✅ 本次注册完成";
  if($("autoDownloadConfig").checked)setTimeout(()=>download("usque-config.json",sourceText,"application/json"),180);
 }catch(e){
  if(e?.status===429||e?.code===1015||/1015|rate.?limit|限流/i.test(String(e?.message||""))){startCooldown(e?.retryAfter||30);return}
  setStatus("注册失败："+e.message,"error");toast("注册失败："+e.message,"error","注册失败");$("regStart").disabled=false;
 }
}
function startCooldown(seconds){
 let left=Math.max(1,Number(seconds)||30);const b=$("regStart");b.disabled=true;if(cooldownTimer)clearInterval(cooldownTimer);
 toast(`Cloudflare 注册接口触发限流，请等待约 ${left} 秒后再试。`,"warning","接口限流");
 const tick=()=>{b.textContent=`⏳ 限流中，${left} 秒后可重试`;setStatus(`Cloudflare WARP 注册接口限流，请等待 ${left} 秒。`,"error");left--;if(left<0){clearInterval(cooldownTimer);cooldownTimer=null;b.textContent="🚀 一键注册";b.disabled=false;setStatus("等待结束，可以手动再试一次。","")}};
 tick();cooldownTimer=setInterval(tick,1000);
}

function selectedFreeLabels(){
 return [
  $("freeUS").checked?"US":"",
  $("freeJP").checked?"JP":"",
  $("freeSG").checked?"SG":"",
  $("freeHK").checked?"HK":"",
  $("freeTW").checked?"TW":"",
  $("freeKR").checked?"KR":""
 ].filter(Boolean);
}
function updateCustomIpRoutingHint(){
 const enabled=$("customIpRoutingEnabled")?.checked;
 const box=$("customIpRoutingHint"); if(!box)return;
 if(!enabled){box.className="custom-ip-hint";box.textContent="当前未启用自定义 IP 分流。";return}
 const p=parseCustomIpRules($("customIpRoutingRules")?.value||"");
 if(p.errors.length){box.className="custom-ip-hint error";box.textContent="⚠ "+p.errors[0];return}
 const regions=p.countries.length?`；涉及地区：${p.countries.join(" / ")}`:"";
 box.className="custom-ip-hint ok";
 box.textContent=`✅ 已识别 ${p.rules.length} 条自定义 IP/CIDR 规则${regions}。应用后这些规则优先于通用分流。`;
}

function updateFreeEgressHint(){
 const enabled=$("freeEgressEnabled").checked;
 const countries=selectedFreeLabels();
 const scope=$("freeScope").selectedOptions?.[0]?.textContent||$("freeScope").value;
 const chain=$("freeUseWarp").checked?"订阅下载 + 节点连接均经 WARP/MASQUE":"直接下载 / 直接连接免费节点";
 $("freeEgressHint").textContent=enabled
   ?`已启用：${scope}；地区：${countries.join(" / ")||"未选择"}；${chain}。`
   :`当前未启用：生成结果与原版一致。启用后 Clash 会自动拉取所选地区的公开免费节点。`;
}

function updateChatgptRouteHint(){
 const mode=$("chatgptRouteMode").value;
 const labels={
   "DIRECT":"DIRECT 直连",
   "AI自动选择":"WARP · AI 自动选择",
   "地区优选":"WARP · 地区优选",
   "PROXY":"WARP · PROXY",
   "AI":"AI 策略组"
 };
 const other=$("otherAiRouteMode").selectedOptions?.[0]?.textContent||$("otherAiRouteMode").value;
 $("chatgptRouteHint").textContent=
   `当前：ChatGPT/OpenAI → ${labels[mode]||mode}；其它 AI → ${other}。`+
   (mode==="DIRECT"?" 这是最简单方案，不需要运行出口检测脚本。":"");
}

function resetRecommended(){
 $("endpointPreset").value="auto-curated";$("portPreset").value="recommended";$("sniPreset").value="www.microsoft.com";$("dnsPreset").value="cf-google-dual";
 $("innerIpMode").value="dual";$("networkMode").value="quic";$("stackMode").value="auto";$("ccMode").value="cubic";$("outerCc").value="";$("bbrProfile").value="standard";
 $("mtuPreset").value="1280";$("handshakeTimeout").value="0";$("ruleMode").value="smart";$("healthUrl").value="http://cp.cloudflare.com/generate_204";
 $("healthInterval").value="300";$("healthTolerance").value="30";$("aiHealthMode").value="chatgpt";
 $("chatgptRouteMode").value="DIRECT";$("otherAiRouteMode").value="AI";$("chatgptDirectFallback").checked=true;
 $("egressCountry1").value="";$("egressCountry2").value="";$("egressCountry3").value="";
 $("controllerUrl").value="http://127.0.0.1:9090";$("controllerSecret").value="";$("localProxyUrl").value="http://127.0.0.1:7890";
 $("egressChatgptFirst").checked=true;$("egressApplyAll").checked=false;$("enableControllerApi").checked=true;
 $("nodeTag").value="CDN";$("profileName").value="MASQUE-Pro";$("nodeCountMode").value="13";$("customNodeCount").value="100";$("nodeBuildMode").value="balanced";$("extraEndpoints").value="";$("nodeNaming").value="detail";
 $("udpForward").checked=true;$("remoteDns").checked=true;$("autoSelect").checked=true;$("showIcons").checked=true;$("adBlock").checked=true;$("includeTestEndpoints").checked=true;$("dedupeNodes").checked=true;$("h2ExtendedPool").checked=true;
 $("freeEgressEnabled").checked=true;$("freeUseWarp").checked=true;$("freeScope").value="ai-streaming";$("freeProtocolMode").value="stable";$("freeMultiSource").checked=true;$("freeCustomSources").value="";
 $("freeUS").checked=true;$("freeJP").checked=true;$("freeSG").checked=true;$("freeHK").checked=false;$("freeTW").checked=false;$("freeKR").checked=false;
 $("customIpRoutingEnabled").checked=false;$("customIpRoutingRules").value="";
 syncConditional();updateEstimate();updateFreeEgressHint();updateCustomIpRoutingHint();
}
function preset(name){
 resetRecommended();
 document.querySelectorAll(".preset").forEach(x=>x.classList.remove("active"));
 if(name==="recommended")$("presetRecommended").classList.add("active");
 if(name==="ipv4"){$("endpointPreset").value="auto-v4";$("presetIpv4").classList.add("active")}
 if(name==="ipv6"){$("endpointPreset").value="auto-v6";$("innerIpMode").value="v6";$("presetIpv6").classList.add("active")}
 if(name==="all"){$("endpointPreset").value="auto-curated";$("portPreset").value="all";$("nodeCountMode").value="64";$("nodeBuildMode").value="balanced";$("presetAll").classList.add("active")}
 if(name==="h2"){$("endpointPreset").value="source-auto";$("portPreset").value="all";$("networkMode").value="h2";$("nodeCountMode").value="100";$("h2ExtendedPool").checked=true;$("presetH2").classList.add("active")}
 syncConditional();updateEstimate();settingsDirty=true;setSettingsState("dirty","预设已载入，点击“应用设置并重新生成”后生效");
 const presetNames={recommended:"新手推荐",ipv4:"IPv4 稳定",ipv6:"IPv6 优先",all:"全节点测速",h2:"H2 备用"};
 toast(`已载入“${presetNames[name]||name}”预设。`,"info","预设已切换");
}
function syncConditional(){
 $("customEndpointWrap").className=$("endpointPreset").value==="custom"?"":"hidden";
 $("customPortWrap").className=$("portPreset").value==="custom"?"":"hidden";
 $("customSniWrap").className=$("sniPreset").value==="custom"?"":"hidden";
 $("customDnsWrap").className=$("dnsPreset").value==="custom"?"":"hidden";
 const ci=$("innerIpMode").value==="custom";
 $("customInner4Wrap").className=ci?"":"hidden";$("customInner6Wrap").className=ci?"":"hidden";
 $("customMtuWrap").className=$("mtuPreset").value==="custom"?"":"hidden";
 $("customNodeCountWrap").className=$("nodeCountMode").value==="custom"?"":"hidden";
 if($("networkMode").value==="h3-l4proxy")$("udpForward").checked=false;
}

const selectSettingIds=["freeEgressEnabled","freeUseWarp","freeScope","freeProtocolMode","freeMultiSource","freeUS","freeJP","freeSG","freeHK","freeTW","freeKR","customIpRoutingEnabled","endpointPreset","portPreset","sniPreset","dnsPreset","innerIpMode","networkMode","stackMode","ccMode","outerCc","bbrProfile","mtuPreset","handshakeTimeout","ruleMode","healthUrl","healthInterval","healthTolerance","aiHealthMode","chatgptRouteMode","otherAiRouteMode","chatgptDirectFallback","egressCountry1","egressCountry2","egressCountry3","egressChatgptFirst","egressApplyAll","enableControllerApi","nodeCountMode","nodeBuildMode","nodeNaming","udpForward","remoteDns","autoSelect","showIcons","adBlock","includeTestEndpoints","dedupeNodes","h2ExtendedPool"];
selectSettingIds.forEach(id=>$(id).addEventListener("change",()=>{
 syncConditional();updateEstimate();
 if(id==="chatgptRouteMode"||id==="otherAiRouteMode")updateChatgptRouteHint();
 if(["freeEgressEnabled","freeUseWarp","freeScope","freeProtocolMode","freeUS","freeJP","freeSG","freeHK","freeTW","freeKR"].includes(id))updateFreeEgressHint();
 if(id==="customIpRoutingEnabled")updateCustomIpRoutingHint();
 markDirty(id,true);
 if(id==="nodeCountMode"){
   const target=targetNodeCount(),actual=connectionPairs().length;
   if(actual<target){
     toast(`目标 ${target} 个节点，但当前只有 ${actual} 个唯一 Endpoint × Port 组合。可在“附加 Endpoint”中增加入口。`,"warning","节点数量受限");
   }else{
     toast(`节点数量模式已切换：应用后生成 ${actual} 个节点。`,"info","节点模式");
   }
 }
}));
const textSettingIds=["freeCustomSources","customIpRoutingRules","customEndpoint","customPort","customSni","customDns","customInner4","customInner6","customMtu","customNodeCount","extraEndpoints","controllerUrl","controllerSecret","localProxyUrl","nodeTag","profileName"];
textSettingIds.forEach(id=>$(id).addEventListener("change",()=>{
 if(id==="customIpRoutingRules")updateCustomIpRoutingHint();
 updateEstimate();
 markDirty(id,true);
}));

$("presetRecommended").addEventListener("click",()=>preset("recommended"));
$("presetIpv4").addEventListener("click",()=>preset("ipv4"));
$("presetIpv6").addEventListener("click",()=>preset("ipv6"));
$("presetAll").addEventListener("click",()=>preset("all"));
$("presetH2").addEventListener("click",()=>preset("h2"));
$("resetSettings").addEventListener("click",()=>{resetRecommended();settingsDirty=true;setSettingsState("dirty","已恢复推荐设置，点击“应用设置并重新生成”后生效");toast("所有高级设置已恢复为推荐值。","success","恢复成功")});
$("applySettings").addEventListener("click",()=>{
 if(!source){setStatus("请先注册或导入 config.json","error");setSettingsState("error","应用失败：尚未加载原生 config.json");toast("请先注册 Usque 或导入已有 config.json。","error","无法应用设置");return}
 try{
  const target=currentFormat==="native"?"clash":currentFormat;setFormat(target);
  const n=connectionPairs().length,targetCount=targetNodeCount();settingsDirty=false;
  const landing=$("freeEgressEnabled").checked?` · 免费落地 ${selectedFreeLabels().join("/")||"未选地区"}`:" · WARP-only";
  setSettingsState("clean",`✅ 设置已成功应用 · ${n} 个 WARP 节点${landing}`);
  if(n<targetCount){
    toast(`设置已应用。目标 ${targetCount} 个，当前可生成 ${n} 个唯一节点；没有复制重复节点。`,"warning","重新生成完成");
  }else{
    toast(`设置已应用并重新生成成功，共 ${n} 个节点。`,"success","重新生成成功");
  }
  const b=$("applySettings"),old=b.textContent;b.textContent="✅ 已应用";setTimeout(()=>b.textContent=old,1200);
 }catch(e){setSettingsState("error","应用失败："+e.message);toast("重新生成失败："+e.message,"error","设置应用失败")}
});

$("regStart").addEventListener("click",register);
$("downloadOriginal").addEventListener("click",()=>sourceText&&download("usque-config.json",sourceText,"application/json"));
$("copyCli").addEventListener("click",()=>copyText("./usque register",$("copyCli")));
$("showNative").addEventListener("click",()=>source&&setFormat("native"));
$("copyNative").addEventListener("click",()=>sourceText&&copyText(sourceText,$("copyNative")));
$("downloadNative2").addEventListener("click",()=>sourceText&&download("usque-config.json",sourceText,"application/json"));

async function filePicked(f){if(!f)return;try{loadSource(await f.text(),f.name)}catch(e){setStatus("读取失败："+e.message,"error");toast("配置文件读取失败："+e.message,"error","导入失败")}}
$("masqueFile").addEventListener("change",e=>filePicked(e.target.files?.[0]));
$("masqueFileTop").addEventListener("change",e=>filePicked(e.target.files?.[0]));
const drop=$("configDrop");
["dragenter","dragover"].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.style.borderColor="#64ded5"}));
["dragleave","drop"].forEach(ev=>drop.addEventListener(ev,e=>{e.preventDefault();drop.style.borderColor=""}));
drop.addEventListener("drop",e=>filePicked(e.dataTransfer.files?.[0]));

$("fmtNative").addEventListener("click",()=>{setFormat("native");toast("已切换到原生 Usque config.json。","success","格式已生成")});
$("fmtClash").addEventListener("click",()=>{try{setFormat("clash");toast(`Clash / Mihomo 配置已生成，共 ${connectionPairs().length} 个节点。`,"success","格式已生成")}catch(e){toast(e.message,"error","生成失败")}});
$("fmtShadowrocket").addEventListener("click",()=>{try{setFormat("shadowrocket");toast(`Shadowrocket 配置已生成，共 ${connectionPairs().length} 个节点。`,"success","格式已生成")}catch(e){toast(e.message,"error","生成失败")}});
$("fmtSingbox").addEventListener("click",()=>{try{setFormat("singbox");toast("sing-box 兼容配置已生成。","success","格式已生成")}catch(e){toast(e.message,"error","生成失败")}});
$("fmtVless").addEventListener("click",()=>{try{setFormat("vless");toast("VLESS 本地桥接配置已生成。","success","格式已生成")}catch(e){toast(e.message,"error","生成失败")}});
function resetSubQr(){
 $("subQrPanel")?.classList.add("hidden");
 $("subQrError")?.classList.add("hidden");
}
const PERM_SUB_KEY="usque.permSub.v1";
function loadPermSub(){try{const v=JSON.parse(localStorage.getItem(PERM_SUB_KEY)||"null");return v&&/^[a-f0-9]{48}$/.test(v.token||"")?v:null;}catch{return null;}}
function savePermSub(v){try{if(v)localStorage.setItem(PERM_SUB_KEY,JSON.stringify(v));else localStorage.removeItem(PERM_SUB_KEY);}catch{}}
function permSubUrl(token){return `${location.origin}/sub/${token}`;}
function renderPermSubBox(){
 const box=$("permSubBox");if(!box)return;
 const perm=loadPermSub();
 if(!perm){box.classList.add("hidden");return;}
 const link=$("permSubLink"),url=permSubUrl(perm.token);
 link.href=url;link.textContent=url;
 box.classList.remove("hidden");
}
function permMsg(text,isError){
 const m=$("permSubMsg");if(!m)return;
 m.textContent=text;m.style.color=isError?"#ff9c9c":"";m.classList.remove("hidden");
}
function showSubQr(url,tier){
 const payload=currentFormat==="clash"?`clash://install-config?url=${encodeURIComponent(url)}`:url;
 const qr=qrcode(0,"M");qr.addData(payload);qr.make();
 $("subQrBox").innerHTML=qr.createSvgTag({cellSize:5,margin:10,scalable:true});
 const link=$("subQrLink");link.href=url;link.textContent=url;
 $("subQrValidity").textContent=tier==="perm"?"订阅链接（常驻，长期有效）：":tier==="7d"?"订阅链接（7 天内有效）：":"订阅链接（24 小时内有效）：";
 const base=currentFormat==="clash"
   ?"用 Clash Verge / FlClash 等客户端扫码会直接弹出导入订阅；也可以在手机上打开订阅链接下载文件再导入。"
   :"用手机扫码或打开订阅链接即可下载这个配置文件，再导入对应客户端。";
 $("subQrTip").textContent=base+(tier==="perm"?" 这是常驻链接：以后换配置在下方「我的常驻订阅」点「更新为当前配置」即可，链接和二维码都不变。":tier==="7d"?" 链接 7 天后自动失效。":" 链接 24 小时后自动失效。");
 $("subQrPanel").classList.remove("hidden");
}
async function subApi(path,body){
 const res=await fetch(path,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
 const data=await res.json().catch(()=>({}));
 if(!res.ok)throw new Error(data.message||`操作失败（HTTP ${res.status}）`);
 return data;
}
async function makeSubQr(){
 const btn=$("makeSubQr"),err=$("subQrError"),panel=$("subQrPanel");
 const content=$("mainOutput").value;
 const tier=$("subTier")?.value||"24h";
 err.classList.add("hidden");panel.classList.add("hidden");
 if(!content){err.textContent="先注册或导入 config.json 生成配置，再生成二维码。";err.classList.remove("hidden");return;}
 btn.disabled=true;btn.textContent="正在生成…";
 try{
  const perm=loadPermSub();
  if(tier==="perm"&&perm){
   try{
    await subApi("/api/sub/update",{token:perm.token,format:currentFormat,content});
   }catch(e){
    if(!/不存在|已过期/.test(String((e&&e.message)||e)))throw e;
    savePermSub(null);
    const data=await subApi("/api/sub",{format:currentFormat,content,tier:"perm"});
    if(data.token)savePermSub({token:data.token,format:currentFormat});
    showSubQr(data.url,"perm");
    renderPermSubBox();
    return;
   }
   savePermSub({token:perm.token,format:currentFormat});
   showSubQr(permSubUrl(perm.token),"perm");
  }else{
   const data=await subApi("/api/sub",{format:currentFormat,content,tier});
   if(!data.url)throw new Error("生成失败：后端没有返回链接。");
   if(tier==="perm"&&data.token)savePermSub({token:data.token,format:currentFormat});
   showSubQr(data.url,tier);
  }
  renderPermSubBox();
 }catch(e){
  err.textContent=String((e&&e.message)||e);
  err.classList.remove("hidden");
 }finally{
  btn.disabled=false;btn.textContent="📱 扫码获取订阅（生成二维码）";
 }
}
$("makeSubQr")?.addEventListener("click",makeSubQr);
async function permSubUpdate(){
 const perm=loadPermSub();if(!perm)return;
 const content=$("mainOutput").value;
 if(!content){permMsg("先注册或导入 config.json 生成配置，再点更新。",true);return;}
 try{
  await subApi("/api/sub/update",{token:perm.token,format:currentFormat,content});
  savePermSub({token:perm.token,format:currentFormat});
  showSubQr(permSubUrl(perm.token),"perm");
  permMsg("已更新：常驻链接不变，内容已换成当前配置。客户端里点一次「更新订阅」即可。",false);
 }catch(e){
  permMsg(String((e&&e.message)||e),true);
  if(/不存在|已过期/.test(String((e&&e.message)||e))){savePermSub(null);renderPermSubBox();}
 }
}
async function permSubRotate(){
 const perm=loadPermSub();if(!perm)return;
 try{
  const data=await subApi("/api/sub/rotate",{token:perm.token});
  if(!data.token)throw new Error("轮换失败：后端没有返回新链接。");
  savePermSub({token:data.token,format:perm.format});
  renderPermSubBox();
  showSubQr(data.url||permSubUrl(data.token),"perm");
  permMsg("已轮换：旧链接立即失效，请用新链接或新二维码重新导入一次。",false);
 }catch(e){permMsg(String((e&&e.message)||e),true);}
}
async function permSubRevoke(){
 const perm=loadPermSub();if(!perm)return;
 try{await subApi("/api/sub/revoke",{token:perm.token});}catch(e){/* 后端记录已不存在时同样清掉本地 */}
 savePermSub(null);renderPermSubBox();resetSubQr();
 toast("常驻订阅已删除，链接立即失效。","success","已删除");
}
$("permSubUpdate")?.addEventListener("click",permSubUpdate);
$("permSubRotate")?.addEventListener("click",permSubRotate);
$("permSubRevoke")?.addEventListener("click",permSubRevoke);
renderPermSubBox();
$("copyMain").addEventListener("click",()=>copyText($("mainOutput").value,$("copyMain")));
$("downloadMain").addEventListener("click",()=>{
 if(currentFormat==="native")download("usque-config.json",$("mainOutput").value,"application/json");
 if(currentFormat==="clash")download("masque-clash-smart.yaml",$("mainOutput").value,"text/yaml");
 if(currentFormat==="shadowrocket")download("masque-shadowrocket.yaml",$("mainOutput").value,"text/yaml");
 if(currentFormat==="singbox")download("sing-box-usque.json",$("mainOutput").value,"application/json");
 if(currentFormat==="vless")download("usque-vless-local.txt",$("mainOutput").value,"text/plain");
});
$("downloadHelper").addEventListener("click",()=>{if(currentFormat==="vless"&&helperText)download("usque-vless-bridge.json",helperText,"application/json")});
$("downloadVlessBat").addEventListener("click",()=>{if(currentFormat==="vless")download("start-usque-vless-windows.bat",buildVlessWindowsBat(),"text/plain")});

$("downloadEgressScanner").addEventListener("click",()=>{
  window.location.href="./warp-egress-selector.py?v=65";
  toast("出口检测脚本下载已触发。","success","下载已触发");
});
$("downloadEgressBat").addEventListener("click",()=>{
  download("run-warp-egress-selector.bat",buildEgressBat(),"text/plain");
});
$("downloadEgressConfig").addEventListener("click",()=>{
  download("warp-egress-preference.json",JSON.stringify(egressPreferences(),null,2),"application/json");
});

resetRecommended();syncConditional();updateEstimate();updateFreeEgressHint();updateCustomIpRoutingHint();setSettingsState("clean","当前设置已应用");
})();