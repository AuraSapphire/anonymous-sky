const SUPABASE_URL="https://ffzhwsxmfxojrhszumwa.supabase.co";
const SUPABASE_KEY="sb_publishable_oYyJcQpOVta7i1vstZvhzA_EfRzQNsr";
const rest=SUPABASE_URL+"/rest/v1/messages";
const headers={"apikey":SUPABASE_KEY,"Authorization":"Bearer "+SUPABASE_KEY};
const grid=document.getElementById("feedGrid"),input=document.getElementById("messageInput"),counter=document.getElementById("counter");
const music=document.getElementById("bgMusic"),playBtn=document.getElementById("playBtn"),mainPlay=document.getElementById("mainPlay");
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#039;"}[c]))}
function ago(v){const n=Math.max(0,Math.floor((Date.now()-new Date(v))/1000));if(n<60)return"just now";if(n<3600)return Math.floor(n/60)+" minutes ago";if(n<86400)return Math.floor(n/3600)+" hours ago";return Math.floor(n/86400)+" days ago"}
let visitorId=localStorage.getItem("anonymousSkyVisitorId");
if(!visitorId){visitorId=(crypto.randomUUID?crypto.randomUUID():Date.now().toString(36)+Math.random().toString(36).slice(2)+Math.random().toString(36).slice(2));localStorage.setItem("anonymousSkyVisitorId",visitorId)}
const names=["Cloud","Sky","Azure","Echo","Starlight","Pixel","Dream","Rain","Comet","Breeze"];
const myName=localStorage.getItem("anonymousSkyName")||(()=>{const n=names[parseInt(visitorId.slice(-2),16)%names.length]+"_"+String(parseInt(visitorId.slice(0,4),16)%900+100);localStorage.setItem("anonymousSkyName",n);return n})();
let reactionRows=[],replyRows=[],allRows=[],activeFilter="newest";
function filteredRows(){let q=(document.getElementById("searchInput")?.value||"").trim().toLowerCase();let rows=allRows.filter(m=>!q||m.content.toLowerCase().includes(q));if(activeFilter==="popular"){const counts={};reactionRows.forEach(r=>counts[r.message_id]=(counts[r.message_id]||0)+1);rows.sort((a,b)=>(counts[b.id]||0)-(counts[a.id]||0))}else if(activeFilter==="random"){rows=rows.sort(()=>Math.random()-.5)}else rows.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at));return rows}
function render(){const rows=filteredRows();if(!rows.length){grid.innerHTML='<div class="empty">No thoughts found in this part of the sky.</div>';return}const counts={},mine=new Set();reactionRows.forEach(r=>{counts[r.message_id]=(counts[r.message_id]||0)+1;if(r.visitor_id===visitorId)mine.add(r.message_id)});const repliesBy={};replyRows.forEach(r=>(repliesBy[r.message_id]??=[]).push(r));grid.innerHTML=rows.map(m=>{const rs=repliesBy[m.id]||[];return '<article class="card" id="message-'+m.id+'"><div class="card-head"><b>'+esc(m.author_id||"Anonymous")+'</b><small>'+ago(m.created_at)+'</small><button class="more-btn" data-report="'+m.id+'" aria-label="Report">!</button></div><p>'+esc(m.content)+'</p><div class="card-actions"><button class="reaction-btn'+(mine.has(m.id)?" reacted":"")+'" data-reaction="'+m.id+'">♡ <span>'+(counts[m.id]||0)+'</span></button><button class="reply-toggle" data-reply="'+m.id+'">▢ <span>'+rs.length+'</span></button></div><div class="reply-box" id="reply-box-'+m.id+'"><input maxlength="300" placeholder="Reply anonymously..."><button data-send-reply="'+m.id+'">Send</button></div>'+(rs.length?'<div class="replies">'+rs.slice(-4).map(r=>'<div><b>'+esc(r.author_id||"Anonymous")+'</b><small>'+ago(r.created_at)+'</small><p>'+esc(r.content)+'</p></div>').join("")+'</div>':"")+'</article>'}).join("");bindCards()}
function bindCards(){grid.querySelectorAll("[data-reaction]").forEach(b=>b.onclick=()=>toggleReaction(Number(b.dataset.reaction)));grid.querySelectorAll("[data-reply]").forEach(b=>b.onclick=()=>document.getElementById("reply-box-"+b.dataset.reply).classList.toggle("show"));grid.querySelectorAll("[data-send-reply]").forEach(b=>b.onclick=()=>sendReply(Number(b.dataset.sendReply)));grid.querySelectorAll("[data-report]").forEach(b=>b.onclick=()=>reportMessage(Number(b.dataset.report)))}
async function load(){try{const [mr,rr,rep]=await Promise.all([fetch(rest+"?select=id,content,created_at,author_id&order=created_at.desc&limit=100",{headers}),fetch(SUPABASE_URL+"/rest/v1/message_reactions?select=message_id,visitor_id&limit=5000",{headers}),fetch(SUPABASE_URL+"/rest/v1/message_replies?select=id,message_id,content,created_at,author_id&order=created_at.asc&limit=1000",{headers})]);if(!mr.ok)throw Error(await mr.text());if(!rr.ok)throw Error(await rr.text());if(!rep.ok)throw Error(await rep.text());allRows=await mr.json();reactionRows=await rr.json();replyRows=await rep.json();render();updateStatus()}catch(e){console.error(e);grid.innerHTML='<div class="empty">Could not connect to the sky right now.</div>'}}
async function toggleReaction(messageId){const idx=reactionRows.findIndex(r=>r.message_id===messageId&&r.visitor_id===visitorId);const mine=idx!==-1;const button=grid.querySelector('[data-reaction="'+messageId+'"]');const count=button?.querySelector("span");const oldRows=reactionRows.slice();if(mine)reactionRows.splice(idx,1);else reactionRows.push({message_id:messageId,visitor_id:visitorId});if(button){button.classList.toggle("reacted",!mine);if(count)count.textContent=String(reactionRows.filter(r=>r.message_id===messageId).length)}try{const url=SUPABASE_URL+"/rest/v1/message_reactions";const r=await fetch(mine?url+"?message_id=eq."+messageId+"&visitor_id=eq."+encodeURIComponent(visitorId):url,{method:mine?"DELETE":"POST",headers:{...headers,"Content-Type":"application/json","Prefer":"return=minimal"},body:mine?undefined:JSON.stringify({message_id:messageId,visitor_id:visitorId})});if(!r.ok)throw Error(await r.text())}catch(e){reactionRows=oldRows;const now=grid.querySelector('[data-reaction="'+messageId+'"]');const nowCount=now?.querySelector("span");if(now){now.classList.toggle("reacted",reactionRows.some(r=>r.message_id===messageId&&r.visitor_id===visitorId));if(nowCount)nowCount.textContent=String(reactionRows.filter(r=>r.message_id===messageId).length)}console.error(e);alert("Could not save your reaction. Please try again.")}}
async function sendReply(messageId){const box=document.querySelector("#reply-box-"+messageId),field=box?.querySelector("input"),text=field?.value.trim();if(!text)return;try{const r=await fetch(SUPABASE_URL+"/rest/v1/message_replies",{method:"POST",headers:{...headers,"Content-Type":"application/json","Prefer":"return=minimal"},body:JSON.stringify({message_id:messageId,content:text,author_id:myName})});if(!r.ok)throw Error(await r.text());field.value="";await load()}catch(e){alert("Could not send the reply.");console.error(e)}}
async function reportMessage(messageId){const reason=prompt("Report this message: spam, harassment, sexual, threat, or other","spam");if(!reason)return;const clean=reason.toLowerCase().trim();if(!["spam","harassment","sexual","threat","other"].includes(clean)){alert("Please use: spam, harassment, sexual, threat, or other.");return}try{const r=await fetch(SUPABASE_URL+"/rest/v1/message_reports",{method:"POST",headers:{...headers,"Content-Type":"application/json","Prefer":"return=minimal"},body:JSON.stringify({message_id:messageId,reporter_id:visitorId,reason:clean})});if(!r.ok)throw Error(await r.text());alert("Report received. Thank you.");}catch(e){alert("Could not submit the report.");console.error(e)}}
async function send(){const text=input.value.trim();if(!text)return;const last=Number(localStorage.getItem("lastPostAt")||0);if(Date.now()-last<15000){alert("Please wait a few seconds before posting again.");return}const b=document.getElementById("sendButton");b.disabled=true;b.textContent="Sending...";try{const r=await fetch(rest,{method:"POST",headers:{...headers,"Content-Type":"application/json","Prefer":"return=minimal"},body:JSON.stringify({content:text,author_id:myName})});if(!r.ok)throw Error(await r.text());localStorage.setItem("lastPostAt",Date.now());input.value="";counter.textContent="0/500";await load()}catch(e){alert("Could not send the message.");console.error(e)}finally{b.disabled=false;b.innerHTML='<span class="ico"><svg viewBox="0 0 24 24"><path d="m3 11 18-8-8 18-2-8z"/><path d="m11 13 10-10"/></svg></span> Send'}}
input.addEventListener("input",()=>counter.textContent=input.value.length+"/500");document.getElementById("sendButton").onclick=send;
function updateStatus(){const el=document.getElementById("messageCount");if(el)el.textContent=allRows.length;const users=document.getElementById("onlineCount");if(users)users.textContent="∞";const name=document.getElementById("identityName");if(name)name.textContent=myName}
function setupDiscovery(){const search=document.getElementById("searchInput");if(search)search.oninput=render;document.querySelectorAll("[data-filter]").forEach(b=>b.onclick=()=>{activeFilter=b.dataset.filter;document.querySelectorAll("[data-filter]").forEach(x=>x.classList.toggle("active",x===b));render()});document.getElementById("randomThought")?.addEventListener("click",()=>{activeFilter="random";const rows=filteredRows();if(rows[0])document.getElementById("message-"+rows[0].id)?.scrollIntoView({behavior:"smooth",block:"center"});render()})}
function setPlaying(on){playBtn.textContent=on?"❚❚":"▶";mainPlay.textContent=on?"❚❚":"▶";document.getElementById("readyText").textContent=on?"Playing":"Ready"}
async function toggleMusic(){if(music.paused){try{await music.play();setPlaying(true)}catch{alert("Add Mass Anasthesia.mp3 to the repository first.")}}else{music.pause();setPlaying(false)}}playBtn.onclick=toggleMusic;mainPlay.onclick=toggleMusic;
document.getElementById("mainStop").onclick=()=>{music.pause();music.currentTime=0;setPlaying(false)};document.getElementById("prevBtn").onclick=()=>music.currentTime=0;document.getElementById("mainPrev").onclick=()=>music.currentTime=0;document.getElementById("nextBtn").onclick=()=>music.currentTime=0;document.getElementById("mainNext").onclick=()=>music.currentTime=0;
document.getElementById("volume").oninput=e=>music.volume=e.target.value;document.getElementById("mainVolume").oninput=e=>music.volume=e.target.value;document.getElementById("mainMute").onclick=()=>music.muted=!music.muted;
music.addEventListener("timeupdate",()=>{const p=music.duration?(music.currentTime/music.duration)*100:0;document.getElementById("progressBar").style.width=p+"%";document.getElementById("mainProgress").style.width=p+"%";document.querySelector(".time span").textContent=new Date(music.currentTime*1000).toISOString().slice(14,19);if(music.duration)document.getElementById("duration").textContent=new Date(music.duration*1000).toISOString().slice(14,19)});
function modal(title,text){document.getElementById("modalTitle").textContent=title;document.getElementById("modalText").textContent=text;document.getElementById("modal").classList.add("show")}
document.getElementById("modalClose").onclick=()=>document.getElementById("modal").classList.remove("show");document.getElementById("modal").onclick=e=>{if(e.target.id==="modal")e.currentTarget.classList.remove("show")};
document.querySelectorAll("[data-action]").forEach(b=>b.addEventListener("click",()=>{const a=b.dataset.action;if(a==="home")window.scrollTo({top:0,behavior:"smooth"});if(a==="messages")document.getElementById("feed").scrollIntoView({behavior:"smooth"});if(a==="music")toggleMusic();if(a==="explore")openGba();if(a==="about")modal("About Anonymous Sky","A small Y2K / Futiger Aero anonymous message board. No account. No profile. Just thoughts floating through the sky.")}));
setupDiscovery();load();setInterval(load,30000);music.volume=.7;

const GBA_ROM_URL="https://ffzhwsxmfxojrhszumwa.supabase.co/storage/v1/object/public/games/Pokemon%20Adventure%20-%20Red%20Chapter%20%28Beta%2015%20%2B%20Expansion%20Fix%29.zip";
let gbaLoaded=false,gbaRomUrl=null;

function openGba(){
  const modal=document.getElementById("gbaModal");
  modal.classList.add("show");
  const game=document.getElementById("gbaGame");
  if(game && !game.dataset.boot){
    game.dataset.boot="1";
    game.innerHTML='<div class="gba-loading"><div><div class="gba-pad">🎮</div><b>SKY://GBA</b><span>Loading game from Anonymous Sky...</span></div></div>';
    startGba(GBA_ROM_URL,"Anonymous Sky GBA");
  }
}
function closeGba(){document.getElementById("gbaModal").classList.remove("show")}
document.getElementById("gbaClose").onclick=closeGba;
document.getElementById("gbaModal").onclick=e=>{if(e.target.id==="gbaModal")closeGba()};

function startGba(gameUrl,name){
  window.EJS_player="#gbaGame";
  window.EJS_core="gba";
  window.EJS_biosUrl="";
  window.EJS_gameUrl=gameUrl;
  window.EJS_pathtodata="https://cdn.emulatorjs.org/latest/data/";
  window.EJS_gameName=name;
  window.EJS_startOnLoaded=true;
  window.EJS_fullscreenOnLoaded=false;
  window.EJS_backgroundColor="#081b32";
  document.getElementById("gbaStatus").textContent="Loading "+name+"...";
  if(!gbaLoaded){
    gbaLoaded=true;
    const s=document.createElement("script");
    s.src="https://cdn.emulatorjs.org/latest/data/loader.js";
    s.onload=()=>document.getElementById("gbaStatus").textContent="Emulator ready";
    s.onerror=()=>document.getElementById("gbaStatus").textContent="Could not load emulator";
    document.body.appendChild(s);
  }
}

document.getElementById("gbaRom").addEventListener("change",e=>{
  const file=e.target.files?.[0]; if(!file)return;
  if(gbaRomUrl)URL.revokeObjectURL(gbaRomUrl);
  gbaRomUrl=URL.createObjectURL(file);
  const game=document.getElementById("gbaGame");
  game.dataset.boot="1";
  game.innerHTML="";
  startGba(gbaRomUrl,file.name.replace(/\\.(gba|zip)$/i,""));
});

document.getElementById("gbaFullscreen").onclick=()=>{
  const el=document.querySelector(".gba-window");
  if(document.fullscreenElement)document.exitFullscreen();else el?.requestFullscreen?.();
};


/* Rei-inspired voice assistant */
const reiModal=document.getElementById("reiModal"),reiTalk=document.getElementById("reiTalk"),reiStatus=document.getElementById("reiStatus"),reiTranscript=document.getElementById("reiTranscript"),reiOrb=document.getElementById("reiOrb");
let reiRecognition=null,reiSpeaking=false,reiReady=false;
function reiOpen(){reiModal?.classList.add("show");if(reiTranscript)reiTranscript.textContent="Hello. I'm here.";}
function reiClose(){reiModal?.classList.remove("show");if(reiRecognition){try{reiRecognition.stop()}catch{}}}
function reiSpeak(text){
  text=String(text).replace(/\\bHello\\b/g,"H-hello").replace(/\\./g,"...");
  if(!("speechSynthesis" in window))return;
  speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  u.rate=.91;u.pitch=1.32;u.volume=.9;
  const voices=speechSynthesis.getVoices();
  const preferred=voices.find(v=>/aria|jenny|samantha|zira|female|google.*english/i.test(v.name+" "+v.lang)&&/en-US|en-GB|english/i.test(v.lang+" "+v.name))||voices.find(v=>/en-US/i.test(v.lang))||voices.find(v=>/en-GB/i.test(v.lang));
  if(preferred)u.voice=preferred;
  u.onstart=()=>{reiSpeaking=true;reiOrb?.classList.add("speaking");if(reiStatus)reiStatus.textContent="Speaking...";};
  u.onend=()=>{reiSpeaking=false;reiOrb?.classList.remove("speaking");if(reiStatus)reiStatus.textContent="Ready.";};
  speechSynthesis.speak(u);
}
function reiAnswer(text){
  const q=text.toLowerCase();
  if(/hello|hi|hey/.test(q))return"Hello. Welcome to Anonymous Sky.";
  if(/who are you|your name/.test(q))return"I'm Rei. I can listen and speak with you here.";
  if(/anonymous sky|what is this|this site/.test(q))return"This is Anonymous Sky. A place for thoughts without identities.";
  if(/music|song/.test(q)){toggleMusic();return"Music.";}
  if(/game|gba|pokemon|play/.test(q)){openGba();return"Opening the game player.";}
  if(/message|post|thought/.test(q)){document.getElementById("feed")?.scrollIntoView({behavior:"smooth"});return"Messages. You can leave a thought there.";}
  if(/thank/.test(q))return"You're welcome.";
  if(/bye|goodbye/.test(q))return"See you somewhere in the sky.";
  return"I heard you. You can talk to me about the sky, messages, music, or the game.";
}
function setupReiVoice(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(SR){
    reiRecognition=new SR();reiRecognition.lang="en-US";reiRecognition.interimResults=false;reiRecognition.continuous=false;
    reiRecognition.onstart=()=>{reiReady=true;reiOrb?.classList.add("listening");if(reiStatus)reiStatus.textContent="Listening...";};
    reiRecognition.onresult=e=>{const text=e.results[0][0].transcript;reiTranscript.textContent="You: "+text;const answer=reiAnswer(text);setTimeout(()=>{reiTranscript.textContent=answer;reiSpeak(answer)},180);};
    reiRecognition.onerror=e=>{reiOrb?.classList.remove("listening");if(reiStatus)reiStatus.textContent=e.error==="not-allowed"?"Microphone permission was blocked.":"I couldn't hear you.";};
    reiRecognition.onend=()=>{reiOrb?.classList.remove("listening");if(!reiSpeaking&&reiStatus)reiStatus.textContent="Ready."};
    reiTalk.onclick=()=>{if(reiSpeaking){speechSynthesis.cancel();return}try{reiRecognition.start()}catch{}};
  }else{reiStatus.textContent="Voice recognition is not supported in this browser.";reiTalk.disabled=true;}
}
document.getElementById("reiOpen")?.addEventListener("click",reiOpen);
document.getElementById("reiClose")?.addEventListener("click",reiClose);
reiModal?.addEventListener("click",e=>{if(e.target===reiModal)reiClose()});
setupReiVoice();
window.addEventListener("load",()=>setTimeout(()=>{reiOpen();reiSpeak("Hello. Welcome to Anonymous Sky.");},700));
